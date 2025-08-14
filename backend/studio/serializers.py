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
        fields = ['id', 'username', 'email', 'first_name', 'last_name']  # include whatever you need


class StudioGeneralInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Studio
        fields = ['subdomain', 'name', 'bio']
        read_only_fields = ['subdomain']  # Usually generated automatically


class StudioThemeBrandingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Studio
        fields = ['primary_color', 'secondary_color', 'font', 'cover_photo']



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
            'bio',
            'primary_color',
            'secondary_color',
            'font_choice',
            'cover_photo',
            'packages',
            'domain',  # nested domain info
        ]




class StudioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Studio
        fields = ["name", "slug", "custom_domain", "status"]


class PhotographerSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Photographer
        fields = ["id", "user", "bio", "profile_picture", "location"]


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
