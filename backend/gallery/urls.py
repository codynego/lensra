from django.urls import path
from .views import (
    GalleryListCreateView,
    PhotoListCreateView,
    AssignClientsToGalleryView,
    AssignClientsToPhotoView,
    ClientAssignedGalleriesView,
    ClientAssignedPhotosView,
    GalleryCreateView,
    GalleryUpdateDeleteView,
    PhotoUpdateDeleteView,
    # New sharing views
    GalleryShareView,
    PhotoShareView,
    gallery_share_view,
    photo_share_view,
    AddToMyGalleryView,
    PublicGalleriesView,
    UserGalleriesView,
    GalleryAnalyticsView,
)

urlpatterns = [
    # Galleries - Basic CRUD
    path('galleries/', GalleryListCreateView.as_view(), name='gallery-list-create'),
    path('galleries/create/', GalleryCreateView.as_view(), name='gallery-create'),
    path('galleries/<int:pk>/', GalleryUpdateDeleteView.as_view(), name='gallery-detail'),

    # Photos - Basic CRUD
    path('photos/', PhotoListCreateView.as_view(), name='photo-list-create'),
    path('photos/<int:pk>/', PhotoUpdateDeleteView.as_view(), name='photo-detail'),

    # Sharing Management (Authenticated Users)
    path('galleries/<int:gallery_id>/share/', GalleryShareView.as_view(), name='gallery-share-settings'),
    path('photos/<int:photo_id>/share/', PhotoShareView.as_view(), name='photo-share-settings'),

    # Public Sharing Access (No Authentication Required)
    path('share/gallery/<str:token>/', gallery_share_view, name='gallery-share'),
    path('share/photo/<str:token>/', photo_share_view, name='photo-share'),

    # Public Gallery Discovery
    path('public/galleries/', PublicGalleriesView.as_view(), name='public-galleries'),
    path('public/galleries/featured/', PublicGalleriesView.as_view(), {'featured': 'true'}, name='featured-galleries'),

    # Add to User's Collection
    path('add-to-collection/', AddToMyGalleryView.as_view(), name='add-to-collection'),

    # User Gallery Organization
    path('user/galleries/', UserGalleriesView.as_view(), name='user-galleries-organized'),
    
    # Analytics
    path('galleries/<int:gallery_id>/analytics/', GalleryAnalyticsView.as_view(), name='gallery-analytics'),

    # Assign clients (Enhanced with tracking)
    path('assign-clients/gallery/<int:gallery_id>/', AssignClientsToGalleryView.as_view(), name='assign-clients-gallery'),
    path('assign-clients/photo/<int:photo_id>/', AssignClientsToPhotoView.as_view(), name='assign-clients-photo'),

    # Client-specific (Enhanced to include shared content)
    path('client/galleries/', ClientAssignedGalleriesView.as_view(), name='client-assigned-galleries'),
    path('client/photos/', ClientAssignedPhotosView.as_view(), name='client-assigned-photos'),
]