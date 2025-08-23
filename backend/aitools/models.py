# ai_tools/models.py
from django.db import models
from django.conf import settings

class BackgroundRemovalTask(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    original_image = models.ImageField(upload_to="ai_tools/originals/")
    result_image = models.ImageField(upload_to="ai_tools/results/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default="pending")  # pending, processing, done, failed




# class EnhancedImage(models.Model):
#     original = models.ImageField(upload_to="enhancements/originals/")
#     enhanced = models.ImageField(upload_to="enhancements/outputs/", blank=True, null=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"EnhancedImage {self.id}"
