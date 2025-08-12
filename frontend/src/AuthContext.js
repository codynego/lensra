import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authTokens, setAuthTokens] = useState(() => {
    const saved = localStorage.getItem("authTokens");
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(true);

  const login = (access, refresh) => {
    const tokens = { access, refresh };
    setAuthTokens(tokens);
    localStorage.setItem("authTokens", JSON.stringify(tokens));
  };

  const logout = useCallback(() => {
    setAuthTokens(null);
    localStorage.removeItem("authTokens");
    window.location.href = "/login"; // Redirect immediately
  }, []);

  const refreshAccessToken = useCallback(async () => {
    if (!authTokens?.refresh) {
      logout();
      return null;
    }
    try {
      const response = await fetch("http://127.0.0.1:8000/api/accounts/token/refresh/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: authTokens.refresh }),
      });

      const data = await response.json();
      if (response.ok && data.access) {
        const updatedTokens = { access: data.access, refresh: authTokens.refresh };
        setAuthTokens(updatedTokens);
        localStorage.setItem("authTokens", JSON.stringify(updatedTokens));
        return data.access;
      } else {
        logout();
        return null;
      }
    } catch {
      logout();
      return null;
    }
  }, [authTokens, logout]);

  // Fetch wrapper that auto-refreshes token if expired
  const apiFetch = useCallback(
    async (url, options = {}) => {
      const opts = {
        ...options,
        headers: {
          ...options.headers,
          Authorization: authTokens?.access ? `Bearer ${authTokens.access}` : "",
          "Content-Type": "application/json",
        },
      };

      let response = await fetch(url, opts);

      if (response.status === 401) {
        const newAccess = await refreshAccessToken();
        if (!newAccess) return null;

        opts.headers.Authorization = `Bearer ${newAccess}`;
        response = await fetch(url, opts);
      }

      return response;
    },
    [authTokens, refreshAccessToken]
  );

  // Optional: check token validity on page load
  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        isAuthenticated: !!authTokens,
        token: authTokens?.access || null,
        apiFetch,
        refreshAccessToken,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
