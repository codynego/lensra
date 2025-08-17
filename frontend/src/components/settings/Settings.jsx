import React, { useState } from "react";
import { 
  Calendar, 
  CreditCard, 
  Palette, 
  Image, 
  Bell, 
  User, 
  Menu, 
  X,
  ChevronRight
} from "lucide-react";
import BookingSettingsTab from "./BookingSettingsTab";
import PaymentSettingsTab from "./PaymentSettingsTab";
import BrandingSettingsTab from "./BrandingSettingsTab";
import GallerySettingsTab from "./GallerySettingsTab";
import NotificationSettingsTab from "./NotificationSettingsTab";
import AccountSettingsTab from "./AccountSettingsTab";


export default function Settings() {
  const [activeTab, setActiveTab] = useState("booking");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = [
    { id: "booking", label: "Booking Settings", icon: Calendar, color: "from-blue-500 to-cyan-500" },
    { id: "payment", label: "Payment Settings", icon: CreditCard, color: "from-green-500 to-emerald-500" },
    { id: "branding", label: "Branding", icon: Palette, color: "from-purple-500 to-pink-500" },
    { id: "gallery", label: "Gallery Settings", icon: Image, color: "from-orange-500 to-red-500" },
    { id: "notifications", label: "Notifications", icon: Bell, color: "from-yellow-500 to-orange-500" },
    { id: "account", label: "Account Settings", icon: User, color: "from-indigo-500 to-purple-500" }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "booking": return <BookingSettingsTab />;
      case "payment": return <PaymentSettingsTab />;
      case "branding": return <BrandingSettingsTab />;
      case "gallery": return <GallerySettingsTab />;
      case "notifications": return <NotificationSettingsTab />;
      case "account": return <AccountSettingsTab />;
      default: return null;
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-900">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Settings
          </h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-200"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            )}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-white/20 shadow-xl">
            <div className="p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r ' + tab.color + ' text-white shadow-lg transform scale-[1.02]'
                        : 'bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-800/70 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                      <span className="font-medium">{tab.label}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="lg:flex lg:h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-col lg:w-80 lg:bg-white/30 lg:dark:bg-gray-900/30 lg:backdrop-blur-xl lg:border-r lg:border-white/20">
          <div className="p-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-8">
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
                    className={`group w-full flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 hover:transform hover:scale-[1.02] ${
                      isActive 
                        ? 'bg-gradient-to-r ' + tab.color + ' text-white shadow-xl'
                        : 'bg-white/40 dark:bg-gray-800/40 hover:bg-white/60 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className={`p-2 rounded-xl transition-colors duration-300 ${
                      isActive 
                        ? 'bg-white/20' 
                        : 'bg-gradient-to-r ' + tab.color + ' group-hover:shadow-lg'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        isActive 
                          ? 'text-white' 
                          : 'text-white'
                      }`} />
                    </div>
                    <span className="font-medium text-left flex-1">{tab.label}</span>
                    <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${
                      isActive ? 'transform rotate-90 text-white' : 'text-gray-400'
                    }`} />
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:overflow-y-auto">
          <div className="p-6 lg:p-12 max-w-4xl mx-auto">
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
      `}</style>
    </div>
  );
}