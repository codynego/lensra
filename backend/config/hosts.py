from django_hosts import patterns, host

host_patterns = patterns('',
    host(r'www', 'config.urls', name='www'),  # main site
    host(r'(?P<subdomain>[\w-]+)', 'config.urls', name='studio'),  # subdomains
)
