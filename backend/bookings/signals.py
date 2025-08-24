# signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import transaction
from .models import Booking, Payment


@receiver(post_save, sender=Booking)
def create_payment_for_booking(sender, instance, created, **kwargs):
    """
    Automatically create a Payment when a new Booking is created
    """
    if created:
        Payment.objects.create(
            booking=instance,
            amount_paid=instance.package_price,  # match booking's snapshotted price
            payment_status=Payment.STATUS_PENDING,
        )


@receiver(post_save, sender=Payment)
def update_booking_status_on_payment(sender, instance, created, **kwargs):
    """
    Sync Booking status with Payment status
    """
    booking = instance.booking

    with transaction.atomic():
        if instance.payment_status == Payment.STATUS_PAID:
            if booking.status != Booking.STATUS_CONFIRMED:
                booking.status = Booking.STATUS_CONFIRMED
                booking.save(update_fields=["status"])

        elif instance.payment_status == Payment.STATUS_FAILED:
            if booking.status != Booking.STATUS_CANCELLED:
                booking.status = Booking.STATUS_CANCELLED
                booking.save(update_fields=["status"])

        elif instance.payment_status == Payment.STATUS_PENDING:
            if booking.status != Booking.STATUS_PENDING:
                booking.status = Booking.STATUS_PENDING
                booking.save(update_fields=["status"])
