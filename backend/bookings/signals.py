# from django.db.models.signals import pre_save
# from django.dispatch import receiver
# from .models import Booking
# from django.core.mail import send_mail
# from django.conf import settings

# @receiver(pre_save, sender=Booking)
# def send_status_update_email(sender, instance, **kwargs):
#     if not instance.pk:
#         # New booking, ignore here
#         return

#     previous = Booking.objects.get(pk=instance.pk)
#     if previous.status != instance.status:
#         # Status changed, send email to client
#         subject = f"Your booking status updated to {instance.status.capitalize()}"
#         message = f"Hello {instance.client.name},\n\nYour booking with {instance.photographer.user.username} on {instance.date} at {instance.start_time} is now '{instance.status}'.\n\nThank you for using Lensra."
#         recipient_list = [instance.client.email]
#         send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, recipient_list)
