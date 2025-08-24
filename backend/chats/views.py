from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from photographers.models import Client, Photographer
from .models import MessageThread, Message
from .serializers import MessageThreadSerializer, MessageSerializer


class ThreadListView(generics.ListAPIView):
    """
    List threads for the logged-in photographer or client (if using accounts)
    """
    serializer_class = MessageThreadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'photographer'):
            return MessageThread.objects.filter(photographer=user.photographer)
        elif hasattr(user, 'client'):
            return MessageThread.objects.filter(client=user.client)
        return MessageThread.objects.none()



class MessageListView(generics.ListAPIView):
    """
    List messages in a thread
    """
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        thread_id = self.kwargs["thread_id"]
        return Message.objects.filter(thread_id=thread_id).order_by("created_at")


class SendMessageView(APIView):
    """
    Send message (works for logged-in users and guests)
    """
    def post(self, request):
        content = request.data.get("content")
        photographer_id = request.data.get("photographer_id")
        client_email = request.data.get("email")
        client_name = request.data.get("name")
        client_phone = request.data.get("phone")

        if not content or not photographer_id or not client_email:
            return Response(
                {"detail": "content, photographer_id and email are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        photographer = get_object_or_404(Photographer, id=photographer_id)

        # Check or create client
        client, created = Client.objects.get_or_create(
            email=client_email,
            defaults={"name": client_name, "phone": client_phone}
        )

        # Get or create thread
        thread, _ = MessageThread.objects.get_or_create(
            photographer=photographer, client=client
        )

        # Determine sender
        if request.user.is_authenticated:
            sender = request.user
        else:
            # For guest clients, tie them to the client’s email
            sender, _ = User.objects.get_or_create(
                username=f"client_{client.id}", defaults={"email": client_email}
            )

        # Create message
        message = Message.objects.create(
            thread=thread, sender=sender, content=content
        )

        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)


class MarkMessageReadView(APIView):
    """
    Mark a message as read
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, message_id):
        message = get_object_or_404(Message, id=message_id)

        # Prevent sender from marking their own message as read
        if message.sender == request.user:
            return Response(
                {"detail": "You cannot mark your own message as read."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        message.is_read = True
        message.save()
        return Response({"detail": "Message marked as read."})
