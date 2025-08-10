from rest_framework import serializers
from .models import Gallery, Photo, PublicGallery, SharedAccess
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSimpleSerializer(serializers.ModelSerializer):
    """Lightweight user representation for assigned clients."""
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class PhotoSerializer(serializers.ModelSerializer):
    assigned_clients = UserSimpleSerializer(many=True, read_only=True)
    accessible_users = UserSimpleSerializer(many=True, read_only=True)
    share_url = serializers.ReadOnlyField()
    can_share = serializers.SerializerMethodField()
    access_type = serializers.SerializerMethodField()

    class Meta:
        model = Photo
        fields = [
            "id", "image", "caption", "uploaded_at", "assigned_clients", 
            "accessible_users", "sharing_status", "share_url", "is_public",
            "can_share", "access_type"
        ]

    def get_can_share(self, obj):
        """Check if current user can modify sharing settings."""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return request.user == obj.gallery.photographer.user

    def get_access_type(self, obj):
        """Determine how the current user has access to this photo."""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 'public' if obj.is_public else 'anonymous'
        
        user = request.user
        if user == obj.gallery.photographer.user:
            return 'owner'
        elif obj.assigned_clients.filter(id=user.id).exists():
            return 'assigned'
        elif obj.accessible_users.filter(id=user.id).exists():
            return 'shared'
        elif obj.is_public:
            return 'public'
        return 'no_access'


class PhotoCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating photos."""
    class Meta:
        model = Photo
        fields = ["image", "caption", "sharing_status"]


class PhotoShareSerializer(serializers.Serializer):
    """Serializer for updating photo sharing settings."""
    sharing_status = serializers.ChoiceField(choices=Photo.SHARING_CHOICES)
    
    def update(self, instance, validated_data):
        instance.sharing_status = validated_data['sharing_status']
        instance.save()
        return instance


class GalleryRecursiveSerializer(serializers.ModelSerializer):
    """Recursively serializes galleries with their sub-galleries and photos."""
    photos = PhotoSerializer(many=True, read_only=True)
    sub_galleries = serializers.SerializerMethodField()
    assigned_clients = UserSimpleSerializer(many=True, read_only=True)
    accessible_users = UserSimpleSerializer(many=True, read_only=True)
    share_url = serializers.ReadOnlyField()

    class Meta:
        model = Gallery
        fields = [
            "id", "title", "description", "created_at", "photos", "sub_galleries", 
            "assigned_clients", "accessible_users", "sharing_status", "share_url", "is_public"
        ]

    def get_sub_galleries(self, obj):
        return GalleryRecursiveSerializer(
            obj.sub_galleries.all(), 
            many=True, 
            context=self.context
        ).data


class GallerySerializer(serializers.ModelSerializer):
    photos = PhotoSerializer(many=True, read_only=True)
    sub_galleries = serializers.SerializerMethodField()
    assigned_clients = UserSimpleSerializer(many=True, read_only=True)
    accessible_users = UserSimpleSerializer(many=True, read_only=True)
    cover_image = serializers.SerializerMethodField()
    share_url = serializers.ReadOnlyField()
    can_share = serializers.SerializerMethodField()
    access_type = serializers.SerializerMethodField()
    photo_count = serializers.SerializerMethodField()
    is_featured = serializers.SerializerMethodField()

    class Meta:
        model = Gallery
        fields = [
            "id", "photographer", "title", "description", "created_at", "photos", 
            "sub_galleries", "assigned_clients", "accessible_users", "cover_image",
            "sharing_status", "share_url", "is_public", "can_share", "access_type",
            "photo_count", "is_featured"
        ]

    def get_sub_galleries(self, obj):
        return GalleryRecursiveSerializer(
            obj.sub_galleries.all(), 
            many=True, 
            context=self.context
        ).data

    def get_cover_image(self, obj):
        return obj.cover_photo

    def get_can_share(self, obj):
        """Check if current user can modify sharing settings."""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return request.user == obj.photographer.user

    def get_access_type(self, obj):
        """Determine how the current user has access to this gallery."""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 'public' if obj.is_public else 'anonymous'
        
        user = request.user
        if user == obj.photographer.user:
            return 'owner'
        elif obj.assigned_clients.filter(id=user.id).exists():
            return 'assigned'
        elif obj.accessible_users.filter(id=user.id).exists():
            return 'shared'
        elif obj.is_public:
            return 'public'
        return 'no_access'

    def get_photo_count(self, obj):
        """Total number of photos in gallery and sub-galleries."""
        def count_photos(gallery):
            count = gallery.photos.count()
            for sub_gallery in gallery.sub_galleries.all():
                count += count_photos(sub_gallery)
            return count
        return count_photos(obj)

    def get_is_featured(self, obj):
        """Check if gallery is featured in public listings."""
        if hasattr(obj, 'public_listing'):
            return obj.public_listing.featured
        return False


class GalleryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new gallery or sub-gallery."""
    class Meta:
        model = Gallery
        fields = ["title", "description", "parent_gallery", "sharing_status"]


class GalleryShareSerializer(serializers.Serializer):
    """Serializer for updating gallery sharing settings."""
    sharing_status = serializers.ChoiceField(choices=Gallery.SHARING_CHOICES)
    
    def update(self, instance, validated_data):
        instance.sharing_status = validated_data['sharing_status']
        instance.save()
        
        # Handle public gallery listing
        if validated_data['sharing_status'] == 'public':
            PublicGallery.objects.get_or_create(gallery=instance)
        elif hasattr(instance, 'public_listing'):
            instance.public_listing.delete()
        
        return instance


class AddToGallerySerializer(serializers.Serializer):
    """Serializer for adding shared galleries/photos to user's accessible list."""
    def create(self, validated_data):
        user = validated_data['user']
        gallery = validated_data.get('gallery')
        photo = validated_data.get('photo')
        access_method = validated_data.get('access_method', 'share_link')
        
        if gallery:
            gallery.add_user_access(user)
            SharedAccess.objects.get_or_create(
                user=user,
                gallery=gallery,
                defaults={'access_method': access_method}
            )
            return gallery
        elif photo:
            photo.add_user_access(user)
            SharedAccess.objects.get_or_create(
                user=user,
                photo=photo,
                defaults={'access_method': access_method}
            )
            return photo
        
        raise serializers.ValidationError("Either gallery or photo must be provided")


class PublicGallerySerializer(serializers.ModelSerializer):
    """Serializer for public gallery listings."""
    gallery = GallerySerializer(read_only=True)
    photographer_name = serializers.CharField(source='gallery.photographer.user.username', read_only=True)
    
    class Meta:
        model = PublicGallery
        fields = ["gallery", "featured", "added_to_public_at", "photographer_name"]


class SharedAccessSerializer(serializers.ModelSerializer):
    """Serializer for tracking shared access history."""
    user = UserSimpleSerializer(read_only=True)
    gallery = serializers.StringRelatedField(read_only=True)
    photo = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = SharedAccess
        fields = ["user", "gallery", "photo", "access_method", "accessed_at"]


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


class GalleryListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for gallery listings (without nested data)."""
    cover_image = serializers.SerializerMethodField()
    photo_count = serializers.SerializerMethodField()
    photographer_name = serializers.CharField(source='photographer.user.username', read_only=True)
    access_type = serializers.SerializerMethodField()
    
    class Meta:
        model = Gallery
        fields = [
            "id", "title", "description", "created_at", "cover_image", 
            "photo_count", "photographer_name", "sharing_status", "is_public", 
            "access_type"
        ]
    
    def get_cover_image(self, obj):
        return obj.cover_photo
    
    def get_photo_count(self, obj):
        return obj.photos.count()
    
    def get_access_type(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 'public' if obj.is_public else 'anonymous'
        
        user = request.user
        if user == obj.photographer.user:
            return 'owner'
        elif obj.assigned_clients.filter(id=user.id).exists():
            return 'assigned'
        elif obj.accessible_users.filter(id=user.id).exists():
            return 'shared'
        elif obj.is_public:
            return 'public'
        return 'no_access'


class UserGalleriesSerializer(serializers.Serializer):
    """Serializer for organizing user's galleries by access type."""
    owned_galleries = GalleryListSerializer(many=True, read_only=True)
    assigned_galleries = GalleryListSerializer(many=True, read_only=True)
    shared_galleries = GalleryListSerializer(many=True, read_only=True)