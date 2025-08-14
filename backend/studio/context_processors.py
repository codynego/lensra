def studio(request):
    return {
        "current_studio": getattr(request, "studio", None),
        "BASE_DOMAIN": getattr(settings, "BASE_DOMAIN", None),
    }