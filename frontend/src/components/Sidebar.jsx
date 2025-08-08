import React from 'react';
import BookingSidebar from './BookingSidebar';
import GallerySidebar from './GallerySidebar';
// import other sidebars as needed

const Sidebar = ({ activeTab, setActiveTab, isMenuOpen, closeMenu, BRAND_COLOR }) => {
  // Common menu items for main navigation to switch tabs
  const mainMenu = [
    { label: 'Bookings' },
    { label: 'Clients' },
    { label: 'Website / Studio' },
    { label: 'Gallery' },
    { label: 'Settings' },
    { label: 'Profile' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-gray-800 p-6 shadow-lg fixed h-screen">
      <div className="mb-10">
        <h2 className="text-3xl font-extrabold cursor-default" style={{ color: BRAND_COLOR }}>
          Lensra
        </h2>
      </div>

      {/* Main navigation buttons */}
      <nav className="flex flex-col space-y-2 mb-6">
        {mainMenu.map(({ label }) => (
          <button
            key={label}
            onClick={() => setActiveTab(label)}
            className={`text-left py-3 px-4 rounded-lg font-semibold transition-colors duration-200 w-full ${
              activeTab === label ? 'text-white' : 'hover:bg-gray-700 text-gray-300'
            }`}
            style={activeTab === label ? { backgroundColor: BRAND_COLOR } : {}}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Render sub-sidebar based on active tab */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'Bookings' && <BookingSidebar />}
        {activeTab === 'Gallery' && <GallerySidebar />}
        {/* add other sidebars here */}
      </div>

      <div className="mt-auto text-center text-gray-400 text-sm">
        Signed in as <br />
        <strong>Photographer</strong>
      </div>
    </aside>
  );
};

export default Sidebar;
