import React, { useState, useEffect } from "react";
import { X, Download, Edit3 } from "lucide-react";
import SmartEditor from "./SmartEditor";

const PhotoPreview = ({ 
  isOpen, 
  onClose, 
  photo = {
    id: 1,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    caption: "Beautiful Mountain Landscape",
    access_type: "owner"
  },
  onDownload = () => console.log('Download'),
  getAccessTypeDisplay = () => <span className="text-blue-400">Owner</span>,
  token = "demo-token"
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(photo);

  // Handle save from SmartPhotoEditor
  const handleSave = (blob, saveAsNew) => {
    const updatedPhoto = {
      ...currentPhoto,
      image: saveAsNew ? URL.createObjectURL(blob) : currentPhoto.image,
      id: saveAsNew ? Date.now() : currentPhoto.id
    };
    setCurrentPhoto(updatedPhoto);
    if (saveAsNew) {
      onDownload();
    }
    setIsEditing(false);
  };

  useEffect(() => {
    setCurrentPhoto(photo);
  }, [photo]);

  if (!isOpen) return null;

  // If editing, render the editor directly (not nested)
  if (isEditing) {
    return (
      <SmartEditor
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        image={{ src: currentPhoto.image, caption: currentPhoto.caption }}
        onSave={handleSave}
        theme="dark"
      />
    );
  }

  // Otherwise, render the preview
  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      {/* Top Header */}
      <div className="flex justify-between items-center p-4 bg-gray-900/80 backdrop-blur-sm">
        <div className="flex gap-3">
          <button
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
            onClick={onDownload}
            aria-label="Download photo"
          >
            <Download className="h-5 w-5 text-white" />
          </button>
          <button
            className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
            onClick={() => setIsEditing(true)}
            aria-label="Edit photo"
          >
            <Edit3 className="h-5 w-5 text-white" />
          </button>
        </div>

        <h1 className="text-white font-semibold truncate mx-4">
          {currentPhoto.caption}
        </h1>

        <button
          className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          onClick={onClose}
          aria-label="Close preview"
        >
          <X className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Main Image Area */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <img
          src={currentPhoto.image}
          alt={currentPhoto.caption || "Photo"}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        />
      </div>

      {/* Photo Info */}
      {currentPhoto.caption && (
        <div className="p-4 bg-gray-900/80 backdrop-blur-sm text-center border-t border-gray-700">
          <div className="text-gray-300">{currentPhoto.caption}</div>
          <div>{getAccessTypeDisplay()}</div>
        </div>
      )}
    </div>
  );
};

export default PhotoPreview;