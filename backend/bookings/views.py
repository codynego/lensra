from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import ServicePackage, Booking, BookingPreference, Payment
from photographers.models import Client as ClientTag, Photographer
from .serializers import (
    ServicePackageSerializer,
    ClientSerializer,
    PaymentSerializer,
    BookingSerializer,
    BookingCreateSerializer,
    BookingPreferenceSerializer,
    ClientBookingsSerializer,
    GuestBookingCreateSerializer,
    
)


# ----------------------
# 📌 Service Package Views
# ----------------------
class ServicePackageListCreateView(generics.ListCreateAPIView):
    queryset = ServicePackage.objects.all()
    serializer_class = ServicePackageSerializer
    permission_classes = [permissions.AllowAny]


class ServicePackageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ServicePackage.objects.all()
    serializer_class = ServicePackageSerializer
    permission_classes = [permissions.AllowAny]


# ----------------------
# 📌 Client Views
# ----------------------
class ClientListCreateView(generics.ListCreateAPIView):
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, "photographer"):
            return ClientTag.objects.filter(photographer=user.photographer)
        return ClientTag.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if not hasattr(user, "photographer"):
            raise PermissionDenied("You are not a registered photographer.")
        serializer.save(photographer=user.photographer)


class ClientDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, "photographer"):
            return ClientTag.objects.filter(photographer=user.photographer)
        return ClientTag.objects.none()


# ----------------------
# 📌 Payment Views
# ----------------------
class PaymentListCreateView(generics.ListCreateAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]


class PaymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]


# ----------------------
# 📌 Booking Views
# ----------------------
class BookingListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        return BookingCreateSerializer if self.request.method == "POST" else BookingSerializer

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, "photographer"):
            return Booking.objects.filter(photographer=user.photographer)
        return Booking.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if not hasattr(user, "photographer"):
            raise PermissionDenied("You are not a registered photographer.")
        serializer.save(photographer=user.photographer)


class BookingDetailView(APIView):
    """Partial update of a booking"""

    def patch(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk)
            serializer = BookingSerializer(booking, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Booking.DoesNotExist:
            return Response({"message": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)


# ----------------------
# 📌 Booking Preferences Views
# ----------------------
class BookingPreferenceListCreateView(generics.ListCreateAPIView):
    queryset = BookingPreference.objects.all()
    serializer_class = BookingPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]


class BookingPreferenceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = BookingPreference.objects.all()
    serializer_class = BookingPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]


# ----------------------
# 📌 Client Bookings (Nested View)
# ----------------------
class ClientBookingsView(generics.RetrieveAPIView):
    """
    Returns a client along with all their bookings
    """
    serializer_class = ClientBookingsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, "photographer"):
            return ClientTag.objects.filter(photographer=user.photographer)
        return ClientTag.objects.none()


# ----------------------
# 📌 Guest Booking Create View
# ----------------------
class GuestBookingCreateView(generics.CreateAPIView):
    serializer_class = GuestBookingCreateSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        serializer.save()