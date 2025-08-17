import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext'; // Adjust path to point to src/AuthContext.js
import Sidebar from './Sidebar';
import GalleryContent from './Gallery/GalleryContent';
import BookingManagement from './Booking/BookingManagement';
import ClientManagement from './Clients/ClientManagement';
import PhotographerSetup from './website/PhotographerSetup';
import Settings from './settings/Settings';
import AiToolSetup from './AiToolSetup';

const BRAND_COLOR = '#dd183b';

const PhotographerDashboard = () => {
  const [activeTab, setActiveTab] = useState('Bookings');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { authState, logout } = useAuth();
  const navigate = useNavigate();

  const closeMenu = () => isMenuOpen && setIsMenuOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMenuOpen={isMenuOpen}
        closeMenu={closeMenu}
        BRAND_COLOR={BRAND_COLOR}
      />

      <main className="flex-1 p-4 lg:p-8 bg-gray-900 overflow-y-auto lg:ml-64 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold" style={{ color: BRAND_COLOR }}>
            {activeTab}
          </h1>
          <button
            onClick={handleLogout}
            className="py-2 px-4 rounded text-white"
            style={{ backgroundColor: BRAND_COLOR, ':hover': { backgroundColor: '#b3122f' } }}
          >
            Logout
          </button>
        </div>

        {activeTab === 'Bookings' && <BookingManagement />}
        {activeTab === 'Gallery' && <GalleryContent />}
        {activeTab === 'Clients' && <ClientManagement />}
        {activeTab === 'Studio' && <PhotographerSetup />}
        {activeTab === 'AI Tools' && <AiToolSetup />}
        {activeTab === 'Settings' && <Settings />}
        {/* Add other components for different tabs as needed */}
      </main>
    </div>
  );
};

export default PhotographerDashboard;