from django.urls import path
from .views import (
    GalleryListCreateView,
    PhotoCreateView,
    AssignClientsToGalleryView,
    AssignClientsToPhotoView,
    ClientAssignedGalleriesView,
    ClientAssignedPhotosView,
    GalleryCreateView
)

urlpatterns = [
    path('galleries/', GalleryListCreateView.as_view(), name='gallery-list-create'),
    path('photos/', PhotoCreateView.as_view(), name='photo-create'),
    path('assign-clients/gallery/<int:gallery_id>/', AssignClientsToGalleryView.as_view(), name='assign-clients-gallery'),
    path('assign-clients/photo/<int:photo_id>/', AssignClientsToPhotoView.as_view(), name='assign-clients-photo'),
    path('client/galleries/', ClientAssignedGalleriesView.as_view(), name='client-assigned-galleries'),
    path('client/photos/', ClientAssignedPhotosView.as_view(), name='client-assigned-photos'),
    path('galleries/create/', GalleryCreateView.as_view(), name='gallery-create'),
]
