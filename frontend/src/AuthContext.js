import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

const AuthContext = createContext();
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api";

export function AuthProvider({ children }) {
  const [authTokens, setAuthTokens] = useState(() => {
    const saved = localStorage.getItem("authTokens");
    return saved ? JSON.parse(saved) : null;
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("userData");
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(true);
  const [lastTokenRefresh, setLastTokenRefresh] = useState(0);

  const fetchUserProfile = useCallback(async () => {
    if (!authTokens?.access) return null;

    try {
      const [userResponse, statsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/accounts/user/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authTokens.access}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(`${API_BASE_URL}/subscriptions/me/stats/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authTokens.access}`,
            "Content-Type": "application/json",
          },
        }),
      ]);

      if (userResponse.ok) {
        const userData = await userResponse.json();
        let combinedUserData = { ...userData };

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          console.log("Fetched user stats:", statsData);
          combinedUserData = {
            ...userData,
            stats: {
              ...statsData,
              storage_used_gb: statsData.storage_used / (1024 * 1024 * 1024),
            },
          };
        } else {
          console.warn("Failed to fetch user stats, continuing with user data only");
          combinedUserData.stats = null;
        }

        setUser(combinedUserData);
        localStorage.setItem("userData", JSON.stringify(combinedUserData));
        return combinedUserData;
      } else if (userResponse.status === 401) {
        return null;
      } else {
        console.error("Failed to fetch user profile");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user profile and stats:", error);
      return null;
    }
  }, [authTokens]);

  const login = async (access, refresh) => {
    const tokens = { access, refresh };
    setAuthTokens(tokens);
    localStorage.setItem("authTokens", JSON.stringify(tokens));

    try {
      const userData = await fetchUserProfile();
      if (!userData) {
        console.warn("Failed to fetch user data during login");
      }
    } catch (error) {
      console.error("Error fetching user data on login:", error);
    }
  };

  const logout = useCallback(() => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem("authTokens");
    localStorage.removeItem("userData");
    window.location.href = "/login";
  }, []);

  const refreshAccessToken = useCallback(async () => {
    const now = Date.now();
    if (now - lastTokenRefresh < 5000) {
      return null;
    }

    if (!authTokens?.refresh) {
      logout();
      return null;
    }

    try {
      setLastTokenRefresh(now);
      const response = await fetch(`${API_BASE_URL}/accounts/token/refresh/`, {
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
    } catch (error) {
      console.error("Error refreshing token:", error);
      logout();
      return null;
    }
  }, [authTokens, lastTokenRefresh, logout]);

  const apiFetch = useCallback(
    async (url, options = {}) => {
      const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
      const isFormData = options.body instanceof FormData;

      const opts = {
        ...options,
        headers: {
          // Only set Content-Type for non-FormData requests
          ...(isFormData ? {} : { "Content-Type": "application/json" }),
          ...options.headers,
          ...(authTokens?.access && { Authorization: `Bearer ${authTokens.access}` }),
        },
      };

      // Log headers and body for debugging
      console.log("apiFetch URL:", fullUrl);
      console.log("apiFetch options:", opts);
      if (isFormData) {
        console.log("FormData contents:");
        for (const [key, value] of options.body.entries()) {
          console.log(`${key}: ${value instanceof File ? value.name : value}`);
        }
      } else if (opts.body && typeof opts.body === "string") {
        console.log("Request body:", opts.body);
      }

      let response = await fetch(fullUrl, opts);
      if (response.status === 401) {
        const newAccess = await refreshAccessToken();
        if (!newAccess) {
          console.warn("Token refresh failed, returning original response");
          return response;
        }

        opts.headers.Authorization = `Bearer ${newAccess}`;
        console.log("Retrying with new token, headers:", opts.headers);
        response = await fetch(fullUrl, opts);
      }

      return response;
    },
    [authTokens, refreshAccessToken]
  );

  const fetchUserStats = useCallback(async () => {
    if (!authTokens?.access) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/me/stats/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authTokens.access}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const statsData = await response.json();
        console.log("Fetched user stats:", statsData);
        const processedStats = {
          ...statsData,
          storage_used_gb: statsData.storage_used / (1024 * 1024 * 1024),
        };

        setUser((prevUser) => {
          if (!prevUser) return null;
          const updatedUser = { ...prevUser, stats: processedStats };
          localStorage.setItem("userData", JSON.stringify(updatedUser));
          return updatedUser;
        });

        return processedStats;
      } else if (response.status === 401) {
        return null;
      } else {
        console.error("Failed to fetch user stats");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
      return null;
    }
  }, [authTokens]);

  const updateUser = useCallback((updatedUserData) => {
    setUser((prevUser) => {
      const newUser = { ...prevUser, ...updatedUserData };
      localStorage.setItem("userData", JSON.stringify(newUser));
      return newUser;
    });
  }, []);

  const hasPermission = useCallback(
    (permission) => {
      if (!user) return false;
      return user.permissions?.includes(permission) || user.is_superuser || false;
    },
    [user]
  );

  const hasRole = useCallback(
    (role) => {
      if (!user) return false;
      return user.role === role || user.roles?.includes(role) || false;
    },
    [user]
  );

  useEffect(() => {
    const initializeAuth = async () => {
      if (authTokens?.access && !user) {
        await fetchUserProfile();
      }
      setLoading(false);
    };

    initializeAuth();
  }, [authTokens, fetchUserProfile]);

  const authState = useMemo(
    () => ({
      isAuthenticated: !!authTokens,
      token: authTokens?.access || null,
      tokens: authTokens,
      user,
      loading,
    }),
    [authTokens, user, loading]
  );

  const contextValue = useMemo(
    () => ({
      authState,
      login,
      logout,
      refreshAccessToken,
      updateUser,
      fetchUserProfile,
      fetchUserStats,
      hasPermission,
      hasRole,
      apiFetch,
      isAuthenticated: !!authTokens,
      token: authTokens?.access || null,
      user,
    }),
    [
      authState,
      login,
      logout,
      refreshAccessToken,
      updateUser,
      fetchUserProfile,
      fetchUserStats,
      hasPermission,
      hasRole,
      apiFetch,
      authTokens,
      user,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>
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

export function useAuthState() {
  const { authState } = useAuth();
  return authState;
}

export function useUser() {
  const { user, updateUser, fetchUserProfile, fetchUserStats } = useAuth();
  return { user, updateUser, fetchUserProfile, fetchUserStats };
}

export function usePermissions() {
  const { hasPermission, hasRole, user } = useAuth();
  return { hasPermission, hasRole, user };
}