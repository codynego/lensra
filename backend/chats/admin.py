from django.contrib import admin
from .models import MessageThread, Message


class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    fields = ("sender", "content", "is_read", "created_at")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)


@admin.register(MessageThread)
class MessageThreadAdmin(admin.ModelAdmin):
    list_display = ("id", "receiver", "sender", "created_at", "unread_count")
    search_fields = ("receiver__username", "sender__email")
    list_filter = ("created_at",)
    inlines = [MessageInline]

    def unread_count(self, obj):
        return obj.messages.filter(is_read=False).count()
    unread_count.short_description = "Unread Messages"


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("id", "thread", "sender", "short_content", "is_read", "created_at")
    list_filter = ("is_read", "created_at", "sender")
    search_fields = ("content", "sender__username", "thread__id")
    readonly_fields = ("created_at",)

    def short_content(self, obj):
        return obj.content[:50] + ("..." if len(obj.content) > 50 else "")
    short_content.short_description = "Content"
