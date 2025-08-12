import { useAuth } from "./AuthContext";

export function useApi() {
  const { token, refreshAccessToken, logout } = useAuth();

  const apiFetch = async (url, options = {}) => {
    const opts = {
      ...options,
      headers: {
        ...options.headers,
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    };

    let response = await fetch(url, opts);

    // If access token expired, try refresh
    if (response.status === 401) {
      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        logout();
        window.location.href = "/login";
        return;
      }
      opts.headers.Authorization = `Bearer ${refreshed}`;
      response = await fetch(url, opts);
    }

    return response;
  };

  return { apiFetch };
}
