# messaging/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import MessageThread, Message
from photographers.models import Photographer, Client


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class PhotographerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Photographer
        fields = ["id", "user", "currency", "years_of_experience", "instagram", "facebook"]


class ClientSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Client
        fields = ["id", "user", "phone", "created_at"]  # adjust to your Client model fields



class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.username", read_only=True)

    class Meta:
        model = Message
        fields = ["id", "sender", "sender_name", "content", "is_read", "created_at"]


class MessageThreadSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = MessageThread
        fields = [
            "id",
            "photographer",
            "client",
            "created_at",
            "last_message",
            "unread_count",
        ]

    def get_last_message(self, obj):
        last_msg = obj.messages.order_by("-created_at").first()
        return MessageSerializer(last_msg).data if last_msg else None

    def get_unread_count(self, obj):
        request = self.context.get("request")
        if not request:
            return obj.messages.filter(is_read=False).count()

        user = request.user

        # If user is logged in (Photographer or Client linked to User)
        if user.is_authenticated:
            return obj.messages.filter(is_read=False).exclude(sender=user).count()

        # If request includes a client_id (guest client)
        client_id = request.query_params.get("client_id")
        if client_id:
            return obj.messages.filter(
                is_read=False
            ).exclude(sender=obj.client.user if hasattr(obj.client, "user") else None).count()

        return obj.messages.filter(is_read=False).count()
