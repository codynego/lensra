import React, { useState } from 'react';
import Sidebar from './Sidebar';
import GalleryContent from './GalleryContent'; 

const BRAND_COLOR = '#dd183b';

const PhotographerDashboard = () => {
  const [activeTab, setActiveTab] = useState('Bookings');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

//   const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => isMenuOpen && setIsMenuOpen(false);

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMenuOpen={isMenuOpen}
        closeMenu={closeMenu}
        BRAND_COLOR={BRAND_COLOR}
      />

      {/* Mobile Header and menu omitted for brevity; you can similarly split mobile menu into components */}

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 bg-gray-900 overflow-y-auto lg:ml-64 min-h-screen">
        <h1 className="text-3xl font-bold mb-6" style={{ color: BRAND_COLOR }}>
          {activeTab}
        </h1>

        {/* Here you render the main content depending on activeTab */}
        {activeTab === 'Bookings' && <div>Bookings content here</div>}
        {activeTab === 'Gallery' && <GalleryContent />}
        {/* ... other tabs */}
      </main>
    </div>
  );
};

export default PhotographerDashboard;
