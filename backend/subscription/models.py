# subscriptions/models.py
from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta


class SubscriptionPlan(models.Model):
    name = models.CharField(max_length=100, unique=True)
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    description = models.TextField(blank=True, null=True)
    
    # Number of sparks (credits) a user gets per day
    sparks_per_day = models.PositiveIntegerField(default=0)
    
    features = models.JSONField(default=dict)  
    # Example: {"galleries": 1, "storage": "2GB", "ai_tools": ["background_removal", "enhancer"]}

    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class UserSubscription(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.SET_NULL, null=True)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(blank=True, null=True)  # for expiring subs
    auto_renew = models.BooleanField(default=True)

    # Sparks tracking
    sparks_used = models.PositiveIntegerField(default=0)
    sparks_remaining = models.PositiveIntegerField(default=0)
    last_reset = models.DateField(default=timezone.now)

    def __str__(self):
        return f"{self.user} → {self.plan}"

    def reset_sparks(self):
        """Reset sparks at the start of a new day."""
        today = timezone.now().date()
        if self.last_reset < today:
            self.sparks_remaining = self.plan.sparks_per_day if self.plan else 0
            self.sparks_used = 0  # reset daily usage counter
            self.last_reset = today
            self.save(update_fields=["sparks_remaining", "sparks_used", "last_reset"])

    def use_spark(self, count=1):
        """Consume sparks if available."""
        self.reset_sparks()
        if self.sparks_remaining >= count:
            self.sparks_remaining -= count
            self.sparks_used += count  # track usage
            self.save(update_fields=["sparks_remaining", "sparks_used"])
            return True
        return False

    def has_sparks(self, count=1):
        """Check if user has enough sparks left."""
        self.reset_sparks()
        return self.sparks_remaining >= count

    def save(self, *args, **kwargs):
        """Ensure sparks are initialized from plan when creating/updating."""
        if self.plan and self.sparks_remaining == 0 and self.sparks_used == 0:
            self.sparks_remaining = self.plan.sparks_per_day
        super().save(*args, **kwargs)


class Stats(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, 
        related_name="stats"
    )

    galleries_count = models.PositiveIntegerField(default=0)
    photos_count = models.PositiveIntegerField(default=0)
    clients_count = models.PositiveIntegerField(default=0)
    bookings_count = models.PositiveIntegerField(default=0)
    storage_used = models.BigIntegerField(default=0)  # bytes

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Stats for {self.user.username}"
