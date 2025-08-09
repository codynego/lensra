import React, { useState } from "react";
import { Menu } from "@headlessui/react";
import { DotsVerticalIcon, XIcon } from "@heroicons/react/outline";

const PhotoCard = ({ photo, onRename, onDelete, onInfo }) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newCaption, setNewCaption] = useState(photo.caption || "");
  const [showPreview, setShowPreview] = useState(false);

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
    if (e.target.closest('[data-menu]') || e.target.closest('[data-rename]')) {
      return;
    }
    openPreview();
  };

  return (
    <>
      {/* Photo Card - Responsive width, fixed height */}
      <div 
        className="relative group bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer transition-transform hover:scale-105 w-full"
        onClick={handleCardClick}
        style={{ height: '220px' }} // Only fix height, let width be responsive
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
        <div className="h-20 p-3 bg-gray-800 text-white text-sm flex items-center">
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
            <span className="line-clamp-2 overflow-hidden">
              {photo.caption || "Untitled"}
            </span>
          )}
        </div>

        {/* Options Menu Button - Always visible on hover */}
        <div 
          data-menu
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="p-2 bg-black bg-opacity-70 rounded-full hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200">
              <DotsVerticalIcon className="h-5 w-5 text-white" />
            </Menu.Button>

            <Menu.Items className="absolute right-0 mt-2 w-44 bg-gray-900 border border-gray-700 text-white rounded-lg shadow-xl z-50 overflow-hidden">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openPreview();
                    }}
                    className={`flex items-center w-full px-4 py-3 text-sm text-left transition-colors ${
                      active ? "bg-gray-700 text-white" : "text-gray-200"
                    }`}
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Preview
                  </button>
                )}
              </Menu.Item>
              
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
                    Rename
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
                    className={`flex items-center w-full px-4 py-3 text-sm text-left transition-colors ${
                      active ? "bg-gray-700 text-white" : "text-gray-200"
                    }`}
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Info
                  </button>
                )}
              </Menu.Item>

              <div className="border-t border-gray-700">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this photo?')) {
                          onDelete(photo);
                        }
                      }}
                      className={`flex items-center w-full px-4 py-3 text-sm text-left transition-colors ${
                        active ? "bg-red-600 text-white" : "text-red-400"
                      }`}
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  )}
                </Menu.Item>
              </div>
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

            {/* Image */}
            <div className="flex-1 flex items-center justify-center max-h-[85vh] w-full">
              <img
                src={photo.image}
                alt={photo.caption || "Photo"}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                id="preview-title"
              />
            </div>

            {/* Caption */}
            {photo.caption && (
              <div className="mt-4 text-white text-center text-lg bg-black bg-opacity-50 px-6 py-3 rounded-lg max-w-4xl">
                {photo.caption}
              </div>
            )}

            {/* Navigation hint */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-gray-400 text-sm">
              Click anywhere outside the image to close
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoCard;