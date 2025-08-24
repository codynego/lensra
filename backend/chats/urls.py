# messaging/urls.py
from django.urls import path
from .views import (
    ThreadListView,
    MessageListView,
    SendMessageView,
    MarkMessageReadView,
)

urlpatterns = [
    # Threads
    path("threads/", ThreadListView.as_view(), name="thread-list"),

    # Messages
    path("threads/<int:thread_id>/messages/", MessageListView.as_view(), name="message-list"),
    path("messages/send/", SendMessageView.as_view(), name="message-send"),
    path("messages/<int:message_id>/read/", MarkMessageReadView.as_view(), name="message-mark-read"),
]
