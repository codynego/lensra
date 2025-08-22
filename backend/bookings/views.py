# bookings/views.py
from rest_framework import generics, permissions
from .models import ServicePackage, Booking, BookingPreference, Payment
from photographers.models import Client
from .serializers import (
    ServicePackageSerializer,
    ClientSerializer,
    PaymentSerializer,
    BookingSerializer,
    BookingCreateSerializer,
    BookingPreferenceSerializer,
    ClientBookingsSerializer,
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


# ----------------------
# 📌 Service Package Views
# ----------------------
class ServicePackageListCreateView(generics.ListCreateAPIView):
    queryset = ServicePackage.objects.all()
    serializer_class = ServicePackageSerializer
    permission_classes = [permissions.AllowAny]  # adjust later if needed


class ServicePackageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ServicePackage.objects.all()
    serializer_class = ServicePackageSerializer
    permission_classes = [permissions.AllowAny]


# ----------------------
# 📌 Client Views
# ----------------------
class ClientListCreateView(generics.ListCreateAPIView):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [permissions.AllowAny]


class ClientDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [permissions.AllowAny]


# ----------------------
# 📌 Payment Views
# ----------------------
class PaymentListCreateView(generics.ListCreateAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.AllowAny]


class PaymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.AllowAny]


# ----------------------
# 📌 Booking Views
# ----------------------
class BookingListCreateView(generics.ListCreateAPIView):
    queryset = Booking.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return BookingCreateSerializer
        return BookingSerializer

    def perform_create(self, serializer):
        serializer.save()

class BookingDetailView(APIView):
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
    permission_classes = [permissions.AllowAny]


class BookingPreferenceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = BookingPreference.objects.all()
    serializer_class = BookingPreferenceSerializer
    permission_classes = [permissions.AllowAny]


# ----------------------
# 📌 Client Bookings (Nested View)
# ----------------------
class ClientBookingsView(generics.RetrieveAPIView):
    """
    Returns a client along with all their bookings
    """

    queryset = Client.objects.all()
    serializer_class = ClientBookingsSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "id"  # use client ID to fetch bookings


