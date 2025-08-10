import React, { useState } from "react";
import { Menu } from "@headlessui/react";
import { 
  DotsVerticalIcon, 
  XIcon,
  ShareIcon,
  GlobeIcon,
  LockClosedIcon,
  ClipboardCopyIcon,
  HeartIcon,
  DownloadIcon
} from "@heroicons/react/outline";
import axios from "axios";

const PhotoCard = ({ 
  photo, 
  onRename, 
  onDelete, 
  onInfo, 
  onAddToCollection,
  showAddToCollection = false 
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newCaption, setNewCaption] = useState(photo.caption || "");
  const [showPreview, setShowPreview] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [visibility, setVisibility] = useState(photo?.visibility || 'private');
  const [isShareableViaLink, setIsShareableViaLink] = useState(photo?.is_shareable_via_link || false);
  const [shareUrl, setShareUrl] = useState(photo?.share_url || '');
  const [updating, setUpdating] = useState(false);

  const handleRenameSubmit = () => {
    if (newCaption.trim() && newCaption !== photo.caption) {
      onRename(photo, newCaption);
    }
    setIsRenaming(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleRenameSubmit();
    } else if (e.key === "Escape") {
      setNewCaption(photo.caption || "");
      setIsRenaming(false);
    }
  };

  const openPreview = () => setShowPreview(true);
  const closePreview = () => setShowPreview(false);

  const handleCardClick = (e) => {
    // Don't open preview if clicking on menu or rename input
    if (e.target.closest('[data-menu]') || e.target.closest('[data-rename]') || e.target.closest('[data-button]')) {
      return;
    }
    openPreview();
  };

  const handleUpdateSharing = async (newVisibility, newShareableViaLink) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.patch(
        `http://127.0.0.1:8000/api/gallery/photos/${photo.id}/share/`,
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
      
      // Update the photo object if parent component needs it
      if (photo.visibility !== undefined) {
        photo.visibility = res.data.visibility;
        photo.is_shareable_via_link = res.data.is_shareable_via_link;
        photo.share_url = res.data.share_url;
        photo.is_public = res.data.is_public;
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

  const handleDownload = async () => {
    try {
      const response = await fetch(photo.image);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = photo.caption ? `${photo.caption}.jpg` : `photo_${photo.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading photo:", err);
      alert("Failed to download photo.");
    }
  };

  const handleAddToCollection = (e) => {
    e.stopPropagation();
    onAddToCollection?.(photo);
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

  const getAccessTypeDisplay = () => {
    if (photo?.access_type) {
      switch (photo.access_type) {
        case 'owner':
          return null;
        case 'assigned':
          return <span className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-blue-600 text-white">Assigned</span>;
        case 'shared':
          return <span className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-green-600 text-white">Shared</span>;
        case 'public':
          return <span className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-purple-600 text-white">Public</span>;
        default:
          return null;
      }
    }
    return null;
  };

  const canManageSharing = photo?.can_share !== false;

  return (
    <>
      {/* Photo Card - Responsive width, fixed height */}
      <div 
        className="relative group bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer transition-transform hover:scale-105 w-full"
        onClick={handleCardClick}
        style={{ height: '220px' }}
      >
        {/* Image Container - Fixed aspect ratio */}
        <div className="w-full h-40 bg-gray-900 overflow-hidden">
          <img
            src={photo.image}
            alt={photo.caption || "Photo"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
            draggable={false}
          />
        </div>

        {/* Caption Section - Fixed height */}
        <div className="h-20 p-3 bg-gray-800 text-white text-sm flex flex-col justify-between">
          {isRenaming ? (
            <input
              data-rename
              type="text"
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full px-2 py-1 text-black rounded bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
              placeholder="Enter caption..."
            />
          ) : (
            <>
              <span className="line-clamp-2 overflow-hidden flex-1">
                {photo.caption || "Untitled"}
              </span>
              <div className="flex items-center justify-between mt-1">
                {getAccessTypeDisplay()}
                <div className="flex items-center gap-1">
                  {getStatusIcon()}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Add to Collection Button (for shared/public photos) */}
        {showAddToCollection && (
          <div 
            data-button
            className="absolute top-2 left-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 z-10"
          >
            <button
              onClick={handleAddToCollection}
              className="p-2 bg-green-600 bg-opacity-90 rounded-full hover:bg-green-700 transition-all duration-200 flex items-center justify-center"
              title="Add to My Collection"
            >
              <HeartIcon className="h-4 w-4 text-white" />
            </button>
          </div>
        )}

        {/* Options Menu Button - Always visible on mobile */}
        <div 
          data-menu
          className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <Menu as="div" className="relative inline-block text-left z-50">
            <Menu.Button className="p-2 bg-black bg-opacity-70 rounded-full hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200">
              <DotsVerticalIcon className="h-5 w-5 text-white" />
            </Menu.Button>

            <Menu.Items className="absolute right-0 mt-2 w-40 bg-gray-900 border border-gray-700 text-white rounded-lg shadow-2xl overflow-hidden max-h-80 overflow-y-auto z-[100]">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openPreview();
                    }}
                    className={`flex items-center w-full px-3 py-2 text-sm text-left transition-colors border-b border-gray-700 ${
                      active ? "bg-gray-700 text-white" : "text-gray-200"
                    }`}
                  >
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>Preview</span>
                  </button>
                )}
              </Menu.Item>

              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload();
                    }}
                    className={`flex items-center w-full px-3 py-2 text-sm text-left transition-colors border-b border-gray-700 ${
                      active ? "bg-gray-700 text-white" : "text-gray-200"
                    }`}
                  >
                    <DownloadIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Download</span>
                  </button>
                )}
              </Menu.Item>
              
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

                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onInfo?.(photo);
                        }}
                        className={`flex items-center w-full px-3 py-2 text-sm text-left transition-colors border-b border-gray-700 ${
                          active ? "bg-gray-700 text-white" : "text-gray-200"
                        }`}
                      >
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Info</span>
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
                          if (window.confirm('Are you sure you want to delete this photo?')) {
                            onDelete(photo);
                          }
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

              {/* Options for non-owners */}
              {!canManageSharing && (
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleAddToCollection}
                      className={`flex items-center w-full px-3 py-2 text-sm text-left transition-colors ${
                        active ? "bg-gray-700 text-white" : "text-gray-200"
                      }`}
                    >
                      <HeartIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>Add to Collection</span>
                    </button>
                  )}
                </Menu.Item>
              )}
            </Menu.Items>
          </Menu>
        </div>

        {/* Overlay gradient for better text/button visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4"
          onClick={closePreview}
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-title"
        >
          <div
            className="relative max-w-7xl w-full h-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 bg-gray-900 bg-opacity-80 rounded-full p-3 hover:bg-opacity-100 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200 z-10"
              onClick={closePreview}
              aria-label="Close preview"
            >
              <XIcon className="h-6 w-6 text-white" />
            </button>

            {/* Download Button */}
            <button
              className="absolute top-4 left-4 bg-gray-900 bg-opacity-80 rounded-full p-3 hover:bg-opacity-100 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200 z-10"
              onClick={handleDownload}
              aria-label="Download photo"
            >
              <DownloadIcon className="h-6 w-6 text-white" />
            </button>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center max-h-[85vh] w-full">
              <img
                src={photo.image}
                alt={photo.caption || "Photo"}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                id="preview-title"
              />
            </div>

            {/* Caption and Info */}
            <div className="mt-4 text-center max-w-4xl">
              {photo.caption && (
                <div className="text-white text-lg bg-black bg-opacity-50 px-6 py-3 rounded-lg mb-2">
                  {photo.caption}
                </div>
              )}
              
              {/* Share info for shared photos */}
              {photo.access_type && photo.access_type !== 'owner' && (
                <div className="flex justify-center gap-2 mb-2">
                  {getAccessTypeDisplay()}
                  {getStatusIcon()}
                </div>
              )}
            </div>

            {/* Navigation hint */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-gray-400 text-sm">
              Click anywhere outside the image to close
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Share Photo</h3>
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
                      <span className="text-white">Public Photo</span>
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

export default PhotoCard;