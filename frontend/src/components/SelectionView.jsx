import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { X, ThumbsUp, ThumbsDown, Image as ImageIcon, CheckCircle, Info, Eye, Folder, ArrowLeft } from "lucide-react";
import { useApi } from "../useApi";
import axios from "axios";

const SelectionView = () => {
  const { token } = useParams();
  const { apiFetch } = useApi();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likedPhotos, setLikedPhotos] = useState(new Set());
  const [dislikedPhotos, setDislikedPhotos] = useState(new Set());
  const [showPreview, setShowPreview] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [currentView, setCurrentView] = useState('all');
  const [currentGallery, setCurrentGallery] = useState(null);
  const [imageLoading, setImageLoading] = useState({}); // Track individual image loading states

  // Mobile swipe states
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [swipeStartX, setSwipeStartX] = useState(0);
  const [swipeCurrentX, setSwipeCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeThreshold] = useState(100);

  const photoRef = useRef(null);

  useEffect(() => {
    fetchGalleryContent();
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [token]);

  const checkMobile = () => {
    setIsMobile(window.innerWidth <= 768);
  };



const fetchGalleryContent = async () => {
  try {
    setLoading(true);
    const response = await axios.get(`http://lvh.me:8000/gallery/public-selection/${token}/`);
    const responseData = response.data;

    console.log("Fetched gallery data:", responseData);
    setData(responseData);

    // Initialize image loading states for all photos, including sub-gallery photos
    const allPhotos = [
      ...(responseData.photos || []),
      ...(responseData.sub_galleries?.flatMap(g => g.photos || []) || []),
    ];

    setImageLoading(
      Object.fromEntries(allPhotos.map(photo => [photo.id, true]))
    );
  } catch (err) {
    console.error("Error fetching gallery:", err);
    setError(
      err.response?.data?.detail ||
      err.message ||
      "Gallery not found or no longer available."
    );
  } finally {
    setLoading(false);
  }
};

  const movePhotoToGallery = async (photoId, targetGalleryId) => {
    if (!targetGalleryId) {
      throw new Error("Target gallery ID is missing");
    }
    console.log("Moving photo:", photoId, "to gallery:", targetGalleryId);
    try {
      const response = await apiFetch(`/gallery/photo/move/`, {
        method: "POST",
        body: JSON.stringify({
          photo_id: photoId,
          target_gallery_id: targetGalleryId,
        }),
      });
      const responseData = await response.json();
      console.log("Returned data:", responseData);
      if (!response.ok) {
        throw new Error(responseData.detail || "Failed to move photo");
      }
      await fetchGalleryContent();
      return responseData;
    } catch (err) {
      console.error("Error moving photo:", err);
      throw err;
    }
  };

  const handleLikePhoto = async (photo) => {
    if (!data?.liked_sub_gallery_id) {
      console.error("liked_sub_gallery_id is undefined");
      alert("Cannot like photo: Liked gallery not available.");
      return;
    }
    try {
      setProcessing(true);
      setDislikedPhotos(prev => {
        const newSet = new Set(prev);
        newSet.delete(photo.id);
        return newSet;
      });
      setLikedPhotos(prev => new Set([...prev, photo.id]));
      await movePhotoToGallery(photo.id, data.liked_sub_gallery_id);
      if (isMobile && currentView === 'all') {
        handleNextPhoto();
      }
    } catch (err) {
      console.error("Error liking photo:", err);
      setLikedPhotos(prev => {
        const newSet = new Set(prev);
        newSet.delete(photo.id);
        return newSet;
      });
      alert("Failed to like photo. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDislikePhoto = async (photo) => {
    if (!data?.disliked_sub_gallery_id) {
      console.error("disliked_sub_gallery_id is undefined");
      alert("Cannot dislike photo: Disliked gallery not available.");
      return;
    }
    try {
      setProcessing(true);
      setLikedPhotos(prev => {
        const newSet = new Set(prev);
        newSet.delete(photo.id);
        return newSet;
      });
      setDislikedPhotos(prev => new Set([...prev, photo.id]));
      await movePhotoToGallery(photo.id, data.disliked_sub_gallery_id);
      if (isMobile && currentView === 'all') {
        handleNextPhoto();
      }
    } catch (err) {
      console.error("Error disliking photo:", err);
      setDislikedPhotos(prev => {
        const newSet = new Set(prev);
        newSet.delete(photo.id);
        return newSet;
      });
      alert("Failed to dislike photo. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleNextPhoto = () => {
    if (currentPhotoIndex < getCurrentPhotos().length - 1) {
      setCurrentPhotoIndex(prev => prev + 1);
    }
  };

  const handlePrevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(prev => prev - 1);
    }
  };

  const handleTouchStart = (e) => {
    if (!isMobile) return;
    setSwipeStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isMobile || !isDragging) return;
    setSwipeCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isMobile || !isDragging) return;
    const swipeDistance = swipeCurrentX - swipeStartX;
    const currentPhoto = getCurrentPhotos()[currentPhotoIndex];
    if (Math.abs(swipeDistance) > swipeThreshold && currentPhoto) {
      if (swipeDistance > 0) {
        handleLikePhoto(currentPhoto);
      } else {
        handleDislikePhoto(currentPhoto);
      }
    }
    setIsDragging(false);
    setSwipeStartX(0);
    setSwipeCurrentX(0);
  };

  const getCurrentPhotos = () => {
    if (!data) return [];

    if (currentView === 'liked') {
      const likedGallery = data.sub_galleries?.find(g => g.id === data.liked_sub_gallery_id);
      return likedGallery?.photos || [];
    } else if (currentView === 'disliked') {
      const dislikedGallery = data.sub_galleries?.find(g => g.id === data.disliked_sub_gallery_id);
      return dislikedGallery?.photos || [];
    } else if (currentView === 'all') {
      return data.photos?.filter(photo => !likedPhotos.has(photo.id) && !dislikedPhotos.has(photo.id)) || [];
    } else {
      // Custom sub-gallery
      const gallery = data.sub_galleries?.find(g => g.id === currentView);
      return gallery?.photos || [];
    }
  };

  const openPreview = (photo) => {
    setSelectedPhoto(photo);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setSelectedPhoto(null);
  };

  const openGallery = (galleryId, galleryData) => {
    setCurrentView(galleryId);
    setCurrentGallery(galleryData);
    setCurrentPhotoIndex(0);
  };

  const goBackToAll = () => {
    setCurrentView('all');
    setCurrentGallery(null);
    setCurrentPhotoIndex(0);
  };

  const handleDone = () => {
    setShowCompletionModal(true);
  };

  const handleImageLoad = (photoId) => {
    setImageLoading(prev => ({ ...prev, [photoId]: false }));
  };

  const handleImageError = (e, photoId) => {
    e.target.src = "/fallback-image.jpg";
    setImageLoading(prev => ({ ...prev, [photoId]: false }));
    console.error(`Failed to load image for photo ${photoId}`);
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your gallery...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-4">Gallery Not Available</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  const currentPhotos = getCurrentPhotos();
  const currentPhoto = currentPhotos[currentPhotoIndex];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {currentView !== 'all' && (
              <button
                onClick={goBackToAll}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold">
                {currentView === 'all' ? (data.name || "Photo Selection") :
                 currentView === 'liked' ? "Liked Photos" :
                 currentView === 'disliked' ? "Disliked Photos" :
                 currentGallery?.title || "Gallery"}
              </h1>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>
                  {currentView === 'all' ? "Swipe or click to rate photos" :
                   `${currentPhotos.length} photos`}
                </span>
                {currentView === 'all' && (
                  <span>
                    • {likedPhotos.size} liked • {dislikedPhotos.size} disliked
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Toggle Guide"
            >
              <Info className="h-4 w-4 mr-2" />
              Guide
            </button>

            <button
              onClick={handleDone}
              disabled={likedPhotos.size === 0}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Complete Selection"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Done ({likedPhotos.size})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Guide */}
        {showGuide && (
          <div className="bg-gradient-to-r from-pink-900/50 to-purple-900/50 border border-pink-700/50 rounded-xl p-6 mb-6">
            <div className="flex items-start space-x-4">
              <Info className="h-6 w-6 text-pink-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-pink-100 mb-3">
                  How to Rate Your Photos
                </h3>
                <div className="space-y-2 text-pink-200">
                  <p>• <strong>Mobile:</strong> Swipe right to like 👍, swipe left to dislike 👎</p>
                  <p>• <strong>Desktop:</strong> Click the 👍 or 👎 icons on photos</p>
                  <p>• <strong>View galleries:</strong> Click "Liked" or "Disliked" to see sorted photos</p>
                  <p>• <strong>Preview:</strong> Click photos to view them full-size</p>
                  <p>• Click <strong>"Done"</strong> when finished rating</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons for Gallery Views */}
        {currentView === 'all' && (
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => setCurrentView('liked')}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              Liked Photos ({data.sub_galleries?.find(g => g.id === data.liked_sub_gallery_id)?.photos?.length || 0})
            </button>
            <button
              onClick={() => setCurrentView('disliked')}
              className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              Disliked Photos ({data.sub_galleries?.find(g => g.id === data.disliked_sub_gallery_id)?.photos?.length || 0})
            </button>
          </div>
        )}

        {/* Mobile Swipe View */}
        {isMobile && currentView === 'all' && currentPhoto && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative w-full max-w-md">
              <div
                ref={photoRef}
                className={`relative bg-gray-800 rounded-xl overflow-hidden shadow-2xl transition-transform duration-300 ${
                  isDragging ? 'scale-105' : ''
                }`}
                style={{
                  transform: isDragging ? `translateX(${(swipeCurrentX - swipeStartX) * 0.1}px) rotate(${(swipeCurrentX - swipeStartX) * 0.02}deg)` : 'none',
                  aspectRatio: '4/3'
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {imageLoading[currentPhoto.id] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-pink-500 border-t-transparent"></div>
                  </div>
                )}
                <img
                  src={currentPhoto.image}
                  alt={currentPhoto.caption || "Photo"}
                  className="w-full h-full object-contain bg-gray-800"
                  onLoad={() => handleImageLoad(currentPhoto.id)}
                  onError={(e) => handleImageError(e, currentPhoto.id)}
                />
                
                {/* Swipe indicators */}
                {isDragging && (
                  <>
                    <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                      swipeCurrentX - swipeStartX > swipeThreshold ? 'opacity-100' : 'opacity-0'
                    }`}>
                      <div className="bg-green-500 text-white px-6 py-3 rounded-full font-bold text-xl">
                        LIKE
                      </div>
                    </div>
                    <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                      swipeCurrentX - swipeStartX < -swipeThreshold ? 'opacity-100' : 'opacity-0'
                    }`}>
                      <div className="bg-red-500 text-white px-6 py-3 rounded-full font-bold text-xl">
                        DISLIKE
                      </div>
                    </div>
                  </>
                )}

                {currentPhoto.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <p className="text-white font-medium">{currentPhoto.caption}</p>
                  </div>
                )}
              </div>

              {/* Action buttons for mobile */}
              <div className="flex justify-center space-x-8 mt-6">
                <button
                  onClick={() => handleDislikePhoto(currentPhoto)}
                  className="p-4 bg-red-500 hover:bg-red-600 rounded-full transition-colors shadow-lg"
                  disabled={processing || !data.disliked_sub_gallery_id}
                >
                  <ThumbsDown className="h-8 w-8 text-white" />
                </button>
                <button
                  onClick={() => handleLikePhoto(currentPhoto)}
                  className="p-4 bg-green-500 hover:bg-green-600 rounded-full transition-colors shadow-lg"
                  disabled={processing || !data.liked_sub_gallery_id}
                >
                  <ThumbsUp className="h-8 w-8 text-white" />
                </button>
              </div>

              {/* Photo counter */}
              <div className="text-center mt-4 text-gray-400">
                {currentPhotoIndex + 1} of {currentPhotos.length}
              </div>
            </div>
          </div>
        )}

        {/* Desktop Grid View */}
        {(!isMobile || currentView !== 'all') && currentPhotos.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <ImageIcon className="h-5 w-5 mr-2" />
              {currentView === 'all' ? 'Unrated Photos' : 
               currentView === 'liked' ? 'Liked Photos' :
               currentView === 'disliked' ? 'Disliked Photos' :
               'Gallery Photos'} ({currentPhotos.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {currentPhotos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <div
                    className="bg-gray-800 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 shadow-lg"
                    style={{ aspectRatio: "4/3" }}
                    onClick={() => openPreview(photo)}
                  >
                    <div className="w-full h-full relative">
                      {imageLoading[photo.id] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                          <div className="animate-spin rounded-full h-8 w-8 border-4 border-pink-500 border-t-transparent"></div>
                        </div>
                      )}
                      <img
                        src={photo.image}
                        alt={photo.caption || "Photo"}
                        className="w-full h-full object-contain bg-gray-800 transition-transform duration-300 group-hover:scale-110"
                        onLoad={() => handleImageLoad(photo.id)}
                        onError={(e) => handleImageError(e, photo.id)}
                      />
                    </div>
                    
                    {photo.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <p className="text-sm text-white truncate font-medium">{photo.caption}</p>
                      </div>
                    )}

                    {/* Action buttons overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex space-x-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDislikePhoto(photo);
                          }}
                          className={`p-3 rounded-full transition-all duration-200 ${
                            dislikedPhotos.has(photo.id)
                              ? "bg-red-500 text-white"
                              : "bg-gray-900 bg-opacity-80 text-gray-300 hover:bg-red-500 hover:text-white"
                          }`}
                          title="Dislike photo"
                          disabled={!data.disliked_sub_gallery_id}
                        >
                          <ThumbsDown className="h-5 w-5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openPreview(photo);
                          }}
                          className="p-3 bg-gray-900 bg-opacity-80 rounded-full hover:bg-blue-500 transition-all duration-200"
                          title="Preview photo"
                        >
                          <Eye className="h-5 w-5 text-white" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLikePhoto(photo);
                          }}
                          className={`p-3 rounded-full transition-all duration-200 ${
                            likedPhotos.has(photo.id)
                              ? "bg-green-500 text-white"
                              : "bg-gray-900 bg-opacity-80 text-gray-300 hover:bg-green-500 hover:text-white"
                          }`}
                          title="Like photo"
                          disabled={!data.liked_sub_gallery_id}
                        >
                          <ThumbsUp className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Status indicators */}
                    {likedPhotos.has(photo.id) && (
                      <div className="absolute top-3 right-3">
                        <div className="bg-green-500 text-white rounded-full p-1">
                          <ThumbsUp className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                    {dislikedPhotos.has(photo.id) && (
                      <div className="absolute top-3 right-3">
                        <div className="bg-red-500 text-white rounded-full p-1">
                          <ThumbsDown className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {currentPhotos.length === 0 && (
          <div className="text-center py-16">
            <ImageIcon className="h-20 w-20 text-gray-500 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              {currentView === 'all' ? 'All photos have been rated!' :
               currentView === 'liked' ? 'No liked photos yet' :
               currentView === 'disliked' ? 'No disliked photos yet' :
               'No photos in this gallery'}
            </h3>
            <p className="text-gray-500 mb-6">
              {currentView === 'all' ? 'Great job! You\'ve rated all available photos.' :
               'Start rating photos to see them here.'}
            </p>
            {currentView !== 'all' && (
              <button
                onClick={goBackToAll}
                className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors"
              >
                Back to All Photos
              </button>
            )}
          </div>
        )}
      </div>

      {/* Photo Preview Modal */}
      {showPreview && selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4"
          onClick={closePreview}
        >
          <div
            className="relative max-w-7xl w-full h-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 bg-gray-900 bg-opacity-80 rounded-full p-3 hover:bg-opacity-100 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200 z-10"
              onClick={closePreview}
            >
              <X className="h-6 w-6 text-white" />
            </button>

            <div className="absolute top-4 left-4 flex space-x-2 z-10">
              <button
                className={`rounded-full p-3 focus-outline-none focus:ring-2 focus:ring-white transition-all duration-200 ${
                  dislikedPhotos.has(selectedPhoto.id)
                    ? "bg-red-500 text-white"
                    : "bg-gray-900 bg-opacity-80 hover:bg-red-500 text-white"
                }`}
                onClick={() => handleDislikePhoto(selectedPhoto)}
                disabled={!data.disliked_sub_gallery_id}
              >
                <ThumbsDown className="h-6 w-6" />
              </button>
              <button
                className={`rounded-full p-3 focus-outline-none focus:ring-2 focus:ring-white transition-all duration-200 ${
                  likedPhotos.has(selectedPhoto.id)
                    ? "bg-green-500 text-white"
                    : "bg-gray-900 bg-opacity-80 hover:bg-green-500 text-white"
                }`}
                onClick={() => handleLikePhoto(selectedPhoto)}
                disabled={!data.liked_sub_gallery_id}
              >
                <ThumbsUp className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center max-h-[85vh] w-full relative">
              {imageLoading[selectedPhoto.id] && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
                </div>
              )}
              <img
                src={selectedPhoto.image}
                alt={selectedPhoto.caption || "Photo"}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                onLoad={() => handleImageLoad(selectedPhoto.id)}
                onError={(e) => handleImageError(e, selectedPhoto.id)}
              />
            </div>

            {selectedPhoto.caption && (
              <div className="mt-4 text-center max-w-4xl">
                <div className="text-white text-lg bg-black bg-opacity-50 px-6 py-3 rounded-lg">
                  {selectedPhoto.caption}
                </div>
              </div>
            )}

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-gray-400 text-sm">
              Click anywhere outside the image to close
            </div>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Selection Complete!</h2>
              <p className="text-gray-300">
                You've liked {data.sub_galleries?.find(g => g.id === data.liked_sub_gallery_id)?.photos?.length || 0} photo{data.sub_galleries?.find(g => g.id === data.liked_sub_gallery_id)?.photos?.length !== 1 ? "s" : ""} and 
                disliked {data.sub_galleries?.find(g => g.id === data.disliked_sub_gallery_id)?.photos?.length || 0} photo{data.sub_galleries?.find(g => g.id === data.disliked_sub_gallery_id)?.photos?.length !== 1 ? "s" : ""}.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowCompletionModal(false)}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Perfect! Close
              </button>
              <button
                onClick={() => setShowCompletionModal(false)}
                className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Continue Rating
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Processing Overlay */}
      {processing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-pink-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-white">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectionView;