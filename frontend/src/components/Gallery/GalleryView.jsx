import React, { useState, useRef, useEffect } from "react";
import GalleryCard from "./GalleryCard";
import PhotoCard from "./PhotoCard";
import { useApi } from "../../useApi";
import { useAuth } from "../../AuthContext";
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Search, 
  Grid3X3, 
  List, 
  MoreHorizontal, 
  Plus, 
  Upload, 
  ArrowLeft,
  Filter,
  SortAsc,
  Folder,
  Image,
  Heart,
  Move,
  Trash2,
  Check
} from 'lucide-react';

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
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('date_desc');
  const [filterBy, setFilterBy] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [draggedPhotoId, setDraggedPhotoId] = useState(null);
  const [userGalleries, setUserGalleries] = useState([]);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [isBackDragOver, setIsBackDragOver] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef(null);
  const { token, isAuthenticated } = useAuth();
  const { apiFetch } = useApi();
  const navigate = useNavigate();
  const apiFetchRef = useRef(apiFetch);
  const canEdit = gallery?.can_share !== false;
  const isSharedView = gallery?.access_type && gallery.access_type !== 'owner';

  // Update apiFetchRef when apiFetch changes
  useEffect(() => {
    apiFetchRef.current = apiFetch;
  }, [apiFetch]);

  // Fetch user stats to check plan limits
  async function loadUserStats() {
    let isMounted = true;
    try {
      console.log('Fetching /subscriptions/me/stats/');
      setStatsLoading(true);
      const response = await apiFetchRef.current('/subscriptions/me/stats/');
      if (!response || !response.ok) {
        throw new Error('Failed to fetch user stats');
      }
      const data = await response.json();
      // Ensure max_galleries_count is a valid number
      if (data?.plan_limits?.max_galleries_count === undefined || data?.galleries_count === undefined) {
        throw new Error('Invalid user stats data');
      }
      if (isMounted) {
        setUserStats(data);
        console.log('User stats loaded:', data);
      }
    } catch (err) {
      console.error('Error loading user stats:', err);
      setUserStats(null); // Reset userStats to prevent invalid data
    } finally {
      if (isMounted) {
        setStatsLoading(false);
      }
    }
    return () => {
      isMounted = false;
    };
  }

  useEffect(() => {
    if (gallery) {
      fetchGalleryDetails(gallery.id);
      setShowAddToCollectionButton(
        isAuthenticated && 
        isSharedView && 
        !gallery.accessible_users?.some(user => user.id === getCurrentUserId())
      );
    }
    // Load user stats when component mounts
    if (isAuthenticated && canEdit) {
      loadUserStats();
    }
  }, [gallery, isAuthenticated, isSharedView, canEdit]);

  useEffect(() => {
    let filtered = [...photos];
    if (searchQuery.trim()) {
      filtered = filtered.filter(photo => 
        photo.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.original_filename?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
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
        filtered.sort((a, b) => (b.caption || b.original_filename || '').localeCompare(a.caption || b.original_filename || ''));
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
    if (searchQuery.trim()) {
      filtered = filtered.filter(gallery => 
        gallery.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gallery.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    switch (sortBy) {
      case 'date_desc':
        filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        break;
      case 'date_asc':
        filtered.sort((a, b) => new Date(a.created_at || 0) - new Date(a.created_at || 0));
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
    return null;
  };

  const normalizeGallery = (g) => ({
    ...g,
    cover_image: g.cover_image || g.cover_photo || null,
  });

  // Plan limit check functions
  function isAtGalleryLimit() {
    if (!userStats?.plan_limits) return false;

    const maxGalleries = parseInt(userStats.plan_limits.max_galleries_count, 10);
    const currentGalleries = parseInt(userStats.galleries_count || 0, 10);

    // Handle invalid or missing data
    if (isNaN(maxGalleries) || isNaN(currentGalleries)) {
      console.error('Invalid gallery limit data:', { maxGalleries, currentGalleries });
      return false;
    }

    // -1 means unlimited
    if (maxGalleries === -1) return false;

    console.log('Checking gallery limit:', maxGalleries, currentGalleries);
    console.log('Is at gallery limit:', currentGalleries >= maxGalleries);
    return currentGalleries >= maxGalleries;
  }

  function isAtPhotoLimit() {
    if (!userStats || !userStats.plan_limits) return false;
    const maxPhotos = parseInt(userStats.plan_limits.max_photos_count, 10);
    const currentPhotos = parseInt(userStats.photos_count || 0, 10);
    if (isNaN(maxPhotos) || isNaN(currentPhotos)) return false;
    return maxPhotos !== -1 && currentPhotos >= maxPhotos;
  }

  function getGalleryUsageInfo() {
    if (!userStats || !userStats.plan_limits) return { percentage: 0, color: '#10B981', isAtLimit: false };
    const maxGalleries = parseInt(userStats.plan_limits.max_galleries_count, 10);
    const currentGalleries = parseInt(userStats.galleries_count || 0, 10);
    if (isNaN(maxGalleries) || maxGalleries === -1) return { percentage: 0, color: '#10B981', isAtLimit: false };
    const percentage = (currentGalleries / maxGalleries) * 100;
    const isAtLimit = currentGalleries >= maxGalleries;
    let color = '#10B981'; // green
    if (percentage >= 100) color = '#EF4444'; // red
    else if (percentage >= 80) color = '#F59E0B'; // yellow
    return { percentage, color, isAtLimit };
  }

  function getPhotoUsageInfo() {
    if (!userStats || !userStats.plan_limits) return { percentage: 0, color: '#10B981', isAtLimit: false };
    const maxPhotos = parseInt(userStats.plan_limits.max_photos_count, 10);
    const currentPhotos = parseInt(userStats.photos_count || 0, 10);
    if (isNaN(maxPhotos) || maxPhotos === -1) return { percentage: 0, color: '#10B981', isAtLimit: false };
    const percentage = (currentPhotos / maxPhotos) * 100;
    const isAtLimit = currentPhotos >= maxPhotos;
    let color = '#10B981'; // green
    if (percentage >= 100) color = '#EF4444'; // red
    else if (percentage >= 80) color = '#F59E0B'; // yellow
    return { percentage, color, isAtLimit };
  }

  const formatLimit = (limit) => {
    if (limit === -1) return '∞';
    return isNaN(limit) ? '0' : limit.toLocaleString();
  };

  const fetchGalleryDetails = async (galleryId) => {
    try {
      const response = await apiFetch(`/gallery/galleries/${galleryId}/`);
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setPhotos(data.photos || []);
      setSubGalleries(data.sub_galleries || []);
    } catch (err) {
      console.error("fetchGalleryDetails error:", err);
      onError(err.message || "Failed to load gallery details");
    }
  };

  const fetchUserGalleries = async () => {
    try {
      const response = await apiFetch(`/gallery/galleries/`);
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setUserGalleries(data || []);
    } catch (err) {
      console.error("fetchUserGalleries error:", err);
      onError(err.message || "Failed to load your galleries");
    }
  };

  const toggleSelection = (id, type) => {
    const itemId = `${type}-${id}`;
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
    if (filterBy === 'all' || filterBy === 'galleries') {
      filteredSubGalleries.forEach(gallery => allItems.add(`gallery-${gallery.id}`));
    }
    if (filterBy === 'all' || filterBy === 'photos') {
      filteredPhotos.forEach(photo => allItems.add(`photo-${photo.id}`));
    }
    setSelectedItems(allItems);
    setSelectionMode(allItems.size > 0);
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
          promises.push(apiFetch(`/gallery/photos/${id}/`, { method: "DELETE" }));
        } else if (type === 'gallery') {
          promises.push(apiFetch(`/gallery/galleries/${id}/`, { method: "DELETE" }));
        }
      });
      await Promise.all(promises);
      await fetchGalleryDetails(gallery.id);
      await loadUserStats(); // Refresh stats after deletion
      clearSelection();
    } catch (err) {
      console.error("Bulk delete error:", err);
      onError("Failed to delete selected items");
    }
  };

  const handleBulkMove = async (targetGalleryId) => {
    if (!canEdit) {
      onError("You don't have permission to move photos.");
      return;
    }
    const photoIds = Array.from(selectedItems)
      .filter(itemId => itemId.startsWith('photo-'))
      .map(itemId => itemId.split('-')[1]);
    if (photoIds.length === 0) {
      onError("No photos selected to move.");
      return;
    }
    try {
      await Promise.all(photoIds.map(photoId => 
        apiFetch(`/gallery/photo/move/`, {
          method: "POST",
          body: JSON.stringify({
            photo_id: photoId,
            target_gallery_id: targetGalleryId,
          }),
        })
      ));
      await fetchGalleryDetails(gallery.id);
      clearSelection();
      setShowMoveModal(false);
    } catch (err) {
      console.error("Bulk move error:", err);
      onError(err.message || "Failed to move photos");
    }
  };

  const handleMovePhoto = async (photoId, targetGalleryId) => {
    if (!canEdit) {
      onError("You don't have permission to move photos.");
      return;
    }
    try {
      const response = await apiFetch(`/gallery/photo/move/`, {
        method: "POST",
        body: JSON.stringify({
          photo_id: photoId,
          target_gallery_id: targetGalleryId,
        }),
      });
      if (!response.ok) throw new Error(await response.text());
      await fetchGalleryDetails(gallery.id);
    } catch (err) {
      console.error("movePhoto error:", err);
      onError(err.message || "Failed to move photo");
    }
  };

  const handleOpenMoveModal = async () => {
    if (userGalleries.length === 0) {
      await fetchUserGalleries();
    }
    setShowMoveModal(true);
  };

  // Enhanced drag handlers with proper event handling
  const handleDragStart = (e, photoId) => {
    if (selectionMode || !canEdit) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData("application/json", JSON.stringify({ photoId }));
    setDraggedPhotoId(photoId);
  };

  const handleDragOver = (e, galleryId) => {
    if (selectionMode || !canEdit || !draggedPhotoId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add("border-blue-400", "bg-blue-500", "bg-opacity-20", "scale-105");
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("border-blue-400", "bg-blue-500", "bg-opacity-20", "scale-105");
  };

  const handleDropOnGallery = async (e, targetGalleryId) => {
    if (selectionMode || !canEdit || !draggedPhotoId) return;
    e.preventDefault();
    e.currentTarget.classList.remove("border-blue-400", "bg-blue-500", "bg-opacity-20", "scale-105");
    
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      const photoId = data.photoId;
      
      if (photoId && targetGalleryId !== gallery.id) {
        await handleMovePhoto(photoId, targetGalleryId);
      }
    } catch (error) {
      console.error("Error handling drop:", error);
    } finally {
      setDraggedPhotoId(null);
    }
  };

  const handleBackDragOver = (e) => {
    if (selectionMode || !canEdit || !gallery.parent_gallery || !draggedPhotoId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsBackDragOver(true);
  };

  const handleBackDragLeave = (e) => {
    // Only remove drag over state if we're actually leaving the element
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsBackDragOver(false);
    }
  };

  const handleBackDrop = async (e) => {
    if (selectionMode || !canEdit || !gallery.parent_gallery || !draggedPhotoId) return;
    e.preventDefault();
    setIsBackDragOver(false);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      const photoId = data.photoId;
      
      if (photoId) {
        await handleMovePhoto(photoId, gallery.parent_gallery);
      }
    } catch (error) {
      console.error("Error handling back drop:", error);
    } finally {
      setDraggedPhotoId(null);
    }
  };

  // Main drag and drop for upload
  const handleMainDragOver = (e) => {
    e.preventDefault();
    if (canEdit && !isAtPhotoLimit()) {
      setIsDragOver(true);
    }
  };

  const handleMainDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleAddGalleryToCollection = async () => {
    if (!isAuthenticated) {
      alert("Please log in to add this gallery to your collection.");
      return;
    }
    setAddingToCollection(true);
    try {
      const response = await apiFetch(`/gallery/add-to-collection/`, {
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
      const response = await apiFetch(`/gallery/add-to-collection/`, {
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
    
    if (isAtGalleryLimit()) {
      console.log('Gallery limit reached, navigating to /upgrade');
      onError(`You've reached your plan's limit of ${formatLimit(userStats?.plan_limits?.max_galleries_count || 0)} galleries. Please upgrade your plan.`);
      navigate('/upgrade');
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
      const response = await apiFetch(`/gallery/galleries/create/`, {
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
      await loadUserStats(); // Refresh stats after creation
    } catch (err) {
      console.error("createSubGallery error:", err);
      onError(err.message || "Failed to create sub-gallery");
    } finally {
      setCreating(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (!canEdit) {
      onError("You don't have permission to upload photos.");
      return;
    }
    
    if (isAtPhotoLimit()) {
      console.log('Photo limit reached, navigating to /upgrade');
      onError(`You've reached your plan's limit of ${formatLimit(userStats?.plan_limits?.max_photos_count || 0)} photos. Please upgrade your plan.`);
      navigate('/upgrade');
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
    
    if (isAtPhotoLimit()) {
      console.log('Photo limit reached, navigating to /upgrade');
      onError(`You've reached your plan's limit of ${formatLimit(userStats?.plan_limits?.max_photos_count || 0)} photos. Please upgrade your plan.`);
      navigate('/upgrade');
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
      const response = await apiFetch(`/gallery/photos/`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error(await response.text());
      await fetchGalleryDetails(gallery.id);
      await loadUserStats(); // Refresh stats after upload
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
      const response = await apiFetch(`/gallery/photos/${photo.id}/`, {
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
      const response = await apiFetch(`/gallery/photos/${photo.id}/`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete photo");
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      await loadUserStats(); // Refresh stats after deletion
    } catch (err) {
      console.error("deletePhoto error:", err);
      onError(err.message || "Failed to delete photo");
    }
  };

  const handlePhotoInfo = (photo) => {
    const accessInfo = photo.access_type ? `\nAccess: ${photo.access_type}` : '';
    const sharingInfo = photo.sharing_status ? `\nSharing: ${photo.sharing_status}` : '';
    alert(`Photo Info:\n\nCaption: ${photo.caption || 'No caption'}\nUpload Date: ${photo.uploaded_at ? new Date(photo.uploaded_at).toLocaleDateString() : 'Unknown'}\nFile Size: ${photo.file_size ? `${(photo.file_size / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}\nDimensions: ${photo.width && photo.height ? `${photo.width} × ${photo.height}` : 'Unknown'}${accessInfo}${sharingInfo}`);
  };

  const handleSubGalleryEdit = async (subGallery, newTitle) => {
    if (!canEdit) {
      onError("You don't have permission to rename sub-galleries.");
      return;
    }
    try {
      const response = await apiFetch(`/gallery/galleries/${subGallery.id}/`, {
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
      const response = await apiFetch(`/gallery/galleries/${subGallery.id}/`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete sub-gallery");
      setSubGalleries((prev) => prev.filter((sg) => sg.id !== subGallery.id));
      await loadUserStats(); // Refresh stats after deletion
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
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/50 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-blue-200 text-sm font-medium">Assigned</span>
            </div>
          );
        case 'shared':
          return (
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/50 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-200 text-sm font-medium">Shared</span>
            </div>
          );
        case 'public':
          return (
            <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-400/50 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-purple-200 text-sm font-medium">Public</span>
            </div>
          );
        default:
          return null;
      }
    }
    return null;
  };

  const itemsToDisplay = () => {
    let items = [];
    if (filterBy === 'all' || filterBy === 'galleries') {
      items = items.concat(filteredSubGalleries.map(g => ({ ...g, type: 'gallery' })));
    }
    if (filterBy === 'all' || filterBy === 'photos') {
      items = items.concat(filteredPhotos.map(p => ({ ...p, type: 'photo' })));
    }
    return items;
  };

  const selectedPhotoCount = Array.from(selectedItems).filter(id => id.startsWith('photo-')).length;

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
  const galleryUsage = getGalleryUsageInfo();
  const photoUsage = getPhotoUsageInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50">
        <div className="px-4 py-4">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                className={`group flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-600/50 text-slate-200 transition-all duration-200 backdrop-blur-sm ${isBackDragOver ? 'border-blue-400 bg-blue-500/20 scale-105' : ''}`}
                onClick={onBack}
                onDragOver={handleBackDragOver}
                onDragLeave={handleBackDragLeave}
                onDrop={handleBackDrop}
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span className="font-medium">Back</span>
                {isBackDragOver && (
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                )}
              </button>
              
              {showAddToCollectionButton && (
                <button
                  onClick={handleAddGalleryToCollection}
                  disabled={addingToCollection}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/80 hover:bg-emerald-500/80 text-white font-medium transition-all duration-200 disabled:opacity-50 backdrop-blur-sm border border-emerald-400/50"
                >
                  {addingToCollection ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                  ) : (
                    <Heart className="w-4 h-4" />
                  )}
                  Add to Collection
                </button>
              )}
            </div>

            {/* Plan Usage Indicators */}
            {isAuthenticated && canEdit && userStats?.plan_limits && (
              <div className="hidden md:flex items-center gap-4 text-xs">
                {userStats.plan_limits.max_galleries_count !== -1 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 rounded-full backdrop-blur-sm border border-slate-600/50">
                    <Folder className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-300">
                      {userStats.galleries_count || 0} / {formatLimit(userStats.plan_limits.max_galleries_count)}
                    </span>
                    <div className="w-8 bg-slate-700 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(galleryUsage.percentage, 100)}%`,
                          backgroundColor: galleryUsage.color,
                        }}
                      />
                    </div>
                  </div>
                )}
                {userStats.plan_limits.max_photos_count !== -1 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 rounded-full backdrop-blur-sm border border-slate-600/50">
                    <Image className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-300">
                      {userStats.photos_count || 0} / {formatLimit(userStats.plan_limits.max_photos_count)}
                    </span>
                    <div className="w-8 bg-slate-700 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all duration-300"
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                {gallery.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Image className="w-4 h-4" />
                  <span>{photos.length} photo{photos.length !== 1 ? 's' : ''}</span>
                </div>
                {subGalleries.length > 0 && (
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Folder className="w-4 h-4" />
                    <span>{subGalleries.length} galler{subGalleries.length !== 1 ? 'ies' : 'y'}</span>
                  </div>
                )}
                {getAccessTypeDisplay()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Limit Warnings */}
      {isAuthenticated && canEdit && userStats && (
        <div className="px-4 py-2 space-y-2">
          {isAtGalleryLimit() && (
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-full">
                  <Zap className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-amber-200 font-semibold">Gallery limit reached</p>
                  <p className="text-amber-300/80 text-sm mt-1">
                    You've reached your plan's limit of {formatLimit(userStats.plan_limits.max_galleries_count)} galleries.{' '}
                    <button
                      onClick={() => navigate('/upgrade')}
                      className="underline hover:no-underline font-medium text-amber-200 hover:text-white transition-colors"
                    >
                      Upgrade your plan
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}
          {isAtPhotoLimit() && (
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-full">
                  <Zap className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-amber-200 font-semibold">Photo limit reached</p>
                  <p className="text-amber-300/80 text-sm mt-1">
                    You've reached your plan's limit of {formatLimit(userStats.plan_limits.max_photos_count)} photos.{' '}
                    <button
                      onClick={() => navigate('/upgrade')}
                      className="underline hover:no-underline font-medium text-amber-200 hover:text-white transition-colors"
                    >
                      Upgrade your plan
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search and Controls */}
      <div className="px-4 py-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search photos and galleries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 backdrop-blur-sm"
            />
          </div>

          {/* View Toggle */}
          <div className="flex rounded-xl overflow-hidden bg-slate-800/60 border border-slate-600/50 backdrop-blur-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-3 transition-all duration-200 ${viewMode === 'grid' 
                ? 'bg-blue-500/80 text-white shadow-lg' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-3 transition-all duration-200 ${viewMode === 'list' 
                ? 'bg-blue-500/80 text-white shadow-lg' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* More Options */}
          <button
            onClick={() => setShowToolbar(!showToolbar)}
            className="px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/60 transition-all duration-200 backdrop-blur-sm"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Extended Toolbar */}
        {showToolbar && (
          <div className="bg-slate-800/40 rounded-xl p-4 backdrop-blur-sm border border-slate-700/50">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Sort and Filter */}
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="flex items-center gap-2">
                  <SortAsc className="w-4 h-4 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 bg-slate-700/60 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-sm"
                  >
                    <option value="date_desc">Newest first</option>
                    <option value="date_asc">Oldest first</option>
                    <option value="name_asc">Name A-Z</option>
                    <option value="name_desc">Name Z-A</option>
                    <option value="size_desc">Largest first</option>
                    <option value="size_asc">Smallest first</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="px-3 py-2 bg-slate-700/60 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-sm"
                  >
                    <option value="all">All items</option>
                    <option value="photos">Photos only</option>
                    <option value="galleries">Galleries only</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              {canEdit && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600/80 hover:bg-blue-500/80 text-white rounded-lg transition-all duration-200 disabled:opacity-50 backdrop-blur-sm border border-blue-400/50"
                    disabled={isAtGalleryLimit()}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Gallery</span>
                  </button>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    accept="image/*"
                    className="hidden"
                    disabled={isAtPhotoLimit()}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600/80 hover:bg-emerald-500/80 text-white rounded-lg transition-all duration-200 disabled:opacity-50 backdrop-blur-sm border border-emerald-400/50"
                    disabled={isAtPhotoLimit()}
                  >
                    <Upload className="w-4 h-4" />
                    <span className="hidden sm:inline">Upload</span>
                  </button>
                </div>
              )}
            </div>

            {/* Selection Actions */}
            {selectionMode && (
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={selectAll}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/60 hover:bg-slate-600/60 text-white rounded-lg text-sm transition-all duration-200"
                  >
                    <Check className="w-3 h-3" />
                    All
                  </button>
                  <button
                    onClick={clearSelection}
                    className="px-3 py-1.5 bg-slate-700/60 hover:bg-slate-600/60 text-white rounded-lg text-sm transition-all duration-200"
                  >
                    Clear ({selectedItems.size})
                  </button>
                  {canEdit && (
                    <>
                      <button
                        onClick={handleBulkDelete}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-600/80 hover:bg-red-500/80 text-white rounded-lg text-sm transition-all duration-200"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                      {selectedPhotoCount > 0 && (
                        <button
                          onClick={handleOpenMoveModal}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/80 hover:bg-blue-500/80 text-white rounded-lg text-sm transition-all duration-200"
                        >
                          <Move className="w-3 h-3" />
                          Move ({selectedPhotoCount})
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create Gallery Form */}
        {showCreateForm && (
          <div className="bg-slate-800/40 rounded-xl p-4 backdrop-blur-sm border border-slate-700/50">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Gallery name..."
                value={newGalleryTitle}
                onChange={(e) => setNewGalleryTitle(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-700/60 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateSubGallery()}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateSubGallery}
                  disabled={creating || isAtGalleryLimit() || !newGalleryTitle.trim()}
                  className="px-6 py-3 bg-blue-600/80 hover:bg-blue-500/80 text-white rounded-xl transition-all duration-200 disabled:opacity-50 font-medium"
                >
                  {creating ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                      Creating...
                    </div>
                  ) : (
                    'Create'
                  )}
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-3 bg-slate-600/60 hover:bg-slate-500/60 text-white rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="px-4 pb-8">
        <div
          onDrop={handleDrop}
          onDragOver={handleMainDragOver}
          onDragLeave={handleMainDragLeave}
          className={`relative min-h-[400px] rounded-2xl border-2 border-dashed transition-all duration-300 ${
            isDragOver 
              ? 'border-blue-400 bg-blue-500/10 scale-[1.02]' 
              : 'border-slate-700/50 hover:border-slate-600/50'
          }`}
        >
          {/* Drag Overlay */}
          {isDragOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20 backdrop-blur-sm rounded-2xl z-10">
              <div className="text-center">
                <Upload className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-bounce" />
                <p className="text-blue-200 text-lg font-semibold">Drop photos to upload</p>
              </div>
            </div>
          )}

          {statsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            </div>
          ) : displayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-8">
              <div className="w-16 h-16 bg-slate-800/60 rounded-full flex items-center justify-center mb-4">
                {searchQuery ? (
                  <Search className="w-8 h-8 text-slate-400" />
                ) : (
                  <Image className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-slate-300 mb-2">
                {searchQuery ? 'No results found' : 'No content yet'}
              </h3>
              <p className="text-slate-500 mb-4">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Start by uploading photos or creating galleries'
                }
              </p>
              {canEdit && !searchQuery && (
                <div className="flex gap-3">
                  {!isAtPhotoLimit() && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600/80 hover:bg-emerald-500/80 text-white rounded-lg transition-all duration-200"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Photos
                    </button>
                  )}
                  {!isAtGalleryLimit() && (
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600/80 hover:bg-blue-500/80 text-white rounded-lg transition-all duration-200"
                    >
                      <Plus className="w-4 h-4" />
                      Create Gallery
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4'
                : 'space-y-3 p-4'
            }>
              {displayItems.map(item => (
                item.type === 'gallery' ? (
                  <GalleryCard
                    key={item.id}
                    gallery={item}
                    onSelect={() => handleSelectSubGallery(item)}
                    onEdit={handleSubGalleryEdit}
                    onDelete={handleSubGalleryDelete}
                    canEdit={canEdit}
                    isSelected={selectedItems.has(`gallery-${item.id}`)}
                    onToggleSelection={() => toggleSelection(item.id, 'gallery')}
                    onDragOver={(e) => handleDragOver(e, item.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDropOnGallery(e, item.id)}
                    viewMode={viewMode}
                  />
                ) : (
                  <PhotoCard
                    key={item.id}
                    photo={item}
                    onRename={handlePhotoRename}
                    onDelete={handlePhotoDelete}
                    onInfo={handlePhotoInfo}
                    onAddToCollection={handleAddPhotoToCollection}
                    canEdit={canEdit}
                    isSelected={selectedItems.has(`photo-${item.id}`)}
                    onToggleSelection={() => toggleSelection(item.id, 'photo')}
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    isDragging={draggedPhotoId === item.id}
                    viewMode={viewMode}
                  />
                )
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Move Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md border border-slate-700/50 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Move className="w-5 h-5" />
              Move Photos
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Select a destination gallery for {selectedPhotoCount} photo{selectedPhotoCount !== 1 ? 's' : ''}
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {userGalleries
                .filter(g => g.id !== gallery.id)
                .map(g => (
                  <button
                    key={g.id}
                    onClick={() => handleBulkMove(g.id)}
                    className="w-full text-left px-4 py-3 bg-slate-700/60 hover:bg-slate-600/60 rounded-xl text-white transition-all duration-200 border border-slate-600/50"
                  >
                    <div className="flex items-center gap-3">
                      <Folder className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">{g.title}</span>
                    </div>
                  </button>
                ))}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowMoveModal(false)}
                className="px-4 py-2 bg-slate-600/60 hover:bg-slate-500/60 text-white rounded-xl transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="fixed bottom-6 right-6 bg-slate-800/90 backdrop-blur-xl text-white p-4 rounded-2xl shadow-2xl border border-slate-700/50 z-50">
          <div className="flex items-center gap-3">
            <div className="animate-spin w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full"></div>
            <span className="font-medium">Uploading photos...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryView;