from django.db.models import Sum
from gallery.models import Gallery, Photo
from bookings.models import Booking
from photographers.models import Client
from .models import Stats

def update_user_stats(user):
    stats, _ = Stats.objects.get_or_create(user=user)

    galleries = Gallery.objects.filter(user=user)
    photos = Photo.objects.filter(gallery__user=user)

    galleries_count = galleries.count()
    photos_count = photos.count()
    # loop over photos and sum their file sizes
    storage_used = sum(p.image.size for p in photos if p.image and hasattr(p.image, "size"))

    clients_count = Client.objects.filter(photographer__user=user).count()
    bookings_count = user.bookings.count() if hasattr(user, "bookings") else 0

    stats.galleries_count = galleries_count
    stats.photos_count = photos_count
    stats.storage_used = storage_used
    stats.clients_count = clients_count
    stats.bookings_count = bookings_count

    stats.save()

    return stats

