# accounts/views.py
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Waitlist
from .serializers import WaitlistSerializer


class WaitlistSignupView(generics.CreateAPIView):
    """Public endpoint – photographers can join the waitlist"""
    queryset = Waitlist.objects.all()
    serializer_class = WaitlistSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "You have successfully joined the waitlist!"},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class WaitlistCountView(APIView):
    """Return the total number of waitlist signups"""
    def get(self, request, *args, **kwargs):
        count = Waitlist.objects.count()
        return Response({"count": count}, status=status.HTTP_200_OK)
