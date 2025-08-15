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
    path("general-info/", StudioProfileDetailUpdateView.as_view(), name="studio-general-info"),

    # Theme & Branding
    path("theme-branding/", ThemeBrandingUpdateView.as_view(), name="studio-theme-branding"),

    # Packages
    path("packages/", ServicePackageListCreateView.as_view(), name="studio-packages"),
    path("packages/<int:pk>/", ServicePackageDetailView.as_view(), name="studio-package-detail"),

    # Domain Settings (premium only)
    path("domain-settings/", DomainSettingsUpdateView.as_view(), name="studio-domain-settings"),
]
