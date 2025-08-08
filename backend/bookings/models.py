from django.db import models
from django.conf import settings
from photographers.models import Photographer

User = settings.AUTH_USER_MODEL

class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('canceled', 'Canceled'),
        ('completed', 'Completed'),
    ]

    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    photographer = models.ForeignKey(Photographer, on_delete=models.CASCADE, related_name='bookings')
    date = models.DateField()
    time = models.TimeField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking by {self.client} with {self.photographer} on {self.date} at {self.time}"
