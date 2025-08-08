# accounts/views.py
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.urls import reverse
from django.conf import settings
from .utils import send_activation_email
from django.contrib.auth.tokens import default_token_generator
from django.http import HttpResponse



from .serializers import RegisterSerializer, ProfileSerializer, ChangePasswordSerializer

User = get_user_model()

class PasswordResetRequestView(APIView):
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"email": "This field is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # To prevent email enumeration, respond with success anyway
            return Response({"detail": "If the email is registered, a reset link will be sent."})

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_link = f"http://localhost:3000/reset-password-confirm/{uid}/{token}/"


        send_mail(
            subject="Password Reset for Lensra",
            message=f"Click the link to reset your password: {reset_link}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )

        return Response({"detail": "If the email is registered, a reset link will be sent."})

class PasswordResetConfirmView(APIView):
    def post(self, request, uidb64, token):
        password = request.data.get('password')
        password2 = request.data.get('password2')

        if not password or not password2:
            return Response({"error": "Password fields are required."}, status=status.HTTP_400_BAD_REQUEST)

        if password != password2:
            return Response({"error": "Passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response({"error": "Invalid link."}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"error": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(password)
        user.save()

        return Response({"detail": "Password has been reset successfully."})

class VerifyEmailView(APIView):
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User with this email does not exist"}, status=status.HTTP_404_NOT_FOUND)

        # Create UID and token
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        # Build activation link
        activation_link = f"{settings.FRONTEND_URL}/activate/{uid}/{token}/"

        # Send email
        send_mail(
            subject="Verify your Lensra account",
            message=f"Hi {user.username},\n\nClick the link below to verify your account:\n{activation_link}\n\nIf you did not create an account, please ignore this email.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

        return Response({"message": "Verification email sent successfully"}, status=status.HTTP_200_OK)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

    def perform_create(self, serializer):
        user = serializer.save(is_active=False)  # inactive until verified
        send_activation_email(user, self.request)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return Response({"message": "Registration successful! Please check your email to verify your account."},
                        status=status.HTTP_201_CREATED)
# Activation view
class ActivateAccountView(generics.GenericAPIView):
    def get(self, request, uidb64, token):
        User = get_user_model()
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user and default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            return Response("Account activated successfully! You can now log in.")
        else:
            return Response("Activation link is invalid or has expired.", status=status.HTTP_400_BAD_REQUEST)



# Profile view
class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        return self.request.user

# Change password
class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({"old_password": "Wrong password."}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({"detail": "Password updated successfully."})

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
