import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Upload, Download, RotateCw, RotateCcw, Crop, Sliders, 
  Sun, Contrast, Palette, Zap, Droplets, Eye, 
  Move3D, Sparkles, Camera, Settings, X, Check,
  ChevronLeft, ChevronRight, RefreshCw, Undo2, Menu
} from 'lucide-react';

const SmartEditor = () => {
  const [image, setImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [activeTab, setActiveTab] = useState('adjust');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showMobileControls, setShowMobileControls] = useState(false);
  
  // Adjustment values
  const [adjustments, setAdjustments] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    vibrance: 0,
    highlights: 0,
    shadows: 0,
    warmth: 0,
    tint: 0,
    exposure: 0,
    gamma: 1,
    clarity: 0,
    vignette: 0
  });

  // Crop state
  const [isCropping, setIsCropping] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Transform state
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);

  // Filters
  const [activeFilter, setActiveFilter] = useState('none');
  
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const processingTimeoutRef = useRef(null);

  const filters = [
    { name: 'none', label: 'Original', preview: 'none' },
    { name: 'vintage', label: 'Vintage', preview: 'sepia(0.3) contrast(1.2) brightness(0.9)' },
    { name: 'dramatic', label: 'Dramatic', preview: 'contrast(1.5) saturate(1.3) brightness(0.8)' },
    { name: 'bw', label: 'B&W', preview: 'grayscale(1) contrast(1.1)' },
    { name: 'warm', label: 'Warm', preview: 'sepia(0.2) saturate(1.2) brightness(1.1)' },
    { name: 'cool', label: 'Cool', preview: 'hue-rotate(10deg) saturate(0.8) brightness(1.05)' },
    { name: 'retro', label: 'Retro', preview: 'sepia(0.4) contrast(1.3) saturate(0.7)' },
    { name: 'fade', label: 'Fade', preview: 'brightness(1.1) contrast(0.8) saturate(0.9)' }
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          setOriginalImage(img);
          setPreviewUrl(reader.result);
          resetAdjustments();
          saveToHistory();
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const resetAdjustments = () => {
    setAdjustments({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      vibrance: 0,
      highlights: 0,
      shadows: 0,
      warmth: 0,
      tint: 0,
      exposure: 0,
      gamma: 1,
      clarity: 0,
      vignette: 0
    });
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
    setActiveFilter('none');
  };

  const saveToHistory = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      imageData,
      adjustments: { ...adjustments },
      rotation,
      flipHorizontal,
      flipVertical,
      activeFilter
    });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setAdjustments(prevState.adjustments);
      setRotation(prevState.rotation);
      setFlipHorizontal(prevState.flipHorizontal);
      setFlipVertical(prevState.flipVertical);
      setActiveFilter(prevState.activeFilter);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const applyFilters = useCallback(() => {
    if (!image || !canvasRef.current) return;
    
    // Clear previous timeout
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }
    
    // Debounce processing for smoother real-time updates
    processingTimeoutRef.current = setTimeout(() => {
      setIsProcessing(true);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = image.width;
      canvas.height = image.height;
      
      ctx.save();
      
      // Apply transformations
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
      
      // Build filter string
      let filterString = '';
      
      if (activeFilter !== 'none') {
        const filter = filters.find(f => f.name === activeFilter);
        if (filter) filterString += filter.preview + ' ';
      }
      
      filterString += `
        brightness(${1 + adjustments.brightness / 100})
        contrast(${1 + adjustments.contrast / 100})
        saturate(${1 + adjustments.saturation / 100})
        hue-rotate(${adjustments.warmth * 3.6}deg)
      `.replace(/\s+/g, ' ').trim();
      
      ctx.filter = filterString;
      ctx.drawImage(image, 0, 0);
      
      // Apply advanced adjustments with image data manipulation for better control
      if (adjustments.highlights !== 0 || adjustments.shadows !== 0 || adjustments.vibrance !== 0) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Calculate luminance
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
          
          // Highlights and shadows
          if (adjustments.highlights !== 0) {
            const factor = (luminance > 128) ? (1 + adjustments.highlights / 100) : 1;
            data[i] = Math.min(255, r * factor);
            data[i + 1] = Math.min(255, g * factor);
            data[i + 2] = Math.min(255, b * factor);
          }
          
          if (adjustments.shadows !== 0) {
            const factor = (luminance < 128) ? (1 + adjustments.shadows / 100) : 1;
            data[i] = Math.min(255, data[i] * factor);
            data[i + 1] = Math.min(255, data[i + 1] * factor);
            data[i + 2] = Math.min(255, data[i + 2] * factor);
          }
          
          // Vibrance (selective saturation)
          if (adjustments.vibrance !== 0) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const factor = 1 + (adjustments.vibrance / 100) * (1 - Math.abs(data[i] - avg) / 128);
            data[i] = Math.min(255, Math.max(0, avg + (data[i] - avg) * factor));
            data[i + 1] = Math.min(255, Math.max(0, avg + (data[i + 1] - avg) * factor));
            data[i + 2] = Math.min(255, Math.max(0, avg + (data[i + 2] - avg) * factor));
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
      }
      
      ctx.restore();
      
      // Create new image for preview immediately
      const imageDataUrl = canvas.toDataURL();
      setPreviewUrl(imageDataUrl);
      setIsProcessing(false);
    }, 16); // ~60fps for smooth real-time updates
  }, [image, adjustments, rotation, flipHorizontal, flipVertical, activeFilter]);

  useEffect(() => {
    if (image) {
      applyFilters();
    }
  }, [applyFilters]);

  const handleAdjustmentChange = (key, value) => {
    setAdjustments(prev => ({ ...prev, [key]: parseFloat(value) }));
  };

  const handleRotate = (direction) => {
    setRotation(prev => (prev + (direction === 'left' ? -90 : 90)) % 360);
  };

  const handleCropStart = (e) => {
    if (!isCropping || !imageRef.current) return;
    e.preventDefault();
    
    const rect = imageRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    setIsDragging(true);
    setDragStart({ x, y });
    setCropArea({ x, y, width: 0, height: 0 });
  };

  const handleCropMove = (e) => {
    if (!isDragging || !imageRef.current) return;
    e.preventDefault();
    
    const rect = imageRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    setCropArea({
      x: Math.min(dragStart.x, x),
      y: Math.min(dragStart.y, y),
      width: Math.abs(x - dragStart.x),
      height: Math.abs(y - dragStart.y)
    });
  };

  const handleCropEnd = () => {
    setIsDragging(false);
    if (!isCropping || cropArea.width < 10 || cropArea.height < 10) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = imageRef.current.getBoundingClientRect();
    
    // Calculate crop ratios
    const scaleX = image.width / rect.width;
    const scaleY = image.height / rect.height;
    
    const cropX = cropArea.x * scaleX;
    const cropY = cropArea.y * scaleY;
    const cropWidth = cropArea.width * scaleX;
    const cropHeight = cropArea.height * scaleY;
    
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    
    ctx.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
    
    const croppedImage = new Image();
    croppedImage.onload = () => {
      setImage(croppedImage);
      setIsCropping(false);
      setCropArea({ x: 0, y: 0, width: 0, height: 0 });
      saveToHistory();
    };
    croppedImage.src = canvas.toDataURL();
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'edited-photo.png';
    link.href = canvasRef.current.toDataURL('image/png', 1.0);
    link.click();
  };

  const tabs = [
    { id: 'adjust', label: 'Adjust', icon: Sliders },
    { id: 'filters', label: 'Filters', icon: Sparkles },
    { id: 'transform', label: 'Transform', icon: Move3D },
    { id: 'crop', label: 'Crop', icon: Crop }
  ];

  const adjustmentControls = [
    { key: 'brightness', label: 'Brightness', icon: Sun, min: -100, max: 100, step: 1 },
    { key: 'contrast', label: 'Contrast', icon: Contrast, min: -100, max: 100, step: 1 },
    { key: 'saturation', label: 'Saturation', icon: Palette, min: -100, max: 100, step: 1 },
    { key: 'vibrance', label: 'Vibrance', icon: Zap, min: -100, max: 100, step: 1 },
    { key: 'highlights', label: 'Highlights', icon: Sun, min: -100, max: 100, step: 1 },
    { key: 'shadows', label: 'Shadows', icon: Eye, min: -100, max: 100, step: 1 },
    { key: 'warmth', label: 'Warmth', icon: Droplets, min: -100, max: 100, step: 1 },
    { key: 'exposure', label: 'Exposure', icon: Camera, min: -100, max: 100, step: 1 }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
        <div className="px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Camera className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Lensra Editor
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              {image && (
                <>
                  <button
                    onClick={undo}
                    disabled={historyIndex <= 0}
                    className="p-2 sm:p-2.5 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Undo2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </button>
                  
                  {/* Mobile Controls Toggle */}
                  <button
                    onClick={() => setShowMobileControls(!showMobileControls)}
                    className="p-2 sm:p-2.5 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors lg:hidden"
                  >
                    <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </button>
                  
                  <button
                    onClick={handleDownload}
                    className="px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base"
                  >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-73px)]">
        {!image ? (
          // Upload Area
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
            <div className="text-center max-w-md w-full">
              <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 rounded-3xl flex items-center justify-center border-2 border-dashed border-indigo-300/50">
                <Upload className="w-12 h-12 sm:w-16 sm:h-16 text-indigo-300" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Upload Your Photo</h2>
              <p className="text-slate-300 mb-8 text-sm sm:text-base">
                Drag and drop your image here or click to browse. Supports JPG, PNG, and WEBP formats.
              </p>
              <label className="inline-block px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl font-semibold cursor-pointer transition-all duration-200 transform hover:scale-105 text-sm sm:text-base">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                Choose Photo
              </label>
            </div>
          </div>
        ) : (
          <>
            {/* Main Image Area */}
            <div className="flex-1 p-4 sm:p-6">
              <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 h-full">
                <div 
                  ref={containerRef}
                  className="relative bg-slate-800/20 rounded-xl overflow-hidden h-full min-h-[300px] sm:min-h-[400px]"
                >
                  {previewUrl && (
                    <div className="flex items-center justify-center p-4 h-full">
                      <div 
                        className="relative inline-block cursor-crosshair max-w-full max-h-full"
                        onMouseDown={handleCropStart}
                        onMouseMove={handleCropMove}
                        onMouseUp={handleCropEnd}
                        onMouseLeave={handleCropEnd}
                        onTouchStart={handleCropStart}
                        onTouchMove={handleCropMove}
                        onTouchEnd={handleCropEnd}
                      >
                        <img
                          ref={imageRef}
                          src={previewUrl}
                          alt="Preview"
                          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl select-none"
                          style={{
                            filter: isProcessing ? 'blur(1px)' : 'none',
                            transition: 'filter 0.1s ease',
                            maxHeight: 'calc(100vh - 200px)'
                          }}
                        />
                        {isCropping && isDragging && (
                          <div
                            className="absolute border-2 border-dashed border-yellow-400 bg-yellow-400/10 pointer-events-none"
                            style={{
                              left: `${cropArea.x}px`,
                              top: `${cropArea.y}px`,
                              width: `${cropArea.width}px`,
                              height: `${cropArea.height}px`,
                            }}
                          />
                        )}
                      </div>
                    </div>
                  )}
                  {isProcessing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-xl pointer-events-none">
                      <div className="flex items-center space-x-3 text-white">
                        <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                        <span className="text-sm sm:text-base">Processing...</span>
                      </div>
                    </div>
                  )}
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              </div>
            </div>

            {/* Controls Panel - Desktop */}
            <div className="hidden lg:block w-80 xl:w-96 p-6">
              <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden h-full">
                {/* Tab Navigation */}
                <div className="flex border-b border-slate-700/50">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          if (tab.id === 'crop') {
                            setIsCropping(true);
                          } else {
                            setIsCropping(false);
                          }
                        }}
                        className={`flex-1 p-3 text-center transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-indigo-500/20 to-purple-600/20 text-indigo-300 border-b-2 border-indigo-400'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                        }`}
                      >
                        <Icon className="w-4 h-4 mx-auto mb-1" />
                        <div className="text-xs font-medium">{tab.label}</div>
                      </button>
                    );
                  })}
                </div>

                <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                  {/* Controls Content */}
                  {activeTab === 'adjust' && (
                    <div className="space-y-6">
                      {adjustmentControls.map((control) => {
                        const Icon = control.icon;
                        return (
                          <div key={control.key} className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Icon className="w-4 h-4 text-indigo-400" />
                                <label className="text-sm font-medium text-white">
                                  {control.label}
                                </label>
                              </div>
                              <span className="text-xs text-slate-300 font-mono min-w-[3rem] text-right">
                                {adjustments[control.key] > 0 ? '+' : ''}{adjustments[control.key]}
                              </span>
                            </div>
                            <div className="relative">
                              <input
                                type="range"
                                min={control.min}
                                max={control.max}
                                step={control.step}
                                value={adjustments[control.key]}
                                onChange={(e) => handleAdjustmentChange(control.key, e.target.value)}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {activeTab === 'filters' && (
                    <div className="grid grid-cols-2 gap-3">
                      {filters.map((filter) => (
                        <button
                          key={filter.name}
                          onClick={() => setActiveFilter(filter.name)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                            activeFilter === filter.name
                              ? 'border-indigo-400 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 text-indigo-300'
                              : 'border-slate-600 hover:border-slate-500 text-slate-300 hover:bg-slate-700/30'
                          }`}
                        >
                          <div className="text-sm font-medium">{filter.label}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {activeTab === 'transform' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-white mb-4">Rotate</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => handleRotate('left')}
                            className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                          >
                            <RotateCcw className="w-4 h-4 text-white" />
                            <span className="text-white text-sm">Left</span>
                          </button>
                          <button
                            onClick={() => handleRotate('right')}
                            className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                          >
                            <RotateCw className="w-4 h-4 text-white" />
                            <span className="text-white text-sm">Right</span>
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white mb-4">Flip</label>
                        <div className="space-y-3">
                          <button
                            onClick={() => setFlipHorizontal(!flipHorizontal)}
                            className={`w-full p-3 rounded-xl transition-all duration-200 ${
                              flipHorizontal 
                                ? 'bg-gradient-to-r from-indigo-500/20 to-purple-600/20 text-indigo-300 border border-indigo-400' 
                                : 'bg-slate-700/50 hover:bg-slate-600/50 text-white'
                            }`}
                          >
                            Flip Horizontal
                          </button>
                          <button
                            onClick={() => setFlipVertical(!flipVertical)}
                            className={`w-full p-3 rounded-xl transition-all duration-200 ${
                              flipVertical 
                                ? 'bg-gradient-to-r from-indigo-500/20 to-purple-600/20 text-indigo-300 border border-indigo-400' 
                                : 'bg-slate-700/50 hover:bg-slate-600/50 text-white'
                            }`}
                          >
                            Flip Vertical
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'crop' && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <p className="text-slate-300 text-sm mb-6">
                          Click and drag on the image to select crop area
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => {
                              setIsCropping(false);
                              setCropArea({ x: 0, y: 0, width: 0, height: 0 });
                            }}
                            className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl transition-all duration-200 text-white text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleCropEnd}
                            disabled={cropArea.width < 10 || cropArea.height < 10}
                            className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200 text-white text-sm"
                          >
                            Apply Crop
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reset Button */}
                  <div className="mt-8 pt-6 border-t border-slate-700/50">
                    <button
                      onClick={() => {
                        resetAdjustments();
                        setImage(originalImage);
                        applyFilters();
                      }}
                      className="w-full p-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl transition-all duration-200 border border-red-400/50"
                    >
                      Reset All Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Controls Panel */}
            {showMobileControls && (
              <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-slate-800/95 backdrop-blur-md border-t border-slate-700/50">
                <div className="p-4 max-h-[70vh] overflow-y-auto">
                  {/* Mobile Tab Navigation */}
                  <div className="flex mb-6 bg-slate-700/30 rounded-xl p-1">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id);
                            if (tab.id === 'crop') {
                              setIsCropping(true);
                            } else {
                              setIsCropping(false);
                            }
                          }}
                          className={`flex-1 p-2 text-center transition-all duration-200 rounded-lg ${
                            activeTab === tab.id
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Icon className="w-4 h-4 mx-auto mb-1" />
                          <div className="text-xs font-medium">{tab.label}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Mobile Controls Content */}
                  {activeTab === 'adjust' && (
                    <div className="space-y-4">
                      {adjustmentControls.map((control) => {
                        const Icon = control.icon;
                        return (
                          <div key={control.key} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Icon className="w-4 h-4 text-indigo-400" />
                                <label className="text-sm font-medium text-white">
                                  {control.label}
                                </label>
                              </div>
                              <span className="text-xs text-slate-300 font-mono min-w-[3rem] text-right">
                                {adjustments[control.key] > 0 ? '+' : ''}{adjustments[control.key]}
                              </span>
                            </div>
                            <div className="relative">
                              <input
                                type="range"
                                min={control.min}
                                max={control.max}
                                step={control.step}
                                value={adjustments[control.key]}
                                onChange={(e) => handleAdjustmentChange(control.key, e.target.value)}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider touch-manipulation"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {activeTab === 'filters' && (
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      {filters.map((filter) => (
                        <button
                          key={filter.name}
                          onClick={() => setActiveFilter(filter.name)}
                          className={`p-3 rounded-xl border-2 transition-all duration-200 text-center ${
                            activeFilter === filter.name
                              ? 'border-indigo-400 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 text-indigo-300'
                              : 'border-slate-600 hover:border-slate-500 text-slate-300 hover:bg-slate-700/30'
                          }`}
                        >
                          <div className="text-sm font-medium">{filter.label}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {activeTab === 'transform' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-3">Rotate</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => handleRotate('left')}
                            className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                          >
                            <RotateCcw className="w-4 h-4 text-white" />
                            <span className="text-white text-sm">Left</span>
                          </button>
                          <button
                            onClick={() => handleRotate('right')}
                            className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                          >
                            <RotateCw className="w-4 h-4 text-white" />
                            <span className="text-white text-sm">Right</span>
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white mb-3">Flip</label>
                        <div className="space-y-2">
                          <button
                            onClick={() => setFlipHorizontal(!flipHorizontal)}
                            className={`w-full p-3 rounded-xl transition-all duration-200 ${
                              flipHorizontal 
                                ? 'bg-gradient-to-r from-indigo-500/20 to-purple-600/20 text-indigo-300 border border-indigo-400' 
                                : 'bg-slate-700/50 hover:bg-slate-600/50 text-white'
                            }`}
                          >
                            Flip Horizontal
                          </button>
                          <button
                            onClick={() => setFlipVertical(!flipVertical)}
                            className={`w-full p-3 rounded-xl transition-all duration-200 ${
                              flipVertical 
                                ? 'bg-gradient-to-r from-indigo-500/20 to-purple-600/20 text-indigo-300 border border-indigo-400' 
                                : 'bg-slate-700/50 hover:bg-slate-600/50 text-white'
                            }`}
                          >
                            Flip Vertical
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'crop' && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-slate-300 text-sm mb-4">
                          Tap and drag on the image to select crop area
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => {
                              setIsCropping(false);
                              setCropArea({ x: 0, y: 0, width: 0, height: 0 });
                            }}
                            className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl transition-all duration-200 text-white text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleCropEnd}
                            disabled={cropArea.width < 10 || cropArea.height < 10}
                            className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200 text-white text-sm"
                          >
                            Apply Crop
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mobile Reset Button */}
                  <div className="mt-6 pt-4 border-t border-slate-700/50">
                    <button
                      onClick={() => {
                        resetAdjustments();
                        setImage(originalImage);
                        applyFilters();
                      }}
                      className="w-full p-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl transition-all duration-200 border border-red-400/50"
                    >
                      Reset All Changes
                    </button>
                  </div>

                  {/* Close Button */}
                  <div className="mt-4">
                    <button
                      onClick={() => setShowMobileControls(false)}
                      className="w-full p-3 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Close Controls</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #9333ea 100%);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
          transition: all 0.2s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }
        
        .slider::-webkit-slider-thumb:active {
          transform: scale(1.15);
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #9333ea 100%);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
          transition: all 0.2s ease;
        }
        
        .slider::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }
        
        .slider::-webkit-slider-track {
          height: 8px;
          border-radius: 4px;
          background: linear-gradient(90deg, #334155 0%, #475569 50%, #334155 100%);
        }
        
        .slider::-moz-range-track {
          height: 8px;
          border-radius: 4px;
          background: linear-gradient(90deg, #334155 0%, #475569 50%, #334155 100%);
          border: none;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #6366f1, #9333ea);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
        }

        .touch-manipulation {
          touch-action: manipulation;
        }

        @supports (-webkit-touch-callout: none) {
          .slider {
            -webkit-appearance: none;
            height: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default SmartEditor;