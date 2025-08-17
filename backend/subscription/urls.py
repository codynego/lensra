from django.urls import path
from .views import (
    SubscriptionPlanListView, SubscriptionPlanDetailView,
    UserSubscriptionListCreateView, UserSubscriptionDetailView,
    MyStatsView
)

urlpatterns = [
    path("plans/", SubscriptionPlanListView.as_view(), name="plans-list"),
    path("plans/<int:pk>/", SubscriptionPlanDetailView.as_view(), name="plans-detail"),

    path("user-subscriptions/", UserSubscriptionListCreateView.as_view(), name="user-subscription-list"),
    path("user-subscriptions/<int:pk>/", UserSubscriptionDetailView.as_view(), name="user-subscription-detail"),

    path("me/stats/", MyStatsView.as_view(), name="my-stats"),
]
