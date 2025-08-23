import React, { useState, useEffect } from "react";
import { Plus, Folder, Search, Grid3X3, List, Filter, SortAsc } from "lucide-react";
import { useAuth } from "../../AuthContext";

const GalleryHeadersAndControls = ({
  activeTab,
  setActiveTab,
  organizedGalleries = { owned_galleries: [], assigned_galleries: [], shared_galleries: [] },
  isAuthenticated,
  theme,
  error,
  galleries,
  onAddToCollection,
  onSelectGallery,
  onError,
  fetchOrganizedGalleries,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  filterBy,
  setFilterBy,
  searchQuery,
  setSearchQuery,
  selectionMode,
  selectedItems,
  onSelectAll,
  onClearSelection,
  onBulkDelete,
  onBulkMove,
  canEdit,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGalleryTitle, setNewGalleryTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const { apiFetch, user, fetchUserStats } = useAuth();

  // Fetch user stats on mount for authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      const loadStats = async () => {
        setStatsLoading(true);
        try {
          await fetchUserStats();
        } catch (err) {
          onError("Failed to load user stats");
        } finally {
          setStatsLoading(false);
        }
      };
      loadStats();
    } else {
      setStatsLoading(false);
    }
  }, [isAuthenticated, fetchUserStats, onError]);

  const handleCreateGallery = async () => {
    if (!newGalleryTitle.trim()) {
      onError("Gallery title cannot be empty.");
      return;
    }
    setCreating(true);
    try {
      const response = await apiFetch("/gallery/galleries/create/", {
        method: "POST",
        body: JSON.stringify({ title: newGalleryTitle, description: "" }),
      });
      if (!response.ok) throw new Error((await response.json()).detail || "Failed to create gallery.");
      const data = await response.json();
      fetchOrganizedGalleries();
      setNewGalleryTitle("");
      setShowCreateForm(false);
      onError("Gallery created successfully!", "success");
    } catch (err) {
      onError(err.message || "Failed to create gallery");
    } finally {
      setCreating(false);
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case "my-galleries": return "My Galleries";
      case "shared": return "Shared with Me";
      case "public": return "Public Galleries";
      default: return "Galleries";
    }
  };

  // Calculate gallery stats
  const totalGalleries = user?.stats?.galleries_count || organizedGalleries.owned_galleries.length;
  const totalPhotos = user?.stats?.photos_count || galleries.reduce((acc, gallery) => acc + gallery.photos.length, 0);
//   const storageUsed = user?.stats?.storage_used_gb
//     ? `${user.stats.storage_used_gb.toFixed(2)} GB`
//     : "N/A";

  return (
    <div className="mb-8">
      {activeTab && setActiveTab && (
        <div className="flex flex-wrap gap-3 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("my-galleries")}
            className={`px-4 py-2.5 rounded-t-lg font-semibold text-sm transition-all duration-300 ${
              activeTab === "my-galleries"
                ? `bg-gradient-to-r from-indigo-600 to-blue-600 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  } border-b-2 border-indigo-500 shadow-md`
                : `hover:text-gray-900 ${
                    theme === "dark" ? "text-white" : "text-gray-600"
                  } dark:hover:bg-gray-700`
            }`}
          >
            My Galleries ({organizedGalleries.owned_galleries.length})
          </button>
          {isAuthenticated && (
            <button
              onClick={() => setActiveTab("shared")}
              className={`px-4 py-2.5 rounded-t-lg font-semibold text-sm transition-all duration-300 ${
                activeTab === "shared"
                  ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-b-2 border-indigo-500 shadow-md"
                  : "text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Shared ({organizedGalleries.assigned_galleries.length + organizedGalleries.shared_galleries.length})
            </button>
          )}
          <button
            onClick={() => setActiveTab("public")}
            className={`px-4 py-2.5 rounded-t-lg font-semibold text-sm transition-all duration-300 ${
              activeTab === "public"
                ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-b-2 border-indigo-500 shadow-md"
                : "text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Public Galleries
          </button>
        </div>
      )}

      {activeTab === "my-galleries" && isAuthenticated && (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"} tracking-tight`}>{getTabTitle()}</h2>
              {statsLoading ? (
                <div className={`mt-2 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Loading stats...</div>
              ) : (
                <div className={`mt-2 flex flex-wrap gap-4 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  <span>
                    <strong>Total Galleries:</strong> {totalGalleries}
                  </span>
                  <span>
                    <strong>Total Photos:</strong> {totalPhotos}
                  </span>
                  {/* <span>
                    <strong>Storage Used:</strong> {storageUsed}
                  </span> */}
                </div>
              )}
            </div>
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
                  className="p-3 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-base font-medium transition-all duration-300"
                  disabled={creating}
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleCreateGallery}
                    disabled={creating}
                    className={`flex-1 py-3 px-4 rounded-lg text-white font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                      creating
                        ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                        : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
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
        </>
      )}

      {viewMode !== undefined && (
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search photos and galleries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-3.5 ${
                theme === "dark" ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"
              } border rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 shadow-sm`}
            />
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex rounded-xl overflow-hidden ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"} shadow-sm`}>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-3.5 flex items-center gap-2 font-medium text-sm transition-all duration-300 ${
                  viewMode === "grid"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-gray-300 hover:text-white hover:bg-gray-700"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-200"
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-3.5 flex items-center gap-2 font-medium text-sm transition-all duration-300 ${
                  viewMode === "list"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-gray-300 hover:text-white hover:bg-gray-700"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-200"
                }`}
              >
                <List className="w-5 h-5" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3.5 ${
                  theme === "dark" ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-white hover:bg-gray-50 text-gray-900"
                } border ${theme === "dark" ? "border-gray-700" : "border-gray-300"} rounded-xl font-medium text-sm transition-all duration-300 shadow-sm ${
                  showFilters ? "ring-2 ring-indigo-500" : ""
                }`}
              >
                <Filter className="w-5 h-5" />
                <span className="hidden sm:inline">Filter</span>
              </button>
              {showFilters && (
                <div
                  className={`absolute right-0 mt-2 w-80 ${
                    theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                  } border rounded-xl shadow-xl z-50 p-6`}
                >
                  <div className="space-y-6">
                    <div>
                      <label
                        className={`block text-sm font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-700"} mb-3`}
                      >
                        <SortAsc className="w-4 h-4 inline mr-2" />
                        Sort By
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className={`w-full px-3 py-2.5 ${
                          theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300 text-gray-900"
                        } border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium`}
                      >
                        <option value="date_desc">Newest First</option>
                        <option value="date_asc">Oldest First</option>
                        <option value="name_asc">Name (A-Z)</option>
                        <option value="name_desc">Name (Z-A)</option>
                        <option value="size_asc">Size (Smallest)</option>
                        <option value="size_desc">Size (Largest)</option>
                      </select>
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-700"} mb-3`}
                      >
                        <Filter className="w-4 h-4 inline mr-2" />
                        Show Items
                      </label>
                      <select
                        value={filterBy}
                        onChange={(e) => setFilterBy(e.target.value)}
                        className={`w-full px-3 py-2.5 ${
                          theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300 text-gray-900"
                        } border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium`}
                      >
                        <option value="all">All Items</option>
                        <option value="photos">Photos Only</option>
                        <option value="galleries">Galleries Only</option>
                      </select>
                    </div>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="w-full py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-all duration-300"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectionMode && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-indigo-900 dark:text-indigo-100">
                {selectedItems.size} item{selectedItems.size !== 1 ? "s" : ""} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onSelectAll}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-100 dark:bg-indigo-800 hover:bg-indigo-200 dark:hover:bg-indigo-700 text-indigo-800 dark:text-indigo-200 rounded-lg font-medium text-sm transition-all"
              >
                Select All
              </button>
              <button
                onClick={onClearSelection}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium text-sm transition-all"
              >
                Clear
              </button>
            </div>
            {canEdit && (
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={onBulkMove}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-all"
                >
                  Move
                </button>
                <button
                  onClick={onBulkDelete}
                  className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-all"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryHeadersAndControls;
