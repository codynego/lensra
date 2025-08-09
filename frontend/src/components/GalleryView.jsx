// src/components/GalleryView.jsx
import React, { useState, useRef, useEffect } from "react";
import GalleryCard from "./GalleryCard";
import PhotoCard from "./PhotoCard";

const API_BASE_URL = "http://localhost:8000/api";

const GalleryView = ({ 
  gallery, 
  onBack, 
  onError,
  token 
}) => {
  const [photos, setPhotos] = useState([]);
  const [subGalleries, setSubGalleries] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newGalleryTitle, setNewGalleryTitle] = useState("");
  const [selectedSubGallery, setSelectedSubGallery] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (gallery) {
      fetchGalleryDetails(gallery.id);
    }
  }, [gallery]);

  const normalizeGallery = (g) => ({
    ...g,
    cover_image: g.cover_image || g.cover_photo || null,
  });

  const fetchGalleryDetails = async (galleryId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/gallery/galleries/${galleryId}/`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      
      setPhotos(data.photos || []);
      setSubGalleries(data.sub_galleries || []);
    } catch (err) {
      console.error("fetchGalleryDetails error:", err);
      onError(err.message || "Failed to load gallery details");
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
        parent_gallery: gallery.id
      };

      const res = await fetch(`${API_BASE_URL}/gallery/galleries/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || errorData.error || "Failed to create sub-gallery.");
      }

      const data = await res.json();
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
    const files = e.dataTransfer.files;
    if (!files.length) return;
    await uploadPhotos(files);
  };

  const handleFileSelect = async (e) => {
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

      const res = await fetch(`${API_BASE_URL}/gallery/photos/`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());

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
    try {
      const res = await fetch(`${API_BASE_URL}/gallery/photos/${photo.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ caption: newCaption }),
      });

      if (!res.ok) throw new Error("Failed to rename photo");
      
      const updatedPhoto = await res.json();
      setPhotos((prev) => 
        prev.map((p) => (p.id === photo.id ? updatedPhoto : p))
      );
    } catch (err) {
      console.error("renamePhoto error:", err);
      onError(err.message || "Failed to rename photo");
    }
  };

  const handlePhotoDelete = async (photo) => {
    try {
      const res = await fetch(`${API_BASE_URL}/gallery/photos/${photo.id}/`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) throw new Error("Failed to delete photo");
      
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    } catch (err) {
      console.error("deletePhoto error:", err);
      onError(err.message || "Failed to delete photo");
    }
  };

  const handlePhotoInfo = (photo) => {
    alert(`Photo Info:
    
Caption: ${photo.caption || 'No caption'}
Upload Date: ${photo.uploaded_at ? new Date(photo.uploaded_at).toLocaleDateString() : 'Unknown'}
File Size: ${photo.file_size ? `${(photo.file_size / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}
Dimensions: ${photo.width && photo.height ? `${photo.width} × ${photo.height}` : 'Unknown'}`);
  };

  const handleSubGalleryEdit = async (subGallery, newTitle) => {
    try {
      const res = await fetch(`${API_BASE_URL}/gallery/galleries/${subGallery.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ title: newTitle }),
      });
      if (!res.ok) throw new Error("Failed to rename sub-gallery");
      
      const updatedSubGallery = await res.json();
      setSubGalleries((prev) =>
        prev.map((sg) => (sg.id === subGallery.id ? normalizeGallery(updatedSubGallery) : sg))
      );
    } catch (err) {
      console.error(err);
      onError(err.message || "Failed to rename sub-gallery");
    }
  };

  const handleSubGalleryDelete = async (subGallery) => {
    try {
      const res = await fetch(`${API_BASE_URL}/gallery/galleries/${subGallery.id}/`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to delete sub-gallery");
      
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

  // If a sub-gallery is selected, render the GalleryView recursively
  if (selectedSubGallery) {
    return (
      <GalleryView
        gallery={selectedSubGallery}
        onBack={handleBackFromSubGallery}
        onError={onError}
        token={token}
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        {/* Mobile header layout */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between mb-3">
            <button
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-600 text-white hover:bg-gray-700 transition-colors"
              onClick={onBack}
              title="Back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[#dd183b] hover:bg-red-700 text-white transition-colors"
              title="Create Sub-Gallery"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          
          <h2 className="text-xl font-bold text-white mb-2 truncate">{gallery.title}</h2>
          <div className="text-gray-400 text-sm">
            {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
            {subGalleries.length > 0 && (
              <span> • {subGalleries.length} {subGalleries.length === 1 ? 'folder' : 'folders'}</span>
            )}
          </div>

          {/* Mobile create form */}
          {showCreateForm && (
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="New sub-gallery title"
                  value={newGalleryTitle}
                  onChange={(e) => setNewGalleryTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateSubGallery()}
                  className="p-3 rounded text-white bg-gray-700 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  disabled={creating}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateSubGallery}
                    disabled={creating}
                    className={`flex-1 py-3 px-4 rounded text-white transition-colors text-base font-medium ${
                      creating ? "bg-gray-600 cursor-not-allowed" : "bg-[#dd183b] hover:bg-red-700"
                    }`}
                  >
                    {creating ? "Creating..." : "Create"}
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
        </div>

        {/* Desktop header layout */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="py-2 px-4 rounded bg-gray-600 text-white hover:bg-gray-700 transition-colors"
              onClick={onBack}
            >
              ← Back
            </button>
            <h2 className="text-2xl font-bold text-white">{gallery.title}</h2>
            <span className="text-gray-400 text-sm">
              ({photos.length} {photos.length === 1 ? 'photo' : 'photos'})
              {subGalleries.length > 0 && (
                <span>, {subGalleries.length} {subGalleries.length === 1 ? 'sub-gallery' : 'sub-galleries'}</span>
              )}
            </span>
          </div>
          
          {/* Desktop Create Sub-Gallery */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="New sub-gallery title"
              value={newGalleryTitle}
              onChange={(e) => setNewGalleryTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateSubGallery()}
              className="p-2 rounded text-white bg-gray-700 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={creating}
            />
            <button
              onClick={handleCreateSubGallery}
              disabled={creating}
              className={`py-2 px-4 rounded text-white transition-colors whitespace-nowrap ${
                creating ? "bg-gray-600 cursor-not-allowed" : "bg-[#dd183b] hover:bg-red-700"
              }`}
            >
              {creating ? "Creating..." : "Create Sub-Gallery"}
            </button>
          </div>
        </div>
      </div>

      {/* Sub-galleries section (folders) */}
      {subGalleries.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Folders</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {subGalleries.map((subGallery) => (
              <GalleryCard
                key={subGallery.id}
                gallery={normalizeGallery(subGallery)}
                onClick={handleSelectSubGallery}
                onEdit={handleSubGalleryEdit}
                onDelete={handleSubGalleryDelete}
                onAddPhotos={(subGal) => {
                  setSelectedSubGallery(subGal);
                }}
                onSubGalleryCreated={(parentId, newSubGallery) => {
                  // This will be handled by the recursive GalleryView
                }}
                isSubGallery={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Photos section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-white">Photos</h3>
        </div>

        {/* Desktop drag-and-drop zone */}
        <div className="hidden sm:block">
          <div
            className="border-2 border-dashed border-gray-500 p-6 text-center text-gray-300 mb-6 rounded-lg hover:border-gray-400 transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-2">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-lg">Drag & drop photos here, or click to select</p>
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
                className={`mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                  uploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Select Files"}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile upload button */}
        <div className="sm:hidden mb-4">
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
            className={`w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-base font-medium ${
              uploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={uploading}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {uploading ? "Uploading..." : "Add Photos"}
            </div>
          </button>
        </div>

        {/* Photos grid using PhotoCard */}
        {photos.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-400 text-base sm:text-lg">No photos in this gallery yet.</p>
            <p className="text-gray-500 text-sm mt-2">Upload some photos to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
            {photos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onRename={handlePhotoRename}
                onDelete={handlePhotoDelete}
                onInfo={handlePhotoInfo}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryView;