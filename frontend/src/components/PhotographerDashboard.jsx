import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import Sidebar from './Sidebar';
import GalleryContent from './Gallery/GalleryContent';
import BookingManagement from './Booking/BookingManagement';
import ClientManagement from './Clients/ClientManagement';
import PhotographerSetup from './website/PhotographerSetup';
import Settings from './settings/Settings';
import AiToolSetup from './AiToolSetup';
import { Menu } from 'lucide-react';

const BRAND_COLOR = '#6366f1';

const PhotographerDashboard = () => {
  const [activeTab, setActiveTab] = useState('Bookings');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { authState, logout } = useAuth();
  const navigate = useNavigate();

  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900 text-white">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMenu}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-800/80 backdrop-blur-sm text-white p-3 rounded-xl shadow-lg border border-gray-700/50 hover:bg-gray-700 transition-all duration-200"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {isMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={closeMenu}
        />
      )}

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMenuOpen={isMenuOpen}
        closeMenu={closeMenu}
        toggleMenu={toggleMenu}
        BRAND_COLOR={BRAND_COLOR}
      />

      <main className={`
        flex-1 p-2 lg:p-2 bg-transparent overflow-y-auto 
        transition-all duration-300
        min-h-screen mt-6 lg:mt-0
      `}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {activeTab}
          </h1>
          <button
            onClick={handleLogout}
            className="py-2 px-6 rounded-xl text-white font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
          >
            Logout
          </button>
        </div>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/30 backdrop-blur-sm">
          {activeTab === 'Bookings' && <BookingManagement />}
          {activeTab === 'Gallery' && <GalleryContent />}
          {activeTab === 'Clients' && <ClientManagement />}
          {activeTab === 'Studio' && <PhotographerSetup />}
          {activeTab === 'AI Tools' && <AiToolSetup />}
          {activeTab === 'Settings' && <Settings />}
        </div>
      </main>
    </div>
  );
};

export default PhotographerDashboard;