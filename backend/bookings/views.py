from rest_framework import generics, permissions
from .models import Booking
from .serializers import BookingSerializer
from .serializers import BookingStatusUpdateSerializer

class BookingStatusUpdateView(generics.UpdateAPIView):
    serializer_class = BookingStatusUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Booking.objects.all()

    def get_object(self):
        booking = super().get_object()
        # Only the photographer assigned to this booking can update status
        if booking.photographer.user != self.request.user:
            raise PermissionDenied("You do not have permission to update this booking.")
        return booking


class BookingCreateView(generics.CreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(client=self.request.user, status='pending')

class ClientBookingListView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(client=self.request.user)

class PhotographerBookingListView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(photographer__user=self.request.user)
