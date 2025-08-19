# accounts/models.py
from django.db import models

class Waitlist(models.Model):
    name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(unique=True)
    studio_name = models.CharField(max_length=150, blank=True)
    whatsapp = models.CharField(max_length=20, blank=True)  # new field
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email
