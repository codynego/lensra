# studio/views.py
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from .models import Studio
from .serializers import (
    StudioSerializer,
    StudioThemeBrandingSerializer,
    StudioDomainSerializer,
)
from bookings.models import ServicePackage
from bookings.serializers import ServicePackageSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from photographers.models import Photographer
from bookings.models import ServicePackage, PhotographerAvailability
from gallery.models import Photo
from .models import Studio
from .serializers import PhotographerWebsiteSerializer


class StudioProfileDetailUpdateView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return Studio.objects.get(photographer=self.request.user)

    def get_serializer_class(self):
        # Allow updating different parts separately if you want
        part = self.request.query_params.get("part")
        if part == "theme":
            return StudioThemeBrandingSerializer
        elif part == "domain":
            return StudioDomainSerializer
        return StudioSerializer


class PhotographerWebsitePublicView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, studio_name):
        # Get photographer by slug from Studio
        studio = get_object_or_404(Studio, slug=studio_name, status=Studio.Status.ACTIVE)
        photographer = Photographer.objects.filter(user=studio.photographer).first()

        # Fetch data
        packages = ServicePackage.objects.filter(photographer=photographer, is_active=True)
        photos = Photo.objects.filter(
            gallery__user=photographer.user,
            visibility="public"
        )

        availability = PhotographerAvailability.objects.filter(photographer=photographer)

        # Serialize
        data = PhotographerWebsiteSerializer({
            "photographer": photographer,
            "studio": studio,
            "packages": packages,
            "photos": photos,
            "availability": availability
        }).data

        return Response(data)



# ---- GENERAL INFO ----
class StudioDetailUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = StudioSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return Studio.objects.get(user=self.request.user)


# ---- THEME & BRANDING ----
class ThemeBrandingUpdateView(generics.UpdateAPIView):
    serializer_class = StudioThemeBrandingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return Studio.objects.get(user=self.request.user)


# ---- PACKAGES ----
class ServicePackageListCreateView(generics.ListCreateAPIView):
    serializer_class = ServicePackageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ServicePackage.objects.filter(photographer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(photographer=self.request.user)


class ServicePackageDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ServicePackageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ServicePackage.objects.filter(photographer=self.request.user)


# ---- DOMAIN SETTINGS ----
class DomainSettingsUpdateView(generics.UpdateAPIView):
    serializer_class = StudioDomainSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return Studio.objects.get(user=self.request.user)

    def update(self, request, *args, **kwargs):
        # Ensure only premium users can update
        profile = self.get_object()
        if not profile.is_premium:
            return Response({"detail": "Premium plan required"}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)


