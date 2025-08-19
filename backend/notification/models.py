# models.py
from django.db import models
from django.conf import settings


class NotificationSettings(models.Model):
    """
    Stores per-user notification preferences, covering channels, categories,
    and quiet hours configuration.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notification_settings"
    )

    # Notification channels
    email_notifications = models.BooleanField(default=True, help_text="Receive notifications via email")
    sms_notifications = models.BooleanField(default=False, help_text="Receive notifications via SMS")
    push_notifications = models.BooleanField(default=True, help_text="Receive push notifications in app")

    # Notification categories
    booking_reminders = models.BooleanField(default=True, help_text="Reminders for upcoming bookings")
    payment_alerts = models.BooleanField(default=True, help_text="Alerts for payments and transactions")
    marketing_emails = models.BooleanField(default=False, help_text="Receive promotional and marketing emails")
    client_messages = models.BooleanField(default=True, help_text="Notifications for direct client messages")
    system_updates = models.BooleanField(default=True, help_text="Product updates and system changes")

    # Quiet hours
    quiet_hours = models.BooleanField(default=False, help_text="Enable quiet hours for notifications")
    quiet_start = models.TimeField(null=True, blank=True, help_text="Quiet hours start time")
    quiet_end = models.TimeField(null=True, blank=True, help_text="Quiet hours end time")

    class Meta:
        verbose_name = "Notification Setting"
        verbose_name_plural = "Notification Settings"

    def __str__(self):
        return f"Notification Settings for {self.user.username}"
