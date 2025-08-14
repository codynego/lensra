from django.conf import settings
from django.db import models

User = settings.AUTH_USER_MODEL

class Photographer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='photographer')
    instagram = models.URLField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='photographers/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username



class Client(models.Model):
    photographer = models.ForeignKey(
        'Photographer',  # Reference to your Photographer model
        on_delete=models.CASCADE,
        related_name="clients"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="photographer_clients"
    )
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def get_full_name(self):
        """Return full name of the client, handling both registered and guest clients."""
        if self.user:
            return self.user.get_full_name()
        return self.name

    @property
    def is_registered(self):
        return self.user is not None

    def __str__(self):
        return self.name
