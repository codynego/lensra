from rest_framework import generics, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied, NotFound
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import Gallery, Photo, PublicGallery, SharedAccess
from .serializers import (
    GallerySerializer, PhotoSerializer, AssignClientsSerializer,
    GalleryRecursiveSerializer, GalleryCreateSerializer, GalleryShareSerializer,
    PhotoShareSerializer, AddToGallerySerializer, PublicGallerySerializer,
    GalleryListSerializer, UserGalleriesSerializer, PhotoCreateSerializer
)
from rest_framework.pagination import PageNumberPagination


User = get_user_model()


# ---- Pagination ----
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


# ---- CUSTOM PERMISSIONS ----
class IsOwnerOrReadOnly(permissions.BasePermission):
    """Allow owners to edit, others to read (if they have access)."""
    
    def has_object_permission(self, request, view, obj):
        # Read permissions for authenticated users with access
        if request.method in permissions.SAFE_METHODS:
            if hasattr(obj, 'can_user_access'):
                return obj.can_user_access(request.user)
            return True
        
        # Write permissions only for owners
        if hasattr(obj, 'photographer'):
            return obj.photographer.user == request.user
        elif hasattr(obj, 'gallery'):
            return obj.gallery.photographer.user == request.user
        return False


# ---- CREATE ----
class GalleryCreateView(generics.CreateAPIView):
    serializer_class = GalleryCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        photographer = self.request.user.photographer
        parent_gallery_id = self.request.data.get("parent_gallery")
        parent_gallery = None

        if parent_gallery_id:
            parent_gallery = get_object_or_404(Gallery, id=parent_gallery_id)
            if parent_gallery.photographer.user != self.request.user:
                raise PermissionDenied("You cannot add a sub-gallery to another photographer's gallery.")

        serializer.save(photographer=photographer, parent_gallery=parent_gallery)


# ---- SHARING VIEWS ----
class GalleryShareView(APIView):
    """Update gallery sharing settings."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, gallery_id):
        gallery = get_object_or_404(Gallery, id=gallery_id)
        
        if gallery.photographer.user != request.user:
            raise PermissionDenied("Only the gallery owner can change sharing settings.")
        
        serializer = GalleryShareSerializer(gallery, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            "detail": "Gallery sharing settings updated.",
            "sharing_status": gallery.sharing_status,
            "share_url": gallery.share_url,
            "is_public": gallery.is_public
        })


class PhotoShareView(APIView):
    """Update photo sharing settings."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, photo_id):
        photo = get_object_or_404(Photo, id=photo_id)
        
        if photo.gallery.photographer.user != request.user:
            raise PermissionDenied("Only the photo owner can change sharing settings.")
        
        serializer = PhotoShareSerializer(photo, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            "detail": "Photo sharing settings updated.",
            "sharing_status": photo.sharing_status,
            "share_url": photo.share_url,
            "is_public": photo.is_public
        })


@api_view(['GET'])
@permission_classes([AllowAny])
def gallery_share_view(request, token):
    """View shared gallery via token (public access)."""
    try:
        gallery = Gallery.objects.get(share_token=token)
        if gallery.sharing_status not in ['shareable', 'public']:
            raise NotFound("Gallery is not available for sharing.")
        
        serializer = GallerySerializer(gallery, context={'request': request})
        return Response(serializer.data)
    except Gallery.DoesNotExist:
        raise NotFound("Gallery not found.")


@api_view(['GET'])
@permission_classes([AllowAny])
def photo_share_view(request, token):
    """View shared photo via token (public access)."""
    try:
        photo = Photo.objects.get(share_token=token)
        if photo.sharing_status not in ['shareable', 'public']:
            raise NotFound("Photo is not available for sharing.")
        
        serializer = PhotoSerializer(photo, context={'request': request})
        return Response(serializer.data)
    except Photo.DoesNotExist:
        raise NotFound("Photo not found.")


class AddToMyGalleryView(APIView):
    """Add shared gallery/photo to user's accessible items."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        gallery_id = request.data.get('gallery_id')
        photo_id = request.data.get('photo_id')
        
        if not gallery_id and not photo_id:
            return Response(
                {"detail": "Either gallery_id or photo_id must be provided."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        data = {'user': request.user}
        
        if gallery_id:
            gallery = get_object_or_404(Gallery, id=gallery_id)
            if not gallery.sharing_status in ['shareable', 'public']:
                raise PermissionDenied("Gallery is not shareable.")
            data['gallery'] = gallery
            data['access_method'] = 'public_gallery' if gallery.is_public else 'share_link'
        
        if photo_id:
            photo = get_object_or_404(Photo, id=photo_id)
            if not photo.sharing_status in ['shareable', 'public']:
                raise PermissionDenied("Photo is not shareable.")
            data['photo'] = photo
            data['access_method'] = 'public_gallery' if photo.is_public else 'share_link'
        
        serializer = AddToGallerySerializer(data=data)
        serializer.is_valid(raise_exception=True)
        item = serializer.save()
        
        item_type = "gallery" if gallery_id else "photo"
        return Response({
            "detail": f"{item_type.capitalize()} added to your accessible items.",
            "item_type": item_type,
            "item_id": gallery_id or photo_id
        })


# ---- PUBLIC GALLERY VIEWS ----
class PublicGalleriesView(generics.ListAPIView):
    """List all public galleries."""
    serializer_class = PublicGallerySerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = PublicGallery.objects.select_related('gallery__photographer__user')
        
        # Filter options
        featured_only = self.request.query_params.get('featured')
        if featured_only == 'true':
            queryset = queryset.filter(featured=True)
        
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(gallery__title__icontains=search) |
                Q(gallery__description__icontains=search) |
                Q(gallery__photographer__user__username__icontains=search)
            )
        
        return queryset.order_by('-featured', '-added_to_public_at')


# ---- ASSIGN CLIENTS ----
class AssignClientsToGalleryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, gallery_id):
        gallery = get_object_or_404(Gallery, id=gallery_id)

        if gallery.photographer.user != request.user:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)

        serializer = AssignClientsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        client_usernames = serializer.validated_data['client_usernames']
        clients = User.objects.filter(username__in=client_usernames, role=User.Roles.CLIENT)

        gallery.assigned_clients.set(clients)
        
        # Also create SharedAccess records for tracking
        for client in clients:
            SharedAccess.objects.get_or_create(
                user=client,
                gallery=gallery,
                defaults={'access_method': 'assigned'}
            )

        return Response({"detail": "Clients assigned to gallery successfully."})


class AssignClientsToPhotoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, photo_id):
        photo = get_object_or_404(Photo, id=photo_id)

        if photo.gallery.photographer.user != request.user:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)

        serializer = AssignClientsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        client_usernames = serializer.validated_data['client_usernames']
        clients = User.objects.filter(username__in=client_usernames, role=User.Roles.CLIENT)

        photo.assigned_clients.set(clients)
        
        # Also create SharedAccess records for tracking
        for client in clients:
            SharedAccess.objects.get_or_create(
                user=client,
                photo=photo,
                defaults={'access_method': 'assigned'}
            )

        return Response({"detail": "Clients assigned to photo successfully."})


# ---- CLIENT VIEWS (Enhanced) ----
class UserGalleriesView(APIView):
    """Get user's galleries organized by access type."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Owned galleries (if user is photographer)
        owned_galleries = []
        if hasattr(user, 'photographer'):
            owned_galleries = Gallery.objects.filter(
                photographer=user.photographer,
                parent_gallery__isnull=True
            )
        
        # Assigned galleries
        assigned_galleries = Gallery.objects.filter(assigned_clients=user)
        
        # Shared galleries (accessible but not assigned)
        shared_galleries = Gallery.objects.filter(accessible_users=user)
        
        data = {
            'owned_galleries': GalleryListSerializer(
                owned_galleries, many=True, context={'request': request}
            ).data,
            'assigned_galleries': GalleryListSerializer(
                assigned_galleries, many=True, context={'request': request}
            ).data,
            'shared_galleries': GalleryListSerializer(
                shared_galleries, many=True, context={'request': request}
            ).data,
        }
        
        return Response(data)


class ClientAssignedGalleriesView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = GallerySerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        user = self.request.user
        queryset = Gallery.objects.filter(
            Q(assigned_clients=user) | Q(accessible_users=user)
        ).distinct()
        
        if self.request.query_params.get("top_only") == "true":
            queryset = queryset.filter(parent_gallery__isnull=True)
        return queryset


class ClientAssignedPhotosView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PhotoSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        user = self.request.user
        return Photo.objects.filter(
            Q(assigned_clients=user) | Q(accessible_users=user)
        ).distinct()


# ---- GALLERY LIST / CREATE ----
class GalleryListCreateView(generics.ListCreateAPIView):
    serializer_class = GalleryRecursiveSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        photographer = self.request.user.photographer
        queryset = Gallery.objects.filter(photographer=photographer)

        if self.request.query_params.get("top_only") == "true":
            queryset = queryset.filter(parent_gallery__isnull=True)

        return queryset

    def perform_create(self, serializer):
        photographer = self.request.user.photographer
        parent_gallery_id = self.request.data.get("parent_gallery")
        parent_gallery = None

        if parent_gallery_id:
            parent_gallery = get_object_or_404(Gallery, id=parent_gallery_id)
            if parent_gallery.photographer.user != self.request.user:
                raise PermissionDenied("You cannot add a sub-gallery to another photographer's gallery.")

        serializer.save(photographer=photographer, parent_gallery=parent_gallery)


# ---- PHOTO LIST / CREATE ----
class PhotoListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PhotoCreateSerializer
        return PhotoSerializer

    def get_queryset(self):
        """Match `GET /api/gallery/photos/?gallery={galleryId}`."""
        gallery_id = self.request.query_params.get('gallery')
        if gallery_id:
            gallery = get_object_or_404(Gallery, id=gallery_id)
            # Check if user has access to this gallery
            if not gallery.can_user_access(self.request.user):
                return Photo.objects.none()
            return gallery.photos.all()
        return Photo.objects.none()

    def perform_create(self, serializer):
        gallery_id = self.request.data.get('gallery')
        gallery = get_object_or_404(Gallery, pk=gallery_id)
        if gallery.photographer.user != self.request.user:
            raise PermissionDenied("You do not have permission to add photos to this gallery.")
        serializer.save(gallery=gallery)


# ---- UPDATE / DELETE ----
class GalleryUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Gallery.objects.all()
    serializer_class = GallerySerializer
    permission_classes = [IsOwnerOrReadOnly]

    def get_object(self):
        obj = super().get_object()
        if self.request.method in permissions.SAFE_METHODS:
            if not obj.can_user_access(self.request.user):
                raise PermissionDenied("You don't have access to this gallery.")
        return obj

    def perform_update(self, serializer):
        gallery = self.get_object()
        if gallery.photographer.user != self.request.user:
            raise PermissionDenied("You cannot edit this gallery.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.photographer.user != self.request.user:
            raise PermissionDenied("You cannot delete this gallery.")
        instance.delete()


class PhotoUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Photo.objects.all()
    permission_classes = [IsOwnerOrReadOnly]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return PhotoCreateSerializer
        return PhotoSerializer

    def get_object(self):
        obj = super().get_object()
        if self.request.method in permissions.SAFE_METHODS:
            if not obj.can_user_access(self.request.user):
                raise PermissionDenied("You don't have access to this photo.")
        return obj

    def perform_update(self, serializer):
        photo = self.get_object()
        if photo.gallery.photographer.user != self.request.user:
            raise PermissionDenied("You cannot edit this photo.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.gallery.photographer.user != self.request.user:
            raise PermissionDenied("You cannot delete this photo.")
        instance.delete()


# ---- ANALYTICS VIEWS ----
class GalleryAnalyticsView(APIView):
    """Get sharing analytics for a gallery."""
    permission_classes = [IsAuthenticated]

    def get(self, request, gallery_id):
        gallery = get_object_or_404(Gallery, id=gallery_id)
        
        if gallery.photographer.user != request.user:
            raise PermissionDenied("You can only view analytics for your own galleries.")
        
        # Get sharing statistics
        access_records = SharedAccess.objects.filter(gallery=gallery)
        
        analytics = {
            'total_shares': access_records.count(),
            'share_methods': {},
            'recent_access': [],
        }
        
        # Count by access method
        for method_choice in SharedAccess._meta.get_field('access_method').choices:
            method_code = method_choice[0]
            method_name = method_choice[1]
            count = access_records.filter(access_method=method_code).count()
            analytics['share_methods'][method_name] = count
        
        # Recent access (last 10)
        recent_access = access_records.select_related('user').order_by('-accessed_at')[:10]
        analytics['recent_access'] = [
            {
                'user': record.user.username,
                'method': record.get_access_method_display(),
                'accessed_at': record.accessed_at
            }
            for record in recent_access
        ]
        
        return Response(analytics)