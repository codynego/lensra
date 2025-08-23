import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Upload, RotateCcw, Contrast, Sun, Download } from 'lucide-react';

const SmartEditor = ({
  theme = 'light',
  onClose,
  image = null
}) => {
  const isDark = theme === 'dark';
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(image); // start from prop or null
  const [filter, setFilter] = useState('none');
  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Draw image on canvas
  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;

    if (!canvas || !img || !img.complete || img.naturalWidth === 0) {
      setError('Failed to initialize canvas.');
      return;
    }

    const ctx = canvas.getContext('2d');
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    const displayWidth = 600;
    const displayHeight = displayWidth / aspectRatio;

    canvas.width = displayWidth;
    canvas.height = displayHeight;

    ctx.filter = filter;
    ctx.drawImage(img, 0, 0, displayWidth, displayHeight);

    setImageLoaded(true);
  };

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setError('Please select a file.');
      return;
    }

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Please upload a valid image file (JPEG or PNG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage({ src: e.target.result, caption: file.name });
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const applyFilter = (newFilter) => {
    setFilter(newFilter);
    initializeCanvas();
  };

  const resetImage = () => {
    setFilter('none');
    initializeCanvas();
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  // Redraw when filter changes
  useEffect(() => {
    if (selectedImage && imageRef.current && imageLoaded) {
      initializeCanvas();
    }
  }, [filter]);

  return (
    <div
      className={`rounded-xl p-6 ${
        isDark
          ? 'bg-gray-800/60 backdrop-blur-sm border border-gray-700/50'
          : 'bg-white/60 backdrop-blur-sm border border-gray-200/50'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-pink-500 flex items-center justify-center">
            <ImageIcon className="h-4 w-4 text-white" />
          </div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Smart Editor
          </h2>
        </div>
        <button
          onClick={onClose}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isDark
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          Back to Dashboard
        </button>
      </div>

      {/* Upload / Canvas area */}
      <div
        className={`h-96 rounded-lg border-2 border-dashed ${
          isDark ? 'border-gray-600' : 'border-gray-300'
        } flex items-center justify-center`}
      >
        <input
          type="file"
          accept="image/jpeg,image/png"
          ref={fileInputRef}
          className="hidden"
          onChange={handleImageUpload}
        />

        {/* No image yet → show upload button */}
        {!selectedImage ? (
          <button
            onClick={handleUploadClick}
            className="flex flex-col items-center gap-4 p-6 rounded-lg bg-gray-200/50 hover:bg-gray-300/50 text-gray-600"
          >
            <Upload className="w-16 h-16 text-teal-600" />
            <p className="text-lg">Upload an image to start editing</p>
          </button>
        ) : (
          <div className="text-center">
            <canvas ref={canvasRef} className="max-h-80 object-contain rounded-lg" />
            <img
              ref={imageRef}
              src={selectedImage.src}
              alt={selectedImage.caption || 'Uploaded Image'}
              className="hidden"
              onLoad={initializeCanvas}
            />
          </div>
        )}
      </div>

      {/* Toolbar only appears if an image is loaded */}
      {selectedImage && imageLoaded && (
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <button onClick={resetImage} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">
            <RotateCcw size={16} /> Reset
          </button>
          <button onClick={() => applyFilter('grayscale(100%)')} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">
            <Contrast size={16} /> Grayscale
          </button>
          <button onClick={() => applyFilter('sepia(100%)')} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">
            <Sun size={16} /> Sepia
          </button>
          <button onClick={downloadImage} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600">
            <Download size={16} /> Download
          </button>
        </div>
      )}

      {/* Error messages */}
      {error && (
        <p className="mt-4 text-center text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
};

export default SmartEditor;
