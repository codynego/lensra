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
    # Sharing views
    GalleryShareView,
    PhotoShareView,
    gallery_share_view,
    photo_share_view,
    AddToMyGalleryView,
    PublicGalleriesView,
    UserGalleriesView,
    GalleryAnalyticsView,
    # New granular control views
    GalleryVisibilityView,
    PhotoVisibilityView,
    GalleryShareLinkView,
    PhotoShareLinkView,
    GalleryPreferenceView,
    MovePhotoView,
    EnableSelectionModeView,
    PublicSelectionGalleryView,
)

urlpatterns = [
    # Galleries - Basic CRUD
    path('api/gallery/galleries/', GalleryListCreateView.as_view(), name='gallery-list-create'),
    path('api/gallery/galleries/create/', GalleryCreateView.as_view(), name='gallery-create'),
    path('api/gallery/galleries/<int:pk>/', GalleryUpdateDeleteView.as_view(), name='gallery-detail'),

    # Photos - Basic CRUD
    path('api/gallery/photos/', PhotoListCreateView.as_view(), name='photo-list-create'),
    path('api/gallery/photos/<int:pk>/', PhotoUpdateDeleteView.as_view(), name='photo-detail'),

    # Sharing Management (Authenticated Users)
    # Combined settings (visibility + sharing)
    path('api/gallery/galleries/<int:gallery_id>/share/', GalleryShareView.as_view(), name='gallery-share-settings'),
    path('api/gallery/photos/<int:photo_id>/share/', PhotoShareView.as_view(), name='photo-share-settings'),
    
    # Granular control - Visibility only
    path('api/gallery/galleries/<int:gallery_id>/visibility/', GalleryVisibilityView.as_view(), name='gallery-visibility'),
    path('api/gallery/photos/<int:photo_id>/visibility/', PhotoVisibilityView.as_view(), name='photo-visibility'),
    
    # Granular control - Share link toggle only
    path('api/gallery/galleries/<int:gallery_id>/share-link/', GalleryShareLinkView.as_view(), name='gallery-share-link'),
    path('api/gallery/photos/<int:photo_id>/share-link/', PhotoShareLinkView.as_view(), name='photo-share-link'),

    # Public Sharing Access (No Authentication Required)
    path('share/gallery/<str:token>/', gallery_share_view, name='gallery-share'),
    path('share/photo/<str:token>/', photo_share_view, name='photo-share'),

    # Public Gallery Discovery
    path('api/gallery/public/galleries/', PublicGalleriesView.as_view(), name='public-galleries'),
    path('api/gallery/public/galleries/featured/', PublicGalleriesView.as_view(), {'featured': 'true'}, name='featured-galleries'),

    # Add to User's Collection
    path('api/gallery/add-to-collection/', AddToMyGalleryView.as_view(), name='add-to-collection'),

    # User Gallery Organization
    path('api/gallery/user/galleries/', UserGalleriesView.as_view(), name='user-galleries-organized'),
    
    # Analytics
    path('api/gallery/galleries/<int:gallery_id>/analytics/', GalleryAnalyticsView.as_view(), name='gallery-analytics'),

    # Assign clients (Enhanced with tracking)
    path('api/gallery/assign-clients/gallery/<int:gallery_id>/', AssignClientsToGalleryView.as_view(), name='assign-clients-gallery'),
    path('api/gallery/assign-clients/photo/<int:photo_id>/', AssignClientsToPhotoView.as_view(), name='assign-clients-photo'),

    # Client-specific (Enhanced to include shared content)
    path('api/gallery/client/galleries/', ClientAssignedGalleriesView.as_view(), name='client-assigned-galleries'),
    path('api/gallery/client/photos/', ClientAssignedPhotosView.as_view(), name='client-assigned-photos'),

    path('api/gallery/preferences/', GalleryPreferenceView.as_view(), name='gallery-preferences'),

    path('api/gallery/photo/move/', MovePhotoView.as_view(), name='move-photo'),

    path('api/gallery/enable-selection/', EnableSelectionModeView.as_view(), name='enable-selection-mode'),
    path('gallery/public-selection/<str:token>/', PublicSelectionGalleryView.as_view(), name='public_selection_gallery'),
]