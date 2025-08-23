import React, { useEffect, useState } from "react";
import GalleryCard from "./GalleryCard";
import GalleryHeadersAndControls from "./GalleryHeadersAndControls";
import GalleryPreview from "./GalleryPreview";
import { useAuth } from "../../AuthContext";
import { Plus, Folder, X } from "lucide-react";

const Gallery = ({ theme }) => {
  const { apiFetch, user, checkPlanLimits, upgradePrompt, setUpgradePrompt, isAuthenticated } = useAuth();
  const [galleries, setGalleries] = useState([]);
  const [publicGalleries, setPublicGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [activeTab, setActiveTab] = useState("my-galleries");
  const [organizedGalleries, setOrganizedGalleries] = useState({
    owned_galleries: [],
    assigned_galleries: [],
    shared_galleries: [],
  });
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("date_desc");
  const [filterBy, setFilterBy] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [userGalleries, setUserGalleries] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGalleryTitle, setNewGalleryTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const { canCreateGallery } = user?.stats
    ? checkPlanLimits("check")
    : { canCreateGallery: false };

  const normalizeGallery = (g) => ({
    ...g,
    cover_image: g.cover_image || g.cover_photo || null,
    photo_count: g.photo_count || 0,
  });

  useEffect(() => {
    const savedState = localStorage.getItem("galleryState");
    if (savedState) {
      const { activeTab: savedTab, selectedGalleryId } = JSON.parse(savedState);
      setActiveTab(savedTab || "my-galleries");
      if (selectedGalleryId) {
        const fetchGallery = async () => {
          try {
            setLoading(true);
            const response = await apiFetch(`/gallery/galleries/${selectedGalleryId}/`, { method: "GET" });
            if (!response.ok) throw new Error(await response.text());
            const data = await response.json();
            setSelectedGallery(normalizeGallery(data));
          } catch (err) {
            setError(err.message || "Failed to restore gallery view");
            localStorage.removeItem("galleryState");
          } finally {
            setLoading(false);
          }
        };
        fetchGallery();
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    if (activeTab === "my-galleries") {
      fetchOrganizedGalleries();
    } else if (activeTab === "public") {
      fetchPublicGalleries();
    }
  }, [activeTab, isAuthenticated]);

  const fetchOrganizedGalleries = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch("/gallery/user/galleries/", { method: "GET" });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setOrganizedGalleries({
        owned_galleries: (data.owned_galleries || []).map(normalizeGallery),
        assigned_galleries: (data.assigned_galleries || []).map(normalizeGallery),
        shared_galleries: (data.shared_galleries || []).map(normalizeGallery),
      });
      setGalleries([
        ...(data.owned_galleries || []),
        ...(data.assigned_galleries || []),
        ...(data.shared_galleries || []),
      ].map(normalizeGallery));
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
      const response = await apiFetch("/gallery/public/galleries/", { method: "GET" });
      if (!response.ok) throw new Error(await response.text());
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

  const fetchUserGalleries = async () => {
    try {
      const response = await apiFetch(`/gallery/galleries/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setUserGalleries((Array.isArray(data) ? data : data.results || []).map(normalizeGallery));
    } catch (err) {
      console.error("fetchUserGalleries error:", err);
      setError(err.message || "Failed to load your galleries");
      setUserGalleries([]);
    }
  };

  const handleAddToCollection = async (gallery) => {
    if (!isAuthenticated) {
      setError("Please log in to add galleries to your collection.");
      return;
    }
    try {
      const response = await apiFetch("/gallery/add-to-collection/", {
        method: "POST",
        body: JSON.stringify({ gallery_id: gallery.id }),
      });
      if (!response.ok) throw new Error((await response.json()).detail || "Failed to add gallery to collection.");
      setOrganizedGalleries((prev) => ({
        ...prev,
        shared_galleries: [normalizeGallery(gallery), ...prev.shared_galleries],
      }));
      setError("Gallery added to your collection!", "success");
    } catch (err) {
      setError(err.message || "Failed to add gallery to collection.");
    }
  };

  const handleSelectGallery = (gallery) => {
    setSelectedGallery(normalizeGallery(gallery));
    localStorage.setItem("galleryState", JSON.stringify({
      activeTab,
      selectedGalleryId: gallery.id,
    }));
  };

  const handleBackToGalleries = () => {
    setSelectedGallery(null);
    localStorage.removeItem("galleryState");
  };

  const handleCreateGallery = async () => {
    if (!newGalleryTitle.trim()) {
      setError("Gallery title cannot be empty.");
      return;
    }
    if (!canCreateGallery) {
      const { message } = checkPlanLimits("createGallery");
      setUpgradePrompt({ type: "galleries", message });
      return;
    }
    setCreating(true);
    try {
      const response = await apiFetch(`/gallery/galleries/create/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newGalleryTitle, description: "" }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.error || "Failed to create gallery.");
      }
      const data = await response.json();
      setGalleries((prev) => [normalizeGallery(data), ...prev]);
      setOrganizedGalleries((prev) => ({
        ...prev,
        owned_galleries: [normalizeGallery(data), ...prev.owned_galleries],
      }));
      setNewGalleryTitle("");
      setShowCreateForm(false);
      setError(`Gallery "${newGalleryTitle}" created successfully!`, "success");
      localStorage.setItem("galleryState", JSON.stringify({ activeTab }));
    } catch (err) {
      setError(err.message || "Failed to create gallery");
    } finally {
      setCreating(false);
    }
  };

  const toggleSelection = (id) => {
    const itemId = `gallery-${id}`;
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
    setSelectionMode(newSelection.size > 0);
  };

  const selectAll = () => {
    const allItems = new Set();
    getFilteredGalleries().forEach((gallery) => allItems.add(`gallery-${gallery.id}`));
    setSelectedItems(allItems);
    setSelectionMode(allItems.size > 0);
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
    setSelectionMode(false);
  };

  const handleBulkDelete = async () => {
    const confirmed = window.confirm(`Delete ${selectedItems.size} selected galleries?`);
    if (!confirmed) return;
    try {
      const promises = [];
      selectedItems.forEach((itemId) => {
        const id = itemId.split("-")[1];
        promises.push(apiFetch(`/gallery/galleries/${id}/`, { method: "DELETE" }));
      });
      await Promise.all(promises);
      await fetchOrganizedGalleries();
      clearSelection();
      setError(`${selectedItems.size} galleries deleted successfully!`, "success");
    } catch (err) {
      setError(err.message || "Failed to delete selected galleries");
    }
  };

  const handleBulkMove = async (targetGalleryId) => {
    try {
      const galleryIds = Array.from(selectedItems).map((itemId) => itemId.split("-")[1]);
      await Promise.all(
        galleryIds.map((galleryId) =>
          apiFetch(`/gallery/gallery/move/`, {
            method: "POST",
            body: JSON.stringify({
              gallery_id: galleryId,
              target_gallery_id: targetGalleryId,
            }),
          })
        )
      );
      await fetchOrganizedGalleries();
      clearSelection();
      setShowMoveModal(false);
      setError(`${galleryIds.length} galleries moved successfully!`, "success");
    } catch (err) {
      setError(err.message || "Failed to move galleries");
    }
  };

  const handleOpenMoveModal = async () => {
    if (!Array.isArray(userGalleries) || userGalleries.length === 0) {
      await fetchUserGalleries();
    }
    setShowMoveModal(true);
  };

  const getFilteredGalleries = () => {
    let currentGalleries = [];
    switch (activeTab) {
      case "my-galleries":
        currentGalleries = organizedGalleries.owned_galleries;
        break;
      case "shared":
        currentGalleries = [...organizedGalleries.assigned_galleries, ...organizedGalleries.shared_galleries];
        break;
      case "public":
        currentGalleries = publicGalleries;
        break;
      default:
        currentGalleries = [];
    }
    let filtered = [...currentGalleries];
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (gallery) =>
          gallery.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          gallery.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date_desc": return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case "date_asc": return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        case "name_asc": return a.title.localeCompare(b.title);
        case "name_desc": return b.title.localeCompare(a.title);
        default: return 0;
      }
    });
    return filtered;
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === "dark" ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="animate-pulse text-lg font-medium text-gray-600 dark:text-white">
          Loading galleries...
        </div>
      </div>
    );
  }

  if (selectedGallery) {
    return (
      <GalleryPreview
        gallery={selectedGallery}
        onBack={handleBackToGalleries}
        onError={setError}
        theme={theme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    );
  }

  const filteredGalleries = getFilteredGalleries();

  return (
    <div
      className={`min-h-screen p-6 md:p-8 max-w-7xl mx-auto ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {upgradePrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`${
              theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            } rounded-2xl w-full max-w-md border shadow-2xl p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                Upgrade Your Plan
              </h3>
              <button
                onClick={() => setUpgradePrompt(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"} mb-6`}>
              {upgradePrompt.message}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setUpgradePrompt(null);
                  window.location.href = "/upgrade";
                }}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium"
              >
                Upgrade Now
              </button>
              <button
                onClick={() => setUpgradePrompt(null)}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <GalleryHeadersAndControls
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        organizedGalleries={organizedGalleries}
        isAuthenticated={isAuthenticated}
        theme={theme}
        error={error}
        galleries={galleries}
        onAddToCollection={handleAddToCollection}
        onSelectGallery={handleSelectGallery}
        onError={setError}
        fetchOrganizedGalleries={fetchOrganizedGalleries}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortBy={sortBy}
        setSortBy={setSortBy}
        filterBy={filterBy}
        setFilterBy={setFilterBy}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectionMode={selectionMode}
        selectedItems={selectedItems}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        onBulkDelete={handleBulkDelete}
        onBulkMove={handleOpenMoveModal}
        canEdit={isAuthenticated}
      />
      {showCreateForm && (
        <div
          className={`${
            theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          } rounded-xl p-6 shadow-lg mb-6`}
        >
          <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"} mb-4`}>
            Create New Gallery
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Enter gallery title..."
              value={newGalleryTitle}
              onChange={(e) => setNewGalleryTitle(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && newGalleryTitle.trim() && !creating) {
                  handleCreateGallery();
                }
              }}
              className={`flex-1 px-4 py-3 ${
                theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300 text-gray-900"
              } border rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium`}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateGallery}
                disabled={creating || !newGalleryTitle.trim() || !canCreateGallery}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? "Creating..." : "Create"}
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className={`px-6 py-3 ${
                  theme === "dark" ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                } rounded-lg font-medium transition-all duration-300`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div
        className={`grid gap-6 ${
          viewMode === "grid" ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6" : "grid-cols-2"
        }`}
      >
        {filteredGalleries.map((gallery) => (
          <GalleryCard
            key={gallery.id}
            gallery={gallery}
            onClick={() => handleSelectGallery(gallery)}
            onAddToCollection={handleAddToCollection}
            showAddToCollection={activeTab === "public" || (activeTab === "shared" && gallery.access_type === "public")}
            theme={theme}
            isSelected={selectedItems.has(`gallery-${gallery.id}`)}
            onToggleSelection={() => toggleSelection(gallery.id)}
          />
        ))}
      </div>
      {isAuthenticated && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => {
              if (!canCreateGallery) {
                const { message } = checkPlanLimits("createGallery");
                setUpgradePrompt({ type: "galleries", message });
                return;
              }
              setShowCreateForm(true);
            }}
            disabled={!canCreateGallery}
            className="w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            title="Create New Gallery"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      )}
      {showMoveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`${
              theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            } rounded-2xl w-full max-w-md border shadow-2xl`}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  Move Galleries
                </h3>
                <button
                  onClick={() => setShowMoveModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Select a destination gallery for {selectedItems.size} galleries
              </p>
            </div>
            <div className="p-6 max-h-80 overflow-y-auto space-y-2">
              {userGalleries.length > 0 ? (
                userGalleries.map((targetGallery) => (
                  <button
                    key={targetGallery.id}
                    onClick={() => handleBulkMove(targetGallery.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3 ${
                      theme === "dark" ? "hover:bg-gray-700 text-white" : "hover:bg-gray-50 text-gray-900"
                    } rounded-xl transition-all duration-300 text-left`}
                  >
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                      <Folder className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{targetGallery.title}</h4>
                    </div>
                  </button>
                ))
              ) : (
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  No galleries available
                </p>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowMoveModal(false)}
                className="w-full py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-medium transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;