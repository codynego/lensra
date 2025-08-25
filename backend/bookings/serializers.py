from rest_framework import serializers
from .models import ServicePackage, Booking, BookingPreference, Payment
from photographers.models import Photographer, Client as ClientTag
from django.contrib.auth import get_user_model
from django.utils import timezone
import datetime

User = get_user_model()


# ----------------------
# 📌 Service Package Serializer
# ----------------------
class ServicePackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServicePackage
        fields = ["id", "title", "description", "price", "duration", "is_active"]


# ----------------------
# 📌 User Serializer (basic info for clients)
# ----------------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "profile_picture"]
        read_only_fields = ["id"]


# ----------------------
# 📌 Client Serializer (tags a User to Photographer)
# ----------------------
class ClientSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    photographer = serializers.StringRelatedField(read_only=True)
    is_registered = serializers.SerializerMethodField()
    notes = serializers.CharField(allow_blank=True, required=False)

    class Meta:
        model = ClientTag
        fields = [
            "id",
            "photographer",
            "user",
            "is_registered",
            "notes",
            "created_at",
        ]
        read_only_fields = ["created_at", "photographer"]

    def get_is_registered(self, obj):
        return True if obj.user else False

    def create(self, validated_data):
        """
        Create a User if not existing, then create Client tag.
        """
        user_data = validated_data.pop("user")
        email = user_data.get("email")
        user, created = User.objects.get_or_create(email=email, defaults={
            "username": email.split("@")[0],
            "first_name": user_data.get("first_name", ""),
            "last_name": user_data.get("last_name", ""),
        })

        photographer = self.context['request'].user.photographer
        client_tag, created = ClientTag.objects.get_or_create(
            photographer=photographer,
            user=user,
            defaults={"notes": validated_data.get("notes", "")}
        )
        return client_tag


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
    client = ClientSerializer(read_only=True)
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
            "currency_symbol",
        ]


# ----------------------
# 📌 Booking Create Serializer
# ----------------------
class BookingCreateSerializer(serializers.ModelSerializer):
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
        # Assign photographer if missing
        if not data.get('photographer'):
            try:
                data['photographer'] = self.context['request'].user.photographer
            except Photographer.DoesNotExist:
                raise serializers.ValidationError("Authenticated user is not a photographer.")

        # Validate session datetime
        session_date = data.get('session_date')
        session_time = data.get('session_time')
        if session_date and session_time:
            session_datetime = datetime.datetime.combine(session_date, session_time)
            session_datetime = timezone.make_aware(session_datetime, timezone.get_current_timezone())
            if session_datetime < timezone.now():
                raise serializers.ValidationError("Session date and time must be in the future.")

        # Validate package price
        service_package = data.get('service_package')
        package_price = data.get('package_price')
        if service_package and package_price is not None and package_price != service_package.price:
            raise serializers.ValidationError(f"Package price must match service package price: {service_package.price}")

        return data

    def create(self, validated_data):
        # Fill package_price if missing
        if 'package_price' not in validated_data or not validated_data['package_price']:
            validated_data['package_price'] = validated_data['service_package'].price
        return super().create(validated_data)


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


class ClientBookingsSerializer(serializers.ModelSerializer):
    bookings = BookingSerializer(many=True, read_only=True, source="client_tags.booking_set")

    class Meta:
        model = ClientTag
        fields = [
            "id",
            "user",
            "is_registered",
            "notes",
            "created_at",
            "bookings",
        ]
