from rest_framework import generics, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import Gallery, Photo
from .serializers import GallerySerializer, PhotoSerializer, AssignClientsSerializer
from rest_framework.pagination import PageNumberPagination

User = get_user_model()

from .serializers import GalleryCreateSerializer

class GalleryCreateView(generics.CreateAPIView):
    serializer_class = GalleryCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        photographer = self.request.user.photographer
        serializer.save(photographer=photographer)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100

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

class ClientAssignedGalleriesView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = GallerySerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return Gallery.objects.filter(assigned_clients=self.request.user)

class ClientAssignedPhotosView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PhotoSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return Photo.objects.filter(assigned_clients=self.request.user)

class GalleryListCreateView(generics.ListCreateAPIView):
    serializer_class = GallerySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        # Photographers see their own galleries
        return Gallery.objects.filter(photographer__user=self.request.user)

    def perform_create(self, serializer):
        photographer = self.request.user.photographerprofile
        serializer.save(photographer=photographer)

class PhotoCreateView(generics.CreateAPIView):
    serializer_class = PhotoSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        gallery_id = self.request.data.get('gallery')
        gallery = get_object_or_404(Gallery, pk=gallery_id)
        if gallery.photographer.user != self.request.user:
            raise PermissionDenied("You do not have permission to add photos to this gallery.")
        serializer.save(gallery=gallery)
