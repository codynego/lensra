# background_removal/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import BackgroundRemovalSerializer
from rembg import remove, new_session
from PIL import Image
import io
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.conf import settings
from subscription.models import UserSubscription  # ✅ fixed app name

# Load ONNX model once at startup
MODEL_PATH = r"C:/Users/Shina/Downloads/u2net.onnx"
session = new_session(model_path=MODEL_PATH)


class BackgroundRemovalView(APIView):
    def post(self, request, *args, **kwargs):
        user = request.user

        try:
            subscription = UserSubscription.objects.get(user=user)
            if not subscription.has_sparks():
                return Response(
                    {
                        "detail": "Insufficient sparks to perform this task.",
                        "action": "Please purchase more sparks or upgrade your plan.",
                        "url": "https://x.ai/subscriptions"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        except UserSubscription.DoesNotExist:
            return Response(
                {
                    "detail": "No active subscription found.",
                    "action": "Please subscribe to use this feature.",
                    "url": "https://x.ai/subscriptions"
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = BackgroundRemovalSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        input_image = serializer.validated_data['image']

        try:
            img = Image.open(input_image)
            result = remove(img, session=session)

            output_io = io.BytesIO()
            result.save(output_io, format="PNG")
            output_file = ContentFile(output_io.getvalue())

            filename = f"bg_removed/output_{input_image.name}.png"
            file_path = default_storage.save(filename, output_file)

            file_url = request.build_absolute_uri(settings.MEDIA_URL + filename)

            subscription.use_spark()

            return Response({"output_image": file_url}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"detail": f"Error processing image: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )