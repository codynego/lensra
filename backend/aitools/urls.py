from django.urls import path
from .views import BackgroundRemovalView

urlpatterns = [
    path("background-remove/", BackgroundRemovalView.as_view(), name="background-remove"),
]
