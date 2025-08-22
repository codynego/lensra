from django.conf import settings
from django.db import models
from .utils import get_currency_symbol, CURRENCY_SYMBOLS

User = settings.AUTH_USER_MODEL

class Photographer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='photographer')
    currency = models.CharField(
        max_length=10,
        default='USD',
        choices=[(c, c) for c in CURRENCY_SYMBOLS.keys()]  # Dropdown in admin
    )
    years_of_experience = models.PositiveIntegerField(default=0)
    instagram = models.URLField(blank=True, null=True)
    facebook = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username

    @property
    def currency_symbol(self):
        """Return the currency symbol for this photographer's currency."""
        return get_currency_symbol(self.currency)



class Client(models.Model):
    photographer = models.ForeignKey(
        'Photographer',
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
