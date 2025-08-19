from __future__ import annotations
from django.conf import settings
from django.db import models
from django.utils.text import slugify
from django.core.exceptions import ValidationError


def _default_token() -> str:
    import secrets
    return secrets.token_urlsafe(20)


def normalize_host(host: str | None) -> str | None:
    if not host:
        return None
    host = host.strip().lower()
    if ":" in host:
        host = host.split(":", 1)[0]  # remove port
    return host.strip(".")


class Studio(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        SUSPENDED = "suspended", "Suspended"
        DELETED = "deleted", "Deleted"

    # Photographer account link
    photographer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="studios",
    )

    # General Info
    name = models.CharField(max_length=120)
    tagline = models.TextField(blank=True, null=True)
    about = models.TextField(blank=True, null=True)
    theme = models.CharField(
        max_length=50,
        choices=[
            ("retro", "Retro"),
            ("minimalist", "Minimalist"),
            ("magazine", "Magazine"),
        ],
        default="modern",
    )
    slug = models.SlugField(
        unique=True,
        help_text="Used for subdomain: <slug>.<BASE_DOMAIN>",
    )

    # Theme & Branding
    primary_color = models.CharField(max_length=7, default="#000000")  # HEX color
    secondary_color = models.CharField(max_length=7, default="#FFFFFF")  # HEX color
    font = models.CharField(max_length=50, default="Sans-serif")
    cover_photo = models.ImageField(upload_to="studio_covers/", blank=True, null=True)

    # Domain Settings
    custom_domain = models.CharField(
        max_length=255,
        unique=True,
        null=True,
        blank=True,
        help_text="Exact host only (no http/https). Example: johndoe.com",
    )
    custom_domain_verified = models.BooleanField(default=False)
    verification_token = models.CharField(
        max_length=64,
        default=_default_token,
        editable=False,
        help_text="TXT record token for domain ownership checks",
    )

    # Status
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.ACTIVE,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("slug",)

    def __str__(self):
        return f"{self.name} ({self.slug})"

    def clean(self):
        if self.slug:
            self.slug = slugify(self.slug)
        if self.custom_domain:
            self.custom_domain = normalize_host(self.custom_domain)
            if not self.custom_domain or "/" in self.custom_domain:
                raise ValidationError({
                    "custom_domain": "Enter a valid host like 'johndoe.com' (no scheme or path).",
                })

    @property
    def public_subdomain_host(self) -> str:
        return f"{self.slug}.{settings.BASE_DOMAIN}"

    def matches_host(self, host: str, base_domain: str) -> bool:
        host = normalize_host(host) or ""
        base_domain = normalize_host(base_domain) or ""
        if host.endswith(f".{base_domain}"):  # subdomain
            return host[: -len(f".{base_domain}")] == self.slug
        if self.custom_domain_verified and self.custom_domain:  # custom domain
            return host == self.custom_domain
        return False

