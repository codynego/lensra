from django.db import models
from django.conf import settings
from photographers.models import Photographer

User = settings.AUTH_USER_MODEL

class Gallery(models.Model):
    assigned_clients = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name='assigned_galleries', blank=True
    )
    photographer = models.ForeignKey(Photographer, on_delete=models.CASCADE, related_name='galleries')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} by {self.photographer.user.username}"

class Photo(models.Model):
    assigned_clients = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name='assigned_photos', blank=True
    )
    gallery = models.ForeignKey(Gallery, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='gallery_photos/')
    caption = models.CharField(max_length=255, blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Photo in {self.gallery.title}"
