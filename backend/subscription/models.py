# subscriptions/models.py
from django.db import models
from django.conf import settings

class SubscriptionPlan(models.Model):
    name = models.CharField(max_length=100, unique=True)
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    description = models.TextField(blank=True, null=True)
    features = models.JSONField(default=dict)  
    # e.g. {"galleries": 1, "storage": "2GB", "ai_tools": ["background_removal", "enhancer"]}

    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class UserSubscription(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.SET_NULL, null=True)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(blank=True, null=True)  # for expiring subs
    auto_renew = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user} → {self.plan}"
