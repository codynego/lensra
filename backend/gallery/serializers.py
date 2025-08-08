from rest_framework import serializers
from .models import Gallery, Photo
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class PhotoSerializer(serializers.ModelSerializer):
    assigned_clients = UserSimpleSerializer(many=True, read_only=True)

    class Meta:
        model = Photo
        fields = ['id', 'image', 'caption', 'uploaded_at', 'assigned_clients']

class GallerySerializer(serializers.ModelSerializer):
    photos = PhotoSerializer(many=True, read_only=True)
    assigned_clients = UserSimpleSerializer(many=True, read_only=True)

    class Meta:
        model = Gallery
        fields = ['id', 'photographer', 'title', 'description', 'created_at', 'photos', 'assigned_clients']

class GalleryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gallery
        fields = ['title']  # only editable fields, no photographer

# Serializer for assigning clients by usernames
class AssignClientsSerializer(serializers.Serializer):
    client_usernames = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=False
    )

    def validate_client_usernames(self, value):
        clients = User.objects.filter(username__in=value, role=User.Roles.CLIENT)
        if clients.count() != len(value):
            missing = set(value) - set(clients.values_list('username', flat=True))
            raise serializers.ValidationError(f"Clients not found or invalid roles: {', '.join(missing)}")
        return value
