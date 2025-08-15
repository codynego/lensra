from django.db import models
from django.conf import settings
from photographers.models import Photographer
from photographers.models import Client

User = settings.AUTH_USER_MODEL


class ServicePackage(models.Model):
    photographer = models.ForeignKey(
        Photographer, on_delete=models.CASCADE, related_name="packages"
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.PositiveIntegerField(
        help_text="Length of the session in minutes"
    )
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.title} - {self.photographer.user.username}"


class Booking(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name="bookings"
    )
    
    photographer = models.ForeignKey(
        Photographer, on_delete=models.CASCADE, related_name="bookings"
    )
    package = models.ForeignKey(
        ServicePackage, on_delete=models.SET_NULL, null=True, blank=True
    )
    date = models.DateField()
    start_time = models.TimeField()
    location = models.CharField(max_length=255)
    notes = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="pending"
    )
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_guest_booking(self):
        return self.client is None

    def __str__(self):
        name = (
            self.client.get_full_name() if self.client
            else self.guest_name or "Guest"
        )
        return f"Booking by {name} with {self.photographer} on {self.date}"




class BookingPreference(models.Model):
    photographer = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="booking_preference"
    )
    
    # Availability
    available_days = models.JSONField(
        default=list,
        help_text="List of days available for booking, e.g., ['Monday', 'Tuesday']"
    )
    start_time = models.TimeField(
        null=True,
        blank=True,
        help_text="Earliest time available for bookings"
    )
    end_time = models.TimeField(
        null=True,
        blank=True,
        help_text="Latest time available for bookings"
    )

    # Session rules
    min_notice_hours = models.PositiveIntegerField(
        default=24,
        help_text="Minimum notice required before booking (in hours)"
    )
    max_future_days = models.PositiveIntegerField(
        default=180,
        help_text="How many days in advance clients can book"
    )
    allow_same_day = models.BooleanField(default=False)

    # Payment rules
    deposit_required = models.BooleanField(default=False)
    deposit_percentage = models.PositiveIntegerField(
        default=0,
        help_text="Deposit percentage if required"
    )

    # Additional options
    auto_confirm = models.BooleanField(
        default=False,
        help_text="If true, bookings are auto-confirmed without manual approval"
    )
    notes = models.TextField(
        blank=True,
        help_text="Additional booking instructions for clients"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Booking Preference"
        verbose_name_plural = "Booking Preferences"

    def __str__(self):
        return f"{self.photographer.username}'s booking preferences"



class Payment(models.Model):
    PAYMENT_STATUS = [
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("failed", "Failed"),
    ]

    booking = models.OneToOneField(
        Booking, on_delete=models.CASCADE, related_name="payment"
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(
        max_length=20, choices=PAYMENT_STATUS, default="pending"
    )
    transaction_id = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment for Booking #{self.booking.id} - {self.payment_status}"


class PhotographerTimeSlot(models.Model):
    photographer = models.ForeignKey(
        Photographer, on_delete=models.CASCADE, related_name="time_slots"
    )
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_booked = models.BooleanField(default=False)

    class Meta:
        unique_together = ("photographer", "date", "start_time", "end_time")
        ordering = ["date", "start_time"]

    def __str__(self):
        return (
            f"{self.photographer.user.username} - "
            f"{self.date} {self.start_time}-{self.end_time}"
        )


class PhotographerBlockedDate(models.Model):
    photographer = models.ForeignKey(
        Photographer, on_delete=models.CASCADE, related_name="blocked_dates"
    )
    date = models.DateField()
    reason = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        unique_together = ("photographer", "date")
        ordering = ["date"]

    def __str__(self):
        return f"{self.photographer.user.username} blocked on {self.date}"


class PhotographerAvailability(models.Model):
    DAYS_OF_WEEK = [
        (0, "Monday"),
        (1, "Tuesday"),
        (2, "Wednesday"),
        (3, "Thursday"),
        (4, "Friday"),
        (5, "Saturday"),
        (6, "Sunday"),
    ]

    photographer = models.ForeignKey(
        Photographer, on_delete=models.CASCADE, related_name="availabilities"
    )
    day_of_week = models.IntegerField(choices=DAYS_OF_WEEK)
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        unique_together = ("photographer", "day_of_week")
        ordering = ["day_of_week", "start_time"]

    def __str__(self):
        return f"{self.photographer.user.username} - {self.get_day_of_week_display()} {self.start_time}-{self.end_time}"
