from rest_framework import serializers
from .models import Photographer
from .models import Client

class ClientSerializer(serializers.ModelSerializer):
    is_registered = serializers.BooleanField(read_only=True)
    photographer = serializers.StringRelatedField(read_only=True)  # Shows photographer's name

    class Meta:
        model = Client
        fields = [
            "id", "photographer", "user", "name", "email",
            "phone", "address", "notes", "is_registered", "created_at"
        ]
        read_only_fields = ["created_at", "photographer", "user"]


class PhotographerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photographer
        fields = [
            'user', 'instagram', 'location', 'bio', 'profile_picture'
        ]
        read_only_fields = ['user', 'created_at']


