import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  X, Download, Save, Copy, Palette, Scissors, Type, PenTool, 
  RotateCw, RotateCcw, Pipette, Sparkles, Aperture, Sliders, 
  Wand, Move, Undo, Redo, Sun, Moon, Contrast, 
  Eye, Zap, Filter, Image as ImageIcon, Settings
} from "lucide-react";

const SmartEditor = ({
  isOpen = false,
  onClose = () => console.log('Close'),
  image = {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    caption: "Sample Image"
  },
  onSave = (blob, saveAsNew) => console.log('Saved:', saveAsNew),
  theme = 'dark'
}) => {
  // State management
  const [activeTool, setActiveTool] = useState('tune');
  const [showToolPanel, setShowToolPanel] = useState(true);
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    highlights: 0,
    shadows: 0,
    temperature: 0,
    blur: 0,
    sepia: 0,
    grayscale: 0,
    hue: 0,
    vignette: 0,
    grain: 0
  });
  
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(32);
  const [textPosition, setTextPosition] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isSaving, setIsSaving] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Preset filters
  const [presets] = useState([
    { 
      name: 'Vivid', 
      icon: '🌈',
      filters: { brightness: 110, contrast: 115, saturation: 130, temperature: 5 }
    },
    { 
      name: 'Dramatic', 
      icon: '🎭',
      filters: { brightness: 95, contrast: 140, saturation: 120, shadows: -20, highlights: -10 }
    },
    { 
      name: 'Vintage', 
      icon: '📷',
      filters: { brightness: 105, sepia: 40, saturation: 80, temperature: 15, vignette: 30 }
    },
    { 
      name: 'B&W', 
      icon: '⚫',
      filters: { grayscale: 100, contrast: 120, brightness: 95 }
    },
    { 
      name: 'Portrait', 
      icon: '👤',
      filters: { brightness: 105, highlights: -15, shadows: 10, temperature: 8, saturation: 110 }
    },
    { 
      name: 'Cinematic', 
      icon: '🎬',
      filters: { contrast: 125, saturation: 90, temperature: -8, vignette: 25, shadows: -15 }
    }
  ]);

  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Tool definitions with modern icons and descriptions
  const tools = [
    { 
      id: 'tune', 
      name: 'Adjust', 
      icon: Sliders, 
      description: 'Fine-tune colors and exposure',
      category: 'basic'
    },
    { 
      id: 'filters', 
      name: 'Filters', 
      icon: Sparkles, 
      description: 'Apply creative filter presets',
      category: 'creative'
    },
    { 
      id: 'crop', 
      name: 'Crop', 
      icon: Scissors, 
      description: 'Crop and straighten',
      category: 'basic'
    },
    { 
      id: 'rotate', 
      name: 'Transform', 
      icon: RotateCw, 
      description: 'Rotate and flip image',
      category: 'basic'
    },
    { 
      id: 'selective', 
      name: 'Selective', 
      icon: Eye, 
      description: 'Local color adjustments',
      category: 'advanced'
    },
    { 
      id: 'text', 
      name: 'Text', 
      icon: Type, 
      description: 'Add text overlays',
      category: 'creative'
    },
    { 
      id: 'brush', 
      name: 'Brush', 
      icon: PenTool, 
      description: 'Paint with adjustments',
      category: 'advanced'
    },
    { 
      id: 'healing', 
      name: 'Healing', 
      icon: Zap, 
      description: 'Remove unwanted objects',
      category: 'advanced'
    }
  ];

  // Enhanced image loading with better error handling
  const loadImage = useCallback(() => {
    const img = imageRef.current;
    if (!img || !image.src) return;

    setImageLoaded(false);
    setImageError(false);

    const handleLoad = () => {
      console.log('Image loaded successfully');
      setImageLoaded(true);
      setImageError(false);
      initializeCanvas();
    };

    const handleError = (error) => {
      console.error('Image failed to load:', error);
      setImageError(true);
      setImageLoaded(false);
      
      // Try loading without crossOrigin
      if (img.crossOrigin) {
        img.crossOrigin = null;
        img.src = image.src; // Reload without CORS
      }
    };

    // Remove existing event listeners
    img.removeEventListener('load', handleLoad);
    img.removeEventListener('error', handleError);
    
    // Add new event listeners
    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);

    // Try loading with crossOrigin first (for canvas manipulation)
    try {
      img.crossOrigin = 'anonymous';
      img.src = image.src;
    } catch (error) {
      console.warn('Failed to load with crossOrigin, trying without:', error);
      img.crossOrigin = null;
      img.src = image.src;
    }
  }, [image.src]);

  // Initialize canvas
  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) {
      console.log('Canvas initialization failed - missing elements or image not ready');
      return;
    }

    try {
      const ctx = canvas.getContext('2d');
      const containerWidth = containerRef.current?.clientWidth || 800;
      const containerHeight = window.innerHeight * 0.6;
      const aspectRatio = img.naturalWidth / img.naturalHeight;

      let displayWidth, displayHeight;
      if (containerWidth / containerHeight > aspectRatio) {
        displayHeight = Math.min(containerHeight, 600);
        displayWidth = displayHeight * aspectRatio;
      } else {
        displayWidth = Math.min(containerWidth * 0.8, 800);
        displayHeight = displayWidth / aspectRatio;
      }

      canvas.width = displayWidth;
      canvas.height = displayHeight;
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;

      // Clear and draw the initial image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      setCropArea({ x: 0, y: 0, width: canvas.width, height: canvas.height });
      console.log('Canvas initialized successfully');
    } catch (error) {
      console.error('Canvas initialization error:', error);
      setImageError(true);
    }
  }, []);

  // Apply all edits with smooth processing
  const applyEdits = useCallback(async () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !img.complete || !imageLoaded) return;

    setIsProcessing(true);
    
    try {
      // Use requestAnimationFrame for smooth rendering
      requestAnimationFrame(() => {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Apply transformations
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);

        // Enhanced filter system
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
        ctx.restore();

        // Apply vignette effect
        if (filters.vignette > 0) {
          const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
          );
          gradient.addColorStop(0, 'rgba(0,0,0,0)');
          gradient.addColorStop(1, `rgba(0,0,0,${filters.vignette / 100})`);
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Draw text overlay
        if (textInput && textPosition) {
          ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
          ctx.fillStyle = textColor;
          ctx.strokeStyle = textColor === '#ffffff' ? '#000000' : '#ffffff';
          ctx.lineWidth = 3;
          ctx.textAlign = 'center';
          ctx.strokeText(textInput, textPosition.x, textPosition.y);
          ctx.fillText(textInput, textPosition.x, textPosition.y);
        }

        // Draw crop overlay with smooth animation
        if (activeTool === 'crop' && cropArea.width > 0 && cropArea.height > 0) {
          // Darken outside areas
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.fillRect(0, 0, canvas.width, cropArea.y);
          ctx.fillRect(0, cropArea.y + cropArea.height, canvas.width, canvas.height - cropArea.y - cropArea.height);
          ctx.fillRect(0, cropArea.y, cropArea.x, cropArea.height);
          ctx.fillRect(cropArea.x + cropArea.width, cropArea.y, canvas.width - cropArea.x - cropArea.width, cropArea.height);
          
          // Modern crop overlay
          ctx.strokeStyle = '#3B82F6';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
          ctx.setLineDash([]);
          
          // Corner handles
          const handleSize = 8;
          ctx.fillStyle = '#3B82F6';
          const corners = [
            [cropArea.x, cropArea.y],
            [cropArea.x + cropArea.width, cropArea.y],
            [cropArea.x, cropArea.y + cropArea.height],
            [cropArea.x + cropArea.width, cropArea.y + cropArea.height]
          ];
          corners.forEach(([x, y]) => {
            ctx.fillRect(x - handleSize/2, y - handleSize/2, handleSize, handleSize);
          });
        }

        setIsProcessing(false);
      });
    } catch (error) {
      console.error('Error applying edits:', error);
      setIsProcessing(false);
    }
  }, [filters, rotation, flipH, flipV, textInput, textPosition, fontSize, textColor, cropArea, activeTool, imageLoaded]);

  // Enhanced filter slider component
  const FilterSlider = ({ label, value, min, max, unit = '', onChange, step = 1, icon: Icon }) => (
    <div className="space-y-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-blue-400" />}
          <label className="text-sm font-medium text-gray-300">{label}</label>
        </div>
        <span className="text-sm text-blue-400 font-mono bg-blue-400/10 px-2 py-1 rounded">
          {value}{unit}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full appearance-none cursor-pointer slider"
        />
      </div>
    </div>
  );

  // Tool change handler with animation
  const handleToolChange = (toolId) => {
    setActiveTool(toolId);
    setShowToolPanel(false);
    setTimeout(() => setShowToolPanel(true), 150);
  };

  // Enhanced canvas interaction
  const handleCanvasInteraction = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (activeTool === 'text') {
      setTextPosition({ x, y });
    } else if (activeTool === 'crop' && e.type === 'mousedown') {
      setIsDragging(true);
      setDragStart({ x, y });
      setCropArea({ x, y, width: 0, height: 0 });
    }
  };

  const handleCanvasMove = (e) => {
    if (!isDragging || activeTool !== 'crop') return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    const width = x - dragStart.x;
    const height = y - dragStart.y;
    setCropArea({
      x: width < 0 ? x : dragStart.x,
      y: height < 0 ? y : dragStart.y,
      width: Math.abs(width),
      height: Math.abs(height)
    });
    applyEdits();
  };

  // Enhanced save functionality
  const savePhoto = async (saveAsNew) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
      
      if (saveAsNew) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `edited_${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      
      onSave(blob, saveAsNew);
      
      // Modern toast notification
      const toast = document.createElement('div');
      toast.className = 'fixed top-6 right-6 bg-green-500/90 backdrop-blur-sm text-white px-6 py-4 rounded-xl shadow-2xl z-50 animate-slide-in-right';
      toast.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            ✓
          </div>
          <span class="font-medium">${saveAsNew ? 'Exported successfully!' : 'Changes saved!'}</span>
        </div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.transform = 'translateX(400px)';
        toast.style.opacity = '0';
        setTimeout(() => document.body.removeChild(toast), 300);
      }, 3000);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Load image when component mounts or image changes
  useEffect(() => {
    if (isOpen && image.src) {
      loadImage();
    }
  }, [isOpen, image.src, loadImage]);

  // Apply edits when image is loaded or filters change
  useEffect(() => {
    if (imageLoaded && !imageError) {
      applyEdits();
    }
  }, [imageLoaded, imageError, applyEdits]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex z-50 overflow-hidden">
      {/* Modern Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-black/40 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 group"
            >
              <X className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <ImageIcon className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-white font-semibold text-lg">Smart Editor</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300">
              <Undo className="h-5 w-5 text-white" />
            </button>
            <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300">
              <Redo className="h-5 w-5 text-white" />
            </button>
            <div className="w-px h-8 bg-white/20 mx-2"></div>
            <button
              onClick={() => savePhoto(true)}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Side Navigation */}
      <div className="w-20 bg-black/60 backdrop-blur-xl border-r border-white/10 flex flex-col pt-20 pb-6">
        <div className="flex-1 flex flex-col gap-2 px-3">
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => handleToolChange(tool.id)}
              className={`p-4 rounded-2xl transition-all duration-300 group relative ${
                activeTool === tool.id 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg' 
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              title={tool.description}
            >
              <tool.icon className={`h-6 w-6 transition-all duration-300 ${
                activeTool === tool.id ? 'text-white scale-110' : 'text-gray-300 group-hover:text-white group-hover:scale-105'
              }`} />
              {activeTool === tool.id && (
                <div className="absolute -right-1 -top-1 w-3 h-3 bg-white rounded-full shadow-lg animate-pulse"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col pt-20">
        <div className="flex-1 flex items-center justify-center p-8 relative" ref={containerRef}>
          <img
            ref={imageRef}
            src={image.src}
            alt={image.caption || "Image"}
            className="hidden"
          />
          
          {imageError ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <X className="h-8 w-8 text-red-400" />
              </div>
              <div className="space-y-2">
                <p className="text-white text-lg font-medium">Failed to load image</p>
                <p className="text-gray-400 text-sm">The image couldn't be loaded. Please try a different image.</p>
                <button
                  onClick={loadImage}
                  className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : !imageLoaded ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin"></div>
              <p className="text-white/70 text-lg">Loading image...</p>
            </div>
          ) : (
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl transition-all duration-300"
                onMouseDown={handleCanvasInteraction}
                onMouseMove={handleCanvasMove}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                style={{ cursor: activeTool === 'crop' ? 'crosshair' : 'default' }}
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <div className="flex items-center gap-3 bg-black/50 px-4 py-2 rounded-full">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
                    <span className="text-white text-sm">Processing...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Control Panel */}
        {imageLoaded && !imageError && (
          <div className={`bg-black/60 backdrop-blur-xl border-t border-white/10 transition-all duration-500 ${showToolPanel ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="p-6 max-h-80 overflow-y-auto custom-scrollbar">
              
              {activeTool === 'tune' && (
                <div className="space-y-4">
                  <h3 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-blue-400" />
                    Adjust Image
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <FilterSlider icon={Sun} label="Brightness" value={filters.brightness} min={0} max={200} unit="%" onChange={(v) => setFilters(prev => ({ ...prev, brightness: v }))} />
                    <FilterSlider icon={Contrast} label="Contrast" value={filters.contrast} min={0} max={200} unit="%" onChange={(v) => setFilters(prev => ({ ...prev, contrast: v }))} />
                    <FilterSlider icon={Palette} label="Saturation" value={filters.saturation} min={0} max={200} unit="%" onChange={(v) => setFilters(prev => ({ ...prev, saturation: v }))} />
                    <FilterSlider label="Highlights" value={filters.highlights} min={-100} max={100} onChange={(v) => setFilters(prev => ({ ...prev, highlights: v }))} />
                    <FilterSlider label="Shadows" value={filters.shadows} min={-100} max={100} onChange={(v) => setFilters(prev => ({ ...prev, shadows: v }))} />
                    <FilterSlider label="Temperature" value={filters.temperature} min={-50} max={50} onChange={(v) => setFilters(prev => ({ ...prev, temperature: v }))} />
                  </div>
                </div>
              )}

              {activeTool === 'filters' && (
                <div className="space-y-6">
                  <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                    Creative Filters
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {presets.map(preset => (
                      <button
                        key={preset.name}
                        onClick={() => setFilters(prev => ({ ...prev, ...preset.filters }))}
                        className="group p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 border border-white/10 hover:border-purple-400/50"
                      >
                        <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
                          {preset.icon}
                        </div>
                        <div className="text-white text-sm font-medium">{preset.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTool === 'crop' && (
                <div className="space-y-6 text-center">
                  <h3 className="text-white font-semibold text-lg">Crop & Frame</h3>
                  <p className="text-gray-400">Drag to select the area you want to keep</p>
                  {cropArea.width > 0 && cropArea.height > 0 && (
                    <button className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-medium transition-all duration-300 shadow-lg">
                      Apply Crop
                    </button>
                  )}
                </div>
              )}

              {activeTool === 'rotate' && (
                <div className="space-y-6">
                  <h3 className="text-white font-semibold text-lg">Transform</h3>
                  <div className="flex flex-wrap gap-4 justify-center">
                    <button
                      onClick={() => setRotation(prev => prev + 90)}
                      className="flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300"
                    >
                      <RotateCw className="h-5 w-5 text-white" />
                      <span className="text-white">Rotate Right</span>
                    </button>
                    <button
                      onClick={() => setRotation(prev => prev - 90)}
                      className="flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300"
                    >
                      <RotateCcw className="h-5 w-5 text-white" />
                      <span className="text-white">Rotate Left</span>
                    </button>
                    <button
                      onClick={() => setFlipH(!flipH)}
                      className="flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300"
                    >
                      <Move className="h-5 w-5 text-white" />
                      <span className="text-white">Flip Horizontal</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTool === 'text' && (
                <div className="space-y-6">
                  <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                    <Type className="h-5 w-5 text-green-400" />
                    Add Text
                  </h3>
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Enter your text..."
                        className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-all duration-300"
                      />
                    </div>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-16 h-14 rounded-xl cursor-pointer bg-transparent"
                    />
                  </div>
                  <FilterSlider label="Font Size" value={fontSize} min={12} max={100} unit="px" onChange={setFontSize} />
                  <p className="text-gray-400 text-sm">Click on the image to place your text</p>
                </div>
              )}

              {activeTool === 'selective' && (
                <div className="space-y-6 text-center">
                  <h3 className="text-white font-semibold text-lg flex items-center gap-2 justify-center">
                    <Eye className="h-5 w-5 text-orange-400" />
                    Selective Adjustments
                  </h3>
                  <p className="text-gray-400">Click and drag on the image to apply local adjustments</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button className="p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300">
                      <Sun className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                      <span className="text-white text-sm">Brighten</span>
                    </button>
                    <button className="p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300">
                      <Moon className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                      <span className="text-white text-sm">Darken</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTool === 'brush' && (
                <div className="space-y-6 text-center">
                  <h3 className="text-white font-semibold text-lg flex items-center gap-2 justify-center">
                    <PenTool className="h-5 w-5 text-pink-400" />
                    Adjustment Brush
                  </h3>
                  <p className="text-gray-400">Paint adjustments directly onto your image</p>
                  <div className="space-y-4">
                    <FilterSlider label="Brush Size" value={50} min={10} max={200} unit="px" onChange={() => {}} />
                    <FilterSlider label="Brush Opacity" value={50} min={0} max={100} unit="%" onChange={() => {}} />
                  </div>
                </div>
              )}

              {activeTool === 'healing' && (
                <div className="space-y-6 text-center">
                  <h3 className="text-white font-semibold text-lg flex items-center gap-2 justify-center">
                    <Zap className="h-5 w-5 text-purple-400" />
                    Healing Tools
                  </h3>
                  <p className="text-gray-400">Remove unwanted objects and blemishes</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button className="p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300">
                      <Wand className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                      <span className="text-white text-sm">Spot Heal</span>
                    </button>
                    <button className="p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300">
                      <Filter className="h-6 w-6 text-green-400 mx-auto mb-2" />
                      <span className="text-white text-sm">Clone</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Save Actions */}
              <div className="flex gap-4 justify-center mt-8 pt-6 border-t border-white/10">
                <button
                  onClick={() => savePhoto(false)}
                  disabled={isSaving || imageError}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl"
                >
                  <Save className="h-5 w-5" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => savePhoto(true)}
                  disabled={isSaving || imageError}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-medium transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl"
                >
                  <Copy className="h-5 w-5" />
                  {isSaving ? 'Exporting...' : 'Export Copy'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom CSS Styles */}
      <style jsx>{`
        .slider {
          background: linear-gradient(to right, #3B82F6 0%, #8B5CF6 100%);
          outline: none;
          opacity: 0.8;
          transition: opacity 0.3s;
        }
        
        .slider:hover {
          opacity: 1;
        }
        
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3B82F6, #8B5CF6);
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          border: 2px solid white;
          transition: all 0.3s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3B82F6, #8B5CF6);
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          border: 2px solid white;
          transition: all 0.3s ease;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3B82F6, #8B5CF6);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563EB, #7C3AED);
        }
        
        @keyframes slide-in-right {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }
        
        .shimmer {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.1) 20%,
            rgba(255, 255, 255, 0.2) 60%,
            rgba(255, 255, 255, 0)
          );
          background-size: 200px 100%;
          animation: shimmer 2s infinite;
        }
        
        .glass-morphism {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .glow {
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
        }
        
        .glow:hover {
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  );
};

export default SmartEditor;