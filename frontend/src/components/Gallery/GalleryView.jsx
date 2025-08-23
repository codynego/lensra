import React, { useState, useRef, useEffect, useCallback } from "react";
import GalleryCard from "./GalleryCard";
import PhotoCard from "./PhotoCard";
import { useAuth } from "../../AuthContext";
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Search, 
  Grid3X3, 
  List, 
  MoreHorizontal, 
  Upload, 
  ArrowLeft,
  Folder,
  Image,
  Heart,
  Move,
  Trash2,
  Check,
  Plus as PlusIcon,
  Filter,
  SortAsc,
  Eye,
  X,
  FolderPlus,
  Settings,
  CheckSquare,
  Square,
  Download,
  Share2
} from 'lucide-react';

const GalleryView = ({ 
  gallery, 
  onBack, 
  onError,
  theme
}) => {
  const { authState, apiFetch } = useAuth();
  const navigate = useNavigate();
  const apiFetchRef = useRef(apiFetch);
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
  const [showFilters, setShowFilters] = useState(false);
  const [draggedPhotoIds, setDraggedPhotoIds] = useState([]);
  const [userGalleries, setUserGalleries] = useState([]);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [isBackDragOver, setIsBackDragOver] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragOverGalleryId, setDragOverGalleryId] = useState(null);

  const fileInputRef = useRef(null);
  const canEdit = gallery?.can_share !== false;
  const isSharedView = gallery?.access_type && gallery.access_type !== 'owner';

  const fetchGalleryDetails = useCallback(async (galleryId) => {
    try {
      const response = await apiFetchRef.current(`/gallery/galleries/${galleryId}/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setPhotos(data.photos || []);
      setSubGalleries(data.sub_galleries || []);
    } catch (err) {
      console.error("fetchGalleryDetails error:", err);
      onError(err.message || "Failed to load gallery details");
    }
  }, [apiFetchRef, onError]);

  useEffect(() => {
    apiFetchRef.current = apiFetch;
  }, [apiFetch]);

  useEffect(() => {
    if (gallery) {
      fetchGalleryDetails(gallery.id);
      setShowAddToCollectionButton(
        authState.isAuthenticated && 
        isSharedView && 
        !gallery.accessible_users?.some(user => user.id === authState.user?.id)
      );
    }
  }, [gallery, authState.isAuthenticated, isSharedView, authState.user?.id, fetchGalleryDetails]);

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

  const normalizeGallery = (g) => ({
    ...g,
    cover_image: g.cover_image || g.cover_photo || null,
  });

  function isAtGalleryLimit() {
    const userStats = authState.user?.stats;
    if (!userStats?.plan_limits) return false;
    const maxGalleries = parseInt(userStats.plan_limits.max_galleries_count, 10);
    const currentGalleries = parseInt(userStats.galleries_count || 0, 10);
    if (isNaN(maxGalleries) || isNaN(currentGalleries)) return false;
    if (maxGalleries === -1) return false;
    return currentGalleries >= maxGalleries;
  }

  function isAtPhotoLimit() {
    const userStats = authState.user?.stats;
    if (!userStats || !userStats.plan_limits) return false;
    const maxPhotos = parseInt(userStats.plan_limits.max_photos_count, 10);
    const currentPhotos = parseInt(userStats.photos_count || 0, 10);
    if (isNaN(maxPhotos) || isNaN(currentPhotos)) return false;
    return maxPhotos !== -1 && currentPhotos >= maxPhotos;
  }

  function getGalleryUsageInfo() {
    const userStats = authState.user?.stats;
    if (!userStats || !userStats.plan_limits) return { percentage: 0, color: 'rgb(59 130 246)', isAtLimit: false };
    const maxGalleries = parseInt(userStats.plan_limits.max_galleries_count, 10);
    const currentGalleries = parseInt(userStats.galleries_count || 0, 10);
    if (isNaN(maxGalleries) || maxGalleries === -1) return { percentage: 0, color: 'rgb(59 130 246)', isAtLimit: false };
    const percentage = (currentGalleries / maxGalleries) * 100;
    const isAtLimit = currentGalleries >= maxGalleries;
    let color = 'rgb(34 197 94)';
    if (percentage >= 100) color = 'rgb(239 68 68)';
    else if (percentage >= 80) color = 'rgb(245 158 11)';
    return { percentage, color, isAtLimit };
  }

  function getPhotoUsageInfo() {
    const userStats = authState.user?.stats;
    if (!userStats || !userStats.plan_limits) return { percentage: 0, color: 'rgb(59 130 246)', isAtLimit: false };
    const maxPhotos = parseInt(userStats.plan_limits.max_photos_count, 10);
    const currentPhotos = parseInt(userStats.photos_count || 0, 10);
    if (isNaN(maxPhotos) || maxPhotos === -1) return { percentage: 0, color: 'rgb(59 130 246)', isAtLimit: false };
    const percentage = (currentPhotos / maxPhotos) * 100;
    const isAtLimit = currentPhotos >= maxPhotos;
    let color = 'rgb(34 197 94)';
    if (percentage >= 100) color = 'rgb(239 68 68)';
    else if (percentage >= 80) color = 'rgb(245 158 11)';
    return { percentage, color, isAtLimit };
  }

  const formatLimit = (limit) => {
    if (limit === -1) return '∞';
    return isNaN(limit) ? '0' : limit.toLocaleString();
  };

  const fetchUserGalleries = async () => {
    try {
      const response = await apiFetchRef.current(`/gallery/galleries/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
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
    const confirmed = window.confirm(`Delete ${selectedItems.size} selected item(s)?`);
    if (!confirmed) return;
    try {
      const promises = [];
      selectedItems.forEach(itemId => {
        const [type, id] = itemId.split('-');
        if (type === 'photo') {
          promises.push(apiFetchRef.current(`/gallery/photos/${id}/`, { method: "DELETE" }));
        } else if (type === 'gallery') {
          promises.push(apiFetchRef.current(`/gallery/galleries/${id}/`, { method: "DELETE" }));
        }
      });
      await Promise.all(promises);
      await fetchGalleryDetails(gallery.id);
      clearSelection();
      onError(`${selectedItems.size} item(s) deleted successfully!`, "success");
    } catch (err) {
      console.error("Bulk delete error:", err);
      onError("Failed to delete selected items");
    }
  };

  const handleBulkMove = async (targetGalleryId) => {
    try {
      const photoIds = Array.from(selectedItems)
        .filter(itemId => itemId.startsWith('photo-'))
        .map(itemId => itemId.split('-')[1]);
      if (photoIds.length === 0) {
        onError("No photos selected to move.");
        return;
      }
      await Promise.all(photoIds.map(photoId => 
        apiFetchRef.current(`/gallery/photo/move/`, {
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
      onError(`${photoIds.length} photo${photoIds.length > 1 ? 's' : ''} moved successfully!`, "success");
    } catch (err) {
      console.error("Bulk move error:", err);
      onError(err.message || "Failed to move photos");
    }
  };

  const handleOpenMoveModal = async () => {
    if (userGalleries.length === 0) {
      await fetchUserGalleries();
    }
    setShowMoveModal(true);
  };

  const handleDragStart = (e, photoId) => {
    let photoIds = [photoId];
    if (selectedItems.size > 0) {
      photoIds = Array.from(selectedItems)
        .filter(itemId => itemId.startsWith('photo-'))
        .map(itemId => itemId.split('-')[1]);
      if (!photoIds.includes(photoId)) {
        photoIds = [photoId];
      }
    }
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData("application/json", JSON.stringify({ photoIds }));
    setDraggedPhotoIds(photoIds);
    document.body.style.cursor = 'grabbing';
  };

  const handleDragEnd = () => {
    setDraggedPhotoIds([]);
    setDragOverGalleryId(null);
    document.body.style.cursor = '';
  };

  const handleDragOver = (e, galleryId) => {
    if (galleryId === gallery.id) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverGalleryId(galleryId);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverGalleryId(null);
    }
  };

  const handleDropOnGallery = async (e, targetGalleryId) => {
    if (targetGalleryId === gallery.id) return;
    e.preventDefault();
    setDragOverGalleryId(null);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      const photoIds = data.photoIds;
      
      if (photoIds && photoIds.length > 0) {
        await Promise.all(photoIds.map(photoId => 
          apiFetchRef.current(`/gallery/photo/move/`, {
            method: "POST",
            body: JSON.stringify({
              photo_id: photoId,
              target_gallery_id: targetGalleryId,
            }),
          })
        ));
        await fetchGalleryDetails(gallery.id);
        clearSelection();
        onError(`${photoIds.length} photo${photoIds.length > 1 ? 's' : ''} moved successfully!`, "success");
      }
    } catch (error) {
      console.error("Error handling drop:", error);
      onError("Failed to move photos");
    } finally {
      handleDragEnd();
    }
  };

  const handleBackDragOver = (e) => {
    if (!gallery.parent_gallery) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsBackDragOver(true);
  };

  const handleBackDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsBackDragOver(false);
    }
  };

  const handleBackDrop = async (e) => {
    if (!gallery.parent_gallery) return;
    e.preventDefault();
    setIsBackDragOver(false);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      const photoIds = data.photoIds;
      
      if (photoIds && photoIds.length > 0) {
        await Promise.all(photoIds.map(photoId => 
          apiFetchRef.current(`/gallery/photo/move/`, {
            method: "POST",
            body: JSON.stringify({
              photo_id: photoId,
              target_gallery_id: gallery.parent_gallery,
            }),
          })
        ));
        await fetchGalleryDetails(gallery.id);
        clearSelection();
        onError(`${photoIds.length} photo${photoIds.length > 1 ? 's' : ''} moved to parent gallery!`, "success");
      }
    } catch (error) {
      console.error("Error handling back drop:", error);
      onError("Failed to move photos to parent gallery");
    } finally {
      handleDragEnd();
    }
  };

  const handleMainDragOver = (e) => {
    e.preventDefault();
    if (!isAtPhotoLimit()) {
      setIsDragOver(true);
    }
  };

  const handleMainDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleAddGalleryToCollection = async () => {
    if (!authState.isAuthenticated) {
      alert("Please log in to add this gallery to your collection.");
      return;
    }
    setAddingToCollection(true);
    try {
      const response = await apiFetchRef.current(`/gallery/add-to-collection/`, {
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
    if (!authState.isAuthenticated) {
      alert("Please log in to add this photo to your collection.");
      return;
    }
    try {
      const response = await apiFetchRef.current(`/gallery/add-to-collection/`, {
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
      onError(`You've reached your plan's limit of ${formatLimit(authState.user?.stats?.plan_limits?.max_galleries_count || 0)} galleries. Please upgrade your plan.`);
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
      const response = await apiFetchRef.current(`/gallery/galleries/create/`, {
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
      onError(`Sub-gallery "${newGalleryTitle}" created successfully!`, "success");
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
      onError(`You've reached your plan's limit of ${formatLimit(authState.user?.stats?.plan_limits?.max_photos_count || 0)} photos. Please upgrade your plan.`);
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
      onError(`You've reached your plan's limit of ${formatLimit(authState.user?.stats?.plan_limits?.max_photos_count || 0)} photos. Please upgrade your plan.`);
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
      const response = await apiFetchRef.current(`/gallery/photos/`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error(await response.text());
      await fetchGalleryDetails(gallery.id);
      onError(`${files.length} photo${files.length > 1 ? 's' : ''} uploaded successfully!`, "success");
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
      const response = await apiFetchRef.current(`/gallery/photos/${photo.id}/`, {
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
      const response = await apiFetchRef.current(`/gallery/photos/${photo.id}/`, {
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
    alert(`Photo Info:\n\nCaption: ${photo.caption || 'No caption'}\nUpload Date: ${photo.uploaded_at ? new Date(photo.uploaded_at).toLocaleDateString() : 'Unknown'}\nFile Size: ${photo.file_size ? `${(photo.file_size / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}\nDimensions: ${photo.width && photo.height ? `${photo.width} × ${photo.height}` : 'Unknown'}${accessInfo}${sharingInfo}`);
  };

  const handleSubGalleryEdit = async (subGallery, newTitle) => {
    if (!canEdit) {
      onError("You don't have permission to rename sub-galleries.");
      return;
    }
    try {
      const response = await apiFetchRef.current(`/gallery/galleries/${subGallery.id}/`, {
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
      const response = await apiFetchRef.current(`/gallery/galleries/${subGallery.id}/`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete sub-gallery");
      setSubGalleries((prev) => prev.filter((sg) => sg.id !== subGallery.id));
    } catch (err) {
      console.error(err);
      onError(err.message || "Failed to delete sub-gallery");
    }
  };

  const handleSubGalleryCreated = async (parentGalleryId, newSubGallery) => {
    if (parentGalleryId === gallery.id) {
      setSubGalleries((prev) => [normalizeGallery(newSubGallery), ...prev]);
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

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'a') {
          e.preventDefault();
          selectAll();
        }
      }
      if (e.key === 'Delete' && selectionMode && canEdit) {
        e.preventDefault();
        handleBulkDelete();
      }
      if (e.key === 'Escape') {
        if (selectionMode) {
          clearSelection();
        }
        if (showCreateForm) {
          setShowCreateForm(false);
        }
        if (showMoveModal) {
          setShowMoveModal(false);
        }
        if (showFilters) {
          setShowFilters(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectionMode, canEdit, showCreateForm, showMoveModal, showFilters]);

  if (selectedSubGallery) {
    return (
      <GalleryView
        gallery={selectedSubGallery}
        onBack={handleBackFromSubGallery}
        onError={onError}
        theme={theme}
      />
    );
  }

  const displayItems = itemsToDisplay();
  const galleryUsage = getGalleryUsageInfo();
  const photoUsage = getPhotoUsageInfo();

  return (
    <div 
      className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}
      onDragOver={handleMainDragOver}
      onDragLeave={handleMainDragLeave}
      onDrop={handleDrop}
    >
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
                onClick={() => fileInputRef.current?.click()}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {displayItems.length === 0 ? (
          <div className="text-center py-16">
            <div className={`w-24 h-24 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-2xl mx-auto mb-6 flex items-center justify-center`}>
              <Folder className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
              {searchQuery ? 'No results found' : 'This gallery is empty'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery 
                ? 'Try adjusting your search terms or filters.' 
                : canEdit 
                  ? 'Start by uploading some photos or creating sub-galleries.'
                  : 'There are no items to display in this gallery.'
              }
            </p>
            {canEdit && !searchQuery && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAtPhotoLimit()}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-medium transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upload Photos
                </button>
                <button
                  onClick={() => setShowCreateForm(true)}
                  disabled={isAtGalleryLimit()}
                  className={`px-6 py-3 ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700' : 'bg-white hover:bg-gray-50 text-gray-900 border-gray-300'} border rounded-xl font-medium transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Create Sub-Gallery
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' 
              : 'grid-cols-1'
          }`}>
            {displayItems.map((item) => (
              <div key={`${item.type}-${item.id}`} className="group">
                {item.type === 'gallery' ? (
                  <GalleryCard
                    gallery={item}
                    onClick={() => handleSelectSubGallery(item)}
                    onEdit={handleSubGalleryEdit}
                    onDelete={handleSubGalleryDelete}
                    onAddPhotos={() => fileInputRef.current?.click()}
                    onSubGalleryCreated={handleSubGalleryCreated}
                    canEdit={canEdit}
                    isSelected={selectedItems.has(`gallery-${item.id}`)}
                    onToggleSelection={() => toggleSelection(item.id, 'gallery')}
                    onDragOver={(e) => handleDragOver(e, item.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDropOnGallery(e, item.id)}
                    viewMode={viewMode}
                    theme={theme}
                    isDraggedOver={dragOverGalleryId === item.id}
                  />
                ) : (
                  <PhotoCard
                    photo={item}
                    onRename={handlePhotoRename}
                    onDelete={handlePhotoDelete}
                    onInfo={handlePhotoInfo}
                    onAddToCollection={handleAddPhotoToCollection}
                    canEdit={canEdit}
                    isSelected={selectedItems.has(`photo-${item.id}`)}
                    onToggleSelection={() => toggleSelection(item.id, 'photo')}
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onDragEnd={handleDragEnd}
                    viewMode={viewMode}
                    theme={theme}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Move Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl w-full max-w-md border shadow-2xl transform transition-all duration-300`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Move Photos
                </h3>
                <button
                  onClick={() => setShowMoveModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Select a destination gallery for {selectedPhotoCount} photo{selectedPhotoCount !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="p-6">
              <div className="max-h-80 overflow-y-auto space-y-2">
                {userGalleries
                  .filter(g => g.id !== gallery.id && g.can_share !== false)
                  .map(targetGallery => (
                    <button
                      key={targetGallery.id}
                      onClick={() => handleBulkMove(targetGallery.id)}
                      className={`w-full flex items-center gap-4 px-4 py-3 ${theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-50 text-gray-900'} rounded-xl transition-all duration-300 text-left group`}
                    >
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors">
                        <Folder className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{targetGallery.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {targetGallery.photos_count || 0} photos
                        </p>
                      </div>
                      <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 rotate-180 transition-colors" />
                    </button>
                  ))}
              </div>
              
              {userGalleries.filter(g => g.id !== gallery.id && g.can_share !== false).length === 0 && (
                <div className="text-center py-8">
                  <Folder className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">No available galleries to move photos to.</p>
                </div>
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

      {/* Upload Drop Zone (when dragging files) */}
      {canEdit && !isAtPhotoLimit() && (
        <div 
          className={`fixed inset-x-0 bottom-0 h-32 bg-gradient-to-t from-indigo-500/20 to-transparent pointer-events-none transition-opacity duration-300 ${isDragOver ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-indigo-600 text-white px-6 py-3 rounded-full shadow-lg animate-bounce">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                <span className="font-semibold">Drop to upload photos</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      {selectionMode && (
        <div className="fixed bottom-6 left-6 bg-gray-900/90 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm z-40">
          <div className="flex items-center gap-4">
            <span className="font-medium">Shortcuts:</span>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs font-mono">Ctrl+A</kbd>
              <span className="text-gray-300 text-xs">Select All</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs font-mono">Del</kbd>
              <span className="text-gray-300 text-xs">Delete</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs font-mono">Esc</kbd>
              <span className="text-gray-300 text-xs">Clear</span>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close filter dropdown */}
      {showFilters && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowFilters(false)}
        />
      )}
    </div>
  );
};

export default GalleryView;