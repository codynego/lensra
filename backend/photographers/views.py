from rest_framework import generics, permissions
from .models import Photographer
from .serializers import PhotographerSerializer
from rest_framework.exceptions import PermissionDenied
from .models import Client
from .serializers import ClientSerializer
from .serializers import ClientSerializer
from bookings.models import Booking
from bookings.serializers import BookingSerializer


from rest_framework.pagination import PageNumberPagination

class ClientPagination(PageNumberPagination):
    page_size = 2  # default number of results per page
    page_size_query_param = 'page_size'  # allow ?page_size=XX in query params
    max_page_size = 100  # limit max results per page


class ClientListCreateView(generics.ListCreateAPIView):
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = ClientPagination  # <-- Added pagination

    def get_queryset(self):
        """
        Only return clients belonging to the authenticated photographer.
        """
        user = self.request.user
        if hasattr(user, "photographer"):
            return Client.objects.filter(photographer=user.photographer).distinct()
        return Client.objects.none()

    def perform_create(self, serializer):
        """
        Assign photographer automatically if not provided.
        """
        user = self.request.user
        if not hasattr(user, "photographer"):
            raise PermissionDenied("You do not have permission to create clients.")

        photographer = serializer.validated_data.get("photographer", None)
        if not photographer:
            photographer = user.photographer

        serializer.save(photographer=photographer)



class ClientDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Allow access to all clients, but restrict based on photographer in get_object.
        """
        return Client.objects.all()

    def get_object(self):
        """
        Ensure the client is associated with the authenticated photographer's bookings.
        """
        obj = super().get_object()
        user = self.request.user
        if not hasattr(user, "photographer") or not obj.bookings.filter(photographer=user.photographer).exists():
            raise PermissionDenied("You do not have permission to access this client.")
        return obj

    def perform_update(self, serializer):
        """
        Ensure the updated client is still associated with the authenticated photographer.
        """
        user = self.request.user
        if not hasattr(user, "photographer"):
            raise PermissionDenied("You do not have permission to update clients.")
        serializer.save()

    def perform_destroy(self, instance):
        """
        Ensure only authorized photographers can delete clients.
        """
        user = self.request.user
        if not hasattr(user, "photographer") or not instance.bookings.filter(photographer=user.photographer).exists():
            raise PermissionDenied("You do not have permission to delete this client.")
        instance.delete()

class ClientBookingsView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Return bookings for the specified client, filtered by the authenticated photographer.
        """
        client_id = self.kwargs['pk']
        user = self.request.user
        if hasattr(user, "photographer"):
            return Booking.objects.filter(client_id=client_id, photographer=user.photographer)
        return Booking.objects.none()


class PhotographerListView(generics.ListAPIView):
    queryset = Photographer.objects.all()
    serializer_class = PhotographerSerializer
    permission_classes = [permissions.AllowAny]  # Public listing


class PhotographerProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = PhotographerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        try:
            photographer = self.request.user.photographer
        except Photographer.DoesNotExist:
            raise PermissionDenied("You are not a registered photographer.")
        return photographer
