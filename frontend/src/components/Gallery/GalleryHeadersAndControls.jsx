import React, { useState, useEffect } from "react";
import { Plus, Folder, Search, Grid3X3, List, Filter, SortAsc, X, ChevronDown, Sparkles, Zap, Crown } from "lucide-react";
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
  const { apiFetch, user, fetchUserStats, checkPlanLimits, upgradePrompt, setUpgradePrompt } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGalleryTitle, setNewGalleryTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);

  // Check if user can create galleries
  const { canCreateGallery, canUploadPhotos } = user?.stats?.plan_limits
    ? checkPlanLimits("check")
    : { canCreateGallery: false, canUploadPhotos: false };

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
    if (!canCreateGallery) {
      const { message } = checkPlanLimits("createGallery");
      setUpgradePrompt({ type: "galleries", message });
      return;
    }
    setCreating(true);
    try {
      const response = await apiFetch("/gallery/galleries/create/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newGalleryTitle, description: "" }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.error || "Failed to create gallery.");
      }
      await response.json();
      await fetchOrganizedGalleries();
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

  // Calculate stats
  const totalGalleries = user?.stats?.galleries_count || organizedGalleries.owned_galleries.length;
  const maxGalleries = user?.stats?.plan_limits?.max_galleries_count || 0;
  const isGalleryLimitReached = totalGalleries >= maxGalleries;

  const totalPhotos = user?.stats?.photos_count || 0;
  const maxPhotos = user?.stats?.plan_limits?.max_photos_count || 0;
  const isPhotoLimitReached = totalPhotos >= maxPhotos;

  const storageUsed = user?.stats?.storage_used_gb || 0;
  const maxStorage = user?.stats?.plan_limits?.max_storage
    ? (user.stats.plan_limits.max_storage / (1024 * 1024 * 1024)).toFixed(2)
    : 0;
  const isStorageLimitReached = storageUsed >= maxStorage;

  const getProgressColor = (used, max) => {
    const percentage = (used / max) * 100;
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className="mb-8 space-y-6">
      {/* Upgrade Modal */}
      {upgradePrompt && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div
            className={`${
              theme === "dark" 
                ? "bg-gray-900/95 border-gray-700/50 backdrop-blur-xl" 
                : "bg-white/95 border-gray-200/50 backdrop-blur-xl"
            } rounded-3xl w-full max-w-md border shadow-2xl p-8 transform transition-all duration-300 scale-100`}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"} mb-2`}>
                Upgrade Your Plan
              </h3>
              <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"} leading-relaxed`}>
                {upgradePrompt.message}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setUpgradePrompt(null);
                  window.location.href = "/upgrade";
                }}
                className="flex-1 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-2xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <Sparkles className="w-4 h-4 inline mr-2" />
                Upgrade Now
              </button>
              <button
                onClick={() => setUpgradePrompt(null)}
                className={`px-6 py-4 ${
                  theme === "dark" 
                    ? "bg-gray-800 hover:bg-gray-700 text-gray-300" 
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                } rounded-2xl font-semibold text-sm transition-all duration-300`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      {activeTab && setActiveTab && (
        <div className="relative">
          <div className={`flex gap-2 p-2 ${
            theme === "dark" 
              ? "bg-gray-800/50 border-gray-700/50" 
              : "bg-gray-50/80 border-gray-200/50"
          } border rounded-2xl backdrop-blur-sm`}>
            <button
              onClick={() => setActiveTab("my-galleries")}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeTab === "my-galleries"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 transform scale-105"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50"
              }`}
            >
              <Folder className="w-4 h-4 inline mr-2" />
              My Galleries
              <span className="ml-2 px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs rounded-full">
                {organizedGalleries.owned_galleries.length}
              </span>
            </button>
            {isAuthenticated && (
              <button
                onClick={() => setActiveTab("shared")}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  activeTab === "shared"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 transform scale-105"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50"
                }`}
              >
                Shared
                <span className="ml-2 px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs rounded-full">
                  {organizedGalleries.assigned_galleries.length + organizedGalleries.shared_galleries.length}
                </span>
              </button>
            )}
            <button
              onClick={() => setActiveTab("public")}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeTab === "public"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 transform scale-105"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50"
              }`}
            >
              Public
            </button>
          </div>
        </div>
      )}

      {/* My Galleries Header with Stats */}
      {activeTab === "my-galleries" && isAuthenticated && (
        <div className={`${
          theme === "dark" 
            ? "bg-gradient-to-br from-gray-800/50 to-gray-900/30 border-gray-700/50" 
            : "bg-gradient-to-br from-white/80 to-gray-50/50 border-gray-200/50"
        } border rounded-3xl p-8 backdrop-blur-sm`}>
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Folder className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"} tracking-tight`}>
                    {getTabTitle()}
                  </h2>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Manage and organize your photo collections
                  </p>
                </div>
              </div>
              
              {/* Stats Cards */}
              {statsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`p-4 rounded-2xl ${
                      theme === "dark" ? "bg-gray-700/50" : "bg-gray-100/50"
                    } animate-pulse`}>
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Galleries Stats */}
                  <div className={`p-5 rounded-2xl ${
                    theme === "dark" 
                      ? "bg-gray-700/30 border-gray-600/50" 
                      : "bg-white/70 border-gray-200/50"
                  } border backdrop-blur-sm`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                        Galleries
                      </h4>
                      <Folder className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                          {totalGalleries}
                        </div>
                        <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          of {maxGalleries} allowed
                        </div>
                      </div>
                      <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${getProgressColor(totalGalleries, maxGalleries)}`}
                          style={{ width: `${Math.min((totalGalleries / maxGalleries) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    {isGalleryLimitReached && (
                      <button
                        onClick={() => {
                          const { message } = checkPlanLimits("createGallery");
                          setUpgradePrompt({ type: "galleries", message });
                        }}
                        className="mt-3 text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Zap className="w-3 h-3" />
                        Upgrade needed
                      </button>
                    )}
                  </div>

                  {/* Photos Stats */}
                  <div className={`p-5 rounded-2xl ${
                    theme === "dark" 
                      ? "bg-gray-700/30 border-gray-600/50" 
                      : "bg-white/70 border-gray-200/50"
                  } border backdrop-blur-sm`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                        Photos
                      </h4>
                      <Grid3X3 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                          {totalPhotos.toLocaleString()}
                        </div>
                        <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          of {maxPhotos.toLocaleString()} allowed
                        </div>
                      </div>
                      <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${getProgressColor(totalPhotos, maxPhotos)}`}
                          style={{ width: `${Math.min((totalPhotos / maxPhotos) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Storage Stats */}
                  <div className={`p-5 rounded-2xl ${
                    theme === "dark" 
                      ? "bg-gray-700/30 border-gray-600/50" 
                      : "bg-white/70 border-gray-200/50"
                  } border backdrop-blur-sm`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                        Storage
                      </h4>
                      <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded" />
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                          {storageUsed.toFixed(2)}
                        </div>
                        <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          of {maxStorage} GB used
                        </div>
                      </div>
                      <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${getProgressColor(storageUsed, maxStorage)}`}
                          style={{ width: `${Math.min((storageUsed / maxStorage) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Create Button */}
            <button
              onClick={() => {
                if (!canCreateGallery) {
                  const { message } = checkPlanLimits("createGallery");
                  setUpgradePrompt({ type: "galleries", message });
                  return;
                }
                setShowCreateForm(!showCreateForm);
              }}
              disabled={!canCreateGallery}
              className={`ml-6 flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-r ${
                canCreateGallery
                  ? "from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25"
                  : "from-gray-400 to-gray-500 cursor-not-allowed opacity-50"
              } text-white transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/30 transform hover:scale-105 disabled:hover:scale-100`}
              title="Create Gallery"
            >
              <Plus className="w-7 h-7" />
            </button>
          </div>

          {/* Create Gallery Form */}
          {showCreateForm && (
            <div className={`${
              theme === "dark" 
                ? "bg-gray-700/30 border-gray-600/50" 
                : "bg-white/70 border-gray-200/50"
            } border rounded-2xl p-6 backdrop-blur-sm animate-in slide-in-from-top-4 duration-300`}>
              <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"} mb-4`}>
                Create New Gallery
              </h3>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Enter gallery name..."
                  value={newGalleryTitle}
                  onChange={(e) => setNewGalleryTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newGalleryTitle.trim() && !creating && canCreateGallery) {
                      handleCreateGallery();
                    }
                  }}
                  className={`flex-1 px-4 py-3 rounded-xl ${
                    theme === "dark" 
                      ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400" 
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  } border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 ${
                    creating || !canCreateGallery ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={creating || !canCreateGallery}
                />
                <button
                  onClick={handleCreateGallery}
                  disabled={creating || !newGalleryTitle.trim() || !canCreateGallery}
                  className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    creating || !newGalleryTitle.trim() || !canCreateGallery
                      ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed text-gray-200"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                  }`}
                >
                  {creating ? "Creating..." : "Create"}
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewGalleryTitle("");
                  }}
                  className={`px-4 py-3 rounded-xl ${
                    theme === "dark" 
                      ? "bg-gray-600 hover:bg-gray-500 text-gray-300" 
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  } font-semibold text-sm transition-all duration-300`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search and Controls */}
      {viewMode !== undefined && (
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative group">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            } group-focus-within:text-indigo-500 transition-colors duration-300`} />
            <input
              type="text"
              placeholder="Search photos and galleries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-6 py-4 ${
                theme === "dark" 
                  ? "bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400" 
                  : "bg-white/80 border-gray-200/50 text-gray-900 placeholder-gray-500"
              } border rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm hover:shadow-md focus:shadow-lg`}
            />
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className={`flex rounded-xl overflow-hidden ${
              theme === "dark" ? "bg-gray-800/80" : "bg-gray-100/80"
            } backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50`}>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-3 flex items-center gap-2 font-semibold text-sm transition-all duration-300 ${
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                    : theme === "dark"
                    ? "text-gray-300 hover:text-white hover:bg-gray-700/50"
                    : "text-gray-700 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-3 flex items-center gap-2 font-semibold text-sm transition-all duration-300 ${
                  viewMode === "list"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                    : theme === "dark"
                    ? "text-gray-300 hover:text-white hover:bg-gray-700/50"
                    : "text-gray-700 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                <List className="w-5 h-5" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>

            {/* Filters */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 ${
                  theme === "dark" 
                    ? "bg-gray-800/80 hover:bg-gray-700/80 text-white" 
                    : "bg-white/80 hover:bg-gray-50/80 text-gray-900"
                } border ${
                  theme === "dark" ? "border-gray-700/50" : "border-gray-200/50"
                } rounded-xl font-semibold text-sm transition-all duration-300 backdrop-blur-sm hover:shadow-md ${
                  showFilters ? "ring-2 ring-indigo-500/50 shadow-lg" : ""
                }`}
              >
                <Filter className="w-5 h-5" />
                <span className="hidden sm:inline">Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                  showFilters ? "rotate-180" : ""
                }`} />
              </button>

              {/* Filter Dropdown */}
              {showFilters && (
                <div
                  className={`absolute right-0 mt-3 w-80 ${
                    theme === "dark" 
                      ? "bg-gray-800/95 border-gray-700/50" 
                      : "bg-white/95 border-gray-200/50"
                  } border rounded-2xl shadow-2xl backdrop-blur-xl z-50 p-6 animate-in slide-in-from-top-2 duration-200`}
                >
                  <div className="space-y-6">
                    <div>
                      <label className={`flex items-center gap-2 text-sm font-semibold ${
                        theme === "dark" ? "text-gray-200" : "text-gray-700"
                      } mb-3`}>
                        <SortAsc className="w-4 h-4 text-indigo-500" />
                        Sort By
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className={`w-full px-4 py-3 ${
                          theme === "dark" 
                            ? "bg-gray-700/50 border-gray-600/50 text-white" 
                            : "bg-gray-50/50 border-gray-300/50 text-gray-900"
                        } border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all duration-300`}
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
                      <label className={`flex items-center gap-2 text-sm font-semibold ${
                        theme === "dark" ? "text-gray-200" : "text-gray-700"
                      } mb-3`}>
                        <Filter className="w-4 h-4 text-emerald-500" />
                        Show Items
                      </label>
                      <select
                        value={filterBy}
                        onChange={(e) => setFilterBy(e.target.value)}
                        className={`w-full px-4 py-3 ${
                          theme === "dark" 
                            ? "bg-gray-700/50 border-gray-600/50 text-white" 
                            : "bg-gray-50/50 border-gray-300/50 text-gray-900"
                        } border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all duration-300`}
                      >
                        <option value="all">All Items</option>
                        <option value="photos">Photos Only</option>
                        <option value="galleries">Galleries Only</option>
                      </select>
                    </div>
                    <button
                      onClick={() => setShowFilters(false)}
                      className={`w-full py-3 ${
                        theme === "dark" 
                          ? "bg-gray-700/50 hover:bg-gray-600/50 text-gray-300" 
                          : "bg-gray-100/50 hover:bg-gray-200/50 text-gray-700"
                      } rounded-xl font-semibold text-sm transition-all duration-300`}
                    >
                      Close Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Selection Mode Banner */}
      {selectionMode && (
        <div className={`${
          theme === "dark"
            ? "bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border-indigo-700/50"
            : "bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border-indigo-200/50"
        } border rounded-2xl p-6 backdrop-blur-sm animate-in slide-in-from-top-4 duration-300`}>
          <div className="flex flex-wrap items-center gap-4">
            {/* Selection Count */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${
                theme === "dark" ? "bg-indigo-800/50" : "bg-indigo-100"
              } flex items-center justify-center`}>
                <span className={`font-bold text-sm ${
                  theme === "dark" ? "text-indigo-300" : "text-indigo-700"
                }`}>
                  {selectedItems.size}
                </span>
              </div>
              <div>
                <div className={`font-semibold text-sm ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}>
                  {selectedItems.size} item{selectedItems.size !== 1 ? "s" : ""} selected
                </div>
                <div className={`text-xs ${
                  theme === "dark" ? "text-indigo-300" : "text-indigo-600"
                }`}>
                  Ready for bulk actions
                </div>
              </div>
            </div>

            {/* Selection Controls */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={onSelectAll}
                className={`px-4 py-2 ${
                  theme === "dark" 
                    ? "bg-indigo-800/50 hover:bg-indigo-700/50 text-indigo-200 border-indigo-600/50" 
                    : "bg-indigo-100 hover:bg-indigo-200 text-indigo-700 border-indigo-300"
                } border rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-md`}
              >
                Select All
              </button>
              <button
                onClick={onClearSelection}
                className={`px-4 py-2 ${
                  theme === "dark" 
                    ? "bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border-gray-600/50" 
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                } border rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-md`}
              >
                Clear
              </button>
              
              {canEdit && (
                <>
                  <div className={`w-px h-6 ${
                    theme === "dark" ? "bg-gray-600" : "bg-gray-300"
                  }`} />
                  <button
                    onClick={onBulkMove}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                  >
                    Move Selected
                  </button>
                  <button
                    onClick={onBulkDelete}
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                  >
                    Delete Selected
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryHeadersAndControls;