from django.urls import path
from .views import BookingCreateView, ClientBookingListView, PhotographerBookingListView, BookingStatusUpdateView

urlpatterns = [
    path('create/', BookingCreateView.as_view(), name='booking-create'),
    path('client/', ClientBookingListView.as_view(), name='client-bookings'),
    path('photographer/', PhotographerBookingListView.as_view(), name='photographer-bookings'),
    path('update-status/<int:pk>/', BookingStatusUpdateView.as_view(), name='booking-update-status'),
]
