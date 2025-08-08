from .models import Photographer
from django.contrib import admin


@admin.register(Photographer)
class PhotographerAdmin(admin.ModelAdmin):
    list_display = ('user', 'studio_name', 'phone_number', 'location')