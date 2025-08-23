import React, { useState, useRef } from 'react';
import { Scissors, Upload, X } from 'lucide-react';
import { useAuth } from '../AuthContext';

const BackgroundRemoval = ({ theme = 'light', onClose }) => {
  const isDark = theme === 'dark';
  const { apiFetch, authState, upgradePrompt } = useAuth();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResultUrl(null);
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
      setPreviewUrl(URL.createObjectURL(droppedFile));
      setResultUrl(null);
      setError(null);
    } else {
      setError('Please drop a valid image file (PNG, JPEG)');
    }
  };

  const handleRemoveImage = () => {
    setFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleProcessImage = async () => {
    if (!authState.isAuthenticated) {
      setError('Please log in to process images.');
      return;
    }
    if (!file) {
      setError('Please select an image first.');
      return;
    }
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await apiFetch('/aitools/background-remove/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('API response:', data);
      if (response.ok) {
        setResultUrl(data.output_image);
      } else {
        setError(data.error || data.detail || 'Failed to process image.');
      }
    } catch (err) {
      console.error('API error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`rounded-xl p-6 ${
        isDark
          ? 'bg-slate-800/80 backdrop-blur-sm border border-slate-700/50'
          : 'bg-slate-50/80 backdrop-blur-sm border border-slate-200/50'
      } max-w-4xl mx-auto`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Scissors className="h-4 w-4 text-white" />
          </div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Background Removal
          </h2>
        </div>
        <button
          onClick={onClose}
          className={`px-4 py-2 rounded-lg transition-colors font-medium ${
            isDark
              ? 'bg-slate-700 hover:bg-slate-600 text-white'
              : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
          }`}
        >
          Back to Dashboard
        </button>
      </div>

      {/* Error or Upgrade Prompt */}
      {(error || upgradePrompt?.message) && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
          {upgradePrompt?.message || error}
        </div>
      )}

      {/* Drag and Drop / File Input */}
      <div
        className={`relative h-64 rounded-lg border-2 border-dashed ${
          isDark ? 'border-slate-600' : 'border-slate-300'
        } flex items-center justify-center mb-6 transition-all duration-200 ${
          isDragging ? 'bg-indigo-500/10 border-indigo-500' : ''
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {!previewUrl ? (
          <div className="text-center">
            <Upload className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
            <p className={`text-lg ${isDark ? 'text-white' : 'text-slate-600'}`}>
              Drag and drop an image or{' '}
              <label
                className={`underline cursor-pointer ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'}`}
              >
                browse
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
              </label>
            </p>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-contain rounded-lg"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-1 bg-red-500/80 rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Process Button */}
      {previewUrl && (
        <button
          onClick={handleProcessImage}
          disabled={loading || !authState.isAuthenticated}
          className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
            loading || !authState.isAuthenticated
              ? 'bg-slate-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-indigo-500/30'
          }`}
        >
          {loading ? 'Processing...' : 'Remove Background'}
        </button>
      )}

      {/* Result */}
      {resultUrl && (
        <div className="mt-6">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-4`}>
            Processed Image
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-600'} mb-2`}>Original</p>
              <img
                src={previewUrl}
                alt="Original"
                className="w-full h-64 object-contain rounded-lg border ${isDark ? 'border-slate-600' : 'border-slate-200'}"
              />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-600'} mb-2`}>Background Removed</p>
              <img
                src={resultUrl}
                alt="Processed"
                className="w-full h-64 object-contain rounded-lg border ${isDark ? 'border-slate-600' : 'border-slate-200'}"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundRemoval;