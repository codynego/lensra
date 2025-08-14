# studio/urls.py
from django.urls import path
from .views import (
    StudioProfileDetailUpdateView,
    ThemeBrandingUpdateView,
    ServicePackageListCreateView,
    ServicePackageDetailView,
    DomainSettingsUpdateView,
    PhotographerWebsitePublicView
)

urlpatterns = [
    path("website/<str:studio_name>/", PhotographerWebsitePublicView.as_view(), name="photographer-public-site"),
    # General Info
    path("studio/general-info/", StudioProfileDetailUpdateView.as_view(), name="studio-general-info"),

    # Theme & Branding
    path("studio/theme-branding/", ThemeBrandingUpdateView.as_view(), name="studio-theme-branding"),

    # Packages
    path("studio/packages/", ServicePackageListCreateView.as_view(), name="studio-packages"),
    path("studio/packages/<int:pk>/", ServicePackageDetailView.as_view(), name="studio-package-detail"),

    # Domain Settings (premium only)
    path("studio/domain-settings/", DomainSettingsUpdateView.as_view(), name="studio-domain-settings"),
]
