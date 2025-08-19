from django.contrib import admin
from .models import Waitlist

@admin.register(Waitlist)
class WaitlistAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email', 'studio_name', 'whatsapp', 'created_at')
    search_fields = ('email', 'name', 'studio_name')
    list_filter = ('created_at',)
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)

    # def has_add_permission(self, request):
    #     return false
