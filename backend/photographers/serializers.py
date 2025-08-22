from rest_framework import serializers
from .models import Photographer
from .models import Client
from django.contrib.auth import get_user_model
from bookings.models import Booking, Payment
from django.db.models import Sum

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile_picture', 'location']
        read_only_fields = ['id', 'role']


class ClientSerializer(serializers.ModelSerializer):
    is_registered = serializers.BooleanField(read_only=True)
    photographer = serializers.StringRelatedField(read_only=True)  # Shows photographer's name

    total_spent = serializers.SerializerMethodField()
    total_bookings = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = [
            "id", "photographer", "user", "name", "email",
            "phone", "address", "notes", "is_registered",
            "total_spent", "total_bookings", "created_at", 
        ]
        read_only_fields = ["created_at", "photographer", "user"]

    def get_total_spent(self, obj):
        """Sum of all successful payments made by this client"""
        total = Payment.objects.filter(
            booking__client=obj,
            payment_status="paid"  # adjust to your success status
        ).aggregate(total=Sum("amount_paid"))["total"]
        return total or 0

    def get_total_bookings(self, obj):
        """Count all bookings made by this client"""
        return Booking.objects.filter(client=obj).count()


class PhotographerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    currency_symbol = serializers.CharField(source="currency_symbol", read_only=True)

    class Meta:
        model = Photographer
        fields = [
            'user', 'instagram', 'facebook', 'currency', 'currency_symbol', 'years_of_experience'
        ]
        read_only_fields = ['user', 'created_at']
