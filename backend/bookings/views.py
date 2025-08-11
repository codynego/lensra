from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import (
    ServicePackage,
    PhotographerAvailability,
    PhotographerBlockedDate,
    Booking,
    Payment,
    PhotographerTimeSlot,
)
from .serializers import (
    ServicePackageSerializer,
    PhotographerAvailabilitySerializer,
    PhotographerBlockedDateSerializer,
    BookingSerializer,
    PaymentSerializer,
    PhotographerTimeSlotSerializer,
)


# ServicePackage ListCreate and RetrieveUpdateDestroy
class ServicePackageListCreateView(generics.ListCreateAPIView):
    serializer_class = ServicePackageSerializer

    def get_permissions(self):
        if self.request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        if self.request.method == 'GET':
            # List only active packages for list
            return ServicePackage.objects.filter(is_active=True)
        return ServicePackage.objects.all()

    def perform_create(self, serializer):
        serializer.save(photographer=self.request.user.photographer)


class ServicePackageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ServicePackage.objects.all()
    serializer_class = ServicePackageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        serializer.save(photographer=self.request.user.photographer)


# PhotographerAvailability ListCreate and Detail
class PhotographerAvailabilityListCreateView(generics.ListCreateAPIView):
    serializer_class = PhotographerAvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PhotographerAvailability.objects.filter(photographer=self.request.user.photographer)

    def perform_create(self, serializer):
        serializer.save(photographer=self.request.user.photographer)


class PhotographerAvailabilityDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PhotographerAvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PhotographerAvailability.objects.filter(photographer=self.request.user.photographer)


# PhotographerBlockedDate ListCreate and Detail
class PhotographerBlockedDateListCreateView(generics.ListCreateAPIView):
    serializer_class = PhotographerBlockedDateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PhotographerBlockedDate.objects.filter(photographer=self.request.user.photographer)

    def perform_create(self, serializer):
        serializer.save(photographer=self.request.user.photographer)


class PhotographerBlockedDateDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PhotographerBlockedDateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PhotographerBlockedDate.objects.filter(photographer=self.request.user.photographer)


# Booking ListCreate and Detail
class BookingListCreateView(generics.ListCreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, "photographer"):
            return Booking.objects.filter(photographer=user.photographer)
        return Booking.objects.filter(client=user)

    def perform_create(self, serializer):
        package = serializer.validated_data["package"]
        photographer = package.photographer
        date = serializer.validated_data["date"]
        slot_id = self.request.data.get("slot_id")

        if not slot_id:
            raise serializers.ValidationError("You must select a time slot.")

        try:
            slot = PhotographerTimeSlot.objects.get(
                id=slot_id, photographer=photographer, date=date, is_booked=False
            )
        except PhotographerTimeSlot.DoesNotExist:
            raise serializers.ValidationError("Selected slot is unavailable.")

        # Check blocked dates
        if PhotographerBlockedDate.objects.filter(photographer=photographer, date=date).exists():
            raise serializers.ValidationError("Photographer is unavailable on this date.")

        # Mark slot as booked
        slot.is_booked = True
        slot.save()

        serializer.save(
            client=self.request.user,
            photographer=photographer,
            total_price=package.price
        )


class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, "photographerprofile"):
            return Booking.objects.filter(photographer=user.photographer)
        return Booking.objects.filter(client=user)


# Booking availability check (replaces @action detail=False)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_availability(request):
    package_id = request.query_params.get("package")
    date = request.query_params.get("date")

    if not package_id or not date:
        return Response(
            {"detail": "package and date parameters are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    package = get_object_or_404(ServicePackage, id=package_id)
    photographer = package.photographer

    if PhotographerBlockedDate.objects.filter(photographer=photographer, date=date).exists():
        return Response({"available": False, "reason": "Blocked date"})

    # Additional slot checking logic could go here...

    return Response({"available": True})


# Payment ListCreate and Detail
class PaymentListCreateView(generics.ListCreateAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, "photographerprofile"):
            return Payment.objects.filter(booking__photographer=user.photographer)
        return Payment.objects.filter(booking__client=user)

    def perform_create(self, serializer):
        serializer.save()


class PaymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, "photographerprofile"):
            return Payment.objects.filter(booking__photographer=user.photographer)
        return Payment.objects.filter(booking__client=user)


# PhotographerTimeSlot ListCreate and Detail
class PhotographerTimeSlotListCreateView(generics.ListCreateAPIView):
    serializer_class = PhotographerTimeSlotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = PhotographerTimeSlot.objects.all()
        date = self.request.query_params.get("date")
        photographer_id = self.request.query_params.get("photographer")

        if date:
            queryset = queryset.filter(date=date)
        if photographer_id:
            queryset = queryset.filter(photographer_id=photographer_id)

        return queryset

    def perform_create(self, serializer):
        serializer.save(photographer=self.request.user.photographer)


class PhotographerTimeSlotDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PhotographerTimeSlotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PhotographerTimeSlot.objects.filter(photographer=self.request.user.photographer)
