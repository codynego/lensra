from django.db import models
from django.conf import settings
from photographers.models import Photographer

User = settings.AUTH_USER_MODEL

class Gallery(models.Model):
    photographer = models.ForeignKey(
        Photographer, on_delete=models.CASCADE, related_name='galleries'
    )
    assigned_clients = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name='assigned_galleries', blank=True
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
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def cover_photo(self):
        """Returns the first photo in the gallery as the cover if available."""
        first_photo = self.photos.first()
        return first_photo.image.url if first_photo else None

    def __str__(self):
        return f"{self.title} by {self.photographer.user.username}"



class Photo(models.Model):
    gallery = models.ForeignKey(
        Gallery, on_delete=models.CASCADE, related_name='photos'
    )
    assigned_clients = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name='assigned_photos', blank=True
    )
    image = models.ImageField(upload_to='gallery_photos/')
    caption = models.CharField(max_length=255, blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Photo in {self.gallery.title}"
