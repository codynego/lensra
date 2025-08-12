import React, { useState, useRef, useEffect } from "react";
import GalleryCard from "./GalleryCard";
import PhotoCard from "./PhotoCard";
import { useApi } from "../../useApi"; // Import useApi
import { useAuth } from "../../AuthContext";

const API_BASE_URL = "http://localhost:8000/api";

const GalleryView = ({ 
  gallery, 
  onBack, 
  onError
}) => {
  const [photos, setPhotos] = useState([]);
  const [subGalleries, setSubGalleries] = useState([]);
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [filteredSubGalleries, setFilteredSubGalleries] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newGalleryTitle, setNewGalleryTitle] = useState("");
  const [selectedSubGallery, setSelectedSubGallery] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddToCollectionButton, setShowAddToCollectionButton] = useState(false);
  const [addingToCollection, setAddingToCollection] = useState(false);

  // New state for management tools
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('date_desc'); // 'date_desc', 'date_asc', 'name_asc', 'name_desc', 'size_desc', 'size_asc'
  const [filterBy, setFilterBy] = useState('all'); // 'all', 'photos', 'folders'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);

  const fileInputRef = useRef(null);
  const { token, isAuthenticated } = useAuth(); // Use useAuth
  const { apiFetch } = useApi(); // Use useApi hook
  const canEdit = gallery?.can_share !== false;
  const isSharedView = gallery?.access_type && gallery.access_type !== 'owner';

  useEffect(() => {
    if (gallery) {
      fetchGalleryDetails(gallery.id);
      setShowAddToCollectionButton(
        isAuthenticated && 
        isSharedView && 
        !gallery.accessible_users?.some(user => user.id === getCurrentUserId())
      );
    }
  }, [gallery, isAuthenticated, isSharedView]);

  // Filter and sort effects
  useEffect(() => {
    let filtered = [...photos];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(photo => 
        photo.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.original_filename?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'date_desc':
        filtered.sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));
        break;
      case 'date_asc':
        filtered.sort((a, b) => new Date(a.uploaded_at) - new Date(b.uploaded_at));
        break;
      case 'name_asc':
        filtered.sort((a, b) => (a.caption || a.original_filename || '').localeCompare(b.caption || b.original_filename || ''));
        break;
      case 'name_desc':
        filtered.sort((a, b) => (b.caption || b.original_filename || '').localeCompare(a.caption || a.original_filename || ''));
        break;
      case 'size_desc':
        filtered.sort((a, b) => (b.file_size || 0) - (a.file_size || 0));
        break;
      case 'size_asc':
        filtered.sort((a, b) => (a.file_size || 0) - (b.file_size || 0));
        break;
      default:
        break;
    }

    setFilteredPhotos(filtered);
  }, [photos, searchQuery, sortBy]);

  useEffect(() => {
    let filtered = [...subGalleries];

    // Apply search filter for sub-galleries
    if (searchQuery.trim()) {
      filtered = filtered.filter(gallery => 
        gallery.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gallery.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort sub-galleries
    switch (sortBy) {
      case 'date_desc':
        filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        break;
      case 'date_asc':
        filtered.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
        break;
      case 'name_asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name_desc':
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        break;
    }

    setFilteredSubGalleries(filtered);
  }, [subGalleries, searchQuery, sortBy]);

  const getCurrentUserId = () => {
    return null; // Adjust based on your auth setup if needed
  };

  const normalizeGallery = (g) => ({
    ...g,
    cover_image: g.cover_image || g.cover_photo || null,
  });

  const fetchGalleryDetails = async (galleryId) => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/gallery/galleries/${galleryId}/`);
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      
      setPhotos(data.photos || []);
      setSubGalleries(data.sub_galleries || []);
    } catch (err) {
      console.error("fetchGalleryDetails error:", err);
      onError(err.message || "Failed to load gallery details");
    }
  };

  // Selection handlers
  const toggleSelection = (id, type) => {
    const itemId = `${type}-${id}`;
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };

  const selectAll = () => {
    const allItems = new Set();
    if (filterBy === 'all' || filterBy === 'photos') {
      filteredPhotos.forEach(photo => allItems.add(`photo-${photo.id}`));
    }
    if (filterBy === 'all' || filterBy === 'folders') {
      filteredSubGalleries.forEach(gallery => allItems.add(`gallery-${gallery.id}`));
    }
    setSelectedItems(allItems);
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
    setSelectionMode(false);
  };

  const handleBulkDelete = async () => {
    if (!canEdit) {
      onError("You don't have permission to delete items.");
      return;
    }

    if (selectedItems.size === 0) return;

    const confirmed = window.confirm(`Delete ${selectedItems.size} selected item(s)?`);
    if (!confirmed) return;

    try {
      const promises = [];
      selectedItems.forEach(itemId => {
        const [type, id] = itemId.split('-');
        if (type === 'photo') {
          promises.push(
            apiFetch(`${API_BASE_URL}/gallery/photos/${id}/`, { method: "DELETE" })
          );
        } else if (type === 'gallery') {
          promises.push(
            apiFetch(`${API_BASE_URL}/gallery/galleries/${id}/`, { method: "DELETE" })
          );
        }
      });

      await Promise.all(promises);
      await fetchGalleryDetails(gallery.id);
      clearSelection();
    } catch (err) {
      console.error("Bulk delete error:", err);
      onError("Failed to delete selected items");
    }
  };

  const handleAddGalleryToCollection = async () => {
    if (!isAuthenticated) {
      alert("Please log in to add this gallery to your collection.");
      return;
    }

    setAddingToCollection(true);
    try {
      const response = await apiFetch(`${API_BASE_URL}/gallery/add-to-collection/`, {
        method: "POST",
        body: JSON.stringify({ gallery_id: gallery.id }),
      });
      if (!response.ok) throw new Error(await response.text());
      alert("Gallery added to your collection!");
      setShowAddToCollectionButton(false);
    } catch (err) {
      console.error("Error adding gallery to collection:", err);
      alert(err.message || "Failed to add gallery to collection.");
    } finally {
      setAddingToCollection(false);
    }
  };

  const handleAddPhotoToCollection = async (photo) => {
    if (!isAuthenticated) {
      alert("Please log in to add this photo to your collection.");
      return;
    }

    try {
      const response = await apiFetch(`${API_BASE_URL}/gallery/add-to-collection/`, {
        method: "POST",
        body: JSON.stringify({ photo_id: photo.id }),
      });
      if (!response.ok) throw new Error(await response.text());
      alert("Photo added to your collection!");
    } catch (err) {
      console.error("Error adding photo to collection:", err);
      alert(err.message || "Failed to add photo to collection.");
    }
  };

  const handleCreateSubGallery = async () => {
    if (!canEdit) {
      onError("You don't have permission to create sub-galleries.");
      return;
    }

    if (!newGalleryTitle.trim()) {
      onError("Gallery title cannot be empty.");
      return;
    }
    setCreating(true);

    try {
      const requestBody = { 
        title: newGalleryTitle,
        description: "",
        parent_gallery: gallery.id
      };

      const response = await apiFetch(`${API_BASE_URL}/gallery/galleries/create/`, {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.error || "Failed to create sub-gallery.");
      }

      const data = await response.json();
      setSubGalleries((prev) => [normalizeGallery(data), ...prev]);
      setNewGalleryTitle("");
      setShowCreateForm(false);
    } catch (err) {
      console.error("createSubGallery error:", err);
      onError(err.message || "Failed to create sub-gallery");
    } finally {
      setCreating(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    if (!canEdit) {
      onError("You don't have permission to upload photos.");
      return;
    }
    const files = e.dataTransfer.files;
    if (!files.length) return;
    await uploadPhotos(files);
  };

  const handleFileSelect = async (e) => {
    if (!canEdit) {
      onError("You don't have permission to upload photos.");
      return;
    }
    const files = e.target.files;
    if (!files.length) return;
    await uploadPhotos(files);
  };

  const uploadPhotos = async (files) => {
    setUploading(true);

    try {
      const formData = new FormData();
      for (let file of files) {
        formData.append("image", file);
        formData.append("gallery", gallery.id);
      }

      const response = await apiFetch(`${API_BASE_URL}/gallery/photos/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(await response.text());
      await fetchGalleryDetails(gallery.id);
    } catch (err) {
      console.error("uploadPhotos error:", err);
      onError(err.message || "Failed to upload photos");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePhotoRename = async (photo, newCaption) => {
    if (!canEdit) {
      onError("You don't have permission to rename photos.");
      return;
    }

    try {
      const response = await apiFetch(`${API_BASE_URL}/gallery/photos/${photo.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ caption: newCaption }),
      });

      if (!response.ok) throw new Error("Failed to rename photo");
      
      const updatedPhoto = await response.json();
      setPhotos((prev) => 
        prev.map((p) => (p.id === photo.id ? updatedPhoto : p))
      );
    } catch (err) {
      console.error("renamePhoto error:", err);
      onError(err.message || "Failed to rename photo");
    }
  };

  const handlePhotoDelete = async (photo) => {
    if (!canEdit) {
      onError("You don't have permission to delete photos.");
      return;
    }

    try {
      const response = await apiFetch(`${API_BASE_URL}/gallery/photos/${photo.id}/`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete photo");
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    } catch (err) {
      console.error("deletePhoto error:", err);
      onError(err.message || "Failed to delete photo");
    }
  };

  const handlePhotoInfo = (photo) => {
    const accessInfo = photo.access_type ? `\nAccess: ${photo.access_type}` : '';
    const sharingInfo = photo.sharing_status ? `\nSharing: ${photo.sharing_status}` : '';
    
    alert(`Photo Info:
    
Caption: ${photo.caption || 'No caption'}
Upload Date: ${photo.uploaded_at ? new Date(photo.uploaded_at).toLocaleDateString() : 'Unknown'}
File Size: ${photo.file_size ? `${(photo.file_size / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}
Dimensions: ${photo.width && photo.height ? `${photo.width} × ${photo.height}` : 'Unknown'}${accessInfo}${sharingInfo}`);
  };

  const handleSubGalleryEdit = async (subGallery, newTitle) => {
    if (!canEdit) {
      onError("You don't have permission to rename sub-galleries.");
      return;
    }

    try {
      const response = await apiFetch(`${API_BASE_URL}/gallery/galleries/${subGallery.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ title: newTitle }),
      });
      if (!response.ok) throw new Error("Failed to rename sub-gallery");
      
      const updatedSubGallery = await response.json();
      setSubGalleries((prev) =>
        prev.map((sg) => (sg.id === subGallery.id ? normalizeGallery(updatedSubGallery) : sg))
      );
    } catch (err) {
      console.error(err);
      onError(err.message || "Failed to rename sub-gallery");
    }
  };

  const handleSubGalleryDelete = async (subGallery) => {
    if (!canEdit) {
      onError("You don't have permission to delete sub-galleries.");
      return;
    }

    try {
      const response = await apiFetch(`${API_BASE_URL}/gallery/galleries/${subGallery.id}/`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete sub-gallery");
      
      setSubGalleries((prev) => prev.filter((sg) => sg.id !== subGallery.id));
    } catch (err) {
      console.error(err);
      onError(err.message || "Failed to delete sub-gallery");
    }
  };

  const handleSelectSubGallery = (subGallery) => {
    setSelectedSubGallery(subGallery);
  };

  const handleBackFromSubGallery = () => {
    setSelectedSubGallery(null);
  };

  const getAccessTypeDisplay = () => {
    if (gallery?.access_type) {
      switch (gallery.access_type) {
        case 'assigned':
          return (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-600 bg-opacity-20 border border-blue-500 rounded-full">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-blue-200 text-sm font-medium">Assigned to you</span>
            </div>
          );
        case 'shared':
          return (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-600 bg-opacity-20 border border-green-500 rounded-full">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              <span className="text-green-200 text-sm font-medium">Shared with you</span>
            </div>
          );
        case 'public':
          return (
            <div className="flex items-center gap-2 px-3 py-1 bg-purple-600 bg-opacity-20 border border-purple-500 rounded-full">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-purple-200 text-sm font-medium">Public Gallery</span>
            </div>
          );
        default:
          return null;
      }
    }
    return null;
  };

  // Filter items to display based on filterBy
  const itemsToDisplay = () => {
    let items = [];
    
    if (filterBy === 'all' || filterBy === 'folders') {
      items = items.concat(filteredSubGalleries.map(g => ({ ...g, type: 'gallery' })));
    }
    
    if (filterBy === 'all' || filterBy === 'photos') {
      items = items.concat(filteredPhotos.map(p => ({ ...p, type: 'photo' })));
    }
    
    return items;
  };

  // If a sub-gallery is selected, render the GalleryView recursively
  if (selectedSubGallery) {
    return (
      <GalleryView
        gallery={selectedSubGallery}
        onBack={handleBackFromSubGallery}
        onError={onError}
      />
    );
  }

  const displayItems = itemsToDisplay();

  return (
    <div>
      {/* Header with Gallery Info */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              className="py-2 px-4 rounded bg-gray-600 text-white hover:bg-gray-700 transition-colors"
              onClick={onBack}
            >
              ← Back
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">{gallery.title}</h2>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1">
                <span className="text-gray-400 text-sm">
                  {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
                  {subGalleries.length > 0 && (
                    <span>, {subGalleries.length} {subGalleries.length === 1 ? 'folder' : 'folders'}</span>
                  )}
                </span>
                {getAccessTypeDisplay()}
              </div>
            </div>
          </div>
          
          {showAddToCollectionButton && (
            <button
              onClick={handleAddGalleryToCollection}
              disabled={addingToCollection}
              className="flex items-center gap-2 py-2 px-4 rounded bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {addingToCollection ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
              Add to Collection
            </button>
          )}
        </div>
      </div>

      {/* Management Toolbar */}
      <div className="mb-6 bg-gray-800 rounded-lg p-4 space-y-4">
        {/* Top Row - Search and View Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search photos and folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex rounded bg-gray-700 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* More Tools Toggle */}
          <button
            onClick={() => setShowToolbar(!showToolbar)}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>

        {/* Expanded Toolbar */}
        {showToolbar && (
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-700">
            {/* Sort By */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-300 whitespace-nowrap">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date_desc">Newest first</option>
                <option value="date_asc">Oldest first</option>
                <option value="name_asc">Name A-Z</option>
                <option value="name_desc">Name Z-A</option>
                <option value="size_desc">Largest first</option>
                <option value="size_asc">Smallest first</option>
              </select>
            </div>

            {/* Filter By */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-300 whitespace-nowrap">Show:</label>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All items</option>
                <option value="photos">Photos only</option>
                <option value="folders">Folders only</option>
              </select>
            </div>

            {/* Selection Mode */}
            {canEdit && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectionMode(!selectionMode);
                    if (!selectionMode) setSelectedItems(new Set());
                  }}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    selectionMode ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:text-white'
                  }`}
                >
                  {selectionMode ? 'Exit Selection' : 'Select Items'}
                </button>

                {selectionMode && (
                  <>
                    <button
                      onClick={selectAll}
                      className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm hover:text-white transition-colors"
                    >
                      Select All
                    </button>
                    <button
                      onClick={clearSelection}
                      className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm hover:text-white transition-colors"
                    >
                      Clear
                    </button>
                    {selectedItems.size > 0 && (
                      <button
                        onClick={handleBulkDelete}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                      >
                        Delete ({selectedItems.size})
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Upload Button */}
            {canEdit && (
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {uploading ? 'Uploading...' : 'Add Photos'}
                </button>
              </div>
            )}

            {/* Create Sub-Gallery */}
            {canEdit && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="New folder name"
                  value={newGalleryTitle}
                  onChange={(e) => setNewGalleryTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateSubGallery()}
                  className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={creating}
                />
                <button
                  onClick={handleCreateSubGallery}
                  disabled={creating || !newGalleryTitle.trim()}
                  className="flex items-center gap-2 px-3 py-1 bg-[#dd183b] text-white rounded text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {creating ? 'Creating...' : 'New Folder'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Summary */}
      {(searchQuery || filterBy !== 'all') && (
        <div className="mb-4 text-sm text-gray-400">
          {displayItems.length === 0 ? (
            <span>No items found</span>
          ) : (
            <span>
              Showing {displayItems.length} of {photos.length + subGalleries.length} items
              {searchQuery && <span> matching "{searchQuery}"</span>}
              {filterBy !== 'all' && <span> • {filterBy === 'photos' ? 'Photos only' : 'Folders only'}</span>}
            </span>
          )}
        </div>
      )}

      {/* Read-only notice for shared galleries */}
      {isSharedView && !canEdit && (
        <div className="mb-6 p-4 bg-blue-900 bg-opacity-20 border border-blue-500 rounded-lg">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-blue-200">
              <p className="font-medium">This is a shared gallery</p>
              <p className="text-sm text-blue-300">You can view and add items to your collection, but cannot edit or upload new content.</p>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      {displayItems.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-400 text-base sm:text-lg">
            {searchQuery || filterBy !== 'all' ? 'No items match your filters' : 'No items in this gallery yet'}
          </p>
          {canEdit && !searchQuery && filterBy === 'all' && (
            <p className="text-gray-500 text-sm mt-2">Upload some photos or create folders to get started!</p>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
          {displayItems.map((item) => {
            const itemId = `${item.type}-${item.id}`;
            const isSelected = selectedItems.has(itemId);
            
            if (item.type === 'gallery') {
              return (
                <div key={`gallery-${item.id}`} className="relative">
                  {selectionMode && (
                    <div className="absolute top-2 left-2 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelection(item.id, 'gallery');
                        }}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'bg-blue-600 border-blue-600' : 'bg-gray-800 border-gray-500'
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    </div>
                  )}
                  <GalleryCard
                    gallery={normalizeGallery(item)}
                    onClick={selectionMode ? () => toggleSelection(item.id, 'gallery') : handleSelectSubGallery}
                    onEdit={canEdit ? handleSubGalleryEdit : undefined}
                    onDelete={canEdit ? handleSubGalleryDelete : undefined}
                    onAddPhotos={(subGal) => setSelectedSubGallery(subGal)}
                    onSubGalleryCreated={(parentId, newSubGallery) => {}}
                    showAddToCollection={isSharedView && isAuthenticated}
                    onAddToCollection={handleAddGalleryToCollection}
                    isSubGallery={true}
                    isSelected={isSelected}
                  />
                </div>
              );
            } else {
              return (
                <div key={`photo-${item.id}`} className="relative">
                  {selectionMode && (
                    <div className="absolute top-2 left-2 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelection(item.id, 'photo');
                        }}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'bg-blue-600 border-blue-600' : 'bg-gray-800 border-gray-500'
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    </div>
                  )}
                  <PhotoCard
                    photo={item}
                    onRename={canEdit ? handlePhotoRename : undefined}
                    onDelete={canEdit ? handlePhotoDelete : undefined}
                    onInfo={handlePhotoInfo}
                    onAddToCollection={handleAddPhotoToCollection}
                    showAddToCollection={isSharedView && isAuthenticated}
                    onClick={selectionMode ? () => toggleSelection(item.id, 'photo') : undefined}
                    isSelected={isSelected}
                  />
                </div>
              );
            }
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          {displayItems.map((item) => {
            const itemId = `${item.type}-${item.id}`;
            const isSelected = selectedItems.has(itemId);
            
            return (
              <div
                key={itemId}
                className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                  isSelected 
                    ? 'bg-blue-900 bg-opacity-30 border-blue-500' 
                    : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                } ${selectionMode ? 'cursor-pointer' : ''}`}
                onClick={selectionMode ? () => toggleSelection(item.id, item.type) : undefined}
              >
                {/* Selection Checkbox */}
                {selectionMode && (
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-500'
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                )}

                {/* Icon */}
                <div className="flex-shrink-0">
                  {item.type === 'gallery' ? (
                    <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      </svg>
                    </div>
                  ) : (
                    <img
                      src={item.image}
                      alt={item.caption || 'Photo'}
                      className="w-10 h-10 object-cover rounded"
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate">
                    {item.type === 'gallery' ? item.title : (item.caption || item.original_filename || 'Untitled')}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="capitalize">{item.type}</span>
                    {item.uploaded_at && (
                      <span>{new Date(item.uploaded_at).toLocaleDateString()}</span>
                    )}
                    {item.file_size && (
                      <span>{(item.file_size / 1024 / 1024).toFixed(2)} MB</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {!selectionMode && (
                  <div className="flex items-center gap-2">
                    {item.type === 'gallery' ? (
                      <button
                        onClick={() => handleSelectSubGallery(item)}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="Open folder"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePhotoInfo(item)}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="Photo info"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    )}
                    
                    {isSharedView && isAuthenticated && (
                      <button
                        onClick={() => item.type === 'gallery' ? handleAddGalleryToCollection() : handleAddPhotoToCollection(item)}
                        className="p-2 text-gray-400 hover:text-green-400 transition-colors"
                        title="Add to collection"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Drag and Drop Zone (Desktop only) */}
      {canEdit && viewMode === 'grid' && !selectionMode && (
        <div className="hidden sm:block mt-8">
          <div
            className="border-2 border-dashed border-gray-600 p-8 text-center text-gray-400 rounded-lg hover:border-gray-500 transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-3">
              <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-lg">Drag & drop photos here to upload</p>
              <p className="text-sm text-gray-500">Or use the "Add Photos" button in the toolbar above</p>
            </div>
          </div>
        </div>
      )}

      {/* Login prompt for anonymous users viewing shared galleries */}
      {!isAuthenticated && isSharedView && (
        <div className="mt-8 text-center p-6 bg-gray-800 rounded-lg">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h3 className="text-lg font-semibold text-white mb-2">Want to save this gallery?</h3>
          <p className="text-gray-400 mb-4">Log in to add photos and galleries to your personal collection.</p>
          <button
            onClick={() => {
              localStorage.setItem('returnAfterLogin', window.location.pathname);
              window.location.href = '/login';
            }}
            className="px-6 py-2 bg-[#dd183b] text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Log In to Save
          </button>
        </div>
      )}
    </div>
  );
};

export default GalleryView;