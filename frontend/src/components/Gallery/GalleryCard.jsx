import React, { useState, useRef, useEffect } from "react";
import buildGalleryUrl from "../../utils/buildUrl";
import { useAuth } from "../../AuthContext";

// Custom dropdown component
const Dropdown = ({ trigger, children, isOpen, onToggle }) => {
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        onToggle(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onToggle]);

  return (
    <div className="relative z-50" ref={dropdownRef}>
      {React.cloneElement(trigger, {
        onClick: (e) => {
          e.stopPropagation();
          onToggle(!isOpen);
        },
      })}
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-2 w-32 bg-slate-800/95 backdrop-blur-md border border-slate-600/50 rounded-lg shadow-2xl divide-y divide-slate-700/30 z-50"
        >
          {children}
        </div>
      )}
    </div>
  );
};

// Icon components
const DotsVerticalIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
  </svg>
);

const FolderIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const ShareIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
  </svg>
);

const GlobeIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LockClosedIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const ClipboardCopyIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const DownloadIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const ViewGridIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const GalleryCard = ({
  gallery = {
    id: 1,
    title: "Summer Memories",
    photo_count: 24,
    cover_photo: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    slug: "summer-memories",
    visibility: "private",
    is_shareable_via_link: false,
    share_url: "",
    can_share: true,
  },
  onClick,
  onEdit,
  onDelete,
  onAddPhotos,
  onSubGalleryCreated,
  canEdit,
  isSelected,
  onToggleSelection,
  onDragOver,
  onDragLeave,
  onDrop,
  viewMode,
  theme,
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(gallery?.title || "Untitled");
  const [showShareModal, setShowShareModal] = useState(false);
  const [visibility, setVisibility] = useState(gallery?.visibility || "private");
  const [isShareableViaLink, setIsShareableViaLink] = useState(gallery?.is_shareable_via_link || false);
  const [shareUrl, setShareUrl] = useState(gallery?.share_url || "");
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectionShareUrl, setSelectionShareUrl] = useState("");
  const [updating, setUpdating] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { apiFetch } = useAuth();
  const fullUrl = buildGalleryUrl(gallery.slug, selectionShareUrl);
  const fullShareUrl = buildGalleryUrl(gallery.slug, shareUrl);

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

    try {
      const response = await apiFetch("/gallery/galleries/create/", {
        method: "POST",
        body: JSON.stringify({
          title,
          parent_gallery: gallery.id,
        }),
      });
      if (!response.ok) throw new Error("Failed to create sub-gallery");
      const data = await response.json();
      onSubGalleryCreated?.(gallery.id, data.gallery || data);
    } catch (err) {
      console.error("Error creating sub-gallery:", err);
      alert("Failed to create sub-gallery.");
    }
  };

  const handleCardClick = (e) => {
    if (
      e.target.closest("[data-menu]") ||
      e.target.closest("[data-button]") ||
      e.target.closest("[data-rename]") ||
      isRenaming
    ) {
      return;
    }
    if (e.ctrlKey || e.metaKey) {
      onToggleSelection?.();
    } else {
      onClick?.(gallery);
    }
  };

  const handleDelete = () => {
    setIsMenuOpen(false);
    if (
      window.confirm(
        `Are you sure you want to delete the gallery "${gallery?.title}"? This action cannot be undone.`
      )
    ) {
      onDelete?.(gallery);
    }
  };

  const handleUpdateSharing = async (newVisibility, newShareableViaLink, newSelectionMode) => {
    setUpdating(true);
    try {
      const response = await apiFetch(`/gallery/galleries/${gallery.id}/share/`, {
        method: "PATCH",
        body: JSON.stringify({
          visibility: newVisibility,
          is_shareable_via_link: newShareableViaLink,
        }),
      });
      if (!response.ok) throw new Error("Failed to update sharing settings");
      const data = await response.json();

      setVisibility(data.visibility);
      setIsShareableViaLink(data.is_shareable_via_link);
      setShareUrl(data.share_url || "");

      if (gallery.visibility !== undefined) {
        gallery.visibility = data.visibility;
        gallery.is_shareable_via_link = data.is_shareable_via_link;
        gallery.share_url = data.share_url;
        gallery.is_public = data.is_public;
      }
    } catch (err) {
      console.error("Error updating sharing:", err);
      alert("Failed to update sharing settings.");
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleSelectionMode = async (e) => {
    e.stopPropagation();
    const enabled = !isSelectionMode;
    setUpdating(true);
    try {
      const response = await apiFetch("/gallery/enable-selection/", {
        method: "POST",
        body: JSON.stringify({
          gallery_id: gallery.id,
          enable_selection: enabled,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to toggle selection mode");
      }
      const data = await response.json();
      setIsSelectionMode(enabled);
      setIsShareableViaLink(false);
      setShareUrl("");
      setSelectionShareUrl(enabled && data.public_selection_url ? data.public_selection_url : "");
      if (enabled && data.public_selection_url) {
        setShowShareModal(true);
      }
    } catch (err) {
      console.error("Error toggling selection mode:", err);
      alert("Failed to toggle selection mode.");
    } finally {
      setUpdating(false);
      setIsMenuOpen(false);
    }
  };

  const handleShareLinkToggle = (enabled) => {
    setIsShareableViaLink(enabled);
    setIsSelectionMode(false);
    setSelectionShareUrl("");
    handleUpdateSharing(visibility, enabled, false);
    if (enabled) {
      setShowShareModal(true);
    }
  };

  const handleVisibilityChange = (newVisibility) => {
    handleUpdateSharing(newVisibility, isShareableViaLink, isSelectionMode);
  };

  const copyShareUrl = async (slug, shareUrl) => {
    if (!slug || !shareUrl) return;

    const fullUrl = buildGalleryUrl(slug, shareUrl);

    try {
      await navigator.clipboard.writeText(fullUrl);
      alert("Link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy using clipboard API:", err);
      const textArea = document.createElement("textarea");
      textArea.value = fullUrl;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("Link copied to clipboard!");
    }
  };

  const handleDownloadGallery = async () => {
    setIsMenuOpen(false);
    try {
      const response = await apiFetch(`/galleries/${gallery.id}/`, {
        method: "GET",
      });
      if (!response.ok) throw new Error("Failed to fetch gallery data");
      const galleryData = await response.json();

      if (galleryData.photos && galleryData.photos.length > 0) {
        for (let i = 0; i < galleryData.photos.length; i++) {
          const photo = galleryData.photos[i];
          try {
            const photoResponse = await fetch(photo.image);
            if (!photoResponse.ok) throw new Error(`Failed to download photo ${i + 1}`);
            const blob = await photoResponse.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = photo.caption
              ? `${gallery.title}_${i + 1}_${photo.caption}.jpg`
              : `${gallery.title}_${i + 1}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            if (i < galleryData.photos.length - 1) {
              await new Promise((resolve) => setTimeout(resolve, 500));
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
    if (visibility === "public") {
      return <GlobeIcon className="h-2 w-2 text-emerald-400" />;
    } else if (isShareableViaLink) {
      return <ShareIcon className="h-2 w-2 text-blue-400" />;
    } else if (isSelectionMode) {
      return <ViewGridIcon className="h-2 w-2 text-amber-400" />;
    } else {
      return <LockClosedIcon className="h-2 w-2 text-slate-400" />;
    }
  };

  const canManageSharing = gallery?.can_share !== false;

  const MenuItem = ({ onClick, icon: Icon, children, className = "", dangerous = false }) => (
    <button
      data-button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`flex items-center w-full px-3 py-1 text-sm text-left transition-colors duration-200 hover:bg-slate-600/50 ${
        dangerous ? "text-red-400 hover:text-red-300" : "text-slate-200 hover:text-white"
      } ${className}`}
    >
      <Icon className="w-3 h-3 mr-2 flex-shrink-0" />
      <span className="text-[10px]">{children}</span>
    </button>
  );

  return (
    <>
      <div
        className={`relative group bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-700/50 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] w-full max-w-sm mx-auto ${
          isSelected ? "ring-2 ring-indigo-500" : ""
        } ${viewMode === "list" ? "flex items-center" : ""}`}
        onClick={handleCardClick}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {/* Image Container */}
        <div
          className={`relative ${
            viewMode === "list"
              ? "w-24 h-24 flex-shrink-0"
              : "w-full aspect-[4/3]"
          } bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden`}
        >
          {gallery?.cover_photo ? (
            <img
              src={gallery.cover_photo}
              alt={gallery?.title || "Gallery"}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
              <FolderIcon className="h-12 w-12 text-slate-400 opacity-50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Status Badge */}
          <div className="absolute top-2 left-2 z-10">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full border border-white/20 text-xs text-white font-medium">
              {getStatusIcon()}
              <span>{visibility === "public" ? "Public" : isShareableViaLink ? "Shared" : isSelectionMode ? "Selection" : "Private"}</span>
            </div>
          </div>

          {/* Sub-gallery Badge */}
          {gallery?.parent_gallery && (
            <div className="absolute bottom-2 left-2 z-10">
              <div className="px-2 py-0.5 bg-indigo-600/80 rounded-md text-xs font-medium text-white border border-indigo-500/30">
                Sub-Gallery
              </div>
            </div>
          )}

          {/* Selection Checkbox (Visible in List View or Selection Mode) */}
          {(viewMode === "list" || isSelected) && (
            <div className="absolute top-2 right-2 z-10">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  onToggleSelection?.();
                }}
                className="w-2 h-2 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Content Area */}
        <div
          className={`p-4 bg-slate-800/90 text-white flex-1 ${
            viewMode === "list" ? "flex items-center justify-between" : ""
          }`}
        >
          {isRenaming ? (
            <input
              data-rename
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full px-2 py-1 bg-slate-700/50 text-white rounded-md border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              onClick={(e) => e.stopPropagation()}
              placeholder="Enter gallery name..."
            />
          ) : (
            <div>
              <h3 className="font-semibold text-base truncate">{gallery?.title || "Untitled"}</h3>
              {gallery?.photo_count !== undefined && (
                <p className="text-xs text-slate-400">{gallery.photo_count} {gallery.photo_count === 1 ? "photo" : "photos"}</p>
              )}
            </div>
          )}
        </div>

        {/* Menu Button */}
        <div
          data-menu
          className={`absolute top-2 right-2 z-50 ${
            viewMode === "list" ? "flex items-center" : "opacity-100 md:opacity-0 md:group-hover:opacity-100"
          } transition-opacity duration-300`}
        >
          <Dropdown
            isOpen={isMenuOpen}
            onToggle={setIsMenuOpen}
            trigger={
              <button
                data-button
                className="p-1.5 bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/80 border border-white/20"
              >
                <DotsVerticalIcon className="h-4 w-4 text-white" />
              </button>
            }
          >
            <div className="p-1">
              <MenuItem onClick={handleDownloadGallery} icon={DownloadIcon}>Download</MenuItem>
              {/* {canEdit && (
                <MenuItem onClick={handleCreateSubGallery} icon={FolderIcon}>
                  Create Sub-Gallery
                </MenuItem>
              )} */}
            </div>
            {canManageSharing && (
              <>
                <div className="p-1">
                  <MenuItem
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsRenaming(true);
                    }}
                    icon={() => (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    )}
                  >
                    Rename
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setIsMenuOpen(false);
                      setShowShareModal(true);
                    }}
                    icon={ShareIcon}
                  >
                    Share Options
                  </MenuItem>
                </div>
                <div className="p-1">
                  <MenuItem
                    onClick={handleDelete}
                    icon={() => (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    )}
                    dangerous
                  >
                    Delete
                  </MenuItem>
                </div>
              </>
            )}
          </Dropdown>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl w-full max-w-md p-6 border border-slate-600/30 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Share Settings</h3>
                <p className="text-xs text-slate-400">Configure gallery access</p>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-600/50 rounded-full transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Visibility Settings */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">Visibility</label>
                <div className="space-y-3">
                  <label
                    className={`flex items-center p-3 rounded-lg border border-slate-600/50 hover:bg-slate-600/30 cursor-pointer transition-all duration-200 ${
                      visibility === "private" ? "bg-slate-600/30" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={visibility === "private"}
                      onChange={(e) => handleVisibilityChange(e.target.value)}
                      disabled={updating}
                      className="w-4 h-4 mr-3 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex items-center flex-1">
                      <LockClosedIcon className="h-4 w-4 text-slate-300 mr-2" />
                      <div>
                        <span className="text-sm text-white font-medium">Private</span>
                        <p className="text-xs text-slate-400">Only you can access this gallery.</p>
                      </div>
                    </div>
                  </label>
                  <label
                    className={`flex items-center p-3 rounded-lg border border-slate-600/50 hover:bg-slate-600/30 cursor-pointer transition-all duration-200 ${
                      visibility === "public" ? "bg-slate-600/30" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={visibility === "public"}
                      onChange={(e) => handleVisibilityChange(e.target.value)}
                      disabled={updating}
                      className="w-4 h-4 mr-3 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex items-center flex-1">
                      <GlobeIcon className="h-4 w-4 text-emerald-400 mr-2" />
                      <div>
                        <span className="text-sm text-white font-medium">Public</span>
                        <p className="text-xs text-slate-400">Anyone can view this gallery.</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Sharing Options */}
              <div className="border-t border-slate-600/40 pt-4">
                <label className="block text-sm font-medium text-white mb-3">Sharing Options</label>
                <div className="space-y-3">
                  <label
                    className={`flex items-center p-3 rounded-lg border border-slate-600/50 hover:bg-slate-600/30 cursor-pointer transition-all duration-200 ${
                      isShareableViaLink ? "bg-slate-600/30" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isShareableViaLink}
                      onChange={(e) => handleShareLinkToggle(e.target.checked)}
                      disabled={updating || isSelectionMode}
                      className="w-4 h-4 mr-3 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex items-center flex-1">
                      <ShareIcon className="h-4 w-4 text-blue-400 mr-2" />
                      <div>
                        <span className="text-sm text-white font-medium">Shareable Link</span>
                        <p className="text-xs text-slate-400">Create a unique URL to share.</p>
                      </div>
                    </div>
                  </label>
                  <label
                    className={`flex items-center p-3 rounded-lg border border-slate-600/50 hover:bg-slate-600/30 cursor-pointer transition-all duration-200 ${
                      isSelectionMode ? "bg-slate-600/30" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelectionMode}
                      onChange={handleToggleSelectionMode}
                      disabled={updating || isShareableViaLink}
                      className="w-4 h-4 mr-3 text-amber-500 focus:ring-amber-500"
                    />
                    <div className="flex items-center flex-1">
                      <ViewGridIcon className="h-4 w-4 text-amber-400 mr-2" />
                      <div>
                        <span className="text-sm text-white font-medium">Selection Mode</span>
                        <p className="text-xs text-slate-400">Allow viewers to select photos.</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Share Links */}
              {(shareUrl && isShareableViaLink) || (isSelectionMode && selectionShareUrl) ? (
                <div className="border-t border-slate-600/40 pt-4">
                  <label className="block text-sm font-medium text-white mb-3">Links</label>
                  {shareUrl && isShareableViaLink && (
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="text"
                        value={fullShareUrl}
                        readOnly
                        className="flex-1 p-2 bg-slate-700/50 text-white rounded-lg border border-slate-600/50 text-xs font-mono focus:outline-none"
                      />
                      <button
                        onClick={() => copyShareUrl(gallery.slug, shareUrl)}
                        className="p-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-colors"
                        title="Copy Link"
                      >
                        <ClipboardCopyIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {isSelectionMode && selectionShareUrl && (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={fullUrl}
                        readOnly
                        className="flex-1 p-2 bg-slate-700/50 text-white rounded-lg border border-slate-600/50 text-xs font-mono focus:outline-none"
                      />
                      <button
                        onClick={() => copyShareUrl(gallery.slug, selectionShareUrl)}
                        className="p-2 bg-amber-600 hover:bg-amber-700 rounded-lg text-white transition-colors"
                        title="Copy Selection Link"
                      >
                        <ClipboardCopyIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Loading State */}
              {updating && (
                <div className="text-center py-4">
                  <div className="w-6 h-6 mx-auto animate-spin border-2 border-indigo-400 border-t-transparent rounded-full"></div>
                  <p className="text-xs text-slate-400 mt-2">Updating...</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t border-slate-600/40 pt-4">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="w-full py-2.5 bg-slate-700/50 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GalleryCard;