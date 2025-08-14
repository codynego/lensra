from asgiref.local import Local
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin
from .models import Studio, normalize_host

# Async-safe request-local storage
_request_state = Local()


def get_current_studio() -> Studio | None:
    return getattr(_request_state, "studio", None)


class StudioResolverMiddleware(MiddlewareMixin):
    """Attach `request.studio` based on the Host header.

    Rules:
      - main site when host == BASE_DOMAIN or host startswith 'www.' + BASE_DOMAIN
      - subdomain: <slug>.<BASE_DOMAIN>
      - custom domain match only when Studio.custom_domain_verified == True
      - skip reserved platform subdomains
    """

    def process_request(self, request):
        host = normalize_host(request.get_host())
        if request.path.startswith("/admin/"):
            _request_state.studio = None
            return None

        request.host = host
        request.studio = None

        base = normalize_host(getattr(settings, "BASE_DOMAIN", ""))
        reserved = set(getattr(settings, "RESERVED_SUBDOMAINS", set()))

        # Main site
        if host == base or host == f"www.{base}":
            _request_state.studio = None
            return None

        # Subdomain under base domain
        if base and host.endswith(f".{base}"):
            sub = host[: -len(f".{base}")]
            if sub in reserved or not sub:
                _request_state.studio = None
                return None
            studio = (
                Studio.objects.filter(slug=sub, status=Studio.Status.ACTIVE)
                .only("id", "slug", "custom_domain", "custom_domain_verified", "status")
                .first()
            )
            request.studio = studio
            _request_state.studio = studio
            return None

        # Custom domain match
        studio = (
            Studio.objects.filter(
                custom_domain=host,
                custom_domain_verified=True,
                status=Studio.Status.ACTIVE,
            )
            .only("id", "slug", "custom_domain", "custom_domain_verified", "status")
            .first()
        )
        request.studio = studio
        _request_state.studio = studio
        return None

    def process_response(self, request, response):
        _request_state.studio = None
        return response