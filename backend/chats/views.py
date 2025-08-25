from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils.crypto import get_random_string
from photographers.models import Client, Photographer
from .models import MessageThread, Message
from .serializers import MessageThreadSerializer, MessageSerializer, SendReplySerializer
from rest_framework.permissions import IsAuthenticated

User = get_user_model()


class ThreadListView(generics.ListAPIView):
    """List threads for the authenticated user (photographer or client)"""
    serializer_class = MessageThreadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return MessageThread.objects.filter(sender=user) | MessageThread.objects.filter(receiver=user)


class MessageListView(generics.ListAPIView):
    """List messages in a specific thread"""
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        thread_id = self.kwargs["thread_id"]
        thread = get_object_or_404(MessageThread, id=thread_id)
        user = self.request.user
        # Ensure the user is part of this thread
        if thread.sender != user and thread.receiver != user:
            return Message.objects.none()
        return thread.messages.order_by("created_at")


class SendMessageView(APIView):
    """
    Send a message between a photographer and a client.
    Works for both authenticated and guest users.
    """
    permission_classes = []

    def post(self, request):
        content = request.data.get("content")
        photographer_id = request.data.get("photographer_id")
        client_email = request.data.get("email")
        client_name = request.data.get("name")
        client_phone = request.data.get("phone")

        if not content or not photographer_id or not client_email or not client_name:
            return Response(
                {"detail": "Content, photographer_id, name, and email are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        photographer = get_object_or_404(Photographer, id=photographer_id)

        # Handle sender: authenticated user or guest client
        if request.user.is_authenticated:
            sender = request.user
            # Ensure a Client record exists for this photographer
            client, _ = Client.objects.get_or_create(user=sender, photographer=photographer)
        else:
            # Create guest user
            base_username = client_name.replace(" ", "_").lower()
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1

            sender = User.objects.create_user(
                username=username,
                email=client_email,
                first_name=client_name.split(" ")[0],
                last_name=" ".join(client_name.split(" ")[1:]) if len(client_name.split(" ")) > 1 else "",
                password=get_random_string(12),
            )

            # Create client record
            client = Client.objects.create(
                user=sender,
                photographer=photographer,
                notes=client_phone
            )

        # Ensure a unique thread per sender/receiver
        thread, _ = MessageThread.objects.get_or_create(
            sender=min(sender, photographer.user, key=lambda u: u.id),
            receiver=max(sender, photographer.user, key=lambda u: u.id)
        )

        # Create the message
        message = Message.objects.create(thread=thread, sender=sender, content=content)

        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)



class MarkMessageReadView(APIView):
    """Mark a message as read by the receiver"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, message_id):
        message = get_object_or_404(Message, id=message_id)
        user = request.user

        if message.sender == user:
            return Response(
                {"detail": "You cannot mark your own message as read."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if message.thread.receiver != user and message.thread.sender != user:
            return Response(
                {"detail": "You do not belong to this thread."},
                status=status.HTTP_403_FORBIDDEN
            )

        message.is_read = True
        message.save()
        return Response({"detail": "Message marked as read."})


class SendReplyView(APIView):
    """
    Send a reply to an existing thread.
    Only authenticated users (photographers or clients) can reply.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SendReplySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        thread_id = serializer.validated_data["thread_id"]
        content = serializer.validated_data["content"]

        # Get the thread
        thread = get_object_or_404(MessageThread, id=thread_id)
        user = request.user

        # Ensure user is part of the thread
        if thread.sender != user and thread.receiver != user:
            return Response(
                {"detail": "You are not part of this thread."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Create the message
        message = Message.objects.create(thread=thread, sender=user, content=content)

        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)