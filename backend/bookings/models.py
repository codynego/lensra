from django.db import models
from django.conf import settings
from decimal import Decimal
from photographers.models import Client, Photographer

User = settings.AUTH_USER_MODEL


# ----------------------
# 📌 Service Package
# ----------------------
class ServicePackage(models.Model):
    photographer = models.ForeignKey(
        Photographer,
        on_delete=models.CASCADE,
        related_name="packages"
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.PositiveIntegerField(  # in minutes
        help_text="Length of the session in minutes"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return f"{self.title} - {self.photographer.user.username}"


# ----------------------
# 📌 Booking
# ----------------------
class Booking(models.Model):
    STATUS_PENDING = "pending"
    STATUS_CONFIRMED = "confirmed"
    STATUS_COMPLETED = "completed"
    STATUS_CANCELLED = "cancelled"

    BOOKING_STATUS = [
        (STATUS_PENDING, "Pending"),
        (STATUS_CONFIRMED, "Confirmed"),
        (STATUS_COMPLETED, "Completed"),
        (STATUS_CANCELLED, "Cancelled"),
    ]

    photographer = models.ForeignKey(
        Photographer,
        on_delete=models.CASCADE,
        related_name="bookings"
    )
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name="bookings"
    )
    service_package = models.ForeignKey(
        "ServicePackage",
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="bookings"
    )

    session_date = models.DateField()
    session_time = models.TimeField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)

    # Track booking status
    status = models.CharField(
        max_length=20, choices=BOOKING_STATUS, default=STATUS_PENDING
    )

    # Pricing (snapshotted at booking time)
    package_price = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal("0.00")
    )

    notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Booking #{self.id} - {self.client.get_full_name()} with {self.photographer.user.get_full_name()}"

    # ---- 💡 Utility methods ----
    @property
    def total_paid(self):
        """Sum of all successful payments for this booking"""
        return sum(p.amount_paid for p in self.payments.filter(payment_status=Payment.STATUS_PAID))

    @property
    def balance_due(self):
        """Remaining balance"""
        return Decimal(self.package_price) - Decimal(self.total_paid)

    @property
    def is_fully_paid(self):
        return self.balance_due <= 0


# ----------------------
# 📌 Booking Preferences
# ----------------------
class BookingPreference(models.Model):
    photographer = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="booking_preference"
    )

    # Availability
    available_days = models.JSONField(
        default=list,
        help_text="List of available days, e.g., ['Monday', 'Tuesday']"
    )
    start_time = models.TimeField(null=True, blank=True, help_text="Earliest booking time")
    end_time = models.TimeField(null=True, blank=True, help_text="Latest booking time")

    # Session rules
    min_notice_hours = models.PositiveIntegerField(default=24, help_text="Min notice before booking")
    max_future_days = models.PositiveIntegerField(default=180, help_text="Max advance days allowed")
    allow_same_day = models.BooleanField(default=False)

    # Payment rules
    deposit_required = models.BooleanField(default=False)
    deposit_percentage = models.PositiveIntegerField(default=0, help_text="Deposit % if required")

    # Additional options
    auto_confirm = models.BooleanField(default=False, help_text="Auto-confirm without approval")
    notes = models.TextField(blank=True, help_text="Extra booking instructions")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Booking Preference"
        verbose_name_plural = "Booking Preferences"

    def __str__(self):
        return f"{self.photographer.username}'s booking preferences"


# ----------------------
# 📌 Payment
# ----------------------
class Payment(models.Model):
    STATUS_PENDING = "pending"
    STATUS_PAID = "paid"
    STATUS_FAILED = "failed"
    STATUS_REFUNDED = "refunded"

    PAYMENT_STATUS = [
        (STATUS_PENDING, "Pending"),
        (STATUS_PAID, "Paid"),
        (STATUS_FAILED, "Failed"),
        (STATUS_REFUNDED, "Refunded"),
    ]

    METHOD_CARD = "card"
    METHOD_BANK = "bank_transfer"
    METHOD_WALLET = "wallet"
    METHOD_CASH = "cash"
    METHOD_MOBILE = "mobile_money"

    PAYMENT_METHODS = [
        (METHOD_CARD, "Credit/Debit Card"),
        (METHOD_BANK, "Bank Transfer"),
        (METHOD_WALLET, "Wallet/Balance"),
        (METHOD_CASH, "Cash"),
        (METHOD_MOBILE, "Mobile Money"),
    ]

    booking = models.ForeignKey(
        "Booking", on_delete=models.CASCADE, related_name="payments"
    )

    # Payment tracking
    amount_paid = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal("0.00")
    )
    payment_status = models.CharField(
        max_length=20, choices=PAYMENT_STATUS, default=STATUS_PENDING
    )
    payment_method = models.CharField(
        max_length=50, choices=PAYMENT_METHODS, blank=True, null=True
    )

    transaction_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Payment for Booking #{self.booking.id} - {self.payment_status}"
