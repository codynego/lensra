from django.contrib import admin
from .models import Studio

@admin.register(Studio)
class StudioAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "slug", "custom_domain", "custom_domain_verified", "status", "photographer")
    list_filter = ("status", "custom_domain_verified")
    search_fields = ("name", "slug", "custom_domain", "photographer__user__email", "photographer__user__username")
    readonly_fields = ("verification_token",)
