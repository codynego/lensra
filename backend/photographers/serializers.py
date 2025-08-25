from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db.models import Sum
from bookings.models import Booking, Payment
from .models import Photographer, Client
from django.contrib.auth.models import User
from django.utils.crypto import get_random_string

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name", "last_name",
            "profile_picture", "location"
        ]
        read_only_fields = ["id"]


class PhotographerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    currency_symbol = serializers.CharField(read_only=True)

    class Meta:
        model = Photographer
        fields = [
            "user",
            "instagram",
            "facebook",
            "currency",
            "currency_symbol",
            "years_of_experience",
        ]
        read_only_fields = ["user"]


class ClientSerializer(serializers.ModelSerializer):
    """Serializer for displaying clients."""
    user = UserSerializer(read_only=True)
    photographer = PhotographerSerializer(read_only=True)
    total_spent = serializers.SerializerMethodField()
    total_bookings = serializers.SerializerMethodField()
    is_registered = serializers.BooleanField(read_only=True, default=True)

    class Meta:
        model = Client
        fields = [
            "id",
            "user",
            "photographer",
            "notes",
            "is_registered",
            "total_spent",
            "total_bookings",
            "created_at",
        ]
        read_only_fields = [
            "id", "created_at", "user", "photographer", "is_registered"
        ]

    def get_total_spent(self, obj):
        """Return the sum of successful payments by this client."""
        client = Client.objects.filter(user=obj.user).first()
        total = Payment.objects.filter(
            booking__client=client,
            payment_status=Payment.STATUS_PAID
        ).aggregate(total=Sum("amount_paid"))["total"]
        return total or 0

    def get_total_bookings(self, obj):
        """Return the total number of bookings for this client."""
        client = Client.objects.filter(user=obj.user).first()
        return Booking.objects.filter(client=client).count()


class ClientCreateSerializer(serializers.ModelSerializer):
    """
    Serializer to create a new client along with an associated User.
    """
    name = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True, required=False)
    phone_number = serializers.CharField(write_only=True, required=False)
    notes = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Client
        fields = ["id", "name", "email", "phone_number", "notes"]

    def create(self, validated_data):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Authentication required to assign photographer.")

        try:
            photographer = Photographer.objects.get(user=request.user)
        except Photographer.DoesNotExist:
            raise serializers.ValidationError("Authenticated user is not a registered photographer.")

        name = validated_data.pop("name")
        email = validated_data.pop("email", None)
        phone_number = validated_data.pop("phone_number", None)
        notes = validated_data.pop("notes", None)

        # Generate a unique username
        base_username = name.replace(" ", "_").lower()
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        # Create the User
        user = User.objects.create_user(
            username=username,
            email=email,
            first_name=name.split(" ")[0],
            last_name=" ".join(name.split(" ")[1:]) if len(name.split(" ")) > 1 else "",
            role=User.Roles.CLIENT,
            password=get_random_string(12)
        )

        if phone_number and hasattr(user, "phone_number"):
            user.phone_number = phone_number
            user.save(update_fields=["phone_number"])

        # Create the Client instance
        client_tag = Client.objects.create(
            photographer=photographer,
            user=user,
            notes=notes
        )

        return client_tag
