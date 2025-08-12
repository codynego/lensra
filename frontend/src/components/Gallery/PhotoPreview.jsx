import React, { useState, useRef, useEffect, useCallback } from "react";
import { XIcon, DownloadIcon, PencilIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/outline";

const PhotoPreview = ({ 
  isOpen, 
  onClose, 
  photo, 
  onDownload, 
  onPhotoUpdate, 
  getAccessTypeDisplay, 
  getStatusIcon,
  token 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [activeEditor, setActiveEditor] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editPanelCollapsed, setEditPanelCollapsed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Editor states
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [hue, setHue] = useState(0);
  const [blur, setBlur] = useState(0);
  const [sepia, setSepia] = useState(0);
  const [grayscale, setGrayscale] = useState(0);

  const [cropMode, setCropMode] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const [drawMode, setDrawMode] = useState(false);
  
  // Text editor states
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(24);
  const [textPosition, setTextPosition] = useState(null);

  // Drawing states
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#ff0000');
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  // Initialize canvas with image
  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    
    if (!canvas || !img || !img.complete) return;

    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions to match image
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    
    // Clear and draw the image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    
    setImageLoaded(true);
  }, []);

  // Apply all filters to canvas
  const applyFilters = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    
    if (!canvas || !img || !img.complete) return;

    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply CSS filters to context
    const filterString = [
      `brightness(${brightness}%)`,
      `contrast(${contrast}%)`,
      `saturate(${saturation}%)`,
      `hue-rotate(${hue}deg)`,
      `blur(${blur}px)`,
      `sepia(${sepia}%)`,
      `grayscale(${grayscale}%)`
    ].join(' ');
    
    ctx.filter = filterString;
    ctx.drawImage(img, 0, 0);
    ctx.filter = 'none'; // Reset filter
  }, [brightness, contrast, saturation, hue, blur, sepia, grayscale]);

  // Apply filters when values change
  useEffect(() => {
    if (isEditing && imageLoaded) {
      applyFilters();
    }
  }, [isEditing, imageLoaded, applyFilters]);

  // Initialize canvas when editing starts
  useEffect(() => {
    if (isEditing && imageRef.current) {
      initializeCanvas();
    }
  }, [isEditing, initializeCanvas]);

  if (!isOpen) return null;

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setHue(0);
    setBlur(0);
    setSepia(0);
    setGrayscale(0);
  };

  const handleEditStart = (editorType) => {
    setActiveEditor(editorType);
    setIsEditing(true);
    setShowEditMenu(false);
    setEditPanelCollapsed(false);
    
    // Initialize modes
    setTextMode(editorType === 'text');
    setDrawMode(editorType === 'draw');
    setCropMode(editorType === 'crop');
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setActiveEditor(null);
    setTextMode(false);
    setDrawMode(false);
    setCropMode(false);
    setImageLoaded(false);
    resetFilters();
  };

  const handleCanvasClick = (e) => {
    if (!textMode) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setTextPosition({ x, y });
  };

  const addTextToCanvas = () => {
    if (!textInput || !textPosition) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = textColor;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    
    // Add stroke for better visibility
    ctx.strokeText(textInput, textPosition.x, textPosition.y);
    ctx.fillText(textInput, textPosition.x, textPosition.y);
    
    setTextInput('');
    setTextPosition(null);
  };

  const handleMouseDown = (e) => {
    if (!drawMode) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    setLastPos({ x, y });
    
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!drawMode || !isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    setLastPos({ x, y });
    e.preventDefault();
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const savePhoto = async (saveAs = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsSaving(true);
    try {
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/jpeg', 0.9);
      });

      const formData = new FormData();
      formData.append('image', blob, `edited_${photo.id}.jpg`);
      
      if (saveAs) {
        formData.append('gallery', photo.gallery);
        formData.append('caption', `${photo.caption || 'Photo'} (edited)`);
        
        const response = await fetch('/api/gallery/photos/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        if (response.ok) {
          const newPhoto = await response.json();
          onPhotoUpdate && onPhotoUpdate(newPhoto, 'created');
          alert('Photo saved as new copy!');
        }
      } else {
        const response = await fetch(`/api/gallery/photos/${photo.id}/`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        if (response.ok) {
          const updatedPhoto = await response.json();
          onPhotoUpdate && onPhotoUpdate(updatedPhoto, 'updated');
          alert('Photo updated successfully!');
        }
      }
      
      handleEditCancel();
    } catch (error) {
      console.error('Error saving photo:', error);
      alert('Failed to save photo. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const editingTools = [
    {
      id: 'filters',
      name: 'Filters',
      icon: '🎨',
      description: 'Brightness, contrast, saturation'
    },
    {
      id: 'effects',
      name: 'Effects',
      icon: '✨',
      description: 'Blur, sepia, grayscale'
    },
    {
      id: 'crop',
      name: 'Crop',
      icon: '✂️',
      description: 'Crop and resize'
    },
    {
      id: 'text',
      name: 'Text',
      icon: '📝',
      description: 'Add text overlay'
    },
    {
      id: 'draw',
      name: 'Draw',
      icon: '🖌️',
      description: 'Draw and annotate'
    },
    {
      id: 'rotate',
      name: 'Rotate',
      icon: '🔄',
      description: 'Rotate and flip'
    }
  ];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4"
      onClick={isEditing ? undefined : onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-title"
    >
      <div
        className="relative max-w-7xl w-full h-full flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
        ref={containerRef}
      >
        {/* Top Controls */}
        <div className="absolute top-4 left-0 right-0 flex justify-between items-center px-4 z-10">
          <div className="flex gap-2">
            <button
              className="bg-gray-900 bg-opacity-80 rounded-full p-3 hover:bg-opacity-100 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200"
              onClick={onDownload}
              aria-label="Download photo"
            >
              <DownloadIcon className="h-6 w-6 text-white" />
            </button>
            
            <button
              className="bg-blue-600 bg-opacity-80 rounded-full p-3 hover:bg-opacity-100 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200"
              onClick={() => setShowEditMenu(!showEditMenu)}
              aria-label="Smart edit"
            >
              <PencilIcon className="h-6 w-6 text-white" />
            </button>
          </div>

          <button
            className="bg-gray-900 bg-opacity-80 rounded-full p-3 hover:bg-opacity-100 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200"
            onClick={isEditing ? handleEditCancel : onClose}
            aria-label={isEditing ? "Cancel editing" : "Close preview"}
          >
            <XIcon className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Edit Tools Menu */}
        {showEditMenu && !isEditing && (
          <div className="absolute top-20 left-4 bg-gray-900 bg-opacity-95 rounded-lg p-4 z-20 max-w-sm">
            <h3 className="text-white text-lg font-semibold mb-3">Smart Edit Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {editingTools.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => handleEditStart(tool.id)}
                  className="flex flex-col items-center p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <span className="text-2xl mb-1">{tool.icon}</span>
                  <span className="text-white text-sm font-medium">{tool.name}</span>
                  <span className="text-gray-400 text-xs text-center">{tool.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Edit Panel - Desktop: Left Side, Mobile: Bottom */}
        {isEditing && (
          <>
            {/* Desktop Edit Panel */}
            <div className="hidden md:block">
              <div className={`fixed left-4 bottom-4 top-20 bg-gray-900 bg-opacity-95 rounded-lg transition-all duration-300 z-20 ${
                editPanelCollapsed ? 'w-12' : 'w-80'
              }`}>
                {/* Toggle Button */}
                <button
                  onClick={() => setEditPanelCollapsed(!editPanelCollapsed)}
                  className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-gray-800 rounded-full p-2 hover:bg-gray-700 z-30"
                >
                  {editPanelCollapsed ? (
                    <ChevronRightIcon className="h-4 w-4 text-white" />
                  ) : (
                    <ChevronLeftIcon className="h-4 w-4 text-white" />
                  )}
                </button>

                {!editPanelCollapsed && (
                  <div className="h-full overflow-y-auto p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white text-lg font-semibold">
                        {editingTools.find(t => t.id === activeEditor)?.name || 'Edit'}
                      </h3>
                      <button
                        onClick={resetFilters}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Reset
                      </button>
                    </div>

                    {/* Filter Controls */}
                    {(activeEditor === 'filters' || activeEditor === 'effects') && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-white text-sm mb-2">Brightness</label>
                          <input
                            type="range"
                            min="0"
                            max="200"
                            value={brightness}
                            onChange={(e) => setBrightness(Number(e.target.value))}
                            className="w-full"
                          />
                          <span className="text-gray-400 text-xs">{brightness}%</span>
                        </div>

                        <div>
                          <label className="block text-white text-sm mb-2">Contrast</label>
                          <input
                            type="range"
                            min="0"
                            max="200"
                            value={contrast}
                            onChange={(e) => setContrast(Number(e.target.value))}
                            className="w-full"
                          />
                          <span className="text-gray-400 text-xs">{contrast}%</span>
                        </div>

                        <div>
                          <label className="block text-white text-sm mb-2">Saturation</label>
                          <input
                            type="range"
                            min="0"
                            max="200"
                            value={saturation}
                            onChange={(e) => setSaturation(Number(e.target.value))}
                            className="w-full"
                          />
                          <span className="text-gray-400 text-xs">{saturation}%</span>
                        </div>

                        <div>
                          <label className="block text-white text-sm mb-2">Hue</label>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={hue}
                            onChange={(e) => setHue(Number(e.target.value))}
                            className="w-full"
                          />
                          <span className="text-gray-400 text-xs">{hue}°</span>
                        </div>

                        {activeEditor === 'effects' && (
                          <>
                            <div>
                              <label className="block text-white text-sm mb-2">Blur</label>
                              <input
                                type="range"
                                min="0"
                                max="10"
                                value={blur}
                                onChange={(e) => setBlur(Number(e.target.value))}
                                className="w-full"
                              />
                              <span className="text-gray-400 text-xs">{blur}px</span>
                            </div>

                            <div>
                              <label className="block text-white text-sm mb-2">Sepia</label>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={sepia}
                                onChange={(e) => setSepia(Number(e.target.value))}
                                className="w-full"
                              />
                              <span className="text-gray-400 text-xs">{sepia}%</span>
                            </div>

                            <div>
                              <label className="block text-white text-sm mb-2">Grayscale</label>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={grayscale}
                                onChange={(e) => setGrayscale(Number(e.target.value))}
                                className="w-full"
                              />
                              <span className="text-gray-400 text-xs">{grayscale}%</span>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Text Controls */}
                    {activeEditor === 'text' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-white text-sm mb-2">Text</label>
                          <input
                            type="text"
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder="Enter text..."
                            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-white text-sm mb-2">Color</label>
                          <input
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-full h-10 rounded cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-white text-sm mb-2">Size</label>
                          <input
                            type="range"
                            min="12"
                            max="72"
                            value={fontSize}
                            onChange={(e) => setFontSize(Number(e.target.value))}
                            className="w-full"
                          />
                          <span className="text-gray-400 text-xs">{fontSize}px</span>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-400 text-sm mb-2">
                            {textPosition ? 'Click "Add Text" to place' : 'Click on image to position text'}
                          </p>
                          {textInput && textPosition && (
                            <button
                              onClick={addTextToCanvas}
                              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Add Text
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Draw Controls */}
                    {activeEditor === 'draw' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-white text-sm mb-2">Brush Color</label>
                          <input
                            type="color"
                            value={brushColor}
                            onChange={(e) => setBrushColor(e.target.value)}
                            className="w-full h-10 rounded cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-white text-sm mb-2">Brush Size</label>
                          <input
                            type="range"
                            min="1"
                            max="20"
                            value={brushSize}
                            onChange={(e) => setBrushSize(Number(e.target.value))}
                            className="w-full"
                          />
                          <span className="text-gray-400 text-xs">{brushSize}px</span>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-400 text-sm mb-2">
                            Drawing mode is active - click and drag on image
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Save Buttons */}
                    <div className="mt-6 space-y-2">
                      <button
                        onClick={() => savePhoto(false)}
                        disabled={isSaving}
                        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => savePhoto(true)}
                        disabled={isSaving}
                        className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? 'Saving...' : 'Save as New'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Edit Panel */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 bg-opacity-95 rounded-t-lg p-4 z-20 max-h-80 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-lg font-semibold">
                  {editingTools.find(t => t.id === activeEditor)?.name || 'Edit'}
                </h3>
                <button
                  onClick={resetFilters}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Reset
                </button>
              </div>

              {/* Mobile controls - same structure but in grid layout */}
              {(activeEditor === 'filters' || activeEditor === 'effects') && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-white text-xs mb-1">Brightness</label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={brightness}
                        onChange={(e) => setBrightness(Number(e.target.value))}
                        className="w-full"
                      />
                      <span className="text-gray-400 text-xs">{brightness}%</span>
                    </div>
                    <div>
                      <label className="block text-white text-xs mb-1">Contrast</label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={contrast}
                        onChange={(e) => setContrast(Number(e.target.value))}
                        className="w-full"
                      />
                      <span className="text-gray-400 text-xs">{contrast}%</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => savePhoto(false)}
                      disabled={isSaving}
                      className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => savePhoto(true)}
                      disabled={isSaving}
                      className="flex-1 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
                    >
                      {isSaving ? 'Saving...' : 'Save New'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Image Display Area */}
        <div className={`flex-1 flex items-center justify-center max-h-[85vh] w-full ${
          isEditing ? 'md:mr-80' : ''
        } ${isEditing ? 'mb-80 md:mb-0' : ''}`}>
          {/* Hidden image for loading */}
          <img
            ref={imageRef}
            src={photo.image}
            alt={photo.caption || "Photo"}
            className="hidden"
            crossOrigin="anonymous"
            onLoad={initializeCanvas}
          />
          
          {isEditing ? (
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-gray-600"
              onClick={handleCanvasClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ 
                display: imageLoaded ? 'block' : 'none',
                cursor: textMode ? 'crosshair' : drawMode ? 'crosshair' : 'default'
              }}
            />
          ) : (
            <img
              src={photo.image}
              alt={photo.caption || "Photo"}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              id="preview-title"
            />
          )}
          
          {/* Loading indicator for canvas */}
          {isEditing && !imageLoaded && (
            <div className="flex items-center justify-center">
              <div className="text-white text-lg">Loading editor...</div>
            </div>
          )}
        </div>

        {/* Photo Info */}
        <div className={`mt-4 text-center max-w-4xl ${isEditing ? 'md:mb-0 mb-80' : ''}`}>
          {photo.caption && (
            <div className="text-white text-lg bg-black bg-opacity-50 px-6 py-3 rounded-lg mb-2">
              {photo.caption}
            </div>
          )}

          {photo.access_type && photo.access_type !== 'owner' && (
            <div className="flex justify-center gap-2 mb-2">
              {getAccessTypeDisplay()}
              {getStatusIcon()}
            </div>
          )}
        </div>

        {/* Close Instruction */}
        {!isEditing && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-gray-400 text-sm">
            Click anywhere outside the image to close
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoPreview;