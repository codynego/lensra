import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { 
  DownloadIcon,
  XIcon,
  HeartIcon,
  FolderIcon,
  PhotographIcon,
  GlobeIcon,
  ShareIcon,
  EyeIcon
} from "@heroicons/react/outline";
import axios from "axios";

const SharedView = () => {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewType, setViewType] = useState(null); // 'gallery' or 'photo'
  const [showPreview, setShowPreview] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [addingToCollection, setAddingToCollection] = useState(false);
  const isAuthenticated = !!localStorage.getItem('accessToken');
  const isSharedView = true; // Since this is the SharedView component

  useEffect(() => {
    fetchSharedContent();
  }, [token]);

  const fetchSharedContent = async () => {
    try {
      setLoading(true);
      // Try gallery first
      try {
        const res = await axios.get(`http://lvh.me:8000/share/gallery/${token}/`);
        setData(res.data);
        setViewType('gallery');
      } catch (galleryErr) {
        // If gallery fails, try photo
        if (galleryErr.response?.status === 404) {
          const res = await axios.get(`http://lvh.me:8000/share/photo/${token}/`);
          setData(res.data);
          setViewType('photo');
        } else {
          throw galleryErr;
        }
      }
    } catch (err) {
      console.error("Error fetching shared content:", err);
      setError(err.response?.data?.detail || "Content not found or no longer available.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (item, filename) => {
    try {
      const response = await fetch(item.image);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading:", err);
      alert("Failed to download file.");
    }
  };

  const handleDownloadGallery = async () => {
    if (!data.photos || data.photos.length === 0) {
      alert("This gallery has no photos to download.");
      return;
    }

    for (let i = 0; i < data.photos.length; i++) {
      const photo = data.photos[i];
      const filename = photo.caption ? 
        `${data.title}_${i + 1}_${photo.caption}.jpg` : 
        `${data.title}_${i + 1}.jpg`;
      
      try {
        await handleDownload(photo, filename);
        // Add delay between downloads
        if (i < data.photos.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (err) {
        console.error(`Error downloading photo ${i + 1}:`, err);
      }
    }
    alert(`Started downloading ${data.photos.length} photos from "${data.title}"`);
  };

  const handleAddToCollection = async (item) => {
    if (!isAuthenticated) {
      alert("Please login to add items to your collection.");
      return;
    }

    setAddingToCollection(true);
    console.log(data)
    try {
      const token = localStorage.getItem('accessToken');
      const payload = viewType === 'gallery' ? 
        { gallery_id: data.id } : 
        { photo_id: data.id };

        console.log("Adding to collection with payload:", payload);
        await axios.post(
        'http://127.0.0.1:8000/api/gallery/add-to-collection/',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      alert(`${viewType === 'gallery' ? 'Gallery' : 'Photo'} added to your collection!`);
    } catch (err) {
        console.log("Error adding to collection:", err);
      console.error("Error adding to collection:", err);
      alert(err.response?.data?.detail || "Failed to add to collection.");
    } finally {
      setAddingToCollection(false);
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

  const getStatusIcon = (item) => {
    if (item.is_public) {
      return <GlobeIcon className="h-4 w-4 text-green-500" />;
    } else {
      return <ShareIcon className="h-4 w-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading shared content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-4">Content Not Available</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <a 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {viewType === 'gallery' ? (
              <FolderIcon className="h-8 w-8 text-blue-500" />
            ) : (
              <PhotographIcon className="h-8 w-8 text-green-500" />
            )}
            <div>
              <h1 className="text-xl font-bold">{data.title || data.caption || "Shared Content"}</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                {getStatusIcon(data)}
                <span>
                  {data.is_public ? "Public" : "Shared via link"} {viewType}
                </span>
                {viewType === 'gallery' && data.photos && (
                  <span>• {data.photos.length} photos</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleAddToCollection(data)}
              disabled={addingToCollection}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              title="Add to Collection"
            >
              {addingToCollection ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              ) : (
                <HeartIcon className="h-4 w-4 mr-2" />
              )}
              Add to Collection
            </button>
            
            {viewType === 'gallery' ? (
              <button
                onClick={handleDownloadGallery}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Download Gallery"
              >
                <DownloadIcon className="h-4 w-4 mr-2" />
                Download All
              </button>
            ) : (
              <button
                onClick={() => handleDownload(data, data.caption ? `${data.caption}.jpg` : `photo_${data.id}.jpg`)}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Download Photo"
              >
                <DownloadIcon className="h-4 w-4 mr-2" />
                Download
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4">
        {/* Description */}
        {data.description && (
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <p className="text-gray-300">{data.description}</p>
          </div>
        )}

        {viewType === 'photo' ? (
          /* Single Photo View */
          <div className="text-center">
            <div className="inline-block bg-gray-800 rounded-lg p-2 mb-4">
              <img
                src={data.image}
                alt={data.caption || "Shared photo"}
                className="max-w-full max-h-[70vh] object-contain rounded cursor-pointer"
                onClick={() => openPreview(data)}
              />
            </div>
            {data.caption && (
              <p className="text-gray-300 text-lg">{data.caption}</p>
            )}
          </div>
        ) : (
          /* Gallery View */
          <div>
            {/* Sub-galleries if any */}
            {data.sub_galleries && data.sub_galleries.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <FolderIcon className="h-5 w-5 mr-2" />
                  Sub-Galleries ({data.sub_galleries.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {data.sub_galleries.map((subGallery) => (
                    <div key={subGallery.id} className="bg-gray-800 rounded-lg p-4 text-center">
                      <FolderIcon className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                      <h3 className="font-medium truncate">{subGallery.title}</h3>
                      <p className="text-sm text-gray-400">
                        {subGallery.photos?.length || 0} photos
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Photos */}
            {data.photos && data.photos.length > 0 ? (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <PhotographIcon className="h-5 w-5 mr-2" />
                  Photos ({data.photos.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {data.photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <div 
                        className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105"
                        style={{ height: '200px' }}
                      >
                        <div className="w-full h-40 overflow-hidden">
                          <img
                            src={photo.image}
                            alt={photo.caption || "Photo"}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            onClick={() => openPreview(photo)}
                          />
                        </div>
                        <div className="p-2 h-16 flex flex-col justify-center">
                          <p className="text-sm truncate">
                            {photo.caption || "Untitled"}
                          </p>
                        </div>

                        {/* Download button overlay */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(photo, photo.caption ? `${photo.caption}.jpg` : `photo_${photo.id}.jpg`);
                            }}
                            className="p-2 bg-black bg-opacity-70 rounded-full hover:bg-opacity-90"
                            title="Download Photo"
                          >
                            <DownloadIcon className="h-4 w-4 text-white" />
                          </button>
                        </div>

                        {/* Preview button overlay */}
                        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openPreview(photo);
                            }}
                            className="p-2 bg-black bg-opacity-70 rounded-full hover:bg-opacity-90"
                            title="View Full Size"
                          >
                            <EyeIcon className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <PhotographIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">This gallery is empty.</p>
              </div>
            )}
          </div>
        )}

        {/* Login prompt for anonymous users viewing shared galleries */}
        {!isAuthenticated && isSharedView && (
          <div className="mt-8 text-center p-6 bg-gray-800 rounded-lg">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="text-lg font-semibold text-white mb-2">Want to save this gallery?</h3>
            <p className="text-gray-400 mb-4">Log in to add photos and galleries to your personal collection.</p>
            <button
              onClick={() => {
                // Store current location to return after login
                localStorage.setItem('returnAfterLogin', window.location.pathname);
                window.location.href = '/login';
              }}
              className="px-6 py-2 bg-[#dd183b] text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Log In to Save
            </button>
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
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 bg-gray-900 bg-opacity-80 rounded-full p-3 hover:bg-opacity-100 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200 z-10"
              onClick={closePreview}
            >
              <XIcon className="h-6 w-6 text-white" />
            </button>

            {/* Download Button */}
            <button
              className="absolute top-4 left-4 bg-gray-900 bg-opacity-80 rounded-full p-3 hover:bg-opacity-100 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200 z-10"
              onClick={() => handleDownload(selectedPhoto, selectedPhoto.caption ? `${selectedPhoto.caption}.jpg` : `photo_${selectedPhoto.id}.jpg`)}
            >
              <DownloadIcon className="h-6 w-6 text-white" />
            </button>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center max-h-[85vh] w-full">
              <img
                src={selectedPhoto.image}
                alt={selectedPhoto.caption || "Photo"}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </div>

            {/* Caption */}
            {selectedPhoto.caption && (
              <div className="mt-4 text-center max-w-4xl">
                <div className="text-white text-lg bg-black bg-opacity-50 px-6 py-3 rounded-lg">
                  {selectedPhoto.caption}
                </div>
              </div>
            )}

            {/* Navigation hint */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-gray-400 text-sm">
              Click anywhere outside the image to close
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedView;