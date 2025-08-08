import os
import time
from django.conf import settings
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import send_mail
from django.urls import reverse
# accounts/utils.py
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes


def profile_picture_upload_path(instance, filename):
    # Extract extension
    ext = filename.split('.')[-1]
    # Make a unique filename
    filename = f"user_{instance.id}_{int(time.time())}.{ext}"
    # Store inside 'profile_pictures'
    return os.path.join('profile_pictures', filename)






def send_activation_email(user, request):
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    activate_url = f"http://{request.get_host()}/accounts/activate/{uid}/{token}/"

    subject = "Activate your Lensra account"
    message = f"Hi {user.username},\n\nPlease click the link below to verify your email and activate your account:\n{activate_url}\n\nIf you didn’t create an account, please ignore this email."

    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])

