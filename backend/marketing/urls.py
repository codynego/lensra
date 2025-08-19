# accounts/urls.py
from django.urls import path
from .views import WaitlistSignupView, WaitlistCountView

urlpatterns = [
    path("waitlist/", WaitlistSignupView.as_view(), name="waitlist-signup"),   # POST
    path("waitlist/count/", WaitlistCountView.as_view(), name="waitlist-count"), # GET
]
