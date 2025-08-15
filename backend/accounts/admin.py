from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Extra Info', {'fields': ('role', 'profile_picture', 'bio', 'phone_number', 'location')}),
    )
    list_display = ('username', 'email', 'role', 'is_staff', 'is_active', 'profile_picture', 'phone_number', 'location')


