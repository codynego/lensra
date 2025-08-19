from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from photographers.models import Photographer
import os
from django.conf import settings
from rest_framework.validators import UniqueValidator


User = get_user_model()

class PhotographerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photographer
        fields = ['years_of_experience', 'instagram', 'facebook']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'phone_number', 'profile_picture', 'bio', 'location']


class UserProfileSerializer(serializers.ModelSerializer):
    photographer_profile = PhotographerProfileSerializer(required=False)
    current_password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    new_password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone_number', 'bio', 'location', 'profile_picture',
            'photographer_profile', 'current_password', 'new_password'
        ]
        read_only_fields = ['id']
        extra_kwargs = {
            'phone_number': {'required': False, 'allow_blank': True},
            'bio': {'required': False, 'allow_blank': True},
            'location': {'required': False, 'allow_blank': True},
            'profile_picture': {'required': False, 'allow_null': True}
        }

    def validate(self, data):
        current_password = data.get('current_password')
        new_password = data.get('new_password')

        if new_password and not current_password:
            raise serializers.ValidationError({"current_password": "Current password is required to set a new password."})
        
        if current_password and new_password:
            user = self.context['request'].user
            if not authenticate(username=user.username, password=current_password):
                raise serializers.ValidationError({"current_password": "Current password is incorrect."})
            if len(new_password) < 8:
                raise serializers.ValidationError({"new_password": "New password must be at least 8 characters long."})
        
        return data

    def update(self, instance, validated_data):
        # Extract nested photographer profile data
        photographer_data = validated_data.pop('photographer_profile', None)
        current_password = validated_data.pop('current_password', None)
        new_password = validated_data.pop('new_password', None)

        # Handle profile picture replacement
        new_picture = validated_data.get('profile_picture')
        if new_picture and instance.profile_picture and instance.profile_picture.name:
            old_path = instance.profile_picture.path
            if os.path.exists(old_path):
                os.remove(old_path)

        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Update password if provided
        if new_password and current_password:
            instance.set_password(new_password)

        instance.save()

        # Update photographer profile if exists
        if photographer_data and hasattr(instance, 'photographer_profile'):
            for attr, value in photographer_data.items():
                setattr(instance.photographer_profile, attr, value)
            instance.photographer_profile.save()

        return instance



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

