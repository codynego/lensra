from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from .models import Studio
from photographers.models import Photographer
from bookings.models import ServicePackage
from gallery.models import Photo
from .serializers import (
    StudioSerializer,
    StudioThemeBrandingSerializer,
    StudioDomainSerializer,
    PhotographerWebsiteSerializer,
)
from bookings.serializers import ServicePackageSerializer
from rest_framework import serializers


class StudioProfileDetailUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = StudioSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        """Get the studio object for the authenticated user"""
        return get_object_or_404(Studio, photographer=self.request.user)

    def get_serializer_context(self):
        """Pass request to serializer context"""
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context

    def update(self, request, *args, **kwargs):
        """Handle both PUT and PATCH requests"""

        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        
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
        """Retrieve public website data for a studio"""
        studio = get_object_or_404(Studio, slug=studio_name, status=Studio.Status.ACTIVE)
        photographer = get_object_or_404(Photographer, user=studio.photographer)

        # Fetch related data
        packages = ServicePackage.objects.filter(photographer=photographer, is_active=True)
        photos = Photo.objects.filter(
            gallery__user=photographer.user,
            visibility="public"
        )

        # Serialize
        data = PhotographerWebsiteSerializer({
            "photographer": photographer,
            "studio": studio,
            "packages": packages,
            "photos": photos,
        }).data

        return Response(data)


class StudioDetailUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = StudioSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        """Get the studio for the authenticated user"""
        return get_object_or_404(Studio, photographer__user=self.request.user)

    def get_serializer_context(self):
        """Pass request to serializer context"""
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context


class ThemeBrandingUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = StudioThemeBrandingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        """Get the studio for the authenticated user"""
        return get_object_or_404(Studio, photographer=self.request.user)


class ServicePackageListCreateView(generics.ListCreateAPIView):
    serializer_class = ServicePackageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return service packages for the authenticated user's photographer"""
        return ServicePackage.objects.filter(photographer=self.request.user.photographer)

    def perform_create(self, serializer):
        """Save new service package with the authenticated user's photographer"""
        serializer.save(photographer=self.request.user.photographer)


class ServicePackageDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ServicePackageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return service packages for the authenticated user's photographer"""
        return ServicePackage.objects.filter(photographer__user=self.request.user)


class DomainSettingsUpdateView(generics.UpdateAPIView):
    serializer_class = StudioDomainSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        """Get the studio for the authenticated user"""
        return get_object_or_404(Studio, photographer=self.request.user)

    def update(self, request, *args, **kwargs):
        """Handle domain settings update with premium check"""
        instance = self.get_object()
        if not getattr(instance, 'is_premium', False):
            return Response(
                {"detail": "Premium plan required"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)


class CheckUsernameAvailability(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Check if a username is available"""
        username = request.query_params.get("username")
        if not username:
            return Response(
                {"error": "Username is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        query = User.objects.filter(username__iexact=username)
        if request.user.is_authenticated:
            query = query.exclude(id=request.user.id)
        exists = query.exists()
        return Response({"available": not exists}, status=status.HTTP_200_OK)