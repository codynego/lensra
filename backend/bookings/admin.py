from django.contrib import admin
from .models import (
    ServicePackage,
    Booking,
    Payment,
    PhotographerTimeSlot,
    PhotographerBlockedDate,
    PhotographerAvailability,
)


@admin.register(ServicePackage)
class ServicePackageAdmin(admin.ModelAdmin):
    list_display = ("title", "photographer", "price", "duration_minutes", "is_active")
    list_filter = ("is_active", "photographer")
    search_fields = ("title", "photographer__user__username")


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("client", "photographer", "package", "date", "start_time", "status", "total_price")
    list_filter = ("status", "date", "photographer")
    search_fields = ("client__username", "photographer__user__username")
    date_hierarchy = "date"


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("booking", "amount", "payment_status", "transaction_id", "created_at")
    list_filter = ("payment_status",)
    search_fields = ("transaction_id",)


@admin.register(PhotographerTimeSlot)
class PhotographerTimeSlotAdmin(admin.ModelAdmin):
    list_display = ("photographer", "date", "start_time", "end_time", "is_booked")
    list_filter = ("date", "is_booked")
    search_fields = ("photographer__user__username",)


@admin.register(PhotographerBlockedDate)
class PhotographerBlockedDateAdmin(admin.ModelAdmin):
    list_display = ("photographer", "date", "reason")
    list_filter = ("date",)
    search_fields = ("photographer__user__username",)


@admin.register(PhotographerAvailability)
class PhotographerAvailabilityAdmin(admin.ModelAdmin):
    list_display = ("photographer", "day_of_week", "start_time", "end_time")
    list_filter = ("day_of_week",)
    search_fields = ("photographer__user__username",)
