from rest_framework import generics, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import Gallery, Photo
from .serializers import (
    GallerySerializer, PhotoSerializer, AssignClientsSerializer,
    GalleryRecursiveSerializer, GalleryCreateSerializer
)
from rest_framework.pagination import PageNumberPagination


User = get_user_model()


# ---- Pagination ----
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


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
        gallery.save()

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
        photo.save()

        return Response({"detail": "Clients assigned to photo successfully."})


# ---- CLIENT VIEWS ----
class ClientAssignedGalleriesView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = GallerySerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = Gallery.objects.filter(assigned_clients=self.request.user)
        if self.request.query_params.get("top_only") == "true":
            queryset = queryset.filter(parent_gallery__isnull=True)
        return queryset


class ClientAssignedPhotosView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PhotoSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return Photo.objects.filter(assigned_clients=self.request.user)


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
    serializer_class = PhotoSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        """Match `GET /api/gallery/photos/?gallery={galleryId}`."""
        gallery_id = self.request.query_params.get('gallery')
        if gallery_id:
            return Photo.objects.filter(gallery_id=gallery_id)
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
    permission_classes = [permissions.IsAuthenticated]

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
    serializer_class = PhotoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        photo = self.get_object()
        if photo.gallery.photographer.user != self.request.user:
            raise PermissionDenied("You cannot edit this photo.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.gallery.photographer.user != self.request.user:
            raise PermissionDenied("You cannot delete this photo.")
        instance.delete()

