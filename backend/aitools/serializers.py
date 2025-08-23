from rest_framework import serializers
# from .models import EnhancedImage

class BackgroundRemovalSerializer(serializers.Serializer):
    image = serializers.ImageField(required=True)
    output_image = serializers.ImageField(read_only=True)



# class EnhancedImageSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = EnhancedImage
#         fields = ['id', 'original', 'enhanced', 'created_at']
#         read_only_fields = ['enhanced', 'created_at']
