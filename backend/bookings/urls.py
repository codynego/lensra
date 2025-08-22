# bookings/urls.py
from django.urls import path
from .views import (
    ServicePackageListCreateView,
    ServicePackageDetailView,
    ClientListCreateView,
    ClientDetailView,
    BookingListCreateView,
    BookingDetailView,
    BookingPreferenceListCreateView,
    BookingPreferenceDetailView,
    PaymentListCreateView,
    PaymentDetailView,
    ClientBookingsView,
)

urlpatterns = [
    path("packages/", ServicePackageListCreateView.as_view(), name="servicepackage-list"),
    path("packages/<int:pk>/", ServicePackageDetailView.as_view(), name="servicepackage-detail"),


    path("clients/", ClientListCreateView.as_view(), name="client-list"),
    path("clients/<int:pk>/", ClientDetailView.as_view(), name="client-detail"),

    path("bookings/", BookingListCreateView.as_view(), name="booking-list"),
    path("bookings/<int:pk>/", BookingDetailView.as_view(), name="booking-detail"),


    path("preferences/", BookingPreferenceListCreateView.as_view(), name="preference-list"),
    path("preferences/<int:pk>/", BookingPreferenceDetailView.as_view(), name="preference-detail"),


    path("payments/", PaymentListCreateView.as_view(), name="payment-list"),
    path("payments/<int:pk>/", PaymentDetailView.as_view(), name="payment-detail"),


    path("clients/<int:pk>/bookings/", ClientBookingsView.as_view(), name="client-bookings"),
]
