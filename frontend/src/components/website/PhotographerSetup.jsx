import React, { useState } from "react";
import { Camera, Palette, Package, Globe } from "lucide-react";
import GeneralInfoForm from "./GeneralInfoForm";
import ThemeBrandingForm from "./ThemeBrandingForm";
import PackagesForm from "./PackagesForm";
import DomainSettingsForm from "./DomainSettingsForm";

const PhotographerSetup = ({ theme = 'dark' }) => {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    {
      id: "general",
      label: "General Info",
      icon: Camera,
      description: "Basic business information",
    },
    {
      id: "theme",
      label: "Theme & Branding",
      icon: Palette,
      description: "Visual identity & styling",
    },
    {
      id: "packages",
      label: "Packages",
      icon: Package,
      description: "Service offerings & pricing",
    },
    {
      id: "domain",
      label: "Domain Settings",
      icon: Globe,
      description: "Website configuration",
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return <GeneralInfoForm theme={theme} />;
      case "theme":
        return <ThemeBrandingForm theme={theme} />;
      case "packages":
        return <PackagesForm theme={theme} />;
      case "domain":
        return <DomainSettingsForm theme={theme} />;
      default:
        return <GeneralInfoForm theme={theme} />;
    }
  };

  const currentTabIndex = tabs.findIndex((tab) => tab.id === activeTab);
  const currentTab = tabs[currentTabIndex];

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

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r ${
            theme === 'dark' ? 'from-indigo-400 to-purple-600' : 'from-indigo-500 to-purple-600'
          } mb-3`}>
            Photography Business Setup
          </h1>
          <p className={`text-sm sm:text-base lg:text-lg max-w-2xl mx-auto ${
            theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
          }`}>
            Configure your photography business profile and get ready to showcase your work
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="flex items-center space-x-2 sm:space-x-4">
              {tabs.map((tab, index) => (
                <React.Fragment key={tab.id}>
                  <div className={`
                    w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-medium transition-all shadow-lg backdrop-blur-sm
                    ${activeTab === tab.id 
                      ? theme === 'dark'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-indigo-500/25'
                        : 'bg-gradient-to-r from-indigo-400 to-purple-500 text-white shadow-indigo-400/25'
                      : index < currentTabIndex 
                        ? theme === 'dark'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                          : 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white'
                        : theme === 'dark'
                          ? 'bg-slate-700/50 text-slate-400'
                          : 'bg-gray-200 text-gray-600'
                    }
                  `}>
                    {index < currentTabIndex ? '✓' : index + 1}
                  </div>
                  {index < tabs.length - 1 && (
                    <div className={`
                      w-8 sm:w-12 h-0.5 transition-colors
                      ${index < currentTabIndex 
                        ? theme === 'dark' ? 'bg-emerald-500' : 'bg-emerald-400'
                        : theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'
                      }
                    `} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="text-center">
            <h2 className={`text-lg sm:text-xl lg:text-2xl font-semibold ${
              theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
            }`}>
              {currentTab?.label}
            </h2>
            <p className={`text-sm mt-1 ${
              theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
            }`}>
              {currentTab?.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar Navigation - Hidden on mobile, visible on desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <div className={`
              rounded-2xl shadow-xl border p-4 sm:p-6 sticky top-8 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1
              ${theme === 'dark'
                ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl border-slate-700/60'
                : 'bg-white/90 border-gray-200'
              }
            `}>
              <h3 className={`text-lg sm:text-xl font-semibold mb-6 ${
                theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
              }`}>Setup Steps</h3>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  const isCompleted = tabs.findIndex((t) => t.id === tab.id) < currentTabIndex;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        w-full flex items-center p-4 rounded-lg text-left transition-all duration-200
                        ${isActive 
                          ? theme === 'dark'
                            ? 'bg-indigo-500/20 border-l-4 border-indigo-500 text-indigo-300 shadow-indigo-500/10'
                            : 'bg-indigo-50/80 border-l-4 border-indigo-400 text-indigo-700 shadow-indigo-300/10'
                          : theme === 'dark'
                            ? 'hover:bg-slate-700/50 text-slate-100 hover:text-slate-50'
                            : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                        }
                      `}
                    >
                      <div className={`
                        p-2 rounded-lg mr-3 transition-colors
                        ${isActive 
                          ? theme === 'dark' ? 'bg-indigo-500/30' : 'bg-indigo-100'
                          : isCompleted 
                            ? theme === 'dark' ? 'bg-emerald-500/30' : 'bg-emerald-100'
                            : theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-100'
                        }
                      `}>
                        <Icon className={`
                          w-5 h-5
                          ${isActive 
                            ? theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                            : isCompleted 
                              ? theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                              : theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                          }
                        `} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{tab.label}</div>
                        <div className={`text-xs mt-1 ${
                          theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                        }`}>{tab.description}</div>
                      </div>
                      {isCompleted && (
                        <div className={theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}>
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Mobile Tab Navigation */}
          <div className="lg:hidden col-span-1 mb-6">
            <div className={`
              rounded-xl shadow-sm border p-4 sm:p-5 overflow-x-auto scrollbar-hide
              ${theme === 'dark'
                ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border-slate-700/60'
                : 'bg-white/90 border-gray-200'
              }
            `}>
              <div className="flex space-x-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex-shrink-0 flex flex-col items-center p-3 rounded-lg min-w-[80px] transition-all duration-300
                        ${isActive 
                          ? theme === 'dark'
                            ? 'bg-indigo-500/20 text-indigo-300'
                            : 'bg-indigo-50/80 text-indigo-700'
                          : theme === 'dark'
                            ? 'hover:bg-slate-700/50 text-slate-400 hover:text-slate-100'
                            : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 mb-1 ${
                        isActive 
                          ? theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                          : theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                      }`} />
                      <span className="text-xs font-medium text-center leading-tight">
                        {tab.label.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className={`
              rounded-2xl shadow-xl border transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1
              ${theme === 'dark'
                ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl border-slate-700/60'
                : 'bg-white/90 border-gray-200'
              }
            `}>
              {/* Content Header */}
              <div className={`px-4 sm:px-6 py-4 border-b ${
                theme === 'dark' ? 'border-slate-700/60' : 'border-gray-200'
              }`}>
                <div className="flex items-center">
                  <div className={`
                    p-2 rounded-lg mr-3
                    ${theme === 'dark'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600'
                      : 'bg-gradient-to-r from-indigo-400 to-purple-500'
                    }
                  `}>
                    <currentTab.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-lg sm:text-xl font-semibold ${
                      theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                    }`}>{currentTab?.label}</h3>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                    }`}>{currentTab?.description}</p>
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="animate-fadeIn">
                  {renderTabContent()}
                </div>
              </div>

              {/* Navigation Footer */}
              <div className={`px-4 sm:px-6 py-4 rounded-b-2xl border-t ${
                theme === 'dark' ? 'bg-slate-800/50 border-slate-700/60' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => {
                      const prevIndex = Math.max(0, currentTabIndex - 1);
                      setActiveTab(tabs[prevIndex].id);
                    }}
                    disabled={currentTabIndex === 0}
                    className={`
                      px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-all duration-200
                      ${currentTabIndex === 0 
                        ? theme === 'dark'
                          ? 'text-slate-500 cursor-not-allowed'
                          : 'text-gray-400 cursor-not-allowed'
                        : theme === 'dark'
                          ? 'text-slate-300 hover:bg-slate-700/50 hover:text-slate-100'
                          : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                      }
                    `}
                  >
                    ← Previous
                  </button>

                  <span className={`text-sm ${
                    theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                  }`}>
                    Step {currentTabIndex + 1} of {tabs.length}
                  </span>

                  <button
                    onClick={() => {
                      const nextIndex = Math.min(tabs.length - 1, currentTabIndex + 1);
                      setActiveTab(tabs[nextIndex].id);
                    }}
                    disabled={currentTabIndex === tabs.length - 1}
                    className={`
                      px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-all duration-300 transform hover:scale-105 shadow-lg
                      ${currentTabIndex === tabs.length - 1 
                        ? theme === 'dark'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/25'
                          : 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white hover:from-emerald-500 hover:to-teal-500 shadow-emerald-400/25'
                        : theme === 'dark'
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-indigo-500/25'
                          : 'bg-gradient-to-r from-indigo-400 to-purple-500 text-white hover:from-indigo-500 hover:to-purple-600 shadow-indigo-400/25'
                      }
                    `}
                  >
                    {currentTabIndex === tabs.length - 1 ? 'Complete Setup' : 'Next →'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
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
};

export default PhotographerSetup;