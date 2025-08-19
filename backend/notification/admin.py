# admin.py
from django.contrib import admin
from .models import NotificationSettings


@admin.register(NotificationSettings)
class NotificationSettingsAdmin(admin.ModelAdmin):
    """
    Admin configuration for NotificationSettings with logical grouping
    for better usability.
    """

    list_display = ("user", "email_notifications", "sms_notifications", "push_notifications", "quiet_hours")
    search_fields = ("user__username", "user__email")
    list_filter = ("email_notifications", "sms_notifications", "push_notifications", "quiet_hours")

    fieldsets = (
        ("User", {
            "fields": ("user",),
        }),
        ("Notification Channels", {
            "fields": ("email_notifications", "sms_notifications", "push_notifications"),
        }),
        ("Notification Categories", {
            "fields": ("booking_reminders", "payment_alerts", "marketing_emails", "client_messages", "system_updates"),
        }),
        ("Quiet Hours", {
            "fields": ("quiet_hours", "quiet_start", "quiet_end"),
        }),
    )
