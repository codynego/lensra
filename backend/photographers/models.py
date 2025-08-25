from django.conf import settings
from django.db import models
from .utils import get_currency_symbol, CURRENCY_SYMBOLS

User = settings.AUTH_USER_MODEL


class Photographer(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='photographer'
    )
    currency = models.CharField(
        max_length=10,
        default='USD',
        choices=[(c, c) for c in CURRENCY_SYMBOLS.keys()]
    )
    years_of_experience = models.PositiveIntegerField(default=0)
    instagram = models.URLField(blank=True, null=True)
    facebook = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # Many-to-many relation to users via Client
    all_clients = models.ManyToManyField(
        User,
        through='Client',
        related_name='photographers'
    )

    def __str__(self):
        return self.user.username

    @property
    def currency_symbol(self):
        return get_currency_symbol(self.currency)

    def add_client(self, user, notes=None):
        """Tag a user as a client with optional notes."""
        tag, created = PhotographerClient.objects.get_or_create(
            photographer=self, client=user
        )
        if notes:
            tag.notes = notes
            tag.save(update_fields=['notes'])
        return tag

    def remove_client(self, user):
        """Remove a tagged client."""
        PhotographerClient.objects.filter(photographer=self, client=user).delete()


class Client(models.Model):
    """
    Through model linking a Photographer to a User (client).
    Allows additional metadata like notes.
    """
    photographer = models.ForeignKey(
        Photographer,
        on_delete=models.CASCADE,
        related_name='client_tags'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='client_tags'
    )
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('photographer', 'user')
        ordering = ['-created_at']

    @property
    def name(self):
        return self.user.get_full_name() or self.user.username

    @property
    def email(self):
        return self.user.email

    @property
    def is_registered(self):
        return True  # always tied to a user

    def __str__(self):
        return f"{self.name} (Client of {self.photographer.user.username})"
