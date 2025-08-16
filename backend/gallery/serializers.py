from rest_framework import serializers
from .models import Gallery, Photo, PublicGallery, SharedAccess
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction
from studio.models import Studio

User = get_user_model()

from .models import GalleryPreference

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]


class GalleryPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryPreference
        fields = '__all__'
        read_only_fields = ['user', 'updated_at']


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
    slug = serializers.SerializerMethodField()

    class Meta:
        model = Gallery
        fields = [
            "id",
            "title",
            "description",
            "created_at",
            "photos",
            "sub_galleries",
            "assigned_clients",
            "accessible_users",
            "visibility",
            "is_shareable_via_link",
            "share_url",
            "is_public",
            "slug"
        ]

    def get_sub_galleries(self, obj):
        return GalleryRecursiveSerializer(
            obj.sub_galleries.all(),
            many=True,
            context=self.context
        ).data

    def get_slug(self, obj):
        """Return the slug for the gallery owner: use Studio slug if photographer, else username."""
        user = obj.user
        try:
            studio = Studio.objects.get(photographer=user)
            if studio.slug:
                return studio.slug
        except Studio.DoesNotExist:
            pass
        return user.username




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
    slug = serializers.SerializerMethodField()  # <-- added

    class Meta:
        model = Gallery
        fields = [
            "id",
            "user",
            "slug",  # <-- added
            "title",
            "description",
            "created_at",
            "photos",
            "sub_galleries",
            "assigned_clients",
            "accessible_users",
            "cover_image",
            "visibility",
            "is_shareable_via_link",
            "share_url",
            "is_public",
            "can_share",
            "access_type",
            "photo_count",
            "is_featured"
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

    def get_slug(self, obj):
        """Return the slug for the gallery owner: use Studio slug if photographer, else username."""
        user = obj.user
        try:
            studio = Studio.objects.get(photographer=user)
            if studio.slug:
                return studio.slug
        except Studio.DoesNotExist:
            pass
        return user.username



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
    slug = serializers.SerializerMethodField()  # Added slug field
    
    class Meta:
        model = Gallery
        fields = [
            "id", "title", "description", "created_at", "cover_image", 
            "photo_count", "user_name", "visibility", 
            "is_shareable_via_link", "is_public", "access_type", "slug"
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

    def get_slug(self, obj):
        """Return the slug for the gallery owner: use Studio slug if photographer, else username."""
        user = obj.user
        try:
            studio = Studio.objects.get(photographer=user)
            if studio.slug:
                return studio.slug
        except Studio.DoesNotExist:
            pass
        return user.username


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



class MovePhotoSerializer(serializers.Serializer):
    photo_id = serializers.IntegerField()
    target_gallery_id = serializers.IntegerField()

    def validate(self, data):
        photo_id = data.get('photo_id')
        target_gallery_id = data.get('target_gallery_id')

        try:
            photo = Photo.objects.get(id=photo_id)
        except Photo.DoesNotExist:
            raise serializers.ValidationError("Photo not found.")

        try:
            target_gallery = Gallery.objects.get(id=target_gallery_id)
        except Gallery.DoesNotExist:
            raise serializers.ValidationError("Target gallery not found.")

        # # Ensure the target gallery is public + selection mode enabled
        # if not target_gallery.is_public or not target_gallery.selection_mode:
        #     raise serializers.ValidationError("This gallery is not open for selection.")

        # Optionally: Prevent moving a photo out of its original parent gallery
        if photo.gallery_id == target_gallery.id:
            raise serializers.ValidationError("Photo is already in this gallery.")

        data['photo'] = photo
        data['target_gallery'] = target_gallery
        return data

    def save(self, **kwargs):
        photo = self.validated_data['photo']
        target_gallery = self.validated_data['target_gallery']

        # Move the photo into the target gallery
        photo.gallery = target_gallery
        photo.save()
        return photo



class EnableSelectionModeSerializer(serializers.Serializer):
    gallery_id = serializers.IntegerField()

    def validate_gallery_id(self, value):
        user = self.context['request'].user
        try:
            gallery = Gallery.objects.get(id=value)
        except Gallery.DoesNotExist:
            raise serializers.ValidationError("Gallery not found.")

        if gallery.user != user:
            raise serializers.ValidationError("You do not have permission to modify this gallery.")

        return value

    def save(self, **kwargs):
        user = self.context['request'].user
        gallery = Gallery.objects.get(id=self.validated_data['gallery_id'])

        # Enable share link for the gallery
        gallery.is_shareable_via_link = True
        gallery.save()  # triggers share_token generation

        # Create "Liked" and "Disliked" sub-galleries if they don't exist
        liked_sub_gallery, liked_created = Gallery.objects.get_or_create(
            parent_gallery=gallery,
            title="Liked",
            user=user
        )
        disliked_sub_gallery, disliked_created = Gallery.objects.get_or_create(
            parent_gallery=gallery,
            title="Disliked",
            user=user
        )

        return {
            "gallery_id": gallery.id,
            "public_selection_url": gallery.public_selection_url,
            "liked_sub_gallery_id": liked_sub_gallery.id,
            "disliked_sub_gallery_id": disliked_sub_gallery.id,
            "sub_galleries_created": liked_created or disliked_created
        }



class PublicPhotoSerializer(serializers.ModelSerializer):
    # Return watermarked image URL
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Photo
        fields = ['id', 'image_url', 'caption']

    def get_image_url(self, obj):
        # Replace with your watermark method if available
        # e.g., obj.get_watermarked_url()
        request = self.context.get('request')
        if hasattr(obj, 'get_watermarked_url'):
            url = obj.get_watermarked_url()
        else:
            url = obj.image.url
        # Make it absolute if request is provided
        if request:
            return request.build_absolute_uri(url)
        return url

class PublicPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photo
        fields = ['id', 'image', 'caption']


class PublicSubGallerySerializer(serializers.ModelSerializer):
    photos = serializers.SerializerMethodField()

    class Meta:
        model = Gallery
        fields = ['id', 'title', 'description', 'photos']

    def get_photos(self, obj):
        photos = obj.photos.all()
        return PublicPhotoSerializer(photos, many=True, context=self.context).data


class PublicSelectionGallerySerializer(serializers.ModelSerializer):
    photos = serializers.SerializerMethodField()
    sub_galleries = serializers.SerializerMethodField()
    public_selection_url = serializers.SerializerMethodField()
    liked_sub_gallery_id = serializers.SerializerMethodField()
    disliked_sub_gallery_id = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()

    class Meta:
        model = Gallery
        fields = [
            'id',
            'title',
            'name',
            'description',
            'share_token',
            'public_selection_url',
            'photos',
            'sub_galleries',
            'liked_sub_gallery_id',
            'disliked_sub_gallery_id',
        ]

    def get_photos(self, obj):
        photos = obj.photos.all()
        return PublicPhotoSerializer(photos, many=True, context=self.context).data

    def get_sub_galleries(self, obj):
        sub_galleries = obj.sub_galleries.all()
        return PublicSubGallerySerializer(sub_galleries, many=True, context=self.context).data

    def get_name(self, obj):
        """Return the name for the gallery owner: use Studio name if photographer, else username."""
        user = obj.user
        try:
            studio = Studio.objects.get(photographer=user)
            if studio.name:
                return studio.name
        except Studio.DoesNotExist:
            pass
        return user.username

    def get_public_selection_url(self, obj):
        request = self.context.get('request')
        if obj.share_token:
            from django.urls import reverse
            url = reverse('public_selection_gallery', kwargs={'token': obj.share_token})
            if request:
                return request.build_absolute_uri(url)
            return url
        return None

    def get_liked_sub_gallery_id(self, obj):
        liked = obj.sub_galleries.filter(title__iexact="Liked").first()
        return liked.id if liked else None

    def get_disliked_sub_gallery_id(self, obj):
        disliked = obj.sub_galleries.filter(title__iexact="Disliked").first()
        return disliked.id if disliked else None

