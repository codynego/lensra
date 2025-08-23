from django.urls import path
from .views import BackgroundRemovalView

urlpatterns = [
    path("background-remove/", BackgroundRemovalView.as_view(), name="background-remove"),
    # path('enhance/', EnhanceImageView.as_view(), name='enhance-image')
]
