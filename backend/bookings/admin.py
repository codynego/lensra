# bookings/admin.py
from django.contrib import admin
from .models import ServicePackage, Booking, BookingPreference, Payment


# ----------------------
# 📌 Payment Inline (inside Booking admin)
# ----------------------
class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0
    readonly_fields = ("amount_paid", "payment_status", "payment_method", "transaction_id", "created_at", "paid_at")


# ----------------------
# 📌 Service Package Admin
# ----------------------
@admin.register(ServicePackage)
class ServicePackageAdmin(admin.ModelAdmin):
    list_display = ("title", "photographer", "price", "duration", "is_active", "created_at")
    list_filter = ("is_active", "created_at", "photographer")
    search_fields = ("title", "photographer__user__username")
    ordering = ("title",)


# ----------------------
# 📌 Booking Admin
# ----------------------
@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        "id", "client", "photographer", "service_package",
        "session_date", "session_time", "status", "package_price",
        "created_at", "updated_at"
    )
    list_filter = ("status", "session_date", "photographer", "created_at")
    search_fields = (
        "id", "client__name", "client__email", "photographer__user__username",
        "service_package__title"
    )
    date_hierarchy = "session_date"
    inlines = [PaymentInline]
    ordering = ("-created_at",)


# ----------------------
# 📌 Booking Preference Admin
# ----------------------
@admin.register(BookingPreference)
class BookingPreferenceAdmin(admin.ModelAdmin):
    list_display = (
        "photographer", "available_days", "start_time", "end_time",
        "min_notice_hours", "max_future_days", "allow_same_day",
        "deposit_required", "deposit_percentage", "auto_confirm", "created_at"
    )
    list_filter = ("allow_same_day", "deposit_required", "auto_confirm", "created_at")
    search_fields = ("photographer__username",)


# ----------------------
# 📌 Payment Admin
# ----------------------
@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "id", "booking", "amount_paid", "payment_status",
        "payment_method", "transaction_id", "created_at", "paid_at"
    )
    list_filter = ("payment_status", "payment_method", "created_at", "paid_at")
    search_fields = ("transaction_id", "booking__id", "booking__client__name", "booking__photographer__user__username")
    ordering = ("-created_at",)
    readonly_fields = ("created_at", "paid_at")
