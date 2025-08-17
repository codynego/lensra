from django.contrib import admin
from .models import SubscriptionPlan, UserSubscription, Stats

# Register your models here.
@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'is_active')
    search_fields = ('name',)
    list_filter = ('is_active',)

@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan', 'start_date', 'end_date')
    search_fields = ('user__username', 'plan__name')
    list_filter = ('start_date', 'end_date')


@admin.register(Stats)
class StatsAdmin(admin.ModelAdmin):
    list_display = ('user', 'galleries_count', 'photos_count', 'storage_used', 'bookings_count', 'clients_count', 'updated_at')
    search_fields = ('user__username',)
    readonly_fields = ('updated_at',)

    def has_add_permission(self, request):
        return False