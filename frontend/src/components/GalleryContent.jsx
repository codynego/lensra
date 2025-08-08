import React, { useState, useEffect } from 'react';

const BRAND_COLOR = '#dd183b';

const GalleryContent = () => {
  const [galleries, setGalleries] = useState([]);
  const [newGalleryTitle, setNewGalleryTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/gallery/galleries/', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch galleries');
      const data = await res.json();
      setGalleries(data.results || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateGallery = async () => {
    if (!newGalleryTitle.trim()) {
      setError('Gallery title cannot be empty.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/gallery/galleries/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newGalleryTitle }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Failed to create gallery.');
      }

      setGalleries((prev) => [...prev, data]);
      setNewGalleryTitle('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 border-white">
        <input
          type="text"
          placeholder="New gallery title"
          value={newGalleryTitle}
          onChange={(e) => setNewGalleryTitle(e.target.value)}
          className="p-2 rounded text-white w-full max-w-md border-white"
          disabled={loading}
        />
        <button
          onClick={handleCreateGallery}
          disabled={loading}
          className={`ml-2 py-2 px-4 rounded text-white ${
            loading ? 'bg-gray-600' : 'bg-[#dd183b] hover:bg-red-700'
          }`}
        >
          {loading ? 'Creating...' : 'Create Gallery'}
        </button>
      </div>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {galleries.length === 0 ? (
        <p className="text-gray-400">No galleries found.</p>
      ) : (
        <ul className="grid grid-cols-3 lg:grid-cols-4 gap-4">
          {galleries.map((gallery) => (
            <li
              key={gallery.id}
              className="p-4 bg-gray-800 rounded shadow flex flex-col justify-between"
            >
              <span className="text-white font-semibold mb-2">{gallery.title}</span>
              {/* Add edit/delete buttons or thumbnails here */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GalleryContent;
