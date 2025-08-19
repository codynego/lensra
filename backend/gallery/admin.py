from django.contrib import admin
from .models import Gallery, Photo, GalleryPreference

@admin.register(Gallery)
class GalleryAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'created_at')
    list_filter = ('created_at', 'user')
    search_fields = ('title', 'user__username')
    ordering = ('-created_at',)
    filter_horizontal = ('assigned_clients',)  # If you want a nicer widget for many-to-many

@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    list_display = ('id', 'gallery', 'caption', 'uploaded_at')
    list_filter = ('uploaded_at', 'gallery')
    search_fields = ('caption', 'gallery__title')
    ordering = ('-uploaded_at',)
    filter_horizontal = ('assigned_clients',)

@admin.register(GalleryPreference)
class GalleryPreferenceAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "allow_public_view",
        "allow_downloads",
        "watermark_images",
        "items_per_page",
        "default_sort_order",
        "updated_at",
    )
    list_filter = (
        "allow_public_view",
        "allow_downloads",
        "watermark_images",
        "default_sort_order",
        "updated_at",
    )
    search_fields = ("user__username", "user__email", "watermark_text")
    readonly_fields = ("updated_at",)
    fieldsets = (
        ("User", {
            "fields": ("user",)
        }),
        ("Permissions & Visibility", {
            "fields": ("allow_public_view", "allow_downloads")
        }),
        ("Watermark Settings", {
            "fields": ("watermark_images", "watermark_text", "watermark_logo")
        }),
        ("Display Options", {
            "fields": ("items_per_page", "default_sort_order")
        }),
        ("System", {
            "fields": ("updated_at",),
        }),
    )