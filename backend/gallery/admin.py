from django.contrib import admin
from .models import Gallery, Photo

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
