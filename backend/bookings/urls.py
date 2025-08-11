from django.urls import path
from .views import (
    ServicePackageListCreateView,
    ServicePackageDetailView,
    PhotographerAvailabilityListCreateView,
    PhotographerAvailabilityDetailView,
    PhotographerBlockedDateListCreateView,
    PhotographerBlockedDateDetailView,
    BookingListCreateView,
    BookingDetailView,
    PaymentListCreateView,
    PaymentDetailView,
    PhotographerTimeSlotListCreateView,
    PhotographerTimeSlotDetailView,
    check_availability,
)

urlpatterns = [
    # Service Packages
    path('packages/', ServicePackageListCreateView.as_view(), name='package-list-create'),
    path('packages/<int:pk>/', ServicePackageDetailView.as_view(), name='package-detail'),

    # Photographer Availability
    path('availability/', PhotographerAvailabilityListCreateView.as_view(), name='availability-list-create'),
    path('availability/<int:pk>/', PhotographerAvailabilityDetailView.as_view(), name='availability-detail'),

    # Photographer Blocked Dates
    path('blocked-dates/', PhotographerBlockedDateListCreateView.as_view(), name='blocked-date-list-create'),
    path('blocked-dates/<int:pk>/', PhotographerBlockedDateDetailView.as_view(), name='blocked-date-detail'),

    # Bookings
    path('bookings/', BookingListCreateView.as_view(), name='booking-list-create'),
    path('bookings/<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),

    # Booking availability check (custom endpoint)
    path('bookings/check-availability/', check_availability, name='booking-check-availability'),

    # Payments
    path('payments/', PaymentListCreateView.as_view(), name='payment-list-create'),
    path('payments/<int:pk>/', PaymentDetailView.as_view(), name='payment-detail'),

    # Photographer Time Slots
    path('time-slots/', PhotographerTimeSlotListCreateView.as_view(), name='time-slot-list-create'),
    path('time-slots/<int:pk>/', PhotographerTimeSlotDetailView.as_view(), name='time-slot-detail'),
]
