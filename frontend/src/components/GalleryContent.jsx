import React, { useEffect, useState } from "react";
import GalleryCard from "./GalleryCard";
import GalleryView from "./GalleryView";

const API_BASE_URL = "http://localhost:8000/api"; // adjust if needed

const GalleryContent = () => {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newGalleryTitle, setNewGalleryTitle] = useState("");
  const [error, setError] = useState(null);
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    fetchGalleries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalizeGallery = (g) => ({
    ...g,
    cover_image: g.cover_image || g.cover_photo || null,
  });

  const fetchGalleries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/gallery/galleries/?top_only=true`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      const items = Array.isArray(data) ? data : data.results || [];
      setGalleries(items.filter(Boolean).map(normalizeGallery));
    } catch (err) {
      console.error("fetchGalleries error:", err);
      setError(err.message || "Failed to fetch galleries");
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
      const res = await fetch(`${API_BASE_URL}/gallery/galleries/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ 
          title: newGalleryTitle,
          description: ""
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || errorData.error || "Failed to create gallery.");
      }

      const data = await res.json();
      setGalleries((prev) => [normalizeGallery(data), ...prev]);
      setNewGalleryTitle("");
      setShowCreateForm(false);
    } catch (err) {
      console.error("createGallery error:", err);
      setError(err.message || "Failed to create gallery");
    } finally {
      setCreating(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-lg">Loading galleries...</div>
      </div>
    );
  }

  // If a gallery is selected, show the GalleryView component
  if (selectedGallery) {
    return (
      <div className="p-3 sm:p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-900 bg-opacity-50 border border-red-500 rounded text-red-200 text-sm">
            {error}
          </div>
        )}
        <GalleryView
          gallery={selectedGallery}
          onBack={handleBackToGalleries}
          onError={handleError}
          token={token}
        />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Top controls for main gallery list */}
      <div className="mb-6">
        {/* Mobile: Show create button and refresh button side by side */}
        <div className="flex items-center justify-between mb-4 sm:hidden">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[#dd183b] hover:bg-red-700 text-white transition-colors"
            title="Create Gallery"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={fetchGalleries}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-600 hover:bg-gray-700 text-white transition-colors"
            title="Refresh"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Mobile: Create form (shown conditionally) */}
        {showCreateForm && (
          <div className="mb-4 sm:hidden">
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="New gallery title"
                value={newGalleryTitle}
                onChange={(e) => setNewGalleryTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateGallery()}
                className="p-3 rounded text-white bg-gray-700 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                disabled={creating}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateGallery}
                  disabled={creating}
                  className={`flex-1 py-3 px-4 rounded text-white transition-colors text-base font-medium ${
                    creating ? "bg-gray-600 cursor-not-allowed" : "bg-[#dd183b] hover:bg-red-700"
                  }`}
                >
                  {creating ? "Creating..." : "Create Gallery"}
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewGalleryTitle("");
                  }}
                  className="py-3 px-4 rounded text-gray-300 bg-gray-600 hover:bg-gray-700 transition-colors text-base"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop: Original layout */}
        <div className="hidden sm:flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="New gallery title"
            value={newGalleryTitle}
            onChange={(e) => setNewGalleryTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateGallery()}
            className="p-2 rounded text-white bg-gray-700 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={creating}
          />
          <button
            onClick={handleCreateGallery}
            disabled={creating}
            className={`py-2 px-4 rounded text-white transition-colors ${
              creating ? "bg-gray-600 cursor-not-allowed" : "bg-[#dd183b] hover:bg-red-700"
            }`}
          >
            {creating ? "Creating..." : "Create Gallery"}
          </button>
          <button
            onClick={fetchGalleries}
            className="py-2 px-4 rounded text-white bg-gray-600 hover:bg-gray-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900 bg-opacity-50 border border-red-500 rounded text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Main gallery list view (top-level galleries only) */}
      {galleries.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-gray-400 text-base sm:text-lg">No galleries found.</p>
          <p className="text-gray-500 text-sm mt-2">Create your first gallery to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {galleries.map((gallery) => (
            <GalleryCard
              key={gallery.id}
              gallery={gallery}
              onClick={handleSelectGallery}
              onEdit={async (g, newTitle) => {
                try {
                  const res = await fetch(
                    `${API_BASE_URL}/gallery/galleries/${g.id}/`,
                    {
                      method: "PATCH",
                      headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                      },
                      body: JSON.stringify({ title: newTitle }),
                    }
                  );
                  if (!res.ok) throw new Error("Failed to rename gallery");
                  const updated = await res.json();
                  setGalleries((prev) =>
                    prev.map((x) => (x.id === g.id ? normalizeGallery(updated) : x))
                  );
                } catch (err) {
                  console.error(err);
                  setError(err.message || "Failed to rename gallery");
                }
              }}
              onDelete={async (g) => {
                try {
                  const res = await fetch(
                    `${API_BASE_URL}/gallery/galleries/${g.id}/`,
                    {
                      method: "DELETE",
                      headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                      },
                    }
                  );
                  if (!res.ok) throw new Error("Failed to delete gallery");
                  setGalleries((prev) => prev.filter((x) => x.id !== g.id));
                } catch (err) {
                  console.error(err);
                  setError(err.message || "Failed to delete gallery");
                }
              }}
              onAddPhotos={(gallery) => {
                setSelectedGallery(gallery);
              }}
              onSubGalleryCreated={async (parentId, newSubGallery) => {
                // For top-level galleries, just refresh the main gallery list
                await fetchGalleries();
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryContent;