import React from 'react';
import { 
  Zap, 
  Search, 
  Grid3X3, 
  List, 
  Upload, 
  ArrowLeft,
  Folder,
  Image,
  Heart,
  Move,
  Trash2,
  Check,
  PlusIcon,
  Filter,
  SortAsc,
  X,
  FolderPlus,
  CheckSquare
} from 'lucide-react';

const GalleryHeader = ({
  gallery,
  photos,
  subGalleries,
  theme,
  authState,
  canEdit,
  isSharedView,
  showAddToCollectionButton,
  addingToCollection,
  onBack,
  handleAddGalleryToCollection,
  isBackDragOver,
  handleBackDragOver,
  handleBackDragLeave,
  handleBackDrop,
  galleryUsage,
  photoUsage,
  formatLimit,
  navigate,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  showFilters,
  setShowFilters,
  sortBy,
  setSortBy,
  filterBy,
  setFilterBy,
  uploading,
  isAtPhotoLimit,
  fileInputRef,
  selectionMode,
  selectedItems,
  selectedPhotoCount,
  selectAll,
  clearSelection,
  handleOpenMoveModal,
  handleBulkDelete,
  showCreateForm,
  setShowCreateForm,
  newGalleryTitle,
  setNewGalleryTitle,
  creating,
  handleCreateSubGallery,
  isAtGalleryLimit,
  draggedPhotoIds,
  isDragOver
}) => {
  const getAccessTypeDisplay = () => {
    if (gallery?.access_type) {
      switch (gallery.access_type) {
        case 'assigned':
          return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full text-blue-700 dark:text-blue-200 text-sm font-medium">
              <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse"></div>
              Assigned
            </div>
          );
        case 'shared':
          return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-full text-emerald-700 dark:text-emerald-200 text-sm font-medium">
              <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse"></div>
              Shared
            </div>
          );
        case 'public':
          return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-full text-purple-700 dark:text-purple-200 text-sm font-medium">
              <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full animate-pulse"></div>
              Public
            </div>
          );
        default:
          return null;
      }
    }
    return null;
  };

  return (
    <>
      {/* Floating Action Button for Create Sub-Gallery */}
      {canEdit && (
        <button
          onClick={() => setShowCreateForm(true)}
          disabled={isAtGalleryLimit()}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
          title={isAtGalleryLimit() ? "Gallery limit reached" : "Create Sub-Gallery"}
        >
          <FolderPlus className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Drag Indicator */}
      {draggedPhotoIds.length > 0 && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-6 py-3 rounded-full shadow-2xl z-50 animate-bounce">
          <div className="flex items-center gap-2">
            <Move className="w-5 h-5" />
            <span className="font-semibold">Moving {draggedPhotoIds.length} photo{draggedPhotoIds.length > 1 ? 's' : ''}</span>
          </div>
        </div>
      )}

      {/* Drop Zone Overlay */}
      {isDragOver && (
        <div className="fixed inset-0 bg-indigo-500/20 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border-2 border-dashed border-indigo-500 animate-pulse">
            <Upload className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-900 dark:text-white">Drop photos here to upload</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`sticky top-0 z-30 ${theme === 'dark' ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-xl border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'} transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${isBackDragOver ? 'ring-2 ring-indigo-500 bg-indigo-500/20' : ''}`}
                onClick={onBack}
                onDragOver={handleBackDragOver}
                onDragLeave={handleBackDragLeave}
                onDrop={handleBackDrop}
                title={gallery.parent_gallery ? "Move to Parent Gallery" : "Back to Galleries"}
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-semibold">Back</span>
                {isBackDragOver && (
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-ping"></div>
                )}
              </button>
              
              {showAddToCollectionButton && (
                <button
                  onClick={handleAddGalleryToCollection}
                  disabled={addingToCollection}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {addingToCollection ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
                  ) : (
                    <Heart className="w-5 h-5" />
                  )}
                  <span className="hidden sm:inline">Add to Collection</span>
                </button>
              )}
            </div>

            {/* Plan Usage Indicators */}
            {authState.isAuthenticated && canEdit && authState.user?.stats?.plan_limits && (
              <div className="hidden lg:flex items-center gap-4">
                {authState.user.stats.plan_limits.max_galleries_count !== -1 && (
                  <div className={`flex items-center gap-3 px-4 py-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl shadow-sm`}>
                    <Folder className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {authState.user.stats.galleries_count || 0} / {formatLimit(authState.user.stats.plan_limits.max_galleries_count)}
                    </span>
                    <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(galleryUsage.percentage, 100)}%`,
                          backgroundColor: galleryUsage.color,
                        }}
                      />
                    </div>
                  </div>
                )}
                {authState.user.stats.plan_limits.max_photos_count !== -1 && (
                  <div className={`flex items-center gap-3 px-4 py-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl shadow-sm`}>
                    <Image className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {authState.user.stats.photos_count || 0} / {formatLimit(authState.user.stats.plan_limits.max_photos_count)}
                    </span>
                    <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(photoUsage.percentage, 100)}%`,
                          backgroundColor: photoUsage.color,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Gallery Title and Info */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className={`text-3xl lg:text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-3`}>
                {gallery.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Image className="w-5 h-5" />
                  <span className="font-medium">{photos.length} photo{photos.length !== 1 ? 's' : ''}</span>
                </div>
                {subGalleries.length > 0 && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Folder className="w-5 h-5" />
                    <span className="font-medium">{subGalleries.length} galler{subGalleries.length !== 1 ? 'ies' : 'y'}</span>
                  </div>
                )}
                {getAccessTypeDisplay()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Limit Warnings */}
      {authState.isAuthenticated && canEdit && authState.user?.stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {(isAtGalleryLimit() || isAtPhotoLimit()) && (
            <div className="space-y-3">
              {isAtGalleryLimit() && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-amber-100 dark:bg-amber-800/50 rounded-xl">
                      <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">Gallery Limit Reached</h3>
                      <p className="text-amber-700 dark:text-amber-300 text-sm">
                        You've reached your plan's limit of {formatLimit(authState.user.stats.plan_limits.max_galleries_count)} galleries.
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/upgrade')}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg font-medium text-sm transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      Upgrade Plan
                    </button>
                  </div>
                </div>
              )}
              {isAtPhotoLimit() && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-amber-100 dark:bg-amber-800/50 rounded-xl">
                      <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">Photo Limit Reached</h3>
                      <p className="text-amber-700 dark:text-amber-300 text-sm">
                        You've reached your plan's limit of {formatLimit(authState.user.stats.plan_limits.max_photos_count)} photos.
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/upgrade')}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg font-medium text-sm transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      Upgrade Plan
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Search and Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search photos and galleries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-3.5 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 shadow-sm`}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className={`flex rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} shadow-sm`}>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-3.5 flex items-center gap-2 font-medium text-sm transition-all duration-300 ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'}`}
              >
                <Grid3X3 className="w-5 h-5" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-3.5 flex items-center gap-2 font-medium text-sm transition-all duration-300 ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-sm' : theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'}`}
              >
                <List className="w-5 h-5" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>

            {/* Filter Button */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3.5 ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-white hover:bg-gray-50 text-gray-900'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} rounded-xl font-medium text-sm transition-all duration-300 shadow-sm ${showFilters ? 'ring-2 ring-indigo-500' : ''}`}
              >
                <Filter className="w-5 h-5" />
                <span className="hidden sm:inline">Filter</span>
              </button>

              {/* Filter Dropdown */}
              {showFilters && (
                <div className={`absolute right-0 mt-2 w-80 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl shadow-xl z-50 p-6`}>
                  <div className="space-y-6">
                    <div>
                      <label className={`block text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-3`}>
                        <SortAsc className="w-4 h-4 inline mr-2" />
                        Sort By
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className={`w-full px-3 py-2.5 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium`}
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
                      <label className={`block text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-3`}>
                        <Filter className="w-4 h-4 inline mr-2" />
                        Show Items
                      </label>
                      <select
                        value={filterBy}
                        onChange={(e) => setFilterBy(e.target.value)}
                        className={`w-full px-3 py-2.5 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium`}
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

            {/* Upload Button */}
            {canEdit && (
              <button
                onClick={() => fileInputRef(current)?.click()}
                disabled={uploading || isAtPhotoLimit()}
                className="flex items-center gap-2 px-4 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-medium text-sm transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
                ) : (
                  <Upload className="w-5 h-5" />
                )}
                <span className="hidden sm:inline">Upload</span>
              </button>
            )}
          </div>
        </div>

        {/* Selection Controls */}
        {selectionMode && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="font-semibold text-indigo-900 dark:text-indigo-100">
                  {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={selectAll}
                  className="flex items-center gap-2 px-3 py-2 bg-indigo-100 dark:bg-indigo-800 hover:bg-indigo-200 dark:hover:bg-indigo-700 text-indigo-800 dark:text-indigo-200 rounded-lg font-medium text-sm transition-all"
                >
                  <Check className="w-4 h-4" />
                  Select All
                </button>
                <button
                  onClick={clearSelection}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium text-sm transition-all"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              </div>

              {canEdit && (
                <div className="flex items-center gap-2 ml-auto">
                  {selectedPhotoCount > 0 && (
                    <button
                      onClick={handleOpenMoveModal}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-all"
                    >
                      <Move className="w-4 h-4" />
                      Move ({selectedPhotoCount})
                    </button>
                  )}
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete ({selectedItems.size})
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Sub-Gallery Form */}
      {showCreateForm && canEdit && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 shadow-lg`}>
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
              Create New Sub-Gallery
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Enter sub-gallery title..."
                value={newGalleryTitle}
                onChange={(e) => setNewGalleryTitle(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newGalleryTitle.trim() && !creating) {
                    handleCreateSubGallery();
                  }
                }}
                className={`flex-1 px-4 py-3 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium`}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateSubGallery}
                  disabled={creating || !newGalleryTitle.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
                  ) : (
                    'Create'
                  )}
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className={`px-6 py-3 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'} rounded-lg font-medium transition-all duration-300`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GalleryHeader;