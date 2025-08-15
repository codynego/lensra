from django.contrib.auth.models import AbstractUser
from django.db import models
import os
import time
from django.conf import settings
from .utils import profile_picture_upload_path


class User(AbstractUser):
    class Roles(models.TextChoices):
        PHOTOGRAPHER = "photographer", "Photographer"
        CLIENT = "client", "Client"
    role = models.CharField(
        max_length=20,
        choices=Roles.choices,
        default=Roles.CLIENT
    )
    profile_picture = models.ImageField(
        upload_to=profile_picture_upload_path,
        blank=True,
        null=True
    )
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)

    def is_photographer(self):
        return self.role == self.ROLES[0][0]

    def is_client(self):
        return self.role == self.ROLES[1][0]

    def __str__(self):
        return self.username

