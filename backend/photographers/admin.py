from .models import Photographer, Client
from django.contrib import admin


@admin.register(Photographer)
class PhotographerAdmin(admin.ModelAdmin):
    list_display = ('user', 'currency_symbol', 'years_of_experience', 'instagram', 'facebook')


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'notes')