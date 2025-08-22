from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Payment


@receiver(post_save, sender=Payment)
def update_booking_status_on_payment(sender, instance, created, **kwargs):
    """
    Sync booking status with payment status
    """
    booking = instance.booking

    if instance.payment_status == "paid":
        if booking.status != "confirmed":
            booking.status = "confirmed"
            booking.save(update_fields=["status"])

    elif instance.payment_status == "failed":
        if booking.status != "cancelled":
            booking.status = "cancelled"
            booking.save(update_fields=["status"])

    elif instance.payment_status == "pending":
        if booking.status != "pending":
            booking.status = "pending"
            booking.save(update_fields=["status"])
