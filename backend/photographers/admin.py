from .models import Photographer, Client
from django.contrib import admin


@admin.register(Photographer)
class PhotographerAdmin(admin.ModelAdmin):
    list_display = ('user', 'studio_name', 'phone_number', 'location')


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'notes')