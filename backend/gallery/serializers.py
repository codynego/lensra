from rest_framework import serializers
from .models import Gallery, Photo
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSimpleSerializer(serializers.ModelSerializer):
    """Lightweight user representation for assigned clients."""
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class PhotoSerializer(serializers.ModelSerializer):
    assigned_clients = UserSimpleSerializer(many=True, read_only=True)

    class Meta:
        model = Photo
        fields = ["id", "image", "caption", "uploaded_at", "assigned_clients"]


class GalleryRecursiveSerializer(serializers.ModelSerializer):
    """Recursively serializes galleries with their sub-galleries and photos."""
    photos = PhotoSerializer(many=True, read_only=True)
    sub_galleries = serializers.SerializerMethodField()
    assigned_clients = UserSimpleSerializer(many=True, read_only=True)

    class Meta:
        model = Gallery
        fields = [
            "id", "title", "description", "created_at",
            "photos", "sub_galleries", "assigned_clients"
        ]

    def get_sub_galleries(self, obj):
        return GalleryRecursiveSerializer(obj.sub_galleries.all(), many=True).data


class GallerySerializer(serializers.ModelSerializer):
    photos = PhotoSerializer(many=True, read_only=True)
    sub_galleries = serializers.SerializerMethodField()
    assigned_clients = UserSimpleSerializer(many=True, read_only=True)
    cover_image = serializers.SerializerMethodField()  # renamed to match frontend

    class Meta:
        model = Gallery
        fields = [
            "id", "photographer", "title", "description", "created_at",
            "photos", "sub_galleries", "assigned_clients", "cover_image"
        ]

    def get_sub_galleries(self, obj):
        return GalleryRecursiveSerializer(obj.sub_galleries.all(), many=True).data

    def get_cover_image(self, obj):
        return obj.cover_photo  # assuming this returns a URL


class GalleryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new gallery or sub-gallery."""
    class Meta:
        model = Gallery
        fields = ["title", "description", "parent_gallery"]


class AssignClientsSerializer(serializers.Serializer):
    """Validates a list of client usernames for assignment."""
    client_usernames = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=False
    )

    def validate_client_usernames(self, value):
        clients = User.objects.filter(username__in=value, role=User.Roles.CLIENT)
        if clients.count() != len(value):
            missing = set(value) - set(clients.values_list("username", flat=True))
            raise serializers.ValidationError(
                f"Clients not found or invalid roles: {', '.join(missing)}"
            )
        return value
