# stats/signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from gallery.models import Gallery, Photo
from bookings.models import Booking
from photographer.models import Client, Photographer
from .utils import update_user_stats  # your function

# --- GALLERY ---
@receiver([post_save, post_delete], sender=Gallery)
def update_stats_on_gallery(sender, instance, **kwargs):
    if instance.user:
        update_user_stats(instance.user)


# --- PHOTO ---
@receiver([post_save, post_delete], sender=Photo)
def update_stats_on_photo(sender, instance, **kwargs):
    if instance.gallery and instance.gallery.user:
        update_user_stats(instance.gallery.user)


# --- BOOKING ---
@receiver([post_save, post_delete], sender=Booking)
def update_stats_on_booking(sender, instance, **kwargs):
    # assuming Booking.photographer is FK -> Photographer model
    if isinstance(instance.photographer, Photographer) and instance.photographer.user:
        update_user_stats(instance.photographer.user)


# --- CLIENT ---
@receiver([post_save, post_delete], sender=Client)
def update_stats_on_client(sender, instance, **kwargs):
    if instance.photographer and instance.photographer.user:
        update_user_stats(instance.photographer.user)
