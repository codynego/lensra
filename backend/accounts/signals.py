from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User
from photographers.models import Photographer
import os
from django.db.models.signals import post_delete
from django.conf import settings
from .models import User

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
