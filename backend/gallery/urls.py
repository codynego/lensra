from django.urls import path
from .views import (
    GalleryListCreateView,
    PhotoListCreateView,
    AssignClientsToGalleryView,
    AssignClientsToPhotoView,
    ClientAssignedGalleriesView,
    ClientAssignedPhotosView,
    GalleryCreateView,
    GalleryUpdateDeleteView,  # using existing update/delete for gallery detail
    PhotoUpdateDeleteView,    # using existing update/delete for photo detail
)

urlpatterns = [
    # Galleries
    path('galleries/', GalleryListCreateView.as_view(), name='gallery-list-create'),
    path('galleries/create/', GalleryCreateView.as_view(), name='gallery-create'),
    path('galleries/<int:pk>/', GalleryUpdateDeleteView.as_view(), name='gallery-detail'),

    # Photos
    path('photos/', PhotoListCreateView.as_view(), name='photo-list-create'),
    path('photos/<int:pk>/', PhotoUpdateDeleteView.as_view(), name='photo-detail'),

    # Assign clients
    path('assign-clients/gallery/<int:gallery_id>/', AssignClientsToGalleryView.as_view(), name='assign-clients-gallery'),
    path('assign-clients/photo/<int:photo_id>/', AssignClientsToPhotoView.as_view(), name='assign-clients-photo'),

    # Client-specific
    path('client/galleries/', ClientAssignedGalleriesView.as_view(), name='client-assigned-galleries'),
    path('client/photos/', ClientAssignedPhotosView.as_view(), name='client-assigned-photos'),
]
