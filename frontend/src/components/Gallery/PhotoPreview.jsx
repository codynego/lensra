import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, Download, Edit3, RotateCw, Save, Copy, Palette, Sparkles, Scissors, Type, PenTool, RotateCcw, Move } from "lucide-react";

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
  onPhotoUpdate = (photo, action) => console.log('Photo updated:', action),
  getAccessTypeDisplay = () => <span className="text-blue-400">Owner</span>,
  getStatusIcon = () => null,
  token = "demo-token"
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [activeEditor, setActiveEditor] = useState(null);
  const [isSaving, setSaving] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Editor states
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    blur: 0,
    sepia: 0,
    grayscale: 0
  });

  // Crop states
  const [cropMode, setCropMode] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Text states
  const [textMode, setTextMode] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(32);
  const [textPosition, setTextPosition] = useState(null);

  // Drawing states
  const [drawMode, setDrawMode] = useState(false);
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#ff0000');
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  // Initialize canvas with proper scaling
  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    
    if (!canvas || !img || !img.complete) return;

    const ctx = canvas.getContext('2d');
    
    // Calculate display size while maintaining aspect ratio
    const containerWidth = containerRef.current?.clientWidth || 800;
    const containerHeight = window.innerHeight * 0.7; // 70% of viewport height
    
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    let displayWidth, displayHeight;
    
    if (containerWidth / containerHeight > aspectRatio) {
      displayHeight = Math.min(containerHeight, img.naturalHeight);
      displayWidth = displayHeight * aspectRatio;
    } else {
      displayWidth = Math.min(containerWidth * 0.8, img.naturalWidth);
      displayHeight = displayWidth / aspectRatio;
    }
    
    // Set canvas to display size for better performance
    canvas.width = displayWidth;
    canvas.height = displayHeight;
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';
    
    // Clear and draw the image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Initialize crop area to full image
    setCropArea({ x: 0, y: 0, width: canvas.width, height: canvas.height });
    
    setImageLoaded(true);
  }, []);

  // Apply all filters to canvas
  const applyFilters = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    
    if (!canvas || !img || !img.complete) return;

    const ctx = canvas.getContext('2d');
    
    // Store current crop area
    const currentCrop = cropArea;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const filterString = [
      `brightness(${filters.brightness}%)`,
      `contrast(${filters.contrast}%)`,
      `saturate(${filters.saturation}%)`,
      `hue-rotate(${filters.hue}deg)`,
      `blur(${filters.blur}px)`,
      `sepia(${filters.sepia}%)`,
      `grayscale(${filters.grayscale}%)`
    ].join(' ');
    
    ctx.filter = filterString;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'none';
    
    // Draw crop overlay if in crop mode
    if (cropMode && currentCrop.width > 0 && currentCrop.height > 0) {
      drawCropOverlay(ctx, currentCrop);
    }
  }, [filters, cropMode, cropArea]);

  const drawCropOverlay = (ctx, crop) => {
    // Darken areas outside crop
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    
    // Top
    ctx.fillRect(0, 0, ctx.canvas.width, crop.y);
    // Bottom
    ctx.fillRect(0, crop.y + crop.height, ctx.canvas.width, ctx.canvas.height - crop.y - crop.height);
    // Left
    ctx.fillRect(0, crop.y, crop.x, crop.height);
    // Right
    ctx.fillRect(crop.x + crop.width, crop.y, ctx.canvas.width - crop.x - crop.width, crop.height);
    
    // Draw crop border
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.strokeRect(crop.x, crop.y, crop.width, crop.height);
    
    // Draw corner handles
    const handleSize = 8;
    ctx.fillStyle = '#3B82F6';
    ctx.fillRect(crop.x - handleSize/2, crop.y - handleSize/2, handleSize, handleSize);
    ctx.fillRect(crop.x + crop.width - handleSize/2, crop.y - handleSize/2, handleSize, handleSize);
    ctx.fillRect(crop.x - handleSize/2, crop.y + crop.height - handleSize/2, handleSize, handleSize);
    ctx.fillRect(crop.x + crop.width - handleSize/2, crop.y + crop.height - handleSize/2, handleSize, handleSize);
  };

  useEffect(() => {
    if (isEditing && imageLoaded) {
      applyFilters();
    }
  }, [isEditing, imageLoaded, applyFilters]);

  useEffect(() => {
    if (isEditing && imageRef.current) {
      initializeCanvas();
    }
  }, [isEditing, initializeCanvas]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (isEditing && imageLoaded) {
        initializeCanvas();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isEditing, imageLoaded, initializeCanvas]);

  if (!isOpen) return null;

  const resetFilters = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hue: 0,
      blur: 0,
      sepia: 0,
      grayscale: 0
    });
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleEditStart = (editorType) => {
    setActiveEditor(editorType);
    setIsEditing(true);
    setShowEditMenu(false);
    
    // Reset modes
    setTextMode(false);
    setDrawMode(false);
    setCropMode(false);
    
    // Set active mode
    if (editorType === 'text') setTextMode(true);
    if (editorType === 'draw') setDrawMode(true);
    if (editorType === 'crop') setCropMode(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setActiveEditor(null);
    setTextMode(false);
    setDrawMode(false);
    setCropMode(false);
    setImageLoaded(false);
    resetFilters();
    setShowEditMenu(false);
  };

  const handleCanvasInteraction = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (textMode) {
      setTextPosition({ x, y });
    } else if (cropMode) {
      if (e.type === 'mousedown') {
        setIsDragging(true);
        setDragStart({ x, y });
        setCropArea({ x, y, width: 0, height: 0 });
      }
    } else if (drawMode) {
      if (e.type === 'mousedown') {
        setIsDrawing(true);
        setLastPos({ x, y });
      }
    }
    e.preventDefault();
  };

  const handleCanvasMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (cropMode && isDragging) {
      const width = x - dragStart.x;
      const height = y - dragStart.y;
      setCropArea({
        x: width < 0 ? x : dragStart.x,
        y: height < 0 ? y : dragStart.y,
        width: Math.abs(width),
        height: Math.abs(height)
      });
      applyFilters(); // Redraw with new crop
    } else if (drawMode && isDrawing) {
      const ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(x, y);
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      setLastPos({ x, y });
    }
    e.preventDefault();
  };

  const handleCanvasEnd = () => {
    setIsDragging(false);
    setIsDrawing(false);
  };

  const addTextToCanvas = () => {
    if (!textInput || !textPosition) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = textColor;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    
    ctx.strokeText(textInput, textPosition.x, textPosition.y);
    ctx.fillText(textInput, textPosition.x, textPosition.y);
    
    setTextInput('');
    setTextPosition(null);
  };

  const applyCrop = () => {
    if (!cropArea.width || !cropArea.height) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Create new canvas with cropped dimensions
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCanvas.width = cropArea.width;
    tempCanvas.height = cropArea.height;
    
    // Copy cropped area to temp canvas
    tempCtx.drawImage(
      canvas,
      cropArea.x, cropArea.y, cropArea.width, cropArea.height,
      0, 0, cropArea.width, cropArea.height
    );
    
    // Resize main canvas and draw cropped image
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;
    canvas.style.width = cropArea.width + 'px';
    canvas.style.height = cropArea.height + 'px';
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tempCanvas, 0, 0);
    
    setCropMode(false);
    setCropArea({ x: 0, y: 0, width: canvas.width, height: canvas.height });
  };

  const savePhoto = async (saveAs = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setSaving(true);
    try {
      // Create blob from canvas
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/jpeg', 0.9);
      });

      // Create download URL and trigger download for demo
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `edited_${photo.id}_${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedPhoto = { 
        ...photo, 
        id: saveAs ? Date.now() : photo.id,
        image: url // In real app, this would be the server response
      };
      
      onPhotoUpdate(updatedPhoto, saveAs ? 'created' : 'updated');
      
      // Show success message
      const message = saveAs ? 'Photo saved as new copy!' : 'Photo updated successfully!';
      
      // Create toast notification
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
      
      handleEditCancel();
    } catch (error) {
      console.error('Error saving photo:', error);
      // Show error toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = 'Failed to save photo. Please try again.';
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    } finally {
      setSaving(false);
    }
  };

  const editingTools = [
    { id: 'filters', name: 'Filters', icon: Palette, description: 'Brightness, contrast, saturation' },
    { id: 'effects', name: 'Effects', icon: Sparkles, description: 'Blur, sepia, grayscale' },
    { id: 'crop', name: 'Crop', icon: Scissors, description: 'Crop and resize' },
    { id: 'text', name: 'Text', icon: Type, description: 'Add text overlay' },
    { id: 'draw', name: 'Draw', icon: PenTool, description: 'Draw and annotate' },
    { id: 'rotate', name: 'Rotate', icon: RotateCw, description: 'Rotate and flip' }
  ];

  const FilterSlider = ({ label, value, min, max, unit, onChange, step = 1 }) => (
    <div className="flex-1 min-w-0">
      <div className="text-center mb-2">
        <label className="text-xs font-medium text-gray-300 block">{label}</label>
        <span className="text-xs text-gray-400">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
      />
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black flex flex-col z-50"
      role="dialog"
      aria-modal="true"
    >
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
          
          {!isEditing && (
            <button
              className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
              onClick={() => setShowEditMenu(!showEditMenu)}
              aria-label="Smart edit"
            >
              <Edit3 className="h-5 w-5 text-white" />
            </button>
          )}
        </div>

        <h1 className="text-white font-semibold truncate mx-4">
          {isEditing ? `Editing - ${editingTools.find(t => t.id === activeEditor)?.name}` : photo.caption}
        </h1>

        <button
          className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          onClick={isEditing ? handleEditCancel : onClose}
          aria-label={isEditing ? "Cancel editing" : "Close preview"}
        >
          <X className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Edit Tools Menu */}
      {showEditMenu && !isEditing && (
        <div className="absolute top-16 left-4 right-4 bg-gray-900/95 backdrop-blur-sm rounded-2xl p-4 z-20 shadow-2xl border border-gray-700">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {editingTools.map(tool => {
              const IconComponent = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => handleEditStart(tool.id)}
                  className="flex flex-col items-center p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all hover:scale-105"
                >
                  <IconComponent className="h-6 w-6 text-blue-400 mb-1" />
                  <span className="text-white text-xs font-medium">{tool.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Image Area */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden" ref={containerRef}>
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
          <div className="relative flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onMouseDown={handleCanvasInteraction}
              onMouseMove={handleCanvasMove}
              onMouseUp={handleCanvasEnd}
              onMouseLeave={handleCanvasEnd}
              onClick={handleCanvasInteraction}
              style={{ 
                display: imageLoaded ? 'block' : 'none',
                cursor: textMode ? 'crosshair' : drawMode ? 'crosshair' : cropMode ? 'crosshair' : 'default'
              }}
            />
            {/* Loading overlay */}
            {!imageLoaded && (
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-3 text-white">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  <span>Loading editor...</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <img
            src={photo.image}
            alt={photo.caption || "Photo"}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        )}
      </div>

      {/* Bottom Controls Panel */}
      {isEditing && (
        <div className="bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 p-4">
          {/* Filter Controls */}
          {(activeEditor === 'filters' || activeEditor === 'effects') && (
            <div className="space-y-4">
              <div className="flex gap-4 overflow-x-auto pb-2">
                <FilterSlider
                  label="Brightness"
                  value={filters.brightness}
                  min={0}
                  max={200}
                  unit="%"
                  onChange={(value) => updateFilter('brightness', value)}
                />
                <FilterSlider
                  label="Contrast"
                  value={filters.contrast}
                  min={0}
                  max={200}
                  unit="%"
                  onChange={(value) => updateFilter('contrast', value)}
                />
                <FilterSlider
                  label="Saturation"
                  value={filters.saturation}
                  min={0}
                  max={200}
                  unit="%"
                  onChange={(value) => updateFilter('saturation', value)}
                />
                <FilterSlider
                  label="Hue"
                  value={filters.hue}
                  min={0}
                  max={360}
                  unit="°"
                  onChange={(value) => updateFilter('hue', value)}
                />
                {activeEditor === 'effects' && (
                  <>
                    <FilterSlider
                      label="Blur"
                      value={filters.blur}
                      min={0}
                      max={10}
                      unit="px"
                      onChange={(value) => updateFilter('blur', value)}
                    />
                    <FilterSlider
                      label="Sepia"
                      value={filters.sepia}
                      min={0}
                      max={100}
                      unit="%"
                      onChange={(value) => updateFilter('sepia', value)}
                    />
                    <FilterSlider
                      label="Grayscale"
                      value={filters.grayscale}
                      min={0}
                      max={100}
                      unit="%"
                      onChange={(value) => updateFilter('grayscale', value)}
                    />
                  </>
                )}
              </div>
              
              <div className="flex gap-2 justify-center">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* Text Controls */}
          {activeEditor === 'text' && (
            <div className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm text-gray-300 mb-2">Text</label>
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Enter text..."
                    className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Color</label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-16 h-12 rounded-lg cursor-pointer border border-gray-600"
                  />
                </div>
                <div className="w-24">
                  <FilterSlider
                    label="Size"
                    value={fontSize}
                    min={12}
                    max={72}
                    unit="px"
                    onChange={(value) => setFontSize(value)}
                  />
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">
                  {textPosition ? 'Click "Add Text" to place text' : 'Click on image to position text'}
                </p>
                {textInput && textPosition && (
                  <button
                    onClick={addTextToCanvas}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    Add Text
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Draw Controls */}
          {activeEditor === 'draw' && (
            <div className="flex gap-4 items-center justify-center">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Color</label>
                <input
                  type="color"
                  value={brushColor}
                  onChange={(e) => setBrushColor(e.target.value)}
                  className="w-16 h-12 rounded-lg cursor-pointer border border-gray-600"
                />
              </div>
              <div className="flex-1 max-w-xs">
                <FilterSlider
                  label="Brush Size"
                  value={brushSize}
                  min={1}
                  max={20}
                  unit="px"
                  onChange={(value) => setBrushSize(value)}
                />
              </div>
              <p className="text-gray-400 text-sm">Click and drag to draw</p>
            </div>
          )}

          {/* Crop Controls */}
          {activeEditor === 'crop' && (
            <div className="text-center space-y-4">
              <p className="text-gray-400 text-sm">Drag on image to select crop area</p>
              {cropArea.width > 0 && cropArea.height > 0 && (
                <button
                  onClick={applyCrop}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  Apply Crop
                </button>
              )}
            </div>
          )}

          {/* Save Buttons */}
          <div className="flex gap-4 justify-center mt-4 pt-4 border-t border-gray-700">
            <button
              onClick={() => savePhoto(false)}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => savePhoto(true)}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <Copy className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save as New'}
            </button>
          </div>
        </div>
      )}

      {/* Photo Info */}
      {!isEditing && photo.caption && (
        <div className="p-4 bg-gray-900/80 backdrop-blur-sm text-center border-t border-gray-700">
          <div className="text-gray-300">{photo.caption}</div>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: 2px solid #1E293B;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
          transition: all 0.2s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          background: #2563EB;
          transform: scale(1.1);
        }
        
        .slider::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: 2px solid #1E293B;
        }
      `}</style>
    </div>
  );
};

export default PhotoPreview;