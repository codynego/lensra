from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import BackgroundRemovalSerializer
from rembg import remove, new_session
from PIL import Image
import io
import os
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.conf import settings



from rest_framework import generics
from .models import EnhancedImage
from .serializers import EnhancedImageSerializer
from io import BytesIO


# Import RealESRGAN (ncnn or normal)
from realesrgan import RealESRGAN

MODEL_PATH = r"C:/Users/Shina/Downloads/u2net.onnx"
session = new_session(model_path=MODEL_PATH)


class BackgroundRemovalView(APIView):

    def post(self, request, *args, **kwargs):
        serializer = BackgroundRemovalSerializer(data=request.data)
        if serializer.is_valid():
            input_image = serializer.validated_data['image']

            # Open and process image
            img = Image.open(input_image)
            result = remove(img, session=session)

            # Save result into Django's default storage (MEDIA_ROOT)
            output_io = io.BytesIO()
            result.save(output_io, format="PNG")
            output_file = ContentFile(output_io.getvalue())

            # Create a unique filename
            filename = f"bg_removed/output_{input_image.name}.png"
            file_path = default_storage.save(filename, output_file)

            # Build full URL
            file_url = request.build_absolute_uri(settings.MEDIA_URL + filename)

            return Response({"output_image": file_url}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)





class EnhanceImageView(generics.CreateAPIView):
    queryset = EnhancedImage.objects.all()
    serializer_class = EnhancedImageSerializer

    def perform_create(self, serializer):
        instance = serializer.save()  # save original first

        # Open uploaded image
        input_path = instance.original.path
        img = Image.open(input_path).convert("RGB")

        # Load RealESRGAN model
        model = RealESRGAN(settings.BASE_DIR, scale=4)
        model.load_weights("RealESRGAN_x4plus.pth", download=True)  # auto-download

        # Enhance image
        sr_img = model.predict(img)

        # Save to memory
        buffer = BytesIO()
        sr_img.save(buffer, format="PNG")
        file_name = f"enhanced_{instance.id}.png"
        instance.enhanced.save(file_name, ContentFile(buffer.getvalue()), save=True)
