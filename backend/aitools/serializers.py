from rest_framework import serializers

class BackgroundRemovalSerializer(serializers.Serializer):
    image = serializers.ImageField(required=True)
    output_image = serializers.ImageField(read_only=True)
