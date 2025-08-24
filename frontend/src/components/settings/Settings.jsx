import React, { useState } from "react";
import { 
  Calendar, 
  CreditCard, 
  Image, 
  Bell, 
  User, 
  Menu, 
  X,
  ArrowRight
} from "lucide-react";
import BookingSettingsTab from "./BookingSettingsTab";
import PaymentSettingsTab from "./PaymentSettingsTab";
import GallerySettingsTab from "./GallerySettingsTab";
import NotificationSettingsTab from "./NotificationSettingsTab";
import AccountSettingsTab from "./AccountSettingsTab";
import UsageComponent from "./UsageComponent";

export default function Settings({ theme = "dark" }) {
  const [activeTab, setActiveTab] = useState("booking");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = [
    { id: "booking", label: "Booking Settings", icon: Calendar, color: "from-blue-500 to-cyan-500" },
    { id: "payment", label: "Payment Settings", icon: CreditCard, color: "from-green-500 to-emerald-500" },
    { id: "usage", label: "Usage", icon: CreditCard, color: "from-teal-500 to-cyan-500" },
    { id: "gallery", label: "Gallery Settings", icon: Image, color: "from-orange-500 to-red-500" },
    { id: "notifications", label: "Notifications", icon: Bell, color: "from-yellow-500 to-orange-500" },
    { id: "account", label: "Account Settings", icon: User, color: "from-indigo-500 to-purple-500" }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "booking": return <BookingSettingsTab theme={theme}/>;
      case "payment": return <PaymentSettingsTab theme={theme}/>;
      case "gallery": return <GallerySettingsTab theme={theme}/>;
      case "usage": return <UsageComponent theme={theme} />;
      case "notifications": return <NotificationSettingsTab theme={theme}/>;
      case "account": return <AccountSettingsTab theme={theme}/>;
      default: return null;
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950' 
        : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
    }`}>
      {/* Animated background effects (visible only in dark mode) */}
      {theme === 'dark' && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-3/4 -right-4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500" />
        </div>
      )}

      {/* Mobile Header */}
      <div className={`lg:hidden sticky top-0 z-50 ${
        theme === 'dark' 
          ? 'bg-slate-900/80 backdrop-blur-2xl border-b border-slate-700/60' 
          : 'bg-white/80 backdrop-blur-lg border-b border-gray-200/50'
      }`}>
        <div className="flex items-center justify-between p-4">
          <h1 className={`text-xl sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r ${
            theme === 'dark' ? 'from-indigo-400 to-purple-400' : 'from-indigo-600 to-purple-600'
          }`}>
            Settings
          </h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-2 rounded-xl transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600/50 backdrop-blur-xl'
                : 'bg-white/50 border-gray-200/50 hover:bg-white/70 hover:border-gray-300/50'
            }`}
          >
            {isMobileMenuOpen ? (
              <X className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`} />
            ) : (
              <Menu className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`} />
            )}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className={`absolute top-full left-0 right-0 border-b shadow-xl ${
            theme === 'dark' 
              ? 'bg-slate-900/95 backdrop-blur-2xl border-slate-700/60' 
              : 'bg-white/95 backdrop-blur-lg border-gray-200/50'
          }`}>
            <div className="p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 ${
                      isActive 
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                        : theme === 'dark'
                          ? 'bg-slate-800/60 text-slate-300 hover:bg-slate-800/80 border-slate-700/50 hover:border-slate-600/50 backdrop-blur-xl'
                          : 'bg-white/50 text-gray-700 hover:bg-white/70 border-gray-200/50 hover:border-gray-300/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`} />
                      <span className="font-medium text-sm sm:text-base">{tab.label}</span>
                    </div>
                    <ArrowRight className={`w-4 h-4 ${isActive ? 'text-white' : theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="lg:flex lg:h-screen relative z-10">
        {/* Desktop Sidebar */}
        <div className={`hidden lg:flex lg:flex-col lg:w-80 ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl border-r border-slate-700/60' 
            : 'bg-white/90 backdrop-blur-lg border-r border-gray-200/50'
        }`}>
          <div className="p-6 lg:p-8">
            <h1 className={`text-2xl lg:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r mb-6 lg:mb-8 ${
              theme === 'dark' ? 'from-indigo-400 to-purple-400' : 'from-indigo-600 to-purple-600'
            }`}>
              Settings
            </h1>
            
            <nav className="space-y-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group w-full flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 ${
                      isActive 
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-xl`
                        : theme === 'dark'
                          ? 'bg-slate-800/60 text-slate-300 hover:bg-slate-800/80 border-slate-700/50 hover:border-slate-600/50 backdrop-blur-xl'
                          : 'bg-white/50 text-gray-700 hover:bg-white/70 border-gray-200/50 hover:border-gray-300/50'
                    }`}
                  >
                    <div className={`p-2 rounded-xl transition-colors duration-300 ${
                      isActive 
                        ? 'bg-white/20' 
                        : `bg-gradient-to-r ${tab.color} group-hover:shadow-lg`
                    }`}>
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white'}`} />
                    </div>
                    <span className="font-medium text-sm lg:text-base text-left flex-1">{tab.label}</span>
                    <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${
                      isActive ? 'transform rotate-90 text-white' : theme === 'dark' ? 'text-slate-400' : 'text-gray-400'
                    }`} />
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-12 max-w-7xl mx-auto">
            <div className="animate-fadeIn">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }

        * {
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        ::-webkit-scrollbar {
          width: 4px;
        }
        ::-webkit-scrollbar-track {
          background: ${theme === 'dark' ? 'rgba(51, 65, 85, 0.3)' : 'rgba(229, 231, 235, 0.3)'};
        }
        ::-webkit-scrollbar-thumb {
          background: ${theme === 'dark' ? 'rgba(99, 102, 241, 0.5)' : 'rgba(79, 70, 229, 0.5)'};
          border-radius: 2px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${theme === 'dark' ? 'rgba(99, 102, 241, 0.7)' : 'rgba(79, 70, 229, 0.7)'};
        }
      `}</style>
    </div>
  );
}