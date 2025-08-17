from rest_framework import serializers
from .models import SubscriptionPlan, UserSubscription
from .models import Stats

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = ['id', 'name', 'price', 'description', 'features', 'is_active']


class UserSubscriptionSerializer(serializers.ModelSerializer):
    plan = SubscriptionPlanSerializer(read_only=True)
    plan_id = serializers.PrimaryKeyRelatedField(
        queryset=SubscriptionPlan.objects.all(), source='plan', write_only=True
    )

    class Meta:
        model = UserSubscription
        fields = ['id', 'user', 'plan', 'plan_id', 'start_date', 'end_date', 'auto_renew']
        read_only_fields = ['user', 'start_date']


class StatsSerializer(serializers.ModelSerializer):
    plan_limits = serializers.SerializerMethodField()
    plan_name = serializers.SerializerMethodField()

    class Meta:
        model = Stats
        fields = [
            "galleries_count",
            "photos_count",
            "storage_used",
            "bookings_count",
            "clients_count",
            "plan_limits",
            "plan_name",
        ]


    def get_plan_name(self, obj):
        """
        Fetch the name of the user's subscription plan.
        """
        user = self.context["request"].user
        try:
            subscription = UserSubscription.objects.get(user=user)
            return subscription.plan.name if subscription.plan else None
        except UserSubscription.DoesNotExist:
            return "Starter"

    def get_plan_limits(self, obj):
        """
        Fetch the subscription plan features for the user.
        """
        user = self.context["request"].user
        try:
            subscription = UserSubscription.objects.get(user=user)
            if subscription.plan and subscription.plan.features:
                return subscription.plan.features
        except UserSubscription.DoesNotExist:
            return {}
        return {}