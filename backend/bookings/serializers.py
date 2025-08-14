from rest_framework import serializers
from django.utils import timezone
from decimal import Decimal
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




from rest_framework import serializers
from .models import Booking, Client, Photographer, PhotographerTimeSlot, ServicePackage
from django.utils import timezone
from decimal import Decimal

class BookingSerializer(serializers.ModelSerializer):
    guest_name = serializers.CharField(write_only=True, required=False)
    guest_email = serializers.EmailField(write_only=True, required=False)
    client_name = serializers.SerializerMethodField(read_only=True)
    client_email = serializers.CharField(source="client.email", read_only=True)
    photographer_name = serializers.CharField(source="photographer.name", read_only=True)
    package_name = serializers.CharField(source="package.name", read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id", "client", "client_name", "client_email",
            "photographer", "photographer_name", "package", "package_name",
            "date", "start_time", "location", "notes", "status",
            "total_price", "created_at", "guest_name", "guest_email"
        ]
        read_only_fields = ["id", "client_name", "client_email", "photographer_name",
                           "package_name", "created_at", "total_price"]
        extra_kwargs = {
            'client': {'write_only': True}
        }

    def get_client_name(self, obj):
        """Get client name, handling both registered clients and guest bookings"""
        if obj.client:
            return obj.client.get_full_name()
        return "Guest"

    def validate(self, data):
        """Validate that either client exists or guest information is provided"""
        client = data.get('client')
        guest_name = data.get('guest_name')
        guest_email = data.get('guest_email')

        if not client and not (guest_name or guest_email):
            raise serializers.ValidationError(
                "Either client must be specified or guest information (name/email) must be provided."
            )
        return data

    def validate_status(self, value):
        """Validate that the status is a valid choice"""
        valid_statuses = [choice[0] for choice in Booking.STATUS_CHOICES]
        if value not in valid_statuses:
            raise serializers.ValidationError(
                f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        # Optional: Restrict who can change status (e.g., only photographers)
        user = self.context['request'].user
        booking = self.instance
        if booking and hasattr(user, 'photographer'):
            # Allow photographers to update status
            return value
        elif booking and booking.client.user == user:
            # Allow clients to update status to specific values (e.g., cancel)
            if value not in ['cancelled']:
                raise serializers.ValidationError(
                    "Clients can only set status to 'cancelled'."
                )
            return value
        raise serializers.ValidationError("You do not have permission to update the status.")

    def validate_start_time(self, value):
        """Validate that start_time is available for the photographer and date"""
        if not value:
            raise serializers.ValidationError("You must select a time slot.")

        photographer_id = self.initial_data.get('photographer')
        date = self.initial_data.get('date')

        if not PhotographerTimeSlot.objects.filter(
            photographer_id=photographer_id,
            date=date,
            start_time=value,
            is_booked=False
        ).exists():
            raise serializers.ValidationError(
                f"Time slot {value} is not available for the selected date and photographer."
            )
        return value

    def create(self, validated_data):
        guest_name = validated_data.pop("guest_name", None)
        guest_email = validated_data.pop("guest_email", None)

        # Create client for guest booking if no client is specified
        if not validated_data.get("client") and (guest_name or guest_email):
            photographer = validated_data["photographer"]
            client = Client.objects.create(
                photographer=photographer,
                name=guest_name or "Guest",
                email=guest_email or f"guest_{timezone.now().timestamp()}@example.com"
            )
            validated_data["client"] = client

        # Calculate total price if not provided
        if not validated_data.get("total_price"):
            package = validated_data.get("package")
            validated_data["total_price"] = package.price if package else Decimal('0.00')

        # Mark the timeslot as booked
        if validated_data.get('start_time') and validated_data.get('date'):
            PhotographerTimeSlot.objects.filter(
                photographer=validated_data["photographer"],
                date=validated_data["date"],
                start_time=validated_data["start_time"]
            ).update(is_booked=True)

        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Remove guest fields from update data
        validated_data.pop("guest_name", None)
        validated_data.pop("guest_email", None)

        # Recalculate total price if package changes
        if 'package' in validated_data and not validated_data.get("total_price"):
            package = validated_data.get("package")
            validated_data["total_price"] = package.price if package else Decimal('0.00')

        # Update timeslot availability if start_time or date changes
        if 'start_time' in validated_data or 'date' in validated_data:
            # Free up the old timeslot
            PhotographerTimeSlot.objects.filter(
                photographer=instance.photographer,
                date=instance.date,
                start_time=instance.start_time
            ).update(is_booked=False)

            # Mark the new timeslot as booked
            new_date = validated_data.get('date', instance.date)
            new_start_time = validated_data.get('start_time', instance.start_time)
            PhotographerTimeSlot.objects.filter(
                photographer=instance.photographer,
                date=new_date,
                start_time=new_start_time
            ).update(is_booked=True)

        return super().update(instance, validated_data)


class PhotographerTimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhotographerTimeSlot
        fields = "__all__"
        read_only_fields = ["photographer", "is_booked"]

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "id", "booking", "amount", "payment_status",
            "transaction_id", "created_at"
        ]
        read_only_fields = ["booking", "created_at"]


class BookingUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['status', 'date', 'start_time', 'location', 'notes', 'package']
        extra_kwargs = {
            'status': {'required': False},
            'date': {'required': False},
            'start_time': {'required': False},
            'location': {'required': False},
            'notes': {'required': False, 'allow_null': True, 'allow_blank': True},
            'package': {'required': False, 'allow_null': True},
        }

    def validate_status(self, value):
        """Validate status and permissions"""
        valid_statuses = [choice[0] for choice in Booking.STATUS_CHOICES]
        if value not in valid_statuses:
            raise serializers.ValidationError(
                f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        
        # Check if request context is available
        if 'request' not in self.context:
            raise serializers.ValidationError("Request context is missing, cannot validate permissions.")
        
        user = self.context['request'].user
        booking = self.instance
        if booking and hasattr(user, 'photographer'):
            return value  # Photographers can set any status
        elif booking and booking.client.user == user:
            if value not in ['cancelled']:
                raise serializers.ValidationError(
                    "Clients can only set status to 'cancelled'."
                )
            return value
        raise serializers.ValidationError("You do not have permission to update the status.")

    def validate(self, data):
        """Validate timeslot availability if date or start_time is provided"""
        date = data.get('date', self.instance.date if self.instance else None)
        start_time = data.get('start_time', self.instance.start_time if self.instance else None)
        photographer = self.instance.photographer if self.instance else None

        # Only validate timeslot if both date and start_time are provided
        if date and start_time and photographer:
            # Check if the new timeslot is available (exclude current booking)
            if (date != self.instance.date or start_time != self.instance.start_time) and not PhotographerTimeSlot.objects.filter(
                photographer=photographer,
                date=date,
                start_time=start_time,
                is_booked=False
            ).exists():
                raise serializers.ValidationError(
                    f"Time slot {start_time} on {date} is not available for the photographer."
                )
        return data

    def update(self, instance, validated_data):
        # Free up the old timeslot if date or start_time changes
        if 'date' in validated_data or 'start_time' in validated_data:
            PhotographerTimeSlot.objects.filter(
                photographer=instance.photographer,
                date=instance.date,
                start_time=instance.start_time
            ).update(is_booked=False)

            # Mark the new timeslot as booked
            new_date = validated_data.get('date', instance.date)
            new_start_time = validated_data.get('start_time', instance.start_time)
            PhotographerTimeSlot.objects.filter(
                photographer=instance.photographer,
                date=new_date,
                start_time=new_start_time
            ).update(is_booked=True)

        # Recalculate total_price if package changes
        if 'package' in validated_data:
            package = validated_data.get('package')
            validated_data['total_price'] = package.price if package else Decimal('0.00')

        return super().update(instance, validated_data)