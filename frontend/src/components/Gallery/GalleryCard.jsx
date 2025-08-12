import React, { useState } from "react";
import { Menu } from "@headlessui/react";
import { 
  DotsVerticalIcon, 
  FolderIcon, 
  PlusIcon, 
  PhotographIcon,
  ShareIcon,
  GlobeIcon,
  LockClosedIcon,
  ClipboardCopyIcon,
  DownloadIcon
} from "@heroicons/react/outline";
import axios from "axios";
import { useAuth } from "../../AuthContext"; // Import useAuth

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
  const [showShareModal, setShowShareModal] = useState(false);
  const [visibility, setVisibility] = useState(gallery?.visibility || 'private');
  const [isShareableViaLink, setIsShareableViaLink] = useState(gallery?.is_shareable_via_link || false);
  const [shareUrl, setShareUrl] = useState(gallery?.share_url || '');
  const [updating, setUpdating] = useState(false);
  const { token, isAuthenticated } = useAuth(); // Get token and isAuthenticated

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
      const res = await axios.post(
        "http://127.0.0.1:8000/api/gallery/galleries/create/",
        {
          title,
          parent_gallery: gallery.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
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

  const handleUpdateSharing = async (newVisibility, newShareableViaLink) => {
    setUpdating(true);
    try {
      const res = await axios.patch(
        `http://127.0.0.1:8000/api/gallery/galleries/${gallery.id}/share/`,
        { 
          visibility: newVisibility,
          is_shareable_via_link: newShareableViaLink
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setVisibility(res.data.visibility);
      setIsShareableViaLink(res.data.is_shareable_via_link);
      setShareUrl(res.data.share_url || '');
      
      // Update the gallery object if parent component needs it
      if (gallery.visibility !== undefined) {
        gallery.visibility = res.data.visibility;
        gallery.is_shareable_via_link = res.data.is_shareable_via_link;
        gallery.share_url = res.data.share_url;
        gallery.is_public = res.data.is_public;
      }
    } catch (err) {
      console.error("Error updating sharing:", err);
      alert("Failed to update sharing settings.");
    } finally {
      setUpdating(false);
    }
  };

  const handleVisibilityChange = (newVisibility) => {
    handleUpdateSharing(newVisibility, isShareableViaLink);
  };

  const handleShareLinkToggle = (enabled) => {
    handleUpdateSharing(visibility, enabled);
  };

  const copyShareUrl = async () => {
    if (!shareUrl) return;
    
    try {
      const fullUrl = `${window.location.origin}${shareUrl}`;
      await navigator.clipboard.writeText(fullUrl);
      alert("Share link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = `${window.location.origin}${shareUrl}`;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert("Share link copied to clipboard!");
    }
  };

  const handleDownloadGallery = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `http://127.0.0.1:8000/api/galleries/${gallery.id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const galleryData = response.data;
      if (galleryData.photos && galleryData.photos.length > 0) {
        // Create a zip-like download by downloading all photos
        for (let i = 0; i < galleryData.photos.length; i++) {
          const photo = galleryData.photos[i];
          try {
            const photoResponse = await fetch(photo.image);
            const blob = await photoResponse.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = photo.caption ? 
              `${gallery.title}_${i + 1}_${photo.caption}.jpg` : 
              `${gallery.title}_${i + 1}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            // Add a small delay between downloads to avoid overwhelming the browser
            if (i < galleryData.photos.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          } catch (photoErr) {
            console.error(`Error downloading photo ${i + 1}:`, photoErr);
          }
        }
        alert(`Started downloading ${galleryData.photos.length} photos from "${gallery.title}"`);
      } else {
        alert("This gallery has no photos to download.");
      }
    } catch (err) {
      console.error("Error downloading gallery:", err);
      alert("Failed to download gallery.");
    }
  };

  const getStatusIcon = () => {
    if (visibility === 'public') {
      return <GlobeIcon className="h-3 w-3 text-green-500" />;
    } else if (isShareableViaLink) {
      return <ShareIcon className="h-3 w-3 text-blue-500" />;
    } else {
      return <LockClosedIcon className="h-3 w-3 text-gray-500" />;
    }
  };

  const canManageSharing = gallery?.can_share !== false;

  return (
    <>
      <div
        className="relative group bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl w-full"
        onClick={handleCardClick}
        style={{ height: '240px' }}
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
            <div className="flex-1 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white truncate text-base">
                  {gallery?.title || "Untitled"}
                </h3>
                {gallery?.photo_count !== undefined && (
                  <p className="text-xs text-gray-400 mt-1">
                    {gallery.photo_count} {gallery.photo_count === 1 ? 'photo' : 'photos'}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                {getStatusIcon()}
              </div>
            </div>
          )}
        </div>

        {/* Options Menu - Fixed positioning and visibility */}
        <div 
          data-menu
          className="absolute top-2 right-2 group-hover:opacity-100 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200"
        >
          <Menu as="div" className="relative text-left z-50">
            <Menu.Button 
              className="p-2 bg-black bg-opacity-70 rounded-full hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <DotsVerticalIcon className="h-5 w-5 text-white" />
            </Menu.Button>
            
            <Menu.Items className="absolute right-0 mt-2 w-44 bg-gray-900 border border-gray-700 text-white rounded-lg shadow-2xl overflow-hidden max-h-80 overflow-y-auto z-[100]">
              {/* Download Option - Always available */}
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadGallery();
                    }}
                    className={`flex items-center w-full px-3 py-2 text-sm text-left transition-colors border-b border-gray-700 last:border-b-0 ${
                      active ? "bg-gray-700 text-white" : "text-gray-200"
                    }`}
                  >
                    <DownloadIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Download</span>
                  </button>
                )}
              </Menu.Item>

              {/* Management options - only if user can manage */}
              {canManageSharing && (
                <>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsRenaming(true);
                        }}
                        className={`flex items-center w-full px-3 py-2 text-sm text-left transition-colors border-b border-gray-700 ${
                          active ? "bg-gray-700 text-white" : "text-gray-200"
                        }`}
                      >
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Rename</span>
                      </button>
                    )}
                  </Menu.Item>

                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowShareModal(true);
                        }}
                        className={`flex items-center w-full px-3 py-2 text-sm text-left transition-colors border-b border-gray-700 ${
                          active ? "bg-gray-700 text-white" : "text-gray-200"
                        }`}
                      >
                        <ShareIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>Share</span>
                      </button>
                    )}
                  </Menu.Item>

                  {/* Separator */}
                  <div className="border-t border-gray-600"></div>

                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete();
                        }}
                        className={`flex items-center w-full px-3 py-2 text-sm text-left transition-colors ${
                          active ? "bg-red-600 text-white" : "text-red-400 hover:text-red-300"
                        }`}
                      >
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Delete</span>
                      </button>
                    )}
                  </Menu.Item>
                </>
              )}
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

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Share Gallery</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Visibility
                </label>
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer p-2 rounded hover:bg-gray-700 transition-colors">
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={visibility === 'private'}
                      onChange={(e) => handleVisibilityChange(e.target.value)}
                      disabled={updating}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex items-center">
                      <LockClosedIcon className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-white">Private</span>
                    </div>
                  </label>
                  <label className="flex items-center cursor-pointer p-2 rounded hover:bg-gray-700 transition-colors">
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={visibility === 'public'}
                      onChange={(e) => handleVisibilityChange(e.target.value)}
                      disabled={updating}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex items-center">
                      <GlobeIcon className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-white">Public Gallery</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <label className="flex items-center cursor-pointer p-2 rounded hover:bg-gray-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={isShareableViaLink}
                    onChange={(e) => handleShareLinkToggle(e.target.checked)}
                    disabled={updating}
                    className="mr-3 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <div className="flex items-center">
                    <ShareIcon className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-white">Enable shareable link</span>
                  </div>
                </label>
              </div>

              {shareUrl && isShareableViaLink && (
                <div className="border-t border-gray-700 pt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Share Link
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={`${window.location.origin}${shareUrl}`}
                      readOnly
                      className="flex-1 p-3 bg-gray-700 text-white rounded border border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={copyShareUrl}
                      className="p-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex-shrink-0"
                      title="Copy Link"
                    >
                      <ClipboardCopyIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {updating && (
                <div className="text-center py-4 border-t border-gray-700">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mx-auto"></div>
                  <p className="text-gray-300 text-sm mt-2">Updating settings...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GalleryCard;