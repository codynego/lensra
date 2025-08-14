from rest_framework import serializers
from .models import Gallery, Photo, PublicGallery, SharedAccess
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction

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
            "accessible_users", "visibility", "is_shareable_via_link", 
            "share_url", "is_public", "can_share", "access_type"
        ]

    def get_can_share(self, obj):
        """Check if current user can modify sharing settings."""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return request.user == obj.gallery.user

    def get_access_type(self, obj):
        """Determine how the current user has access to this photo."""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 'public' if obj.is_public else 'anonymous'
        
        user = request.user
        if user == obj.gallery.user:
            return 'owner'
        elif obj.assigned_clients.filter(id=user.id).exists():
            return 'assigned'
        elif obj.accessible_users.filter(id=user.id).exists():
            return 'shared'
        elif obj.is_public:
            return 'public'
        return 'no_access'


class PhotoCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating photos."""
    
    class Meta:
        model = Photo
        fields = ["image", "caption", "visibility", "is_shareable_via_link"]

    def create(self, validated_data):
        """Create photo instance"""
        return Photo.objects.create(**validated_data)


class PhotoShareSerializer(serializers.Serializer):
    """Serializer for updating photo sharing settings."""
    visibility = serializers.ChoiceField(choices=Photo.VISIBILITY_CHOICES)
    is_shareable_via_link = serializers.BooleanField()
    
    def update(self, instance, validated_data):
        instance.visibility = validated_data['visibility']
        instance.is_shareable_via_link = validated_data['is_shareable_via_link']
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
            "assigned_clients", "accessible_users", "visibility", 
            "is_shareable_via_link", "share_url", "is_public"
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
            "id", "user", "title", "description", "created_at", "photos", 
            "sub_galleries", "assigned_clients", "accessible_users", "cover_image",
            "visibility", "is_shareable_via_link", "share_url", "is_public", 
            "can_share", "access_type", "photo_count", "is_featured"
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
        return request.user == obj.user

    def get_access_type(self, obj):
        """Determine how the current user has access to this gallery."""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 'public' if obj.is_public else 'anonymous'
        
        user = request.user
        if user == obj.user:
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
        fields = ["title", "description", "parent_gallery", "visibility", "is_shareable_via_link"]


class GalleryShareSerializer(serializers.Serializer):
    """Serializer for updating gallery sharing settings."""
    visibility = serializers.ChoiceField(choices=Gallery.VISIBILITY_CHOICES)
    is_shareable_via_link = serializers.BooleanField()
    
    def update(self, instance, validated_data):
        instance.visibility = validated_data['visibility']
        instance.is_shareable_via_link = validated_data['is_shareable_via_link']
        instance.save()
        
        # Handle public gallery listing
        if validated_data['visibility'] == 'public':
            PublicGallery.objects.get_or_create(gallery=instance)
        elif hasattr(instance, 'public_listing'):
            instance.public_listing.delete()
        
        return instance


class AddToGallerySerializer(serializers.Serializer):
    gallery_id = serializers.IntegerField(required=False)
    photo_id = serializers.IntegerField(required=False)
    access_method = serializers.CharField(default='share_link', required=False)

    def validate(self, data):
        if not data.get('gallery_id') and not data.get('photo_id'):
            raise serializers.ValidationError("Either gallery_id or photo_id must be provided.")
        if data.get('gallery_id') and data.get('photo_id'):
            raise serializers.ValidationError("Provide only one of gallery_id or photo_id.")
        return data

    def create(self, validated_data):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            raise serializers.ValidationError("User must be authenticated to add to collection.")

        gallery_id = validated_data.get('gallery_id')
        photo_id = validated_data.get('photo_id')
        access_method = validated_data.get('access_method', 'share_link')

        if gallery_id:
            try:
                original_gallery = Gallery.objects.get(id=gallery_id)

                # 1. Ensure "Shared Photos" gallery exists for this user
                shared_gallery, _ = Gallery.objects.get_or_create(
                    user=user,
                    title="Shared Photos",
                    defaults={
                        'description': 'Photos shared with me from other galleries',
                        'visibility': 'private'
                    }
                )

                # 2. Duplicate each photo from the original gallery into Shared Photos
                for photo in original_gallery.photos.all():
                    # Check if this photo is already in the user's shared gallery
                    existing_photo = Photo.objects.filter(
                        gallery=shared_gallery,
                        caption=photo.caption,
                        image=photo.image.name
                    ).first()
                    
                    if not existing_photo:
                        # Create a new photo instance (duplicate)
                        new_photo = Photo(
                            gallery=shared_gallery,
                            image=photo.image,
                            caption=photo.caption,
                            visibility=photo.visibility,
                            is_shareable_via_link=photo.is_shareable_via_link
                        )
                        new_photo.save()
                        
                        # Grant user access to their copy
                        new_photo.add_user_access(user)

                        # Track the share
                        SharedAccess.objects.get_or_create(
                            user=user,
                            photo=new_photo,
                            defaults={'access_method': access_method}
                        )

                # 3. Optionally record that user has access to original gallery
                SharedAccess.objects.get_or_create(
                    user=user,
                    gallery=original_gallery,
                    defaults={'access_method': access_method}
                )

                return shared_gallery

            except Gallery.DoesNotExist:
                raise serializers.ValidationError("Gallery not found.")

        elif photo_id:
            try:
                original_photo = Photo.objects.get(id=photo_id)

                # 1. Ensure "Shared Photos" gallery exists for this user
                shared_gallery, _ = Gallery.objects.get_or_create(
                    user=user,
                    title="Shared Photos",
                    defaults={
                        'description': 'Photos shared with me from other galleries',
                        'visibility': 'private'
                    }
                )

                # 2. Check if this photo is already in the user's shared gallery
                existing_photo = Photo.objects.filter(
                    gallery=shared_gallery,
                    caption=original_photo.caption,
                    image=original_photo.image.name
                ).first()
                
                if existing_photo:
                    return existing_photo

                # 3. Create a duplicate of the photo
                new_photo = Photo(
                    gallery=shared_gallery,
                    image=original_photo.image,
                    caption=original_photo.caption,
                    visibility=original_photo.visibility,
                    is_shareable_via_link=original_photo.is_shareable_via_link
                )
                new_photo.save()

                # 4. Grant the user access to their copy
                new_photo.add_user_access(user)

                # 5. Track that this is from a share
                SharedAccess.objects.get_or_create(
                    user=user,
                    photo=new_photo,
                    defaults={'access_method': access_method}
                )

                return new_photo

            except Photo.DoesNotExist:
                raise serializers.ValidationError("Photo not found.")

        raise serializers.ValidationError("Either gallery or photo must be provided.")
class PublicGallerySerializer(serializers.ModelSerializer):
    """Serializer for public gallery listings."""
    gallery = GallerySerializer(read_only=True)
    user_name = serializers.CharField(source='gallery.user.username', read_only=True)
    
    class Meta:
        model = PublicGallery
        fields = ["gallery", "featured", "added_to_public_at", "user_name"]


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
    user_name = serializers.CharField(source='user.username', read_only=True)
    access_type = serializers.SerializerMethodField()
    
    class Meta:
        model = Gallery
        fields = [
            "id", "title", "description", "created_at", "cover_image", 
            "photo_count", "user_name", "visibility", 
            "is_shareable_via_link", "is_public", "access_type"
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
        if user == obj.user:
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


# Additional convenience serializers for the new structure

class GalleryVisibilitySerializer(serializers.Serializer):
    """Simple serializer for just updating visibility without sharing settings."""
    visibility = serializers.ChoiceField(choices=Gallery.VISIBILITY_CHOICES)
    
    def update(self, instance, validated_data):
        instance.visibility = validated_data['visibility']
        instance.save()
        
        # Handle public gallery listing
        if validated_data['visibility'] == 'public':
            PublicGallery.objects.get_or_create(gallery=instance)
        elif hasattr(instance, 'public_listing'):
            instance.public_listing.delete()
        
        return instance


class PhotoVisibilitySerializer(serializers.Serializer):
    """Simple serializer for just updating photo visibility without sharing settings."""
    visibility = serializers.ChoiceField(choices=Photo.VISIBILITY_CHOICES)
    
    def update(self, instance, validated_data):
        instance.visibility = validated_data['visibility']
        instance.save()
        return instance


class ShareLinkToggleSerializer(serializers.Serializer):
    """Serializer for toggling share link functionality only."""
    is_shareable_via_link = serializers.BooleanField()
    
    def update(self, instance, validated_data):
        instance.is_shareable_via_link = validated_data['is_shareable_via_link']
        instance.save()
        return instance