import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import Sidebar from './Sidebar';
// import GalleryContent from './Gallery/GalleryContent';
import Gallery from './Gallery/Gallery';
import BookingManagement from './Booking/BookingManagement';
import ClientManagement from './Clients/ClientManagement';
import PhotographerSetup from './website/PhotographerSetup';
import Settings from './settings/Settings';
import AiToolsDashboard from './AiToolsDashboard';
import Messages from './Messages';
import { 
  Menu, 
  X, 
  Camera, 
  Calendar, 
  Users, 
  Settings as SettingsIconLucide, 
  Palette,
  Bot,
  LogOut,
  ChevronRight,
  Sun,
  Moon,
  MessageCircle
} from 'lucide-react';

const BRAND_COLOR = '#6366f1';

const PhotographerDashboard = () => {
  const [activeTab, setActiveTab] = useState('Bookings');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Theme state: light or dark
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.background = 'linear-gradient(to bottom right, #1F2937, #1E293B, #1F2937)';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.background = 'linear-gradient(to bottom right, #F1F5F9, #E2E8F0, #F1F5F9)';
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { id: 'Bookings', label: 'Bookings', icon: Calendar },
    { id: 'Messages', label: 'Messages', icon: MessageCircle },
    { id: 'Gallery', label: 'Gallery', icon: Camera },
    { id: 'Clients', label: 'Clients', icon: Users },
    { id: 'Studio', label: 'Studio Setup', icon: Palette },
    { id: 'AI Tools', label: 'AI Tools', icon: Bot },
    { id: 'Settings', label: 'Settings', icon: SettingsIconLucide },
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false);
  };

  if (!isAuthenticated || loading) {
    return <div className="flex items-center justify-center min-h-screen text-white">Loading...</div>;
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-72 ${theme === 'dark' ? 'bg-gray-800 border-r border-gray-700' : 'bg-white shadow-xl'} transform transition-transform duration-300 ease-in-out z-50
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className={`flex items-center justify-between p-6 ${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-slate-200'}`}>
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                <Camera size={20} />
              </div>
              <div>
                <h1 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Lensra</h1>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>Dashboard</p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={20} className={theme === 'dark' ? 'text-gray-400' : 'text-slate-600'} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200
                    ${isActive 
                      ? theme === 'dark' 
                        ? 'bg-indigo-900 text-indigo-300 border border-indigo-700' 
                        : 'bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100'
                      : theme === 'dark' 
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }
                  `}
                >
                  <IconComponent size={20} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <ChevronRight size={16} className="ml-auto" />}
                </button>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className={`p-4 ${theme === 'dark' ? 'border-t border-gray-700' : 'border-t border-slate-200'}`}>
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`w-full flex items-center space-x-3 p-3 rounded-xl ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-slate-50'} transition-colors`}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 text-left">
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {user?.username || 'User'}
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
                <ChevronRight 
                  size={16} 
                  className={`transition-transform ${theme === 'dark' ? 'text-gray-400' : 'text-slate-400'} ${showUserMenu ? 'rotate-90' : ''}`}
                />
              </button>

              {showUserMenu && (
                <div className={`absolute bottom-full left-0 right-0 mb-2 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'} rounded-xl shadow-lg border py-2`}>
                  <button
                    onClick={toggleTheme}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-slate-50 text-slate-700'} transition-colors`}
                  >
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    <span className="font-medium">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-red-50 text-red-600 transition-colors`}
                  >
                    <LogOut size={18} />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:ml-72">
        {/* Top Navigation Bar */}
        <header className={`sticky top-0 z-30 ${theme === 'dark' ? 'bg-gray-800/80 border-b border-gray-700' : 'bg-white/80 border-b border-slate-200/80'} backdrop-blur-md`}>
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Menu size={22} className={theme === 'dark' ? 'text-gray-300' : 'text-slate-700'} />
              </button>
              
              <div>
                <h2 className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {activeTab}
                </h2>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'} hidden sm:block`}>
                  Manage your {activeTab.toLowerCase()} efficiently
                </p>
              </div>
            </div>

            {/* Mobile User Menu */}
            <div className="lg:hidden relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold"
              >
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </button>

              {showUserMenu && (
                <div className={`absolute top-full right-0 mt-2 w-48 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'} rounded-xl shadow-lg border py-2`}>
                  <div className={`px-4 py-2 ${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-slate-200'}`}>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      {user?.username || 'User'}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-slate-50 text-slate-700'} transition-colors`}
                  >
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    <span className="font-medium">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-red-50 text-red-600 transition-colors"
                  >
                    <LogOut size={18} />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={`p-4 sm:p-6 ${theme === 'dark' ? 'bg-gray-850' : 'bg-slate-50'}`}>
          <div className="max-w-7xl mx-auto">
            {activeTab === 'Bookings' && <BookingManagement theme={theme} />}
            {activeTab === 'Gallery' && <Gallery theme={theme} />}
            {activeTab === 'Messages' && <Messages theme={theme} />}
            {activeTab === 'Clients' && <ClientManagement theme={theme} />}
            {activeTab === 'Studio' && <PhotographerSetup theme={theme} />}
            {activeTab === 'AI Tools' && <AiToolsDashboard theme={theme} />}
            {activeTab === 'Settings' && <Settings theme={theme} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PhotographerDashboard;