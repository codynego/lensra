from rest_framework import serializers
from .models import Booking

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['client', 'status', 'created_at']

    def validate(self, data):
        # Add validation logic e.g. booking date/time in the future
        from datetime import datetime, date, time as dtime
        booking_date = data.get('date')
        booking_time = data.get('time')

        if booking_date < date.today():
            raise serializers.ValidationError("Booking date cannot be in the past.")
        if booking_date == date.today() and booking_time <= dtime.now():
            raise serializers.ValidationError("Booking time must be later than now.")
        return data



class BookingStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['status']
