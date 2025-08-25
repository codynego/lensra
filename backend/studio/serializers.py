from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Studio
from photographers.models import Photographer
from bookings.models import ServicePackage
from gallery.models import Photo
from bookings.serializers import ServicePackageSerializer
from accounts.serializers import UserProfileSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "email", "location", "phone_number", "profile_picture"]
        extra_kwargs = {
            "username": {"required": False},
            "email": {"required": False},
            "location": {"required": False},
            "phone_number": {"required": False},
        }

    def validate_email(self, value):
        """Validate email format and uniqueness"""
        if value:
            # Use self.instance if available, otherwise rely on context
            current_user = self.instance or self.context.get('current_user')
            query = User.objects.filter(email__iexact=value)
            if current_user and current_user.id:
                query = query.exclude(id=current_user.id)
            if query.exists():
                raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        """Validate username uniqueness"""
        if value:
            # Use self.instance if available, otherwise rely on context
            current_user = self.instance or self.context.get('current_user')
            query = User.objects.filter(username__iexact=value)
            if current_user and current_user.id:
                query = query.exclude(id=current_user.id)
            if query.exists():
                raise serializers.ValidationError("A user with this username already exists.")
        return value


class StudioGeneralInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Studio
        fields = ['subdomain', 'name', 'tagline']
        read_only_fields = ['subdomain']


class StudioThemeBrandingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Studio
        fields = ['primary_color', 'secondary_color', 'font', 'cover_photo', 'theme']


class StudioDomainSerializer(serializers.ModelSerializer):
    is_verified = serializers.BooleanField(source='custom_domain_verified', read_only=True)

    class Meta:
        model = Studio
        fields = ['custom_domain', 'is_verified']
        read_only_fields = ['is_verified']


class StudioFullSerializer(serializers.ModelSerializer):
    packages = ServicePackageSerializer(many=True, read_only=True)
    domain = StudioDomainSerializer(source='*', read_only=True)

    class Meta:
        model = Studio
        fields = [
            'subdomain',
            'name',
            'tagline',
            'primary_color',
            'secondary_color',
            'font',
            'cover_photo',
            'packages',
            'domain',
        ]


class StudioSerializer(serializers.ModelSerializer):


    class Meta:
        model = Studio
        fields = [
            "id", "name", "slug", "theme", "tagline", "about", "custom_domain",
            "status", "primary_color", "secondary_color", "font",
            "cover_photo",
        ]
        read_only_fields = [
            "id", "status", "custom_domain", "primary_color",
            "secondary_color", "font", "cover_photo", "theme"
        ]

    def validate_name(self, value):
        """Validate studio name"""
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Studio name must be at least 2 characters long.")
        return value.strip()

    def validate_slug(self, value):
        """Validate slug uniqueness and format"""
        if not value or len(value.strip()) < 3:
            raise serializers.ValidationError("Subdomain must be at least 3 characters long.")
        if len(value) > 50:
            raise serializers.ValidationError("Subdomain cannot exceed 50 characters.")
        if not value.islower() or not all(c.isalnum() or c == '-' for c in value):
            raise serializers.ValidationError("Subdomain can only contain lowercase letters, numbers, and hyphens.")
        query = Studio.objects.filter(slug=value)
        if self.instance:
            query = query.exclude(id=self.instance.id)
        if query.exists():
            raise serializers.ValidationError("A studio with this subdomain already exists.")
        return value.strip()



class PhotographerSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Photographer
        fields = ["id", "user"]


class PhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photo
        fields = ["id", "image", "caption"]


class PhotographerWebsiteSerializer(serializers.Serializer):
    photographer = PhotographerSerializer()
    studio = StudioSerializer()
    packages = ServicePackageSerializer(many=True)
    photos = PhotoSerializer(many=True)