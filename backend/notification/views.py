# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import NotificationSettings
from .serializers import NotificationSettingsSerializer

class NotificationSettingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            settings = NotificationSettings.objects.get(user=request.user)
            serializer = NotificationSettingsSerializer(settings)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except NotificationSettings.DoesNotExist:
            return Response({
                'email_notifications': True,
                'sms_notifications': False,
                'push_notifications': True,
                'booking_reminders': True,
                'payment_alerts': True,
                'marketing_emails': False,
                'client_messages': True,
                'system_updates': True,
                'quiet_hours': False,
                'quiet_start': None,
                'quiet_end': None,
            }, status=status.HTTP_200_OK)

    def put(self, request):
        try:
            settings = NotificationSettings.objects.get(user=request.user)
        except NotificationSettings.DoesNotExist:
            settings = NotificationSettings(user=request.user)

        serializer = NotificationSettingsSerializer(settings, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
