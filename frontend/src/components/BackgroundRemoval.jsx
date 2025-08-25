import { useState, useEffect, useRef } from 'react';
import { Scissors, Upload, X, Download, Sparkles, FileImage } from 'lucide-react';
import { useAuth } from '../AuthContext';

const BackgroundRemoval = ({ theme = 'dark', onClose, sparksRemaining }) => {
  const isDark = theme === 'dark';
  const { apiFetch, authState, upgradePrompt } = useAuth();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const fileInputRef = useRef(null);

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > maxFileSize) {
        setError({ message: 'Image size exceeds 10MB limit.', action: null, url: null });
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResultUrl(null);
      setError(null);
      setIsProcessed(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      if (droppedFile.size > maxFileSize) {
        setError({ message: 'Image size exceeds 10MB limit.', action: null, url: null });
        return;
      }
      setFile(droppedFile);
      setPreviewUrl(URL.createObjectURL(droppedFile));
      setResultUrl(null);
      setError(null);
      setIsProcessed(false);
    } else {
      setError({ message: 'Please drop a valid image file (PNG, JPEG, WebP).', action: null, url: null });
    }
  };

  const handleRemoveImage = () => {
    setFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
    setError(null);
    setIsProcessed(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProcessImage = async () => {
    if (!authState.isAuthenticated) {
      setError({ message: 'Please log in to process images.', action: null, url: null });
      return;
    }
    if (!file) {
      setError({ message: 'Please select an image first.', action: null, url: null });
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
        if (data.output_image && (data.output_image.startsWith('http://') || data.output_image.startsWith('https://'))) {
          setResultUrl(data.output_image);
          setIsProcessed(true);
        } else {
          setError({ message: 'Invalid image URL received from server.', action: null, url: null });
        }
      } else {
        if (response.status === 400 || response.status === 402) {
          setError({
            message: data.detail || 'Insufficient sparks to perform this task.',
            action: data.action || 'Please purchase more sparks or upgrade your plan.',
            url: data.url || 'https://x.ai/subscriptions',
          });
        } else if (response.status === 403) {
          setError({
            message: data.detail || 'No active subscription found.',
            action: data.action || 'Please subscribe to use this feature.',
            url: data.url || 'https://x.ai/subscriptions',
          });
        } else {
          setError({ message: data.detail || 'Failed to process image.', action: null, url: null });
        }
      }
    } catch (err) {
      console.error('API error:', err);
      setError({ message: 'Network error. Please try again.', action: null, url: null });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!resultUrl) {
      setError({ message: 'No image available to download.', action: null, url: null });
      return;
    }

    try {
      const response = await fetch(resultUrl, {
        method: 'GET',
        headers: { 'Accept': 'image/png' },
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'lensra_bgremoval.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err.message);
      setError({ message: 'An error occurred while downloading the image. Please try again.', action: null, url: null });
    }
  };

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 lg:p-8 transition-all duration-500 ${
        isDark
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
          : 'bg-gradient-to-br from-slate-50 via-white to-slate-50'
      }`}
    >
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse ${
            isDark ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-blue-300 to-purple-300'
          }`}
        />
        <div
          className={`absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-20 animate-pulse ${
            isDark ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gradient-to-r from-pink-300 to-orange-300'
          }`}
          style={{ animationDelay: '1s' }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                <Scissors className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 opacity-20 blur animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm sm:text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Lensra Background Removal
              </h1>
              <p className={`text-sm sm:text-base mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Remove backgrounds with AI precision
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              isDark
                ? 'bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-700/50 backdrop-blur-sm'
                : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200/50 backdrop-blur-sm shadow-lg'
            }`}
          >
            Back to Dashboard
          </button>
        </div>

        {sparksRemaining === 0 && !error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm">
            <p className="text-red-400 text-sm font-medium">No sparks available.</p>
            <p className="text-slate-300 text-sm mt-2">
              Please purchase more sparks or upgrade your plan.{' '}
              <a
                href="https://x.ai/subscriptions"
                className="text-indigo-400 underline hover:text-indigo-300"
                aria-label="Upgrade your plan to get more sparks"
              >
                Click here to get more sparks
              </a>
            </p>
          </div>
        )}

        {sparksRemaining !== null && sparksRemaining > 0 && sparksRemaining < 5 && !error && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-sm">
            <p className="text-amber-400 text-sm font-medium">Low sparks: {sparksRemaining} remaining.</p>
            <p className="text-slate-300 text-sm mt-2">
              Purchase more sparks to continue using AI tools.{' '}
              <a
                href="https://x.ai/subscriptions"
                className="text-indigo-400 underline hover:text-indigo-300"
                aria-label="Purchase more sparks"
              >
                Get more sparks
              </a>
            </p>
          </div>
        )}

        {(error || upgradePrompt?.message) && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm">
            <p className="text-red-400 text-sm font-medium">{error?.message || upgradePrompt?.message}</p>
            {(error?.action || upgradePrompt?.action) && (
              <p className="text-slate-300 text-sm mt-2">
                {error?.action || upgradePrompt?.action}{' '}
                {(error?.url || upgradePrompt?.url) && (
                  <a
                    href={error?.url || upgradePrompt?.url}
                    className="text-indigo-400 underline hover:text-indigo-300"
                    aria-label="Upgrade your plan to get more sparks"
                  >
                    Click here to get more sparks
                  </a>
                )}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Upload Image
            </h2>
            <div
              className={`relative group transition-all duration-500 ease-out ${
                isDragging ? 'transform scale-105' : ''
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <div
                className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-500 ${
                  isDragging
                    ? 'border-indigo-400 bg-indigo-500/5'
                    : isDark
                    ? 'border-slate-700 hover:border-slate-600 bg-slate-800/40'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/40'
                } backdrop-blur-sm`}
              >
                {!previewUrl ? (
                  <div className="p-12 text-center">
                    <div
                      className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                        isDragging
                          ? 'bg-indigo-500 text-white transform scale-110'
                          : isDark
                          ? 'bg-slate-700 text-slate-300 group-hover:bg-slate-600'
                          : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'
                      }`}
                    >
                      <Upload className={`w-8 h-8 transition-transform duration-500 ${isDragging ? 'transform scale-110' : ''}`} />
                    </div>
                    <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Drop your image here
                    </h3>
                    <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Supports PNG, JPEG, WebP up to 10MB
                    </p>
                    <label
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                    >
                      <FileImage className="w-4 h-4 mr-2" />
                      Browse Files
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="relative group">
                    <div className="aspect-square max-h-96 overflow-hidden">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-4 right-4 p-2 bg-red-500/80 hover:bg-red-600 backdrop-blur-sm rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {previewUrl && !isProcessed && (
              <button
                onClick={handleProcessImage}
                disabled={loading || !authState.isAuthenticated || sparksRemaining === 0}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-500 transform hover:scale-105 active:scale-95 ${
                  loading || !authState.isAuthenticated || sparksRemaining === 0
                    ? 'bg-slate-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-600 hover:via-purple-700 hover:to-pink-700 text-white shadow-2xl hover:shadow-indigo-500/30 animate-pulse'
                }`}
                style={{ animationDuration: '3s' }}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing Magic...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <Sparkles className="w-5 h-5" />
                    Remove Background
                  </div>
                )}
              </button>
            )}
          </div>

          <div className="space-y-6">
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Result
            </h2>
            {!resultUrl ? (
              <div
                className={`rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-500 ${
                  isDark ? 'border-slate-700 bg-slate-800/20' : 'border-slate-300 bg-slate-50/20'
                } backdrop-blur-sm`}
              >
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                    isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <Scissors className="w-8 h-8" />
                </div>
                <p className={`text-lg font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Processed image will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative group overflow-hidden rounded-2xl">
                  <div className="aspect-square max-h-96 overflow-hidden">
                    <img
                      src={resultUrl}
                      alt="Processed"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      style={{
                        background:
                          'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
                        backgroundSize: '16px 16px',
                        backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <button
                  onClick={handleDownload}
                  disabled={!resultUrl}
                  className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                >
                  <Download className="w-5 h-5" />
                  Download Result
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackgroundRemoval;