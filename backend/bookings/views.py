from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from photographers.models import Client
from datetime import datetime
from rest_framework import serializers
from rest_framework.views import APIView
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
    BookingUpdateSerializer,
)
import logging
from rest_framework.settings import api_settings
from rest_framework.exceptions import PermissionDenied, ValidationError

logger = logging.getLogger(__name__)



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
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        """Return bookings based on user type: photographer, client, or none for guests."""
        user = self.request.user
        if user.is_authenticated:
            if hasattr(user, "photographer"):
                logger.debug(f"Fetching bookings for photographer: {user.photographer.id}")
                return Booking.objects.filter(photographer=user.photographer)
            logger.debug(f"Fetching bookings for client user: {user.id}")
            return Booking.objects.filter(client__user=user)
        logger.debug("No bookings returned for unauthenticated user")
        return Booking.objects.none()

    def perform_create(self, serializer):
        """Handle booking creation with slot validation and client assignment."""
        try:
            client_id = self.request.data.get("client")
            print(f"Creating booking with client_id: {client_id}")
            package = serializer.validated_data["package"]
            photographer = package.photographer
            date = serializer.validated_data["date"]
            time_slot_id = self.request.data.get("time_slot_id")

            # Validate time_slot_id
            if not time_slot_id:
                logger.error("No time_slot_id provided in request")
                raise ValidationError("You must select a time slot.")

            # Check slot availability
            try:
                slot = PhotographerTimeSlot.objects.get(
                    id=time_slot_id,
                    photographer=photographer,
                    date=date,
                    is_booked=False
                )
                logger.debug(f"Found available time slot: {slot.id}, {slot.start_time}")
            except PhotographerTimeSlot.DoesNotExist:
                logger.error(f"Time slot {time_slot_id} unavailable for photographer {photographer.id} on {date}")
                raise ValidationError("Selected time slot is unavailable.")

            # Check for blocked dates
            if PhotographerBlockedDate.objects.filter(
                photographer=photographer,
                date=date
            ).exists():
                logger.error(f"Photographer {photographer.id} is blocked on {date}")
                raise ValidationError("Photographer is unavailable on this date.")

            # Determine client
            if client_id:
                try:
                    client = Client.objects.get(id=client_id, photographer=photographer)
                    logger.debug(f"Using existing client: {client.id}")
                except Client.DoesNotExist:
                    logger.error(f"Client {client_id} does not exist for photographer {photographer.id}")
                    raise ValidationError("Client does not exist.")
            elif self.request.user.is_authenticated and photographer.user != self.request.user:
                client, _ = Client.objects.get_or_create(
                    user=self.request.user,
                    defaults={
                        "name": self.request.user.get_full_name() or self.request.user.username,
                        "email": self.request.user.email,
                        "photographer": photographer
                    }
                )
                logger.debug(f"Using authenticated client: {client.id}")
            else:
                guest_name = self.request.data.get("guest_name")
                guest_email = self.request.data.get("guest_email")
                if not guest_name:
                    logger.error("Guest booking attempted without name")
                    raise ValidationError("Guest bookings require a name.")
                client, _ = Client.objects.get_or_create(
                    user=None,
                    email=guest_email,
                    defaults={"name": guest_name, "photographer": photographer}
                )
                logger.debug(f"Created guest client: {client.id}")

            # Mark slot as booked
            slot.is_booked = True
            slot.save()
            logger.debug(f"Marked time slot {slot.id} as booked")

            # Save booking
            serializer.save(
                client=client,
                photographer=photographer,
                total_price=package.price
            )
            logger.info(f"Booking created successfully for client {client.id}, photographer {photographer.id}")

        except Exception as e:
            logger.error(f"Error creating booking: {str(e)}", exc_info=True)
            raise

    def get_success_headers(self, data):
        """Return headers with the URL of the created resource."""
        try:
            return {'Location': str(data[api_settings.URL_FIELD_NAME])}
        except (TypeError, KeyError):
            logger.warning("Could not generate success headers, returning empty headers")
            return {}


class BookingDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk):
        user = self.request.user
        booking = get_object_or_404(Booking, pk=pk)
        
        # Check if the user is the photographer or client
        if booking.photographer == user.photographer:
            return booking
        elif booking.client and booking.client.user == user:
            return booking
        logger.warning(f"User {user} has no access to booking {pk}")
        return None

    def put(self, request, pk, format=None):
        logger.debug(f"PUT request data: {request.data}")
        booking = self.get_object(pk)
        if not booking:
            return Response({"error": "Booking not found or you don't have access"},
                           status=status.HTTP_404_NOT_FOUND)
        serializer = BookingUpdateSerializer(booking, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        logger.error(f"PUT errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk, format=None):
        logger.debug(f"PATCH request data: {request.data}")
        booking = self.get_object(pk)
        if not booking:
            return Response({"error": "Booking not found or you don't have access"},
                           status=status.HTTP_404_NOT_FOUND)
        serializer = BookingUpdateSerializer(booking, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        logger.error(f"PATCH errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        booking = self.get_object(pk)
        if not booking:
            return Response({"error": "Booking not found or you don't have access"},
                           status=status.HTTP_404_NOT_FOUND)
        # Free up the timeslot
        PhotographerTimeSlot.objects.filter(
            photographer=booking.photographer,
            date=booking.date,
            start_time=booking.start_time
        ).update(is_booked=False)
        booking.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


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
    """
    List and create photographer time slots.
    Supports filtering by `photographer` and `date` query parameters.
    """
    serializer_class = PhotographerTimeSlotSerializer
    permission_classes = [permissions.IsAuthenticated]
    debug_mode = False  # Set to True to enable print debugging

    def get_queryset(self):
        photographer_id = self.request.query_params.get("photographer")
        selected_date = self.request.query_params.get("date")

        if self.debug_mode:
            print(f"DEBUG: photographer_id={photographer_id}, selected_date={selected_date}")

        if not photographer_id:
            return PhotographerTimeSlot.objects.none()

        queryset = PhotographerTimeSlot.objects.filter(photographer_id=photographer_id)

        if selected_date:
            try:
                date_obj = datetime.strptime(selected_date, "%Y-%m-%d").date()
                queryset = queryset.filter(date=date_obj)
            except ValueError:
                if self.debug_mode:
                    print(f"DEBUG: Invalid date format: {selected_date}")
                return PhotographerTimeSlot.objects.none()

        if self.debug_mode:
            print(f"DEBUG: Final queryset count: {queryset.count()}")

        return queryset.order_by("start_time")

    def perform_create(self, serializer):
        """
        Automatically assign the authenticated photographer to the created slot.
        """
        user = self.request.user
        if not hasattr(user, "photographer"):
            raise PermissionDenied("You must be a photographer to create a time slot.")
        serializer.save(photographer=user.photographer)


class PhotographerTimeSlotDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PhotographerTimeSlotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PhotographerTimeSlot.objects.filter(photographer=self.request.user.photographer)

