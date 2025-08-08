from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('photographer', 'client', 'date', 'time', 'status')
    list_filter = ('status', 'date')
    search_fields = ('photographer__user__username', 'client__user__username')
    ordering = ('-date', '-time')

    fieldsets = (
        (None, {'fields': ('photographer', 'client', 'date', 'time', 'status')}),
    )
