from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import BackgroundRemovalSerializer
from rembg import remove
from PIL import Image
import io
from django.core.files.base import ContentFile

class BackgroundRemovalView(APIView):

    def post(self, request, *args, **kwargs):
        serializer = BackgroundRemovalSerializer(data=request.data)
        if serializer.is_valid():
            input_image = serializer.validated_data['image']

            # Open and process image
            img = Image.open(input_image)
            result = remove(img)

            # Save result into a Django-friendly file
            output_io = io.BytesIO()
            result.save(output_io, format="PNG")
            output_file = ContentFile(output_io.getvalue(), name="output.png")

            # Return processed image
            response_data = {
                "output_image": request.build_absolute_uri("/media/output.png")  # adjust if saving to model/storage
            }
            return Response(response_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
