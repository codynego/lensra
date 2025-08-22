from rest_framework import serializers
from .models import ServicePackage, Booking, BookingPreference, Payment
from photographers.models import Photographer, Client
from django.utils import timezone
import datetime




# ----------------------
# 📌 Service Package Serializer
# ----------------------
class ServicePackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServicePackage
        fields = ["id", "title", "description", "price", "duration", "is_active"]


# ----------------------
# 📌 Client Serializer (basic info)
# ----------------------
class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ["id", "name", "email", "phone", "address", "is_registered"]


# ----------------------
# 📌 Payment Serializer
# ----------------------
class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "id",
            "amount_paid",
            "payment_status",
            "payment_method",
            "transaction_id",
            "created_at",
            "paid_at",
        ]


# ----------------------
# 📌 Booking Serializer (detailed)
# ----------------------
class BookingSerializer(serializers.ModelSerializer):
    """Used for listing and retrieving bookings"""
    client = serializers.StringRelatedField(read_only=True)
    photographer = serializers.StringRelatedField(read_only=True)
    service_package = serializers.StringRelatedField(read_only=True)
    currency_symbol = serializers.CharField(source="photographer.currency_symbol", read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id",
            "client",
            "photographer",
            "service_package",
            "session_date",
            "session_time",
            "status",
            "notes",
            "location",
            "package_price",
            "currency_symbol",  # 👈 added here
        ]


# ----------------------
# 📌 Booking Create Serializer
# ----------------------


class BookingCreateSerializer(serializers.ModelSerializer):
    """Used for creating a new booking"""
    
    photographer = serializers.PrimaryKeyRelatedField(
        queryset=Photographer.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = Booking
        fields = [
            "client",
            "photographer",
            "service_package",
            "session_date",
            "session_time",
            "status",
            "notes",
            "package_price",
        ]

    def validate(self, data):
        """Validate session_date, session_time, and photographer"""
        if not data.get('photographer'):
            user = self.context['request'].user
            try:
                data['photographer'] = Photographer.objects.get(user=user)
            except Photographer.DoesNotExist:
                raise serializers.ValidationError({
                    "photographer": "Authenticated user is not associated with a photographer profile."
                })

        session_date = data.get('session_date')
        session_time = data.get('session_time')
        if session_date and session_time:
            try:
                session_datetime = datetime.datetime.combine(session_date, session_time)
                session_datetime = timezone.make_aware(session_datetime, timezone.get_current_timezone())
                if session_datetime < timezone.now():
                    raise serializers.ValidationError({
                        "session_date": "Session date and time must be in the future."
                    })
            except ValueError:
                raise serializers.ValidationError({
                    "session_time": "Invalid date or time format."
                })

        service_package = data.get('service_package')
        package_price = data.get('package_price')
        if service_package and package_price is not None and package_price != service_package.price:
            raise serializers.ValidationError({
                "package_price": f"Package price must match service package price: {service_package.price}"
            })

        return data

    def create(self, validated_data):
        """Set photographer from authenticated user if not provided"""
        if 'photographer' not in validated_data or not validated_data['photographer']:
            user = self.context['request'].user
            try:
                validated_data['photographer'] = Photographer.objects.get(user=user)
            except Photographer.DoesNotExist:
                raise serializers.ValidationError({
                    "photographer": "Authenticated user is not associated with a photographer profile."
                })

        if 'notes' in validated_data and validated_data['notes']:
            validated_data['location'] = validated_data['notes']

        if validated_data.get('service_package') and 'package_price' not in validated_data:
            validated_data['package_price'] = validated_data['service_package'].price

        return super().create(validated_data)
# ----------------------
# 📌 Booking Preference Serializer
# ----------------------
class BookingPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingPreference
        fields = [
            "id",
            "photographer",
            "available_days",
            "session_time",
            "min_notice_hours",
            "max_future_days",
            "allow_same_day",
            "deposit_required",
            "deposit_percentage",
            "auto_confirm",
            "notes",
            "created_at",
            "updated_at",
        ]


# ----------------------
# 📌 Client Bookings Serializer (NESTED VIEW)
# ----------------------
class ClientBookingsSerializer(serializers.ModelSerializer):
    bookings = BookingSerializer(many=True, read_only=True, source="booking_set")

    class Meta:
        model = Client
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "address",
            "is_registered",
            "bookings",  # 👈 all bookings tied to this client
        ]
