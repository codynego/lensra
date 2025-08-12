from django.urls import path
from .views import PhotographerListView, ClientListCreateView, ClientDetailView, ClientBookingsView

urlpatterns = [
    path('', PhotographerListView.as_view(), name='photographer-list'),
    path('clients/', ClientListCreateView.as_view(), name='client-list-create'),
    path('clients/<int:pk>/', ClientDetailView.as_view(), name='client-detail'),
    path('clients/<int:pk>/bookings/', ClientBookingsView.as_view(), name='client-bookings'),
]
