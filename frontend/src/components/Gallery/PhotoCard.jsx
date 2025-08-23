import React, { useState } from "react";
import { Menu } from "@headlessui/react";
import {
  DotsVerticalIcon,
  ShareIcon,
  GlobeIcon,
  LockClosedIcon,
  ClipboardCopyIcon,
  HeartIcon,
  DownloadIcon,
} from "@heroicons/react/outline";
import { useApi } from "../../useApi";
import PhotoPreview from "./PhotoPreview";
import { useAuth } from "../../AuthContext";

const PhotoCard = ({
  photo,
  onRename,
  onDelete,
  onInfo,
  onAddToCollection,
  showAddToCollection = false,
  isSelected,
  onToggleSelection,
  selectedItems,
  theme,
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newCaption, setNewCaption] = useState(photo.caption || "");
  const [showPreview, setShowPreview] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [visibility, setVisibility] = useState(photo?.visibility || "private");
  const [isShareableViaLink, setIsShareableViaLink] = useState(
    photo?.is_shareable_via_link || false
  );
  const [shareUrl, setShareUrl] = useState(photo?.share_url || "");
  const [updating, setUpdating] = useState(false);
  const { token, isAuthenticated } = useAuth();
  const { apiFetch } = useApi();

  const handleRenameSubmit = () => {
    if (newCaption.trim() && newCaption !== photo.caption) {
      console.log(newCaption)
      onRename(photo.id, newCaption);
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
    if (
      e.target.closest("[data-menu]") ||
      e.target.closest("[data-rename]") ||
      e.target.closest("[data-button]") ||
      e.target.closest("[data-selection]")
    ) {
      return;
    }
    openPreview();
  };

  const handleUpdateSharing = async (newVisibility, newShareableViaLink) => {
    setUpdating(true);
    try {
      const response = await apiFetch(`/gallery/photos/${photo.id}/share/`, {
        method: "PATCH",
        body: JSON.stringify({
          visibility: newVisibility,
          is_shareable_via_link: newShareableViaLink,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update sharing settings");
      }

      const data = await response.json();
      setVisibility(data.visibility);
      setIsShareableViaLink(data.is_shareable_via_link);
      setShareUrl(data.share_url || "");

      if (photo.visibility !== undefined) {
        photo.visibility = data.visibility;
        photo.is_shareable_via_link = data.is_shareable_via_link;
        photo.share_url = data.share_url;
        photo.is_public = data.is_public;
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
      const textArea = document.createElement("textarea");
      textArea.value = `${window.location.origin}${shareUrl}`;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("Share link copied to clipboard!");
    }
  };

  const handleDownload = async () => {
    try {
      const response = await apiFetch(photo.image, { method: "GET" });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
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

  const handleDragStart = (e) => {
    let photoIds = [photo.id];
    if (selectedItems.size > 0) {
      photoIds = Array.from(selectedItems)
        .filter((itemId) => itemId.startsWith("photo-"))
        .map((itemId) => itemId.split("-")[1]);
      if (!photoIds.includes(photo.id)) {
        photoIds = [photo.id];
      }
    }
    console.log("Drag started with photo IDs:", photoIds);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("application/json", JSON.stringify({ photoIds }));
    document.body.style.cursor = "grabbing";
    const preview = document.createElement("div");
    preview.innerText = `${photoIds.length} photo${photoIds.length > 1 ? "s" : ""}`;
    preview.style.cssText = `
      position: absolute;
      background: rgba(79, 70, 229, 0.9);
      color: white;
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      z-index: 1000;
    `;
    document.body.appendChild(preview);
    e.dataTransfer.setDragImage(preview, 0, 0);
    setTimeout(() => document.body.removeChild(preview), 0);
  };

  const handleDragEnd = () => {
    console.log("Drag ended");
    document.body.style.cursor = "";
  };

  const getStatusIcon = () => {
    if (visibility === "public") {
      return <GlobeIcon className="h-2.5 w-2.5 text-emerald-400" />;
    } else if (isShareableViaLink) {
      return <ShareIcon className="h-2.5 w-2.5 text-blue-400" />;
    } else {
      return <LockClosedIcon className="h-2.5 w-2.5 text-slate-400" />;
    }
  };

  const getAccessTypeDisplay = () => {
    if (photo?.access_type) {
      switch (photo.access_type) {
        case "owner":
          return null;
        case "assigned":
          return (
            <span className="inline-flex items-center px-1 py-0.5 rounded text-[10px] font-medium bg-blue-500/80 text-white border border-blue-400/30">
              Assigned
            </span>
          );
        case "shared":
          return (
            <span className="inline-flex items-center px-1 py-0.5 rounded text-[10px] font-medium bg-emerald-500/80 text-white border border-emerald-400/30">
              Shared
            </span>
          );
        case "public":
          return (
            <span className="inline-flex items-center px-1 py-0.5 rounded text-[10px] font-medium bg-purple-500/80 text-white border border-purple-400/30">
              Public
            </span>
          );
        default:
          return null;
      }
    }
    return null;
  };

  const canManageSharing = photo?.can_share !== false;

  return (
    <>
      <div
        className={`relative group bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-md border border-slate-700/40 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.01] w-full max-w-xs`}
        onClick={handleCardClick}
        style={{ height: "180px" }}
        draggable={true}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="w-full h-32">
          <img
            src={photo.image}
            alt={photo.caption || "Photo"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 rounded-t-xl"
            loading="lazy"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-xl" />
        </div>

        <div className="h-16 p-2 bg-slate-800/90 text-white text-xs flex flex-col justify-between rounded-b-xl">
          {isRenaming ? (
            <input
              data-rename
              type="text"
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full px-1.5 py-0.5 bg-slate-700/50 text-white rounded-md border border-slate-600/50 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
              onClick={(e) => e.stopPropagation()}
              placeholder="Enter caption..."
            />
          ) : (
            <>
              <span className="line-clamp-2 overflow-hidden flex-1 text-xs font-medium">
                {photo.caption || "Untitled"}
              </span>
              <div className="flex items-center justify-between mt-0.5">
                {getAccessTypeDisplay()}
                <div className="flex items-center gap-1">{getStatusIcon()}</div>
              </div>
            </>
          )}
        </div>

        {showAddToCollection && (
          <div
            data-button
            className="absolute top-1.5 left-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 z-20"
          >
            <button
              onClick={handleAddToCollection}
              className="p-1 bg-emerald-600/90 rounded-full hover:bg-emerald-700 transition-all duration-200 flex items-center justify-center"
              title="Add to My Collection"
            >
              <HeartIcon className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
        )}

        <div
          data-selection
          className="absolute top-1.5 left-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 z-20"
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelection();
            }}
            className="w-3.5 h-3.5 text-indigo-600 focus:ring-indigo-500 rounded"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        <div
          data-menu
          className="absolute top-1.5 right-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 z-40"
          onClick={(e) => e.stopPropagation()}
        >
          <Menu as="div" className="relative inline-block text-left z-[100]">
            <Menu.Button className="p-1 bg-black/40 backdrop-blur-sm rounded-full hover:bg-black/60 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200">
              <DotsVerticalIcon className="h-3.5 w-3.5 text-white" />
            </Menu.Button>

            <Menu.Items className="absolute right-0 mt-1 w-32 bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 text-white rounded-md shadow-xl z-[100] divide-y divide-slate-700/30">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openPreview();
                    }}
                    className={`flex items-center w-full px-1.5 py-1 text-[10px] text-left transition-colors ${
                      active ? "bg-slate-700/50 text-white" : "text-slate-200"
                    }`}
                  >
                    <svg
                      className="w-3 h-3 mr-1 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
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
                    className={`flex items-center w-full px-1.5 py-1 text-[10px] text-left transition-colors ${
                      active ? "bg-slate-700/50 text-white" : "text-slate-200"
                    }`}
                  >
                    <DownloadIcon className="w-3 h-3 mr-1 flex-shrink-0" />
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
                        className={`flex items-center w-full px-1.5 py-1 text-[10px] text-left transition-colors ${
                          active ? "bg-slate-700/50 text-white" : "text-slate-200"
                        }`}
                      >
                        <svg
                          className="w-3 h-3 mr-1 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
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
                        className={`flex items-center w-full px-1.5 py-1 text-[10px] text-left transition-colors ${
                          active ? "bg-slate-700/50 text-white" : "text-slate-200"
                        }`}
                      >
                        <ShareIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span>Share</span>
                      </button>
                    )}
                  </Menu.Item>

                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm("Are you sure you want to delete this photo?")) {
                            onDelete(photo);
                          }
                        }}
                        className={`flex items-center w-full px-1.5 py-1 text-[10px] text-left transition-colors ${
                          active ? "bg-red-600/50 text-white" : "text-red-400 hover:text-red-300"
                        }`}
                      >
                        <svg
                          className="w-3 h-3 mr-1 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        <span>Delete</span>
                      </button>
                    )}
                  </Menu.Item>
                </>
              )}

              {!canManageSharing && (
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleAddToCollection}
                      className={`flex items-center w-full px-1.5 py-1 text-[10px] text-left transition-colors ${
                        active ? "bg-slate-700/50 text-white" : "text-slate-200"
                      }`}
                    >
                      <HeartIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span>Add to Collection</span>
                    </button>
                  )}
                </Menu.Item>
              )}
            </Menu.Items>
          </Menu>
        </div>
      </div>

      <PhotoPreview
        isOpen={showPreview}
        onClose={closePreview}
        photo={photo}
        onDownload={handleDownload}
        getAccessTypeDisplay={getAccessTypeDisplay}
        getStatusIcon={getStatusIcon}
      />

      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg max-w-sm w-full p-5 max-h-[90vh] overflow-y-auto border border-slate-700/30 shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-base font-semibold text-white">Share Photo</h3>
                <p className="text-[10px] text-slate-400">Configure photo access</p>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-md"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white mb-2">
                  Visibility
                </label>
                <div className="space-y-2">
                  <label className="flex items-center p-2 rounded-md border border-slate-600/50 hover:bg-slate-700/30 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={visibility === "private"}
                      onChange={(e) => handleVisibilityChange(e.target.value)}
                      disabled={updating}
                      className="w-3.5 h-3.5 mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex items-center flex-1">
                      <LockClosedIcon className="h-3.5 w-3.5 text-slate-300 mr-1.5" />
                      <div>
                        <span className="text-xs text-white font-medium">Private</span>
                        <p className="text-[10px] text-slate-400">Only you can access this photo.</p>
                      </div>
                    </div>
                  </label>
                  <label className="flex items-center p-2 rounded-md border border-slate-600/50 hover:bg-slate-700/30 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={visibility === "public"}
                      onChange={(e) => handleVisibilityChange(e.target.value)}
                      disabled={updating}
                      className="w-3.5 h-3.5 mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex items-center flex-1">
                      <GlobeIcon className="h-3.5 w-3.5 text-emerald-400 mr-1.5" />
                      <div>
                        <span className="text-xs text-white font-medium">Public</span>
                        <p className="text-[10px] text-slate-400">Anyone can view this photo.</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="border-t border-slate-700/40 pt-3">
                <label className="flex items-center p-2 rounded-md border border-slate-600/50 hover:bg-slate-700/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isShareableViaLink}
                    onChange={(e) => handleShareLinkToggle(e.target.checked)}
                    disabled={updating}
                    className="w-3.5 h-3.5 mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center flex-1">
                    <ShareIcon className="h-3.5 w-3.5 text-blue-400 mr-1.5" />
                    <div>
                      <span className="text-xs text-white font-medium">Shareable Link</span>
                      <p className="text-[10px] text-slate-400">Create a unique URL to share.</p>
                    </div>
                  </div>
                </label>
              </div>

              {shareUrl && isShareableViaLink && (
                <div className="border-t border-slate-700/40 pt-3">
                  <label className="block text-xs font-medium text-white mb-2">
                    Share Link
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={`${window.location.origin}${shareUrl}`}
                      readOnly
                      className="flex-1 p-1.5 bg-slate-700/50 text-white rounded-md border border-slate-600/50 text-[10px] font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={copyShareUrl}
                      className="p-1.5 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
                      title="Copy Link"
                    >
                      <ClipboardCopyIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {updating && (
                <div className="text-center py-3 border-t border-slate-700/40">
                  <div className="w-5 h-5 mx-auto animate-spin border-2 border-blue-400 border-t-transparent rounded-full"></div>
                  <p className="text-[10px] text-slate-400 mt-1">Updating settings...</p>
                </div>
              )}

              <div className="border-t border-slate-700/40 pt-3">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="w-full py-1.5 bg-slate-700/50 hover:bg-slate-700 text-white rounded-md text-xs"
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

export default PhotoCard;