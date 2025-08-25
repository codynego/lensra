from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import MessageThread, Message
from photographers.models import Photographer, Client
from photographers.serializers import PhotographerSerializer, ClientSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class MessageSerializer(serializers.ModelSerializer):
    thread_id = serializers.IntegerField(source="thread.id", read_only=True)
    sender_name = serializers.CharField(source="sender.username", read_only=True)
    receiver_name = serializers.CharField(source="receiver.username", read_only=True)

    class Meta:
        model = Message
        fields = ["id", "sender", "sender_name", "content", "is_read", "created_at", "thread_id", "receiver_name"]
        read_only_fields = ["id", "created_at", "is_read"]


class MessageThreadSerializer(serializers.ModelSerializer):
    sender_user = UserSerializer(source="sender", read_only=True)
    receiver_user = UserSerializer(source="receiver", read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = MessageThread
        fields = [
            "id",
            "sender",
            "sender_user",
            "receiver",
            "receiver_user",
            "created_at",
            "last_message",
            "unread_count",
        ]

    def get_last_message(self, obj):
        last_msg = obj.messages.order_by("-created_at").first()
        return MessageSerializer(last_msg).data if last_msg else None

    def get_unread_count(self, obj):
        request = self.context.get("request", None)
        user = getattr(request, "user", None)
        if user and user.is_authenticated:
            return obj.messages.filter(is_read=False).exclude(sender=user).count()
        return obj.messages.filter(is_read=False).count()


class SendReplySerializer(serializers.Serializer):
    thread_id = serializers.IntegerField()
    content = serializers.CharField(max_length=2000)

    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError("Message content cannot be empty.")
        return value
