from rest_framework import serializers
from .models import Photographer


class PhotographerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photographer
        fields = [
            'studio_name', 'website', 'instagram', 'phone_number',
            'location', 'bio', 'profile_picture'
        ]


