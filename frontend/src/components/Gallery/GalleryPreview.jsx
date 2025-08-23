import React, { useState, useEffect, useCallback, useRef } from "react";
import GalleryCard from "./GalleryCard";
import PhotoCard from "./PhotoCard";
import GalleryHeadersAndControls from "./GalleryHeadersAndControls";
import { useAuth } from "../../AuthContext";
import { ArrowLeft, Upload, FolderPlus, X, Folder, Plus } from "lucide-react";

const GalleryPreview = ({ gallery, onBack, onError, theme }) => {
  const { apiFetch } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [subGalleries, setSubGalleries] = useState([]);
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [filteredSubGalleries, setFilteredSubGalleries] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("date_desc");
  const [filterBy, setFilterBy] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedSubGallery, setSelectedSubGallery] = useState(null);
  const [userGalleries, setUserGalleries] = useState([]);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedTargetGalleries, setSelectedTargetGalleries] = useState(new Set());
  const [dragOverGalleryId, setDragOverGalleryId] = useState(null);
  const [isBackDragOver, setIsBackDragOver] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGalleryTitle, setNewGalleryTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMoving, setIsMoving] = useState(false);
  const [isFetchingGalleries, setIsFetchingGalleries] = useState(false);
  const fileInputRef = useRef(null);
  const canEdit = gallery?.can_share !== false;

  useEffect(() => {
  }, [gallery, subGalleries]);

  const normalizeGallery = (g) => ({
    ...g,
    cover_image: g.cover_image || g.cover_photo || null,
  });

  const fetchGalleryDetails = useCallback(async () => {
    if (!gallery?.id) {
      console.error("Invalid gallery ID:", gallery);
      onError("Invalid gallery ID");
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const response = await apiFetch(`/gallery/galleries/${gallery.id}/`, { method: "GET" });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setPhotos(data.photos || []);
      setSubGalleries(data.sub_galleries || []);
    } catch (err) {
      onError(err.message || "Failed to load gallery details");
    } finally {
      setIsLoading(false);
    }
  }, [gallery, apiFetch, onError]);

  useEffect(() => {
    fetchGalleryDetails();
  }, [fetchGalleryDetails]);

  const handleFileUpload = async (e) => {
    if (!gallery?.id) {
      onError("Cannot upload: Invalid gallery ID");
      return;
    }
    const files = Array.from(e.target.files);
    if (!files.length) return;
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("image", file);
        formData.append("gallery", gallery.id);
      });
      const response = await apiFetch("/api/gallery/photos/", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload photos");
      }
      await fetchGalleryDetails();
      onError(`${files.length} photo${files.length > 1 ? "s" : ""} uploaded successfully!`, "success");
      fileInputRef.current.value = null;
      setShowActions(false);
    } catch (err) {
      onError(err.message || "Failed to upload photos");
    }
  };

  const handlePhotoDelete = async (photoId) => {
    if (!canEdit) {
      onError("You don't have permission to delete photos.");
      return;
    }
    const confirmed = window.confirm("Delete this photo?");
    if (!confirmed) return;
    try {
      const response = await apiFetch(`/gallery/photos/${photoId}/`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(await response.text());
      await fetchGalleryDetails();
      clearSelection();
      onError("Photo deleted successfully!", "success");
    } catch (err) {
      onError(err.message || "Failed to delete photo");
    }
  };

  const handleGalleryDelete = async (galleryId) => {
    if (!canEdit) {
      onError("You don't have permission to delete galleries.");
      return;
    }
    const confirmed = window.confirm("Delete this gallery?");
    if (!confirmed) return;
    try {
      const response = await apiFetch(`/gallery/galleries/${galleryId}/`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(await response.text());
      await fetchGalleryDetails();
      clearSelection();
      onError("Gallery deleted successfully!", "success");
    } catch (err) {
      onError(err.message || "Failed to delete gallery");
    }
  };

  const handlePhotoRename = async (photoId, newCaption) => {
    if (!canEdit) {
      onError("You don't have permission to rename photos.");
      return;
    }
    try {
      const response = await apiFetch(`/gallery/photos/${photoId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: newCaption.trim() }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Rename photo failed with status:", response.status, "Response:", errorText);
        throw new Error(errorText || "Failed to rename photo");
      }
      await fetchGalleryDetails();
      onError("Photo renamed successfully!", "success");
    } catch (err) {
      onError(err.message || "Failed to rename photo");
    }
  };

  const handleGalleryRename = async (galleryId, newTitle) => {
    if (!canEdit) {
      onError("You don't have permission to rename galleries.");
      return;
    }
    if (!newTitle.trim()) {
      onError("Gallery title cannot be empty.");
      return;
    }
    try {
      const response = await apiFetch(`/gallery/galleries/${galleryId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim() }),
      });
    //   console.log("Rename gallery request:", { url: `/gallery/galleries/${galleryId}/`, body: { title: newTitle.trim() } });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Rename gallery failed with status:", response.status, "Response:", errorText);
        throw new Error(errorText || "Failed to rename gallery");
      }
      const data = await response.json();
      await fetchGalleryDetails();
      onError("Gallery renamed successfully!", "success");
    } catch (err) {
      console.error("Rename gallery error:", err);
      onError(err.message || "Failed to rename gallery");
    }
  };

  useEffect(() => {
    let filtered = [...photos];
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (photo) =>
          photo.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          photo.original_filename?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date_desc": return new Date(b.uploaded_at) - new Date(a.uploaded_at);
        case "date_asc": return new Date(a.uploaded_at) - new Date(b.uploaded_at);
        case "name_asc": return (a.caption || a.original_filename || "").localeCompare(b.caption || b.original_filename || "");
        case "name_desc": return (b.caption || b.original_filename || "").localeCompare(a.caption || a.original_filename || "");
        case "size_asc": return (a.file_size || 0) - (b.file_size || 0);
        case "size_desc": return (b.file_size || 0) - (a.file_size || 0);
        default: return 0;
      }
    });
    setFilteredPhotos(filtered);
  }, [photos, searchQuery, sortBy]);

  useEffect(() => {
    let filtered = [...subGalleries];
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
    setFilteredSubGalleries(filtered);
  }, [subGalleries, searchQuery, sortBy]);

  const handleSelectSubGallery = (subGallery) => {
    if (!subGallery?.id) {
      console.error("Invalid sub-gallery:", subGallery);
      onError("Invalid sub-gallery selected");
      return;
    }
    setSelectedSubGallery(normalizeGallery(subGallery));
  };

  const itemsToDisplay = () => {
    let items = [];
    if (filterBy === "all" || filterBy === "galleries") {
      items = items.concat(filteredSubGalleries.map((g) => ({ ...g, type: "gallery" })));
    }
    if (filterBy === "all" || filterBy === "photos") {
      items = items.concat(filteredPhotos.map((p) => ({ ...p, type: "photo" })));
    }
    return items;
  };

  const toggleSelection = (id, type) => {
    if (type !== "photo") return;
    const itemId = `photo-${id}`;
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
    if (filterBy === "all" || filterBy === "photos") {
      filteredPhotos.forEach((photo) => allItems.add(`photo-${photo.id}`));
    }
    setSelectedItems(allItems);
    setSelectionMode(allItems.size > 0);
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
    setSelectionMode(false);
    setSelectedTargetGalleries(new Set());
  };

  const handleBulkDelete = async () => {
    if (!canEdit) {
      onError("You don't have permission to delete items.");
      return;
    }
    const photoIds = Array.from(selectedItems)
      .filter((itemId) => itemId.startsWith("photo-"))
      .map((itemId) => itemId.split("-")[1]);
    if (photoIds.length === 0) {
      onError("No photos selected to delete.");
      return;
    }
    const confirmed = window.confirm(`Delete ${photoIds.length} selected photo(s)?`);
    if (!confirmed) return;
    try {
      const results = await Promise.allSettled(
        photoIds.map((photoId) =>
          apiFetch(`/gallery/photos/${photoId}/`, { method: "DELETE" })
        )
      );
      const errors = results.filter((r) => r.status === "rejected").map((r) => r.reason.message);
      if (errors.length) throw new Error(`Failed to delete some photos: ${errors.join(", ")}`);
      await fetchGalleryDetails();
      clearSelection();
      onError(`${photoIds.length} photo(s) deleted successfully!`, "success");
    } catch (err) {
      onError(err.message || "Failed to delete selected photos");
    }
  };

  const fetchUserGalleries = async () => {
    setIsFetchingGalleries(true);
    try {
      const response = await apiFetch(`/gallery/galleries/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("fetchUserGalleries failed with status:", response.status, "Response:", errorText);
        throw new Error(errorText || "Failed to fetch galleries");
      }
      const data = await response.json();
      const galleries = Array.isArray(data)
        ? data
        : data.owned_galleries || data.galleries || data.results || [];
      if (galleries.length === 0) {
        console.warn("No galleries returned from API");
      }
      setUserGalleries(galleries);
    } catch (err) {
      console.error("fetchUserGalleries error:", err);
      onError(err.message || "Failed to load your galleries");
      setUserGalleries([]);
    } finally {
      setIsFetchingGalleries(false);
    }
  };

  const handleCreateSubGallery = async () => {
    if (!newGalleryTitle.trim()) {
      onError("Gallery title cannot be empty.");
      return;
    }
    setCreating(true);
    try {
      const requestBody = {
        title: newGalleryTitle,
        description: "",
        parent_gallery: gallery.id,
      };
      const response = await apiFetch(`/gallery/galleries/create/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      setShowActions(false);
      await fetchUserGalleries();
    } catch (err) {
      onError(err.message || "Failed to create sub-gallery");
    } finally {
      setCreating(false);
    }
  };

  const handleDragOver = (e, galleryId) => {
    if (galleryId === gallery.id) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverGalleryId(galleryId);
    console.log("Dragging over gallery ID:", galleryId);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverGalleryId(null);
      console.log("Drag left gallery");
    }
  };

  const handleDropOnGallery = async (e, targetGalleryId) => {
    if (targetGalleryId === gallery.id) return;
    e.preventDefault();
    setDragOverGalleryId(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      const photoIds = data.photoIds;
      console.log("Dropped photo IDs:", photoIds, "on gallery:", targetGalleryId);
      if (photoIds && photoIds.length > 0) {
        const maxRetries = 2;
        for (let retry = 0; retry <= maxRetries; retry++) {
          try {
            const results = await Promise.allSettled(
              photoIds.map((photoId) =>
                apiFetch(`/gallery/photo/move/`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    photo_id: photoId,
                    target_gallery_id: targetGalleryId,
                  }),
                }).then((res) => {
                  if (!res.ok) throw new Error(`Failed to move photo ${photoId}`);
                  return res;
                })
              )
            );
            const errors = results.filter((r) => r.status === "rejected").map((r) => r.reason.message);
            if (errors.length) throw new Error(`Failed to move some photos: ${errors.join(", ")}`);
            break;
          } catch (err) {
            if (retry === maxRetries) throw err;
            console.warn(`Retry ${retry + 1}/${maxRetries} for moving photos:`, err);
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }
        await fetchGalleryDetails();
        clearSelection();
        onError(`${photoIds.length} photo${photoIds.length > 1 ? "s" : ""} moved successfully!`, "success");
      } else {
        onError("No photos selected to move");
      }
    } catch (error) {
      console.error("Drop error:", error);
      onError(error.message || "Failed to move photos");
    }
  };

  const handleBackDragOver = (e) => {
    if (!gallery.parent_gallery) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsBackDragOver(true);
    console.log("Dragging over back button");
  };

  const handleBackDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsBackDragOver(false);
      console.log("Drag left back button");
    }
  };

  const handleBackDrop = async (e) => {
    if (!gallery.parent_gallery) return;
    e.preventDefault();
    setIsBackDragOver(false);
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      const photoIds = data.photoIds;
      console.log("Dropped photo IDs:", photoIds, "on parent gallery:", gallery.parent_gallery);
      if (photoIds && photoIds.length > 0) {
        const maxRetries = 2;
        for (let retry = 0; retry <= maxRetries; retry++) {
          try {
            const results = await Promise.allSettled(
              photoIds.map((photoId) =>
                apiFetch(`/gallery/photo/move/`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    photo_id: photoId,
                    target_gallery_id: gallery.parent_gallery,
                  }),
                }).then((res) => {
                  if (!res.ok) throw new Error(`Failed to move photo ${photoId}`);
                  return res;
                })
              )
            );
            const errors = results.filter((r) => r.status === "rejected").map((r) => r.reason.message);
            if (errors.length) throw new Error(`Failed to move some photos: ${errors.join(", ")}`);
            break;
          } catch (err) {
            if (retry === maxRetries) throw err;
            console.warn(`Retry ${retry + 1}/${maxRetries} for moving photos to parent:`, err);
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }
        await fetchGalleryDetails();
        clearSelection();
        onError(`${photoIds.length} photo${photoIds.length > 1 ? "s" : ""} moved to parent gallery!`, "success");
      } else {
        onError("No photos selected to move");
      }
    } catch (error) {
      console.error("Back drop error:", error);
      onError(error.message || "Failed to move photos to parent gallery");
    }
  };

  const handleMainDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleMainDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!gallery?.id) {
      onError("Cannot upload: Invalid gallery ID");
      return;
    }
    const files = Array.from(e.dataTransfer.files);
    if (!files.length) return;
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("image", file);
        formData.append("gallery", gallery.id);
      });
      const response = await apiFetch("/api/gallery/photos/", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload photos");
      }
      await fetchGalleryDetails();
      onError(`${files.length} photo${files.length > 1 ? "s" : ""} uploaded successfully!`, "success");
    } catch (err) {
      onError(err.message || "Failed to upload photos");
    }
  };

  const toggleTargetGallerySelection = (galleryId) => {
    const newSelection = new Set(selectedTargetGalleries);
    if (newSelection.has(galleryId)) {
      newSelection.delete(galleryId);
    } else {
      newSelection.add(galleryId);
    }
    setSelectedTargetGalleries(newSelection);
  };

  const handleBulkMove = async () => {
    if (!canEdit) {
      onError("You don't have permission to move photos.");
      return;
    }
    const photoIds = Array.from(selectedItems)
      .filter((itemId) => itemId.startsWith("photo-"))
      .map((itemId) => itemId.split("-")[1]);
    const targetGalleryIds = Array.from(selectedTargetGalleries);
    if (photoIds.length === 0) {
      onError("No photos selected to move.");
      return;
    }
    if (targetGalleryIds.length === 0) {
      onError("No galleries selected to move to.");
      return;
    }
    const confirmed = window.confirm(
      `Move ${photoIds.length} photo${photoIds.length > 1 ? "s" : ""} to ${targetGalleryIds.length} galler${targetGalleryIds.length > 1 ? "ies" : "y"}?`
    );
    if (!confirmed) return;
    setIsMoving(true);
    try {
      const maxRetries = 2;
      const errors = [];
      for (const targetGalleryId of targetGalleryIds) {
        for (let retry = 0; retry <= maxRetries; retry++) {
          try {
            const results = await Promise.allSettled(
              photoIds.map((photoId) =>
                apiFetch(`/gallery/photo/move/`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    photo_id: photoId,
                    target_gallery_id: targetGalleryId,
                  }),
                }).then((res) => {
                  if (!res.ok) throw new Error(`Failed to move photo ${photoId} to gallery ${targetGalleryId}`);
                  return res;
                })
              )
            );
            const moveErrors = results.filter((r) => r.status === "rejected").map((r) => r.reason.message);
            if (moveErrors.length) {
              errors.push(...moveErrors);
              break;
            }
            break;
          } catch (err) {
            if (retry === maxRetries) {
              errors.push(err.message);
              break;
            }
            console.warn(`Retry ${retry + 1}/${maxRetries} for moving photos to gallery ${targetGalleryId}:`, err);
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }
      }
      if (errors.length) throw new Error(`Failed to move some photos: ${errors.join(", ")}`);
      await fetchGalleryDetails();
      clearSelection();
      setShowMoveModal(false);
      onError(
        `${photoIds.length} photo${photoIds.length > 1 ? "s" : ""} moved to ${targetGalleryIds.length} galler${targetGalleryIds.length > 1 ? "ies" : "y"} successfully!`,
        "success"
      );
    } catch (err) {
      console.error("Bulk move error:", err);
      onError(err.message || "Failed to move photos to selected galleries");
    } finally {
      setIsMoving(false);
    }
  };

  const handleOpenMoveModal = async () => {
    setIsFetchingGalleries(true);
    await fetchUserGalleries();
    setSelectedTargetGalleries(new Set());
    setShowMoveModal(true);
  };

  if (!gallery || isLoading) {
    return (
      <div
        className={`min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"} flex items-center justify-center`}
      >
        <div className="text-center">
          <p className={`text-lg ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            {gallery ? "Loading gallery..." : "No gallery selected"}
          </p>
        </div>
      </div>
    );
  }

  if (selectedSubGallery) {
    return (
      <GalleryPreview
        gallery={selectedSubGallery}
        onBack={() => setSelectedSubGallery(null)}
        onError={onError}
        theme={theme}
      />
    );
  }

  return (
    <div
      className={`min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"} transition-colors duration-300 ${
        isDragOver ? "border-6 border-dashed border-indigo-500 bg-indigo-500/10 animate-pulse" : ""
      }`}
      onDragOver={handleMainDragOver}
      onDragLeave={handleMainDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={`sticky top-0 z-30 ${theme === "dark" ? "bg-gray-900/95" : "bg-white/95"} backdrop-blur-xl border-b ${
          theme === "dark" ? "border-gray-800" : "border-gray-200"
        } shadow-sm`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-6">
            <button
              className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl ${
                theme === "dark" ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"
              } transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${
                isBackDragOver ? "ring-4 ring-indigo-600 bg-indigo-600/30 scale-105 animate-pulse" : ""
              }`}
              onClick={onBack}
              onDragOver={handleBackDragOver}
              onDragLeave={handleBackDragLeave}
              onDrop={handleBackDrop}
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-semibold">Back</span>
            </button>
          </div>
          <h1 className={`text-3xl lg:text-4xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"} mb-3`}>
            {gallery.title}
          </h1>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <GalleryHeadersAndControls
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
          canEdit={canEdit}
          theme={theme}
          organizedGalleries={{ owned_galleries: [], assigned_galleries: [], shared_galleries: [] }}
        />
        {showCreateForm && (
          <div
            className={`${
              theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            } rounded-xl p-6 shadow-lg mb-6`}
          >
            <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"} mb-4`}>
              Create New Sub-Gallery
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Enter sub-gallery title..."
                value={newGalleryTitle}
                onChange={(e) => setNewGalleryTitle(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && newGalleryTitle.trim() && !creating) {
                    handleCreateSubGallery();
                  }
                }}
                className={`flex-1 px-4 py-3 ${
                  theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300 text-gray-900"
                } border rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium`}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateSubGallery}
                  disabled={creating || !newGalleryTitle.trim()}
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
            viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6' : 'grid-cols-2'
          }`}
        >
          {itemsToDisplay().map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDropOnGallery(e, item.id)}
              className={dragOverGalleryId === item.id ? "ring-2 ring-indigo-500 bg-indigo-500/10 animate-pulse" : ""}
            >
              {item.type === "gallery" ? (
                <GalleryCard
                  gallery={item}
                  onClick={() => handleSelectSubGallery(item)}
                  theme={theme}
                  isSelected={selectedItems.has(`gallery-${item.id}`)}
                  onToggleSelection={() => toggleSelection(item.id, "gallery")}
                  onDelete={() => handleGalleryDelete(item.id)}
                  onEdit={(gallery, newTitle) => handleGalleryRename(gallery.id, newTitle)}
                />
              ) : (
                <PhotoCard
                  photo={item}
                  theme={theme}
                  isSelected={selectedItems.has(`photo-${item.id}`)}
                  onToggleSelection={() => toggleSelection(item.id, "photo")}
                  onDelete={() => handlePhotoDelete(item.id)}
                  onRename={(photoId, newCaption) => handlePhotoRename(photoId, newCaption)}
                  selectedItems={selectedItems}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      {canEdit && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          {showActions && (
            <>
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                  setShowActions(false);
                }}
                className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center animate-fade-in"
                title="Upload Photos"
              >
                <Upload className="w-6 h-6" />
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(true);
                  setShowActions(false);
                }}
                className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center animate-fade-in"
                title="Create Sub-Gallery"
              >
                <FolderPlus className="w-6 h-6" />
              </button>
            </>
          )}
          <button
            onClick={() => setShowActions(!showActions)}
            className="w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
          >
            <Plus className={`w-6 h-6 transition-transform duration-300 ${showActions ? "rotate-45" : ""}`} />
          </button>
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        accept="image/*"
        onChange={handleFileUpload}
      />
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
                Select one or more destination galleries
              </p>
            </div>
            <div className="p-6 max-h-80 overflow-y-auto space-y-2">
              {isFetchingGalleries ? (
                <div className="text-center">
                  <div className="w-6 h-6 mx-auto border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mt-2`}>
                    Loading galleries...
                  </p>
                </div>
              ) : Array.isArray(userGalleries) && userGalleries.length > 0 ? (
                (() => {
                  const availableGalleries = userGalleries.filter((g) => g.id !== gallery.id);
                  console.log("All userGalleries:", userGalleries);
                  console.log("Current gallery ID:", gallery.id);
                  console.log("Sub-galleries IDs:", subGalleries.map((sg) => sg.id));
                  console.log("Available galleries after filter:", availableGalleries);
                  return availableGalleries.length > 0 ? (
                    availableGalleries.map((targetGallery) => (
                      <div
                        key={targetGallery.id}
                        className={`w-full flex items-center gap-4 px-4 py-3 ${
                          theme === "dark" ? "hover:bg-gray-700 text-white" : "hover:bg-gray-50 text-gray-900"
                        } rounded-xl transition-all duration-300`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedTargetGalleries.has(targetGallery.id)}
                          onChange={() => toggleTargetGallerySelection(targetGallery.id)}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded"
                          disabled={isMoving}
                        />
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                          <Folder className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{targetGallery.title}</h4>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      No other galleries available
                    </p>
                  );
                })()
              ) : (
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  No galleries available
                </p>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <button
                  onClick={handleBulkMove}
                  disabled={isMoving || selectedTargetGalleries.size === 0 || isFetchingGalleries}
                  className={`flex-1 py-3 bg-gradient-to-r ${
                    isMoving || selectedTargetGalleries.size === 0 || isFetchingGalleries
                      ? "from-gray-400 to-gray-500 cursor-not-allowed"
                      : "from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  } text-white rounded-xl font-medium transition-all duration-300`}
                >
                  {isMoving ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Moving...
                    </div>
                  ) : (
                    `Move to ${selectedTargetGalleries.size} Galler${selectedTargetGalleries.size === 1 ? "y" : "ies"}`
                  )}
                </button>
                <button
                  onClick={() => setShowMoveModal(false)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-medium transition-all duration-300"
                  disabled={isMoving}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPreview;