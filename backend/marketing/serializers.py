# accounts/serializers.py
from rest_framework import serializers
from .models import Waitlist

class WaitlistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Waitlist
        fields = ["id", "name", "email", "studio_name", "whatsapp", "created_at"]
