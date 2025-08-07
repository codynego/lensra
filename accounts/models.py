from django.contrib.auth.models import AbstractUser
from django.db import models

# models.py
class User(AbstractUser):
    ROLE_CHOICES = (
        ('photographer', 'Photographer'),
        ('client', 'Client'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    def is_photographer(self):
        return self.role == 'photographer'

    def is_client(self):
        return self.role == 'client'


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"
