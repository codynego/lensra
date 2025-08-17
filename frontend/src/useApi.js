import { useAuth } from "./AuthContext";

export function useApi() {
  const { token, refreshAccessToken, logout } = useAuth();
  const API_BASE_URL = "http://lvh.me:8000/api";

  const apiFetch = async (url, options = {}) => {
    const fullUrl = `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    const headers = {
      ...options.headers,
    };

    // Add Authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Only add Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const opts = {
      ...options,
      headers,
    };

    let response = await fetch(fullUrl, opts);

    // If access token expired, try refresh
    if (response.status === 401) {
      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        logout();
        window.location.href = "/login";
        return;
      }
      
      // Update headers with refreshed token
      opts.headers.Authorization = `Bearer ${refreshed}`;
      response = await fetch(fullUrl, opts);
    }

    return response;
  };

  return { apiFetch };
}