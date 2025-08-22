from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User
from photographers.models import Photographer
import os
from django.db.models.signals import post_delete
from django.conf import settings
from .models import User
from subscription.models import UserSubscription, SubscriptionPlan, Stats
from studio.models import Studio
from notification.models import NotificationSettings

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        if instance.role == User.Roles.PHOTOGRAPHER:
            Photographer.objects.create(user=instance)



@receiver(post_delete, sender=User)
def delete_profile_picture_on_user_delete(sender, instance, **kwargs):
    """
    Deletes profile picture file from storage when a User is deleted.
    """
    if instance.profile_picture:
        if os.path.isfile(instance.profile_picture.path):
            os.remove(instance.profile_picture.path)



@receiver(post_save, sender=Photographer)
def create_photographer_studio(sender, instance, created, **kwargs):
    if created:
        Studio.objects.create(photographer=instance.user)

@receiver(post_save, sender=User)
def create_user_subscription(sender, instance, created, **kwargs):
    """
    Automatically create a UserSubscription when a new User is created.
    """
    if created:
        plan = SubscriptionPlan.objects.first()
        UserSubscription.objects.create(user=instance, plan=plan)


@receiver(post_save, sender=UserSubscription)
def update_user_stats_on_subscription_change(sender, instance, **kwargs):
    """
    Update user stats when a UserSubscription is created or updated.
    """
    if instance.user:
        stats, _ = Stats.objects.get_or_create(user=instance.user)
        stats.subscription_plan = instance.plan
        stats.save()


@receiver(post_save, sender=User)
def create_notification_settings(sender, instance, created, **kwargs):
    """
    Automatically create NotificationSettings when a new User is created.
    """
    if created:
        NotificationSettings.objects.create(user=instance)
        # Optionally, set default values for notification settings
        instance.notification_settings.email_notifications = True
        instance.notification_settings.save()