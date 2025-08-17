import React, { useState, useRef, useEffect } from "react";

// Mock implementations for demo
const useAuth = () => ({ isAuthenticated: true });
const useApi = () => ({ 
  apiFetch: async (url, options) => {
    console.log('API call:', url, options);
    return { 
      ok: true, 
      json: () => Promise.resolve({ 
        visibility: options?.body ? JSON.parse(options.body).visibility : 'private',
        is_shareable_via_link: options?.body ? JSON.parse(options.body).is_shareable_via_link : false,
        share_url: 'abc123',
        public_selection_url: 'def456'
      })
    };
  }
});
const buildGalleryUrl = (slug, shareUrl) => `https://gallery.com/${slug}/${shareUrl}`;

// Custom dropdown component
const Dropdown = ({ trigger, children, isOpen, onToggle }) => {
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && 
          !dropdownRef.current.contains(event.target) && 
          menuRef.current && 
          !menuRef.current.contains(event.target)) {
        onToggle(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onToggle]);

  return (
    <div className="relative" ref={dropdownRef}>
      {React.cloneElement(trigger, {
        onClick: (e) => {
          e.stopPropagation();
          onToggle(!isOpen);
        }
      })}
      {isOpen && (
        <div 
          ref={menuRef}
          className="absolute right-0 top-full mt-2 w-40 bg-slate-900/95 backdrop-blur-xl border border-slate-700/70 text-white rounded-lg shadow-2xl overflow-visible z-[9999] divide-y divide-slate-700/50"
          onClick={(e) => e.stopPropagation()}
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
    can_share: true
  },
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
  const [visibility, setVisibility] = useState(gallery?.visibility || "private");
  const [isShareableViaLink, setIsShareableViaLink] = useState(
    gallery?.is_shareable_via_link || false
  );
  const [shareUrl, setShareUrl] = useState(gallery?.share_url || "");
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectionShareUrl, setSelectionShareUrl] = useState("");
  const [updating, setUpdating] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { apiFetch } = useApi();
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

    setLoadingSubGallery(true);
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
    } finally {
      setLoadingSubGallery(false);
    }
  };

  const handleCardClick = (e) => {
    if (
      e.target.closest("[data-menu]") ||
      e.target.closest("[data-button]") ||
      e.target.closest("[data-rename]")
    ) {
      return;
    }
    onClick?.(gallery);
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

  const handleUpdateSharing = async (newVisibility, newShareableViaLink) => {
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

  const handleVisibilityChange = (newVisibility) => {
    handleUpdateSharing(newVisibility, isShareableViaLink);
  };

  const handleShareLinkToggle = (enabled) => {
    handleUpdateSharing(visibility, enabled);
  };

  const copyShareUrl = async (slug, selectionShareUrl) => {
    if (!slug || !selectionShareUrl) return;

    const fullUrl = buildGalleryUrl(slug, selectionShareUrl);

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
      return <GlobeIcon className="h-4 w-4 text-emerald-400" />;
    } else if (isShareableViaLink) {
      return <ShareIcon className="h-4 w-4 text-blue-400" />;
    } else if (isSelectionMode) {
      return <ViewGridIcon className="h-4 w-4 text-amber-400" />;
    } else {
      return <LockClosedIcon className="h-4 w-4 text-slate-400" />;
    }
  };

  const canManageSharing = gallery?.can_share !== false;

  const MenuItem = ({ onClick, icon: Icon, children, className = "", dangerous = false }) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`flex items-center w-full px-2.5 py-2 text-xs text-left transition-all duration-200 hover:scale-[0.98] ${
        dangerous 
          ? "text-red-400 hover:text-red-300 hover:bg-red-600/20" 
          : "text-slate-200 hover:text-white hover:bg-slate-700/70"
      } ${className}`}
    >
      <Icon className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
      <span className="font-medium">{children}</span>
    </button>
  );

  return (
    <>
      <div
        className="relative group bg-gradient-to-b from-slate-800 to-slate-900 backdrop-blur-sm rounded-2xl overflow-visible shadow-lg border border-slate-700/50 cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-slate-900/50 w-full"
        onClick={handleCardClick}
        style={{ height: "280px" }}
      >
        {/* Image Container */}
        <div className="w-full h-48 bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden relative">
          {gallery?.cover_photo ? (
            <img
              src={gallery.cover_photo}
              alt={gallery?.title || "Gallery"}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900">
              <FolderIcon className="h-16 w-16 text-slate-400 opacity-60" />
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/30 backdrop-blur-md rounded-full border border-white/20">
              {getStatusIcon()}
              <span className="text-xs text-white font-medium">
                {visibility === "public" ? "Public" : 
                 isShareableViaLink ? "Shared" : 
                 isSelectionMode ? "Selection" : "Private"}
              </span>
            </div>
          </div>

          {/* Sub-gallery Badge */}
          {gallery?.parent_gallery && (
            <div className="absolute bottom-3 left-3">
              <div className="px-2 py-1 bg-blue-500/90 backdrop-blur-sm rounded-lg text-xs font-semibold text-white border border-blue-400/50">
                Sub-Gallery
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="h-32 p-4 bg-gradient-to-b from-slate-800 to-slate-900 text-white flex flex-col justify-between">
          {isRenaming ? (
            <input
              data-rename
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full px-3 py-2 bg-slate-700 text-white rounded-xl border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
              onClick={(e) => e.stopPropagation()}
              placeholder="Enter gallery name..."
            />
          ) : (
            <div className="flex-1">
              <h3 className="font-bold text-white text-lg leading-tight mb-1 truncate">
                {gallery?.title || "Untitled"}
              </h3>
              {gallery?.photo_count !== undefined && (
                <p className="text-sm text-slate-400 font-medium">
                  {gallery.photo_count} {gallery.photo_count === 1 ? "photo" : "photos"}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Menu Button */}
        <div
          data-menu
          className="absolute top-3 right-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 z-50"
        >
          <Dropdown
            isOpen={isMenuOpen}
            onToggle={setIsMenuOpen}
            trigger={
              <button
                className="p-2.5 bg-black/30 backdrop-blur-md rounded-full hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 border border-white/20"
              >
                <DotsVerticalIcon className="h-5 w-5 text-white" />
              </button>
            }
          >
            <div className="p-0.5">
              <MenuItem onClick={handleDownloadGallery} icon={DownloadIcon}>
                Download
              </MenuItem>
            </div>

            {canManageSharing && (
              <>
                <div className="p-0.5">
                  <MenuItem onClick={() => { setIsMenuOpen(false); setIsRenaming(true); }} icon={() => (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  )}>
                    Rename
                  </MenuItem>

                  <MenuItem onClick={() => { setIsMenuOpen(false); setShowShareModal(true); }} icon={ShareIcon}>
                    Share Option
                  </MenuItem>
                </div>

                <div className="p-0.5">
                  <MenuItem onClick={handleDelete} icon={() => (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )} dangerous>
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 backdrop-blur-xl rounded-3xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto border border-slate-600/30 shadow-2xl shadow-black/50">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">Share Settings</h3>
                <p className="text-slate-400 text-sm">Configure how others can access your gallery</p>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-xl"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-8">
              {/* Visibility Settings */}
              <div>
                <label className="block text-lg font-semibold text-white mb-5">
                  Gallery Visibility
                </label>
                <div className="space-y-4">
                  <label className="flex items-start cursor-pointer p-4 rounded-2xl border border-slate-600/40 hover:border-slate-500/60 hover:bg-slate-700/20 transition-all duration-300 group">
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={visibility === "private"}
                      onChange={(e) => handleVisibilityChange(e.target.value)}
                      disabled={updating}
                      className="w-5 h-5 mt-0.5 mr-4 text-blue-600 focus:ring-blue-500 focus:ring-2 rounded-full"
                    />
                    <div className="flex items-start flex-1">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-700/50 mr-4 group-hover:bg-slate-600/50 transition-colors">
                        <LockClosedIcon className="h-5 w-5 text-slate-300" />
                      </div>
                      <div className="flex-1">
                        <span className="text-white font-semibold text-base block mb-1">Private</span>
                        <p className="text-slate-400 text-sm leading-relaxed">Only you can access this gallery. Perfect for personal collections.</p>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-start cursor-pointer p-4 rounded-2xl border border-slate-600/40 hover:border-slate-500/60 hover:bg-slate-700/20 transition-all duration-300 group">
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={visibility === "public"}
                      onChange={(e) => handleVisibilityChange(e.target.value)}
                      disabled={updating}
                      className="w-5 h-5 mt-0.5 mr-4 text-blue-600 focus:ring-blue-500 focus:ring-2 rounded-full"
                    />
                    <div className="flex items-start flex-1">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/20 mr-4 group-hover:bg-emerald-500/30 transition-colors">
                        <GlobeIcon className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <span className="text-white font-semibold text-base block mb-1">Public Gallery</span>
                        <p className="text-slate-400 text-sm leading-relaxed">Anyone can discover and view this gallery. Great for showcasing your work.</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Sharing Options */}
              <div className="border-t border-slate-700/50 pt-8">
                <label className="block text-lg font-semibold text-white mb-5">
                  Advanced Sharing
                </label>
                
                <div className="space-y-4">
                  {/* Enable Shareable Link Toggle */}
                  <div className="p-4 rounded-2xl border border-slate-600/40 hover:border-slate-500/60 hover:bg-slate-700/20 transition-all duration-300">
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={isShareableViaLink}
                          onChange={(e) => handleShareLinkToggle(e.target.checked)}
                          disabled={updating}
                          className="sr-only"
                        />
                        <div className={`w-11 h-6 rounded-full transition-all duration-300 ${isShareableViaLink ? 'bg-blue-600' : 'bg-slate-600'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-300 mt-0.5 ${isShareableViaLink ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'}`}></div>
                        </div>
                      </div>
                      <div className="flex items-center ml-4 flex-1">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/20 mr-4">
                          <ShareIcon className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <span className="text-white font-semibold text-base block mb-1">Enable Shareable Link</span>
                          <p className="text-slate-400 text-sm leading-relaxed">Create a unique URL that you can share with others</p>
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Enable Selection Mode Toggle */}
                  <div className="p-4 rounded-2xl border border-slate-600/40 hover:border-slate-500/60 hover:bg-slate-700/20 transition-all duration-300">
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={isSelectionMode}
                          onChange={(e) => {
                            const enabled = e.target.checked;
                            setIsSelectionMode(enabled);
                            if (enabled) {
                              setSelectionShareUrl("selection-demo-url");
                            } else {
                              setSelectionShareUrl("");
                            }
                          }}
                          disabled={updating}
                          className="sr-only"
                        />
                        <div className={`w-11 h-6 rounded-full transition-all duration-300 ${isSelectionMode ? 'bg-amber-500' : 'bg-slate-600'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-300 mt-0.5 ${isSelectionMode ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'}`}></div>
                        </div>
                      </div>
                      <div className="flex items-center ml-4 flex-1">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/20 mr-4">
                          <ViewGridIcon className="h-5 w-5 text-amber-400" />
                        </div>
                        <div className="flex-1">
                          <span className="text-white font-semibold text-base block mb-1">Enable Selection Mode</span>
                          <p className="text-slate-400 text-sm leading-relaxed">Allow viewers to select and share specific photos from your gallery</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Share Links Section */}
              {(shareUrl && isShareableViaLink) || (isSelectionMode && selectionShareUrl) ? (
                <div className="border-t border-slate-700/50 pt-8">
                  <label className="block text-lg font-semibold text-white mb-5">
                    Generated Links
                  </label>
                  
                  <div className="space-y-4">
                    {shareUrl && isShareableViaLink && (
                      <div className="p-4 rounded-2xl bg-slate-700/30 border border-slate-600/40">
                        <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center">
                          <ShareIcon className="w-4 h-4 mr-2" />
                          Gallery Share Link
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={fullShareUrl}
                            readOnly
                            className="flex-1 p-3 bg-slate-800/50 text-slate-200 rounded-xl border border-slate-600/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent font-mono"
                          />
                          <button
                            onClick={() => copyShareUrl(gallery.slug, shareUrl)}
                            className="p-3 bg-blue-600/90 hover:bg-blue-600 text-white rounded-xl transition-all duration-200 flex-shrink-0 hover:scale-105 active:scale-95 shadow-lg"
                            title="Copy Link"
                          >
                            <ClipboardCopyIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {isSelectionMode && selectionShareUrl && (
                      <div className="p-4 rounded-2xl bg-slate-700/30 border border-slate-600/40">
                        <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center">
                          <ViewGridIcon className="w-4 h-4 mr-2" />
                          Selection Mode Link
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={fullUrl}
                            readOnly
                            className="flex-1 p-3 bg-slate-800/50 text-slate-200 rounded-xl border border-slate-600/30 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent font-mono"
                          />
                          <button
                            onClick={() => copyShareUrl(gallery.slug, selectionShareUrl)}
                            className="p-3 bg-amber-600/90 hover:bg-amber-600 text-white rounded-xl transition-all duration-200 flex-shrink-0 hover:scale-105 active:scale-95 shadow-lg"
                            title="Copy Selection Link"
                          >
                            <ClipboardCopyIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Loading State */}
              {updating && (
                <div className="text-center py-8 border-t border-slate-700/50">
                  <div className="relative w-8 h-8 mx-auto mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-400 border-t-transparent"></div>
                  </div>
                  <p className="text-slate-300 font-medium">
                    Updating settings...
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t border-slate-700/50 pt-6">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="w-full py-3 px-4 bg-slate-700/50 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
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