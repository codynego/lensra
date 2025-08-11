from rest_framework import serializers
from .models import (
    ServicePackage,
    PhotographerAvailability,
    PhotographerBlockedDate,
    Booking,
    Payment,
    PhotographerTimeSlot
)


class ServicePackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServicePackage
        fields = [
            "id",
            "photographer",
            "title",
            "description",
            "price",
            "duration_minutes",
            "is_active"
        ]
        read_only_fields = ["photographer"]


class PhotographerAvailabilitySerializer(serializers.ModelSerializer):
    day_of_week_display = serializers.CharField(
        source="get_day_of_week_display", read_only=True
    )

    class Meta:
        model = PhotographerAvailability
        fields = [
            "id",
            "photographer",
            "day_of_week",
            "day_of_week_display",
            "start_time",
            "end_time",
        ]
        read_only_fields = ["photographer"]


class PhotographerBlockedDateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhotographerBlockedDate
        fields = [
            "id",
            "photographer",
            "date",
            "reason"
        ]
        read_only_fields = ["photographer"]


class BookingSerializer(serializers.ModelSerializer):
    package_details = ServicePackageSerializer(source="package", read_only=True)
    photographer_name = serializers.CharField(
        source="photographer.user.username", read_only=True
    )
    client_name = serializers.CharField(
        source="client.username", read_only=True
    )

    class Meta:
        model = Booking
        fields = [
            "id",
            "client",
            "client_name",
            "photographer",
            "photographer_name",
            "package",
            "package_details",
            "date",
            "start_time",
            "location",
            "notes",
            "status",
            "total_price",
            "created_at"
        ]
        read_only_fields = ["client", "status", "created_at", "total_price"]


class PaymentSerializer(serializers.ModelSerializer):
    booking_details = BookingSerializer(source="booking", read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id",
            "booking",
            "booking_details",
            "amount",
            "payment_status",
            "transaction_id",
            "created_at"
        ]
        read_only_fields = ["payment_status", "transaction_id", "created_at"]


class PhotographerTimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhotographerTimeSlot
        fields = "__all__"
        read_only_fields = ["photographer", "is_booked"]
