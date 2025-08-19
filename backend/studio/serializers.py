from rest_framework import serializers
from .models import Studio
from bookings.serializers import ServicePackageSerializer
# studio/serializers.py
from rest_framework import serializers
from photographers.models import Photographer
from bookings.models import ServicePackage, PhotographerAvailability
from gallery.models import Photo
from .models import Studio
from bookings.serializers import ServicePackageSerializer
from django.contrib.auth import get_user_model


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
            # Check if email already exists for other users
            user_id = self.instance.id if self.instance else None
            if User.objects.filter(email=value).exclude(id=user_id).exists():
                raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        """Validate username uniqueness"""
        if value:
            # Check if username already exists for other users
            user_id = self.instance.id if self.instance else None
            if User.objects.filter(username=value).exclude(id=user_id).exists():
                raise serializers.ValidationError("A user with this username already exists.")
        return value


class StudioGeneralInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Studio
        fields = ['subdomain', 'name', 'tagline']
        read_only_fields = ['subdomain']  # Usually generated automatically


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
    domain = StudioDomainSerializer(source='*', read_only=True)  # Include domain fields

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
            'domain',  # nested domain info
        ]



class StudioSerializer(serializers.ModelSerializer):
    photographer = UserSerializer()

    class Meta:
        model = Studio
        fields = [
            "id", "name", "slug", "theme", "tagline", "about", "custom_domain",
            "status", "primary_color", "secondary_color", "font",
            "cover_photo", "photographer"
        ]
        read_only_fields = [
            "id", "status", "custom_domain", "primary_color",
            "secondary_color", "font", "cover_photo"
        ]

    def validate_name(self, value):
        """Validate studio name"""
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Studio name must be at least 2 characters long.")
        return value.strip()

    def update(self, instance, validated_data):
        """Update studio and photographer data"""
        user_data = validated_data.pop("photographer", None)

        # Update studio fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update photographer fields if present
        if user_data:
            photographer = instance.photographer
            user_serializer = UserSerializer(photographer, data=user_data, partial=True)
            if user_serializer.is_valid(raise_exception=True):
                user_serializer.save()

        return instance





class PhotographerSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Photographer
        fields = ["id", "user"]


class PhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photo
        fields = ["id", "image", "caption"]


class PhotographerAvailabilitySerializer(serializers.ModelSerializer):
    day_of_week_display = serializers.CharField(source="get_day_of_week_display", read_only=True)

    class Meta:
        model = PhotographerAvailability
        fields = ["day_of_week", "day_of_week_display", "start_time", "end_time"]


class PhotographerWebsiteSerializer(serializers.Serializer):
    photographer = PhotographerSerializer()
    studio = StudioSerializer()
    packages = ServicePackageSerializer(many=True)
    photos = PhotoSerializer(many=True)
    availability = PhotographerAvailabilitySerializer(many=True)
