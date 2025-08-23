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
  const [upgradePrompt, setUpgradePrompt] = useState(null); // { type: "photos" | "galleries" | "storage", message: string }

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

const checkPlanLimits = useCallback(
  (action, data = {}) => {
    if (!user?.stats?.plan_limits) {
      console.warn("No stats or plan_limits available for limit checking");
      return { canCreateGallery: false, canUploadPhotos: false, canCreateClient: false, message: "Plan limits not available" };
    }

    const {
      max_storage,
      max_galleries_count,
      max_photos_count,
      max_clients: max_clients,
    } = user.stats.plan_limits;
    const { galleries_count = 0, photos_count = 0, storage_used = 0, clients_count = 0 } = user.stats;

    console.log("Checking plan limits:", {
      action,
      max_storage,
      max_galleries_count,
      max_photos_count,
      max_clients,
      galleries_count,
      photos_count,
      storage_used,
      clients_count,
      data,
    });

    const result = {
      canCreateGallery: galleries_count < max_galleries_count,
      canUploadPhotos: photos_count < max_photos_count && storage_used < max_storage,
      canCreateClient: clients_count < max_clients,
      message: null,
    };

    if (action === "createGallery" && !result.canCreateGallery) {
      result.message = `You have reached your limit of ${max_galleries_count} galleries. Upgrade your plan to create more.`;
    } else if (action === "uploadPhotos") {
      const files = data.files || [];
      const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
      if (photos_count + files.length > max_photos_count) {
        result.canUploadPhotos = false;
        result.message = `You have reached your limit of ${max_photos_count} photos. Upgrade your plan to upload more.`;
      } else if (storage_used + totalSize > max_storage) {
        result.canUploadPhotos = false;
        result.message = `You have exceeded your storage limit of ${(max_storage / (1024 * 1024 * 1024)).toFixed(2)} GB. Upgrade your plan for more storage.`;
      }
    } else if (action === "createClient" && !result.canCreateClient) {
      result.message = `You have reached your limit of ${max_clients} clients. Upgrade your plan to add more.`;
    }

    return result;
  },
  [user]
);
  const apiFetch = useCallback(
    async (url, options = {}) => {
      const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
      const isFormData = options.body instanceof FormData;

      const opts = {
        ...options,
        headers: {
          ...(isFormData ? {} : { "Content-Type": "application/json" }),
          ...options.headers,
          ...(authTokens?.access && { Authorization: `Bearer ${authTokens.access}` }),
        },
      };

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

      if (response.status === 403 && user?.stats?.plan_limits) {
        try {
          const errorData = await response.json();
          const message = errorData.error || errorData.detail || "Plan limit exceeded";
          if (message.includes("photos limit")) {
            setUpgradePrompt({
              type: "photos",
              message: `You have reached your limit of ${user.stats.plan_limits.max_photos_count} photos. Upgrade your plan to upload more.`,
            });
          } else if (message.includes("galleries limit")) {
            setUpgradePrompt({
              type: "galleries",
              message: `You have reached your limit of ${user.stats.plan_limits.max_galleries_count} galleries. Upgrade your plan to create more.`,
            });
          } else if (message.includes("storage limit")) {
            setUpgradePrompt({
              type: "storage",
              message: `You have exceeded your storage limit of ${(user.stats.plan_limits.max_storage / (1024 * 1024 * 1024)).toFixed(2)} GB. Upgrade your plan for more storage.`,
            });
          }
        } catch (err) {
          console.error("Error parsing 403 response:", err);
          setUpgradePrompt({
            type: "general",
            message: "Plan limit exceeded. Please upgrade your plan.",
          });
        }
      }

      return response;
    },
    [authTokens, refreshAccessToken, user]
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
      upgradePrompt,
      setUpgradePrompt,
      checkPlanLimits,
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
      upgradePrompt,
      checkPlanLimits,
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