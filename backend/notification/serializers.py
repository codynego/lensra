# serializers.py
from rest_framework import serializers
from .models import NotificationSettings
from django.utils import timezone

class NotificationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationSettings
        fields = [
            'email_notifications',
            'sms_notifications',
            'push_notifications',
            'booking_reminders',
            'payment_alerts',
            'marketing_emails',
            'client_messages',
            'system_updates',
            'quiet_hours',
            'quiet_start',
            'quiet_end',
        ]

    def validate(self, data):
        if data.get('quiet_hours'):
            if not data.get('quiet_start') or not data.get('quiet_end'):
                raise serializers.ValidationError({
                    'quiet_hours': 'Quiet start and end times must be provided when quiet hours are enabled.'
                })
        return data
