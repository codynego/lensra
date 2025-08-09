import React, { useState } from "react";
import { Menu } from "@headlessui/react";
import { DotsVerticalIcon, FolderIcon, PlusIcon, PhotographIcon } from "@heroicons/react/outline";
import axios from "axios";

const GalleryCard = ({
  gallery,
  onClick,
  onEdit,
  onDelete,
  onAddPhotos,
  onSubGalleryCreated,
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(gallery?.title || "Untitled");
  const [loadingSubGallery, setLoadingSubGallery] = useState(false);

  const handleRenameSubmit = () => {
    if (newTitle.trim() && newTitle !== gallery?.title) {
      onEdit?.(gallery, newTitle);
    }
    setIsRenaming(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleRenameSubmit();
    } else if (e.key === "Escape") {
      setNewTitle(gallery?.title || "Untitled");
      setIsRenaming(false);
    }
  };

  const handleCreateSubGallery = async (e) => {
    e.stopPropagation();
    const title = prompt("Enter sub-gallery name:");
    if (!title) return;
    
    setLoadingSubGallery(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/galleries/create/", {
        title,
        parent_gallery: gallery.id,
      });
      onSubGalleryCreated?.(gallery.id, res.data.gallery || res.data);
    } catch (err) {
      console.error("Error creating sub-gallery:", err);
      alert("Failed to create sub-gallery.");
    } finally {
      setLoadingSubGallery(false);
    }
  };

  const handleCardClick = (e) => {
    // Don't open gallery if clicking on menu, buttons, or rename input
    if (e.target.closest('[data-menu]') || e.target.closest('[data-button]') || e.target.closest('[data-rename]')) {
      return;
    }
    onClick?.(gallery);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the gallery "${gallery?.title}"? This action cannot be undone.`)) {
      onDelete?.(gallery);
    }
  };

  return (
    <div
      className="relative group bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl w-full"
      onClick={handleCardClick}
      style={{ height: '240px' }} // Only fix height, let width be responsive
    >
      {/* Thumbnail Container - Fixed height */}
      <div className="w-full h-40 bg-gray-900 overflow-hidden relative">
        {gallery?.cover_photo ? (
          <img
            src={gallery.cover_photo}
            alt={gallery?.title || "Gallery"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800 text-gray-400">
            <FolderIcon className="h-16 w-16 opacity-60" />
          </div>
        )}
        
        {/* Overlay gradient for better button visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>

      {/* Title Section - Fixed height */}
      <div className="h-25 p-3 bg-gray-800 text-white flex items-center">
        {isRenaming ? (
          <input
            data-rename
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-full px-2 py-1 text-black rounded bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()}
            placeholder="Enter gallery name..."
          />
        ) : (
          <div className="flex-1">
            <h3 className="font-semibold text-white truncate text-base">
              {gallery?.title || "Untitled"}
            </h3>
            {gallery?.photo_count !== undefined && (
              <p className="text-xs text-gray-400 mt-1">
                {gallery.photo_count} {gallery.photo_count === 1 ? 'photo' : 'photos'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Quick Add Sub-Gallery Button */}
      <div 
        data-button
        className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
      >
        <button
          onClick={handleCreateSubGallery}
          disabled={loadingSubGallery}
          className={`p-2 bg-black bg-opacity-70 rounded-full hover:bg-opacity-90 transition-all duration-200 flex items-center justify-center ${
            loadingSubGallery ? "cursor-not-allowed opacity-50" : ""
          }`}
          title="Create Sub-Gallery"
        >
          {loadingSubGallery ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
          ) : (
            <PlusIcon className="h-5 w-5 text-white" />
          )}
        </button>
      </div>

      {/* Options Menu */}
      <div 
        data-menu
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
      >
        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button 
            className="p-2 bg-black bg-opacity-70 rounded-full hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <DotsVerticalIcon className="h-5 w-5 text-white" />
          </Menu.Button>
          
          <Menu.Items className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 text-white rounded-lg shadow-xl z-50 overflow-hidden">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRenaming(true);
                  }}
                  className={`flex items-center w-full px-4 py-3 text-sm text-left transition-colors ${
                    active ? "bg-gray-700 text-white" : "text-gray-200"
                  }`}
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Rename Gallery
                </button>
              )}
            </Menu.Item>
            
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddPhotos?.(gallery);
                  }}
                  className={`flex items-center w-full px-4 py-3 text-sm text-left transition-colors ${
                    active ? "bg-gray-700 text-white" : "text-gray-200"
                  }`}
                >
                  <PhotographIcon className="w-4 h-4 mr-3" />
                  Add Photos
                </button>
              )}
            </Menu.Item>
            
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleCreateSubGallery}
                  disabled={loadingSubGallery}
                  className={`flex items-center w-full px-4 py-3 text-sm text-left transition-colors ${
                    active ? "bg-gray-700 text-white" : "text-gray-200"
                  } ${loadingSubGallery ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <FolderIcon className="w-4 h-4 mr-3" />
                  Create Sub-Gallery
                </button>
              )}
            </Menu.Item>

            <div className="border-t border-gray-700">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    className={`flex items-center w-full px-4 py-3 text-sm text-left transition-colors ${
                      active ? "bg-red-600 text-white" : "text-red-400"
                    }`}
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Gallery
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Menu>
      </div>

      {/* Gallery Type Indicator */}
      {gallery?.parent_gallery && (
        <div className="absolute bottom-2 left-2 opacity-75">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
            Sub-Gallery
          </span>
        </div>
      )}
    </div>
  );
};

export default GalleryCard;