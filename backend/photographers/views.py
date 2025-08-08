from rest_framework import generics, permissions
from .models import Photographer
from .serializers import PhotographerSerializer
from rest_framework.exceptions import PermissionDenied


class PhotographerListView(generics.ListAPIView):
    queryset = Photographer.objects.all()
    serializer_class = PhotographerSerializer
    permission_classes = [permissions.AllowAny]  # Public listing


class PhotographerProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = PhotographerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        try:
            photographer = self.request.user.photographer
        except Photographer.DoesNotExist:
            raise PermissionDenied("You are not a registered photographer.")
        return photographer
