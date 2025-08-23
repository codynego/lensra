import React, { useEffect, useState } from "react";
import GalleryCard from "./GalleryCard";
import GalleryHeadersAndControls from "./GalleryHeadersAndControls";
import GalleryPreview from "./GalleryPreview";
import { useAuth } from "../../AuthContext";
import { useApi } from "../../useApi";
import { Plus, Folder, Search, Grid3X3, List, Filter, SortAsc } from "lucide-react";

const Gallery = ({ theme }) => {
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
  const { isAuthenticated } = useAuth();
  const { apiFetch } = useApi();

  const normalizeGallery = (g) => ({
    ...g,
    cover_image: g.cover_image || g.cover_photo || null,
  });

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
      setError(err.message || "Failed to fetch public galleries");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserGalleries = async () => {
    try {
      const response = await apiFetch(`/gallery/galleries/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setUserGalleries(data || []);
    } catch (err) {
      console.error("fetchUserGalleries error:", err);
      setError(err.message || "Failed to load your galleries");
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

  const handleSelectGallery = (gallery) => setSelectedGallery(gallery);
  const handleBackToGalleries = () => setSelectedGallery(null);

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
      setError("Failed to delete selected galleries");
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
    if (userGalleries.length === 0) {
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
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100'}`}>
        <div className="animate-pulse text-lg font-medium text-gray-600 dark:text-white">Loading galleries...</div>
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
      />
    );
  }

  const filteredGalleries = getFilteredGalleries();

  return (
    <div className={`min-h-screen p-6 md:p-8 max-w-7xl mx-auto ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100'}`}>
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
        canEdit={true} // Assuming can edit top-level galleries
      />
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-200 text-sm font-medium animate-fade-in">
          {error}
        </div>
      )}
      <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6' : 'grid-cols-2'}`}>
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
      {showMoveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl w-full max-w-md border shadow-2xl`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Move Galleries
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Select a destination gallery for {selectedItems.size} galleries
              </p>
            </div>
            <div className="p-6 max-h-80 overflow-y-auto space-y-2">
              {userGalleries.map((targetGallery) => (
                <button
                  key={targetGallery.id}
                  onClick={() => handleBulkMove(targetGallery.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3 ${theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-50 text-gray-900'} rounded-xl transition-all duration-300 text-left`}
                >
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <Folder className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{targetGallery.title}</h4>
                  </div>
                </button>
              ))}
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