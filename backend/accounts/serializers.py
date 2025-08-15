from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from photographers.models import Photographer
import os
from django.conf import settings
from rest_framework.validators import UniqueValidator


User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'phone_number', 'profile_picture', 'bio', 'location']



class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all(), message="This email is already registered.")]
    )
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'role', 'password', 'password2']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            role=validated_data['role'],
            password=validated_data['password']
        )
        return user

class PhotographerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photographer
        fields = ['studio_name', 'website', 'bio', 'specialties']

    

class ProfileSerializer(serializers.ModelSerializer):
    photographer_profile = PhotographerProfileSerializer(required=False)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'profile_picture', 'photographer_profile'
        ]
        read_only_fields = ['id', 'role']

    def update(self, instance, validated_data):
        photographer_data = validated_data.pop('photographer_profile', None)

        # Delete old picture if replacing
        new_picture = validated_data.get('profile_picture', None)
        if new_picture and instance.profile_picture:
            old_path = instance.profile_picture.path
            if os.path.exists(old_path):
                os.remove(old_path)

        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update nested profiles
        if photographer_data and hasattr(instance, 'photographer_profile'):
            PhotographerProfileSerializer().update(instance.photographer_profile, photographer_data)

        return instance

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value

