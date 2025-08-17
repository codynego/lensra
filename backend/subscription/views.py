from rest_framework import generics, permissions
from .models import SubscriptionPlan, UserSubscription, Stats
from .serializers import SubscriptionPlanSerializer, UserSubscriptionSerializer, StatsSerializer
from .utils import update_user_stats



# Anyone can view active plans
class SubscriptionPlanListView(generics.ListAPIView):
    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.AllowAny]


class SubscriptionPlanDetailView(generics.RetrieveAPIView):
    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.AllowAny]


# Authenticated users manage their subscription
class UserSubscriptionListCreateView(generics.ListCreateAPIView):
    serializer_class = UserSubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserSubscription.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserSubscriptionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserSubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserSubscription.objects.filter(user=self.request.user)


class MyStatsView(generics.RetrieveAPIView):
    serializer_class = StatsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Ensure stats exists for user
        stats, _ = Stats.objects.get_or_create(user=self.request.user)
        # Update stats if necessary
        update_user_stats(self.request.user)
        return stats

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request  # 👈 ensures request is in context
        return context