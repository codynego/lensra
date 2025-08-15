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
from rest_framework import serializers


class StudioProfileDetailUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = StudioSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        """Get the studio object for the authenticated user"""
        return get_object_or_404(Studio, photographer=self.request.user)

    def update(self, request, *args, **kwargs):
        """Handle both PUT and PATCH requests"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        except serializers.ValidationError as e:
            return Response(
                {"error": "Validation failed", "details": e.detail}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": "Update failed", "message": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_update(self, serializer):
        """Perform the update operation"""
        serializer.save()

    def patch(self, request, *args, **kwargs):
        """Handle PATCH requests (partial updates)"""
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)


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
        return Studio.objects.get(photographer__user=self.request.user)


# ---- THEME & BRANDING ----
class ThemeBrandingUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = StudioThemeBrandingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return Studio.objects.get(photographer=self.request.user)


# ---- PACKAGES ----
class ServicePackageListCreateView(generics.ListCreateAPIView):
    serializer_class = ServicePackageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ServicePackage.objects.filter(photographer=self.request.user.photographer)

    def perform_create(self, serializer):
        serializer.save(photographer=self.request.user.photographer)


class ServicePackageDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ServicePackageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ServicePackage.objects.filter(photographer__user=self.request.user)


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


