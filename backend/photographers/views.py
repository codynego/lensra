from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.pagination import PageNumberPagination

from .models import Photographer, Client
from .serializers import (
    PhotographerSerializer,
    ClientSerializer,
    ClientCreateSerializer
)
from bookings.models import Booking
from bookings.serializers import BookingSerializer


class ClientPagination(PageNumberPagination):
    page_size = 10  # default number of results per page
    page_size_query_param = 'page_size'
    max_page_size = 100


class ClientListCreateView(generics.ListCreateAPIView):
    """
    List all clients for the authenticated photographer, or create a new client.
    """
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = ClientPagination

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ClientCreateSerializer
        return ClientSerializer

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, "photographer"):
            return Client.objects.filter(photographer=user.photographer).distinct()
        return Client.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if not hasattr(user, "photographer"):
            raise PermissionDenied("You are not authorized to create clients.")
        serializer.save(photographer=user.photographer)


class ClientDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a specific client.
    """
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return all clients; object-level permissions are enforced in get_object
        return Client.objects.all()

    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        if not hasattr(user, "photographer") or obj.photographer != user.photographer:
            raise PermissionDenied("You do not have permission to access this client.")
        return obj

    def perform_update(self, serializer):
        user = self.request.user
        if not hasattr(user, "photographer"):
            raise PermissionDenied("You are not authorized to update clients.")
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if not hasattr(user, "photographer") or instance.photographer != user.photographer:
            raise PermissionDenied("You are not authorized to delete this client.")
        instance.delete()


class ClientBookingsView(generics.ListAPIView):
    """
    List all bookings for a specific client, filtered by the authenticated photographer.
    """
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        client_id = self.kwargs['pk']
        user = self.request.user
        if hasattr(user, "photographer"):
            return Booking.objects.filter(client_id=client_id, photographer=user.photographer)
        return Booking.objects.none()


class PhotographerListView(generics.ListAPIView):
    """
    Public listing of all photographers.
    """
    queryset = Photographer.objects.all()
    serializer_class = PhotographerSerializer
    permission_classes = [permissions.AllowAny]


class PhotographerProfileView(generics.RetrieveUpdateAPIView):
    """
    Retrieve or update the authenticated photographer's profile.
    """
    serializer_class = PhotographerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        try:
            return self.request.user.photographer
        except Photographer.DoesNotExist:
            raise PermissionDenied("You are not a registered photographer.")
