from django.conf import settings
from django.db import models

User = settings.AUTH_USER_MODEL

class Photographer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='photographer')
    studio_name = models.CharField(max_length=255)
    website = models.URLField(blank=True, null=True)
    instagram = models.URLField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='photographers/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.studio_name or self.user.username
