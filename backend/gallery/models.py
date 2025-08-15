from django.db import models
from django.conf import settings
from django.utils.crypto import get_random_string

User = settings.AUTH_USER_MODEL

class Gallery(models.Model):
    VISIBILITY_CHOICES = [
        ('private', 'Private'),
        ('public', 'Public Gallery'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='galleries',
        blank=True, null=True
    )
    assigned_clients = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name='assigned_galleries', blank=True
    )
    # Users who have access to this gallery (either assigned or added via share)
    accessible_users = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name='accessible_galleries', blank=True
    )
    parent_gallery = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        related_name='sub_galleries',
        blank=True,
        null=True
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    defaults = models.JSONField(default=dict, blank=True, null=True)
    
    # Separate visibility and sharing controls
    visibility = models.CharField(
        max_length=20, 
        choices=VISIBILITY_CHOICES, 
        default='private',
        help_text="Controls who can discover and view this gallery"
    )
    is_shareable_via_link = models.BooleanField(
        default=False,
        help_text="Allow sharing this gallery via a unique link"
    )
    
    # Unique share token for generating shareable URLs
    share_token = models.CharField(
        max_length=32, 
        unique=True, 
        blank=True, 
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Generate share token if sharing is enabled and token doesn't exist
        if self.is_shareable_via_link and not self.share_token:
            self.share_token = get_random_string(32)
        # Clear share token if sharing is disabled
        elif not self.is_shareable_via_link:
            self.share_token = None
        
        super().save(*args, **kwargs)

    @property
    def is_public(self):
        """Helper property for backward compatibility and clarity."""
        return self.visibility == 'public'

    @property
    def cover_photo(self):
        """Returns the first photo in the gallery as the cover if available."""
        first_photo = self.photos.first()
        return first_photo.image.url if first_photo else None

    @property
    def share_url(self):
        """Returns the shareable URL if sharing is enabled."""
        if self.share_token and self.is_shareable_via_link:
            from django.urls import reverse
            return reverse('gallery-share', kwargs={'token': self.share_token})
        return None

    def add_user_access(self, user):
        """Add a user to accessible_users without creating duplicates."""
        if not self.accessible_users.filter(id=user.id).exists():
            self.accessible_users.add(user)

    def can_user_access(self, user):
        """Check if a user can access this gallery."""
        # Public galleries are accessible to everyone
        if self.is_public:
            return True
        
        if user.is_authenticated:
            return (
                user == self.user or
                self.assigned_clients.filter(id=user.id).exists() or
                self.accessible_users.filter(id=user.id).exists()
            )
        return False

    def __str__(self):
        return f"{self.title} by {self.user.username}"


class Photo(models.Model):
    VISIBILITY_CHOICES = [
        ('private', 'Private'),
        ('public', 'Public Photo'),
    ]
    
    gallery = models.ForeignKey(
        Gallery, on_delete=models.CASCADE, related_name='photos'
    )
    assigned_clients = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name='assigned_photos', blank=True
    )
    # Users who have access to this photo (either assigned or added via share)
    accessible_users = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name='accessible_photos', blank=True
    )
    defaults = models.JSONField(default=dict, blank=True, null=True)
    image = models.ImageField(upload_to='gallery_photos/')
    caption = models.CharField(max_length=255, blank=True, null=True)
    
    # Separate visibility and sharing controls
    visibility = models.CharField(
        max_length=20, 
        choices=VISIBILITY_CHOICES, 
        default='private',
        help_text="Controls who can discover and view this photo"
    )
    is_shareable_via_link = models.BooleanField(
        default=False,
        help_text="Allow sharing this photo via a unique link"
    )
    
    # Unique share token for generating shareable URLs
    share_token = models.CharField(
        max_length=32, 
        unique=True, 
        blank=True, 
        null=True
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Generate share token if sharing is enabled and token doesn't exist
        if self.is_shareable_via_link and not self.share_token:
            self.share_token = get_random_string(32)
        # Clear share token if sharing is disabled
        elif not self.is_shareable_via_link:
            self.share_token = None
        
        super().save(*args, **kwargs)

    @property
    def is_public(self):
        """Helper property for backward compatibility and clarity."""
        return self.visibility == 'public'

    @property
    def share_url(self):
        """Returns the shareable URL if sharing is enabled."""
        if self.share_token and self.is_shareable_via_link:
            from django.urls import reverse
            return reverse('photo-share', kwargs={'token': self.share_token})
        return None

    def add_user_access(self, user):
        """Add a user to accessible_users without creating duplicates."""
        if not self.accessible_users.filter(id=user.id).exists():
            self.accessible_users.add(user)

    def can_user_access(self, user):
        """Check if a user can access this photo."""
        # Public photos are accessible to everyone
        if self.is_public:
            return True
        
        if user.is_authenticated:
            return (
                user == self.gallery.user or
                self.assigned_clients.filter(id=user.id).exists() or
                self.accessible_users.filter(id=user.id).exists() or
                self.gallery.can_user_access(user)  # Inherit gallery access
            )
        return False

    def __str__(self):
        return f"Photo in {self.gallery.title}"


class PublicGallery(models.Model):
    """Manager for public galleries - this could be a separate view/manager instead"""
    gallery = models.OneToOneField(
        Gallery, 
        on_delete=models.CASCADE, 
        related_name='public_listing'
    )
    featured = models.BooleanField(default=False)
    added_to_public_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Public Galleries"
    
    def __str__(self):
        return f"Public: {self.gallery.title}"


class SharedAccess(models.Model):
    """Track when users gain access to galleries/photos via sharing"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE
    )
    gallery = models.ForeignKey(
        Gallery, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True
    )
    photo = models.ForeignKey(
        Photo, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True
    )
    access_method = models.CharField(
        max_length=20,
        choices=[
            ('share_link', 'Via Share Link'),
            ('public_gallery', 'From Public Gallery'),
            ('assigned', 'Directly Assigned'),
        ]
    )
    accessed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = [
            ['user', 'gallery'],
            ['user', 'photo'],
        ]
    
    def __str__(self):
        item = self.gallery or self.photo
        return f"{self.username} - {item} ({self.access_method})"



# preferences/models.py

from django.db import models
from django.conf import settings

class GalleryPreference(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="gallery_preference"
    )

    # Example preferences — customize as needed
    allow_public_view = models.BooleanField(default=True)
    allow_downloads = models.BooleanField(default=False)
    watermark_images = models.BooleanField(default=True)
    watermark_text = models.CharField(
        max_length=255, 
        blank=True, 
        null=True,
        help_text="Text to use for watermarking images"
    )
    watermark_logo = models.ImageField(
        upload_to='watermark_logos/', 
        blank=True, 
        null=True,
        help_text="Logo to use for watermarking images"
    )
    items_per_page = models.PositiveIntegerField(default=20)
    default_sort_order = models.CharField(
        max_length=20,
        choices=[
            ("newest", "Newest First"),
            ("oldest", "Oldest First"),
            ("popular", "Most Viewed"),
        ],
        default="newest"
    )

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Gallery Preferences"
