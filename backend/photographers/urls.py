from django.urls import path
from .views import (
    PhotographerListView,
    ClientListCreateView,
    ClientDetailView,
    ClientBookingsView,
    PhotographerProfileView,

)

urlpatterns = [
    # Public listing of photographers
    path('', PhotographerListView.as_view(), name='photographer-list'),
    path('profile/', PhotographerProfileView.as_view(), name='photographer-profile'),
    # Client management for authenticated photographers
    path('clients/', ClientListCreateView.as_view(), name='client-list-create'),
    path('clients/<int:pk>/', ClientDetailView.as_view(), name='client-detail'),
    path('clients/<int:pk>/bookings/', ClientBookingsView.as_view(), name='client-bookings'),
]
