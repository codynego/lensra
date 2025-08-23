import React, { useEffect, useState } from "react";
import GalleryCard from "./GalleryCard";
import GalleryView from "./GalleryView";
import { useAuth } from "../../AuthContext";
import { useApi } from "../../useApi";
import { Plus } from "lucide-react";

const GalleryContent = ({ theme }) => {
  const [galleries, setGalleries] = useState([]);
  const [publicGalleries, setPublicGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newGalleryTitle, setNewGalleryTitle] = useState("");
  const [error, setError] = useState(null);
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { isAuthenticated } = useAuth();
  const { apiFetch } = useApi();
  const [activeTab, setActiveTab] = useState("my-galleries");
  const [organizedGalleries, setOrganizedGalleries] = useState({
    owned_galleries: [],
    assigned_galleries: [],
    shared_galleries: [],
  });

  useEffect(() => {
    if (activeTab === "my-galleries") {
      fetchOrganizedGalleries();
    } else if (activeTab === "public") {
      fetchPublicGalleries();
    }
  }, [activeTab]);

  const normalizeGallery = (g) => ({
    ...g,
    cover_image: g.cover_image || g.cover_photo || null,
  });

  const fetchOrganizedGalleries = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch("/gallery/user/galleries/", {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setOrganizedGalleries({
        owned_galleries: (data.owned_galleries || []).map(normalizeGallery),
        assigned_galleries: (data.assigned_galleries || []).map(normalizeGallery),
        shared_galleries: (data.shared_galleries || []).map(normalizeGallery),
      });

      const allGalleries = [
        ...(data.owned_galleries || []),
        ...(data.assigned_galleries || []),
        ...(data.shared_galleries || []),
      ].map(normalizeGallery);
      setGalleries(allGalleries);
    } catch (err) {
      console.error("fetchOrganizedGalleries error:", err);
      setError(err.message || "Failed to fetch galleries");
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicGalleries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch("/gallery/public/galleries/", {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      const items = Array.isArray(data) ? data : data.results || [];
      setPublicGalleries(items.map((item) => normalizeGallery(item.gallery)));
    } catch (err) {
      console.error("fetchPublicGalleries error:", err);
      setError(err.message || "Failed to fetch public galleries");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGallery = async () => {
    if (!newGalleryTitle.trim()) {
      setError("Gallery title cannot be empty.");
      return;
    }
    setCreating(true);
    setError(null);

    try {
      const response = await apiFetch("/gallery/galleries/create/", {
        method: "POST",
        body: JSON.stringify({
          title: newGalleryTitle,
          description: "",
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.error || "Failed to create gallery.");
      }

      const data = await response.json();
      const newGallery = normalizeGallery(data);

      setOrganizedGalleries((prev) => ({
        ...prev,
        owned_galleries: [newGallery, ...prev.owned_galleries],
      }));

      setNewGalleryTitle("");
      setShowCreateForm(false);
    } catch (err) {
      console.error("createGallery error:", err);
      setError(err.message || "Failed to create gallery");
    } finally {
      setCreating(false);
    }
  };

  const handleAddToCollection = async (gallery) => {
    if (!isAuthenticated) {
      alert("Please log in to add galleries to your collection.");
      return;
    }

    try {
      const response = await apiFetch("/gallery/add-to-collection/", {
        method: "POST",
        body: JSON.stringify({ gallery_id: gallery.id }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to add gallery to collection.");
      }

      alert("Gallery added to your collection!");

      setOrganizedGalleries((prev) => ({
        ...prev,
        shared_galleries: [normalizeGallery(gallery), ...prev.shared_galleries],
      }));
    } catch (err) {
      console.error("Error adding to collection:", err);
      alert(err.message || "Failed to add gallery to collection.");
    }
  };

  const handleSelectGallery = (gallery) => {
    setSelectedGallery(gallery);
  };

  const handleBackToGalleries = () => {
    setSelectedGallery(null);
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
  };

  const getCurrentGalleries = () => {
    switch (activeTab) {
      case "my-galleries":
        return organizedGalleries.owned_galleries;
      case "shared":
        return [...organizedGalleries.assigned_galleries, ...organizedGalleries.shared_galleries];
      case "public":
        return publicGalleries;
      default:
        return [];
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case "my-galleries":
        return "My Galleries";
      case "shared":
        return "Shared with Me";
      case "public":
        return "Public Galleries";
      default:
        return "Galleries";
    }
  };

  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case "my-galleries":
        return {
          title: "No galleries found.",
          subtitle: "Create your first gallery to get started!",
        };
      case "shared":
        return {
          title: "No shared galleries.",
          subtitle: "Galleries shared with you will appear here.",
        };
      case "public":
        return {
          title: "No public galleries available.",
          subtitle: "Check back later for new public content!",
        };
      default:
        return {
          title: "No galleries found.",
          subtitle: "",
        };
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100'}`}>
        <div className="animate-pulse text-lg font-medium text-gray-600 dark:text-white">Loading galleries...</div>
      </div>
    );
  }

  if (selectedGallery) {
    return (
      <div className={`p-6 md:p-8 ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100'}`}>
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-200 text-sm font-medium animate-fade-in">
            {error}
          </div>
        )}
        <GalleryView
          gallery={selectedGallery}
          onBack={handleBackToGalleries}
          onError={handleError}
          theme={theme}
        />
      </div>
    );
  }

  const currentGalleries = getCurrentGalleries();
  const emptyState = getEmptyStateMessage();

  return (
    <div className={`min-h-screen p-6 md:p-8 max-w-7xl mx-auto ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100'}`}>
      <div className="mb-8">
        <div className="flex flex-wrap gap-3 mb-6 border-b border-gray-200 dark:text-white">
          <button
            onClick={() => setActiveTab("my-galleries")}
            className={`px-4 py-2.5 rounded-t-lg font-semibold text-sm transition-all duration-300 ${
              activeTab === "my-galleries"
                ? `bg-gradient-to-r from-indigo-600 to-blue-600 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} border-b-2 border-indigo-500 shadow-md`
                : `hover:text-gray-900 ${theme === 'dark' ? 'text-white' : 'text-gray-100'} dark:hover:bg-gray-700`
            }`}
          >
            My Galleries ({organizedGalleries.owned_galleries.length})
          </button>

          {isAuthenticated && (
            <button
              onClick={() => setActiveTab("shared")}
              className={`px-4 py-2.5 rounded-t-lg font-semibold text-sm transition-all duration-300 ${
                activeTab === "shared"
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-b-2 border-indigo-500 shadow-md'
                  : 'text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Shared ({organizedGalleries.assigned_galleries.length + organizedGalleries.shared_galleries.length})
            </button>
          )}

          <button
            onClick={() => setActiveTab("public")}
            className={`px-4 py-2.5 rounded-t-lg font-semibold text-sm transition-all duration-300 ${
              activeTab === "public"
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-b-2 border-indigo-500 shadow-md'
                : 'text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Public Galleries
          </button>
        </div>

        {activeTab === "my-galleries" && isAuthenticated && (
          <>
            <div className="flex items-center justify-between mb-6 sm:hidden">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{getTabTitle()}</h2>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                title="Create Gallery"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            {showCreateForm && (
              <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-md animate-fade-in">
                <div className="flex flex-col gap-4">
                  <input
                    type="text"
                    placeholder="Enter new gallery title"
                    value={newGalleryTitle}
                    onChange={(e) => setNewGalleryTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateGallery()}
                    className="p-3 rounded-lg text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-base font-medium transition-all duration-300"
                    disabled={creating}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleCreateGallery}
                      disabled={creating}
                      className={`flex-1 py-3 px-4 rounded-lg text-white font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                        creating
                          ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                          : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700'
                      }`}
                    >
                      {creating ? "Creating..." : "Create Gallery"}
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewGalleryTitle("");
                      }}
                      className="py-3 px-4 rounded-lg text-gray-600 dark:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 font-semibold text-sm transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="hidden sm:flex flex-wrap gap-4 items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{getTabTitle()}</h2>
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  placeholder="Enter new gallery title"
                  value={newGalleryTitle}
                  onChange={(e) => setNewGalleryTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateGallery()}
                  className="p-3 rounded-lg text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-base font-medium transition-all duration-300"
                  disabled={creating}
                />
                <button
                  onClick={handleCreateGallery}
                  disabled={creating}
                  className={`py-3 px-4 rounded-lg text-white font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                    creating
                      ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700'
                  }`}
                >
                  {creating ? "Creating..." : "Create Gallery"}
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab !== "my-galleries" && (
          <div className="hidden sm:block">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{getTabTitle()}</h2>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-200 text-sm font-medium animate-fade-in">
          {error}
        </div>
      )}

      {currentGalleries.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 text-gray-300 dark:text-gray-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <p className="text-lg font-semibold text-gray-600 dark:text-white">{emptyState.title}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{emptyState.subtitle}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {currentGalleries.map((gallery) => (
            <GalleryCard
              key={gallery.id}
              gallery={gallery}
              onClick={handleSelectGallery}
              onEdit={async (g, newTitle) => {
                try {
                  const response = await apiFetch(`/gallery/galleries/${g.id}/`, {
                    method: "PATCH",
                    body: JSON.stringify({ title: newTitle }),
                  });
                  if (!response.ok) throw new Error("Failed to rename gallery");
                  const updated = await response.json();
                  const normalizedUpdated = normalizeGallery(updated);

                  if (activeTab === "my-galleries") {
                    setOrganizedGalleries((prev) => ({
                      ...prev,
                      owned_galleries: prev.owned_galleries.map((x) =>
                        x.id === g.id ? normalizedUpdated : x
                      ),
                    }));
                  }
                } catch (err) {
                  console.error(err);
                  setError(err.message || "Failed to rename gallery");
                }
              }}
              onDelete={async (g) => {
                try {
                  const response = await apiFetch(`/gallery/galleries/${g.id}/`, {
                    method: "DELETE",
                  });
                  if (!response.ok) throw new Error("Failed to delete gallery");

                  if (activeTab === "my-galleries") {
                    setOrganizedGalleries((prev) => ({
                      ...prev,
                      owned_galleries: prev.owned_galleries.filter((x) => x.id !== g.id),
                    }));
                  }
                } catch (err) {
                  console.error(err);
                  setError(err.message || "Failed to delete gallery");
                }
              }}
              onAddPhotos={(gallery) => {
                setSelectedGallery(gallery);
              }}
              onSubGalleryCreated={async () => {
                await fetchOrganizedGalleries();
              }}
              onAddToCollection={handleAddToCollection}
              showAddToCollection={
                activeTab === "public" || (activeTab === "shared" && gallery.access_type === "public")
              }
              theme={theme}
            />
          ))}
        </div>
      )}

      {activeTab === "shared" && isAuthenticated && (
        <div className="mt-10 space-y-8">
          {organizedGalleries.assigned_galleries.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <svg
                  className="w-6 h-6 mr-2 text-indigo-600 dark:text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Assigned by Photographers ({organizedGalleries.assigned_galleries.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {organizedGalleries.assigned_galleries.map((gallery) => (
                  <GalleryCard
                    key={`assigned-${gallery.id}`}
                    gallery={gallery}
                    onClick={handleSelectGallery}
                    showAddToCollection={false}
                    theme={theme}
                  />
                ))}
              </div>
            </div>
          )}

          {organizedGalleries.shared_galleries.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <svg
                  className="w-6 h-6 mr-2 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
                Added from Sharing ({organizedGalleries.shared_galleries.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {organizedGalleries.shared_galleries.map((gallery) => (
                  <GalleryCard
                    key={`shared-${gallery.id}`}
                    gallery={gallery}
                    onClick={handleSelectGallery}
                    showAddToCollection={false}
                    theme={theme}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!isAuthenticated && activeTab !== "public" && (
        <div className="mt-10 text-center p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md animate-fade-in">
          <svg
            className="w-16 h-16 text-gray-300 dark:text-gray-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Login Required</h3>
          <p className="text-gray-600 dark:text-white mb-4 text-sm">
            Please log in to access your personal galleries and shared content.
          </p>
          <button
            onClick={() => {
              window.location.href = "/login";
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Log In
          </button>
        </div>
      )}
    </div>
  );
};

export default GalleryContent;