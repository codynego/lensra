import React, { useEffect, useState } from "react";
import GalleryCard from "./GalleryCard";
import GalleryView from "./GalleryView";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

const GalleryContent = () => {
  const [galleries, setGalleries] = useState([]);
  const [publicGalleries, setPublicGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newGalleryTitle, setNewGalleryTitle] = useState("");
  const [error, setError] = useState(null);
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState('my-galleries'); // 'my-galleries', 'shared', 'public'
  const [organizedGalleries, setOrganizedGalleries] = useState({
    owned_galleries: [],
    assigned_galleries: [],
    shared_galleries: []
  });

  const token = localStorage.getItem("accessToken");
  const isAuthenticated = !!token;

  useEffect(() => {
    if (activeTab === 'my-galleries') {
      fetchOrganizedGalleries();
    } else if (activeTab === 'public') {
      fetchPublicGalleries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const res = await fetch(`${API_BASE_URL}/gallery/user/galleries/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      setOrganizedGalleries({
        owned_galleries: (data.owned_galleries || []).map(normalizeGallery),
        assigned_galleries: (data.assigned_galleries || []).map(normalizeGallery),
        shared_galleries: (data.shared_galleries || []).map(normalizeGallery)
      });
      console.log("Fetched organized galleries:", data);
      
      // Set combined galleries for backward compatibility
      const allGalleries = [
        ...(data.owned_galleries || []),
        ...(data.assigned_galleries || []),
        ...(data.shared_galleries || [])
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
      const res = await fetch(`${API_BASE_URL}/gallery/public/galleries/`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      const items = Array.isArray(data) ? data : data.results || [];
      setPublicGalleries(items.map(item => normalizeGallery(item.gallery)));
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
      const newGallery = normalizeGallery(data);
      
      // Add to owned galleries
      setOrganizedGalleries(prev => ({
        ...prev,
        owned_galleries: [newGallery, ...prev.owned_galleries]
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
      const res = await axios.post(
        `${API_BASE_URL}/gallery/add-to-collection/`,
        { gallery_id: gallery.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Gallery added to your collection!");
      
      // Add to shared galleries
      setOrganizedGalleries(prev => ({
        ...prev,
        shared_galleries: [normalizeGallery(gallery), ...prev.shared_galleries]
      }));
      
    } catch (err) {
      console.error("Error adding to collection:", err);
      alert(err.response?.data?.detail || "Failed to add gallery to collection.");
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
      case 'my-galleries':
        return organizedGalleries.owned_galleries;
      case 'shared':
        return [...organizedGalleries.assigned_galleries, ...organizedGalleries.shared_galleries];
      case 'public':
        return publicGalleries;
      default:
        return [];
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'my-galleries':
        return 'My Galleries';
      case 'shared':
        return 'Shared with Me';
      case 'public':
        return 'Public Galleries';
      default:
        return 'Galleries';
    }
  };

  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case 'my-galleries':
        return {
          title: "No galleries found.",
          subtitle: "Create your first gallery to get started!"
        };
      case 'shared':
        return {
          title: "No shared galleries.",
          subtitle: "Galleries shared with you will appear here."
        };
      case 'public':
        return {
          title: "No public galleries available.",
          subtitle: "Check back later for new public content!"
        };
      default:
        return {
          title: "No galleries found.",
          subtitle: ""
        };
    }
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

  const currentGalleries = getCurrentGalleries();
  const emptyState = getEmptyStateMessage();

  return (
    <div className="p-3 sm:p-6">
      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('my-galleries')}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === 'my-galleries'
                ? 'bg-[#dd183b] text-white border-b-2 border-[#dd183b]'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            My Galleries ({organizedGalleries.owned_galleries.length})
          </button>
          
          {isAuthenticated && (
            <button
              onClick={() => setActiveTab('shared')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'shared'
                  ? 'bg-[#dd183b] text-white border-b-2 border-[#dd183b]'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              Shared ({organizedGalleries.assigned_galleries.length + organizedGalleries.shared_galleries.length})
            </button>
          )}
          
          <button
            onClick={() => setActiveTab('public')}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === 'public'
                ? 'bg-[#dd183b] text-white border-b-2 border-[#dd183b]'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            Public Galleries
          </button>
        </div>

        {/* Create Gallery Section - Only show for My Galleries tab */}
        {activeTab === 'my-galleries' && isAuthenticated && (
          <>
            {/* Mobile: Show create button */}
            <div className="flex items-center justify-between mb-4 sm:hidden">
              <h2 className="text-xl font-bold text-white">{getTabTitle()}</h2>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-[#dd183b] hover:bg-red-700 text-white transition-colors"
                title="Create Gallery"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
            <div className="hidden sm:flex flex-wrap gap-2 items-center justify-between">
              <h2 className="text-2xl font-bold text-white">{getTabTitle()}</h2>
              <div className="flex gap-2 items-center">
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
              </div>
            </div>
          </>
        )}

        {/* Title for other tabs */}
        {activeTab !== 'my-galleries' && (
          <div className="hidden sm:block">
            <h2 className="text-2xl font-bold text-white">{getTabTitle()}</h2>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900 bg-opacity-50 border border-red-500 rounded text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Gallery Grid */}
      {currentGalleries.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-gray-400 text-base sm:text-lg">{emptyState.title}</p>
          <p className="text-gray-500 text-sm mt-2">{emptyState.subtitle}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {currentGalleries.map((gallery) => (
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
                  const normalizedUpdated = normalizeGallery(updated);
                  
                  // Update in the appropriate category
                  if (activeTab === 'my-galleries') {
                    setOrganizedGalleries(prev => ({
                      ...prev,
                      owned_galleries: prev.owned_galleries.map(x => x.id === g.id ? normalizedUpdated : x)
                    }));
                  }
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
                  
                  // Remove from the appropriate category
                  if (activeTab === 'my-galleries') {
                    setOrganizedGalleries(prev => ({
                      ...prev,
                      owned_galleries: prev.owned_galleries.filter(x => x.id !== g.id)
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
              onSubGalleryCreated={async (parentId, newSubGallery) => {
                // For top-level galleries, just refresh the organized galleries
                await fetchOrganizedGalleries();
              }}
              onAddToCollection={handleAddToCollection}
              showAddToCollection={activeTab === 'public' || (activeTab === 'shared' && gallery.access_type === 'public')}
            />
          ))}
        </div>
      )}

      {/* Shared galleries breakdown for shared tab */}
      {activeTab === 'shared' && isAuthenticated && (
        <div className="mt-8">
          {organizedGalleries.assigned_galleries.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Assigned by Photographers ({organizedGalleries.assigned_galleries.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {organizedGalleries.assigned_galleries.map((gallery) => (
                  <GalleryCard
                    key={`assigned-${gallery.id}`}
                    gallery={gallery}
                    onClick={handleSelectGallery}
                    showAddToCollection={false}
                  />
                ))}
              </div>
            </div>
          )}

          {organizedGalleries.shared_galleries.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Added from Sharing ({organizedGalleries.shared_galleries.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {organizedGalleries.shared_galleries.map((gallery) => (
                  <GalleryCard
                    key={`shared-${gallery.id}`}
                    gallery={gallery}
                    onClick={handleSelectGallery}
                    showAddToCollection={false}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Login prompt for non-authenticated users */}
      {!isAuthenticated && activeTab !== 'public' && (
        <div className="mt-8 text-center p-6 bg-gray-800 rounded-lg">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="text-lg font-semibold text-white mb-2">Login Required</h3>
          <p className="text-gray-400 mb-4">Please log in to access your personal galleries and shared content.</p>
          <button
            onClick={() => {
              // Redirect to login or trigger login modal
              window.location.href = '/login';
            }}
            className="px-6 py-2 bg-[#dd183b] text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Log In
          </button>
        </div>
      )}
    </div>
  );
};

export default GalleryContent;