import React, { useState } from "react";
import { Camera, Palette, Package, Globe } from "lucide-react";
import GeneralInfoForm from "./GeneralInfoForm";
import ThemeBrandingForm from "./ThemeBrandingForm";
import PackagesForm from "./PackagesForm";
import DomainSettingsForm from "./DomainSettingsForm";

const PhotographerSetup = () => {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    {
      id: "general",
      label: "General Info",
      icon: Camera,
      description: "Basic business information"
    },
    {
      id: "theme",
      label: "Theme & Branding",
      icon: Palette,
      description: "Visual identity & styling"
    },
    {
      id: "packages",
      label: "Packages",
      icon: Package,
      description: "Service offerings & pricing"
    },
    {
      id: "domain",
      label: "Domain Settings",
      icon: Globe,
      description: "Website configuration"
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return <GeneralInfoForm />;
      case "theme":
        return <ThemeBrandingForm />;
      case "packages":
        return <PackagesForm />;
      case "domain":
        return <DomainSettingsForm />;
      default:
        return <GeneralInfoForm />;
    }
  };

  const currentTabIndex = tabs.findIndex(tab => tab.id === activeTab);
  const currentTab = tabs[currentTabIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Photography Business Setup
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Configure your photography business profile and get ready to showcase your work
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2">
              {tabs.map((tab, index) => (
                <React.Fragment key={tab.id}>
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                    ${activeTab === tab.id 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : index < currentTabIndex 
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }
                  `}>
                    {index < currentTabIndex ? '✓' : index + 1}
                  </div>
                  {index < tabs.length - 1 && (
                    <div className={`
                      w-12 h-0.5 transition-colors
                      ${index < currentTabIndex ? 'bg-green-500' : 'bg-gray-200'}
                    `} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentTab?.label}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {currentTab?.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation - Hidden on mobile, visible on desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Setup Steps</h3>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  const isCompleted = tabs.findIndex(t => t.id === tab.id) < currentTabIndex;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        w-full flex items-center p-4 rounded-lg text-left transition-all duration-200
                        ${isActive 
                          ? 'bg-blue-50 border-l-4 border-blue-600 text-blue-700' 
                          : 'hover:bg-gray-50 text-gray-700'
                        }
                      `}
                    >
                      <div className={`
                        p-2 rounded-lg mr-3 transition-colors
                        ${isActive 
                          ? 'bg-blue-100' 
                          : isCompleted 
                            ? 'bg-green-100'
                            : 'bg-gray-100'
                        }
                      `}>
                        <Icon className={`
                          w-5 h-5
                          ${isActive 
                            ? 'text-blue-600' 
                            : isCompleted 
                              ? 'text-green-600'
                              : 'text-gray-600'
                          }
                        `} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{tab.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{tab.description}</div>
                      </div>
                      {isCompleted && (
                        <div className="text-green-600">
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex overflow-x-auto space-x-2 scrollbar-hide">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex-shrink-0 flex flex-col items-center p-3 rounded-lg min-w-[80px] transition-all
                        ${isActive 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'hover:bg-gray-50 text-gray-600'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5 mb-1" />
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              {/* Content Header */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-50 rounded-lg mr-3">
                    <currentTab.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{currentTab?.label}</h3>
                    <p className="text-sm text-gray-600">{currentTab?.description}</p>
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6 lg:p-8">
                <div className="animate-fadeIn">
                  {renderTabContent()}
                </div>
              </div>

              {/* Navigation Footer */}
              <div className="px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => {
                      const prevIndex = Math.max(0, currentTabIndex - 1);
                      setActiveTab(tabs[prevIndex].id);
                    }}
                    disabled={currentTabIndex === 0}
                    className={`
                      px-4 py-2 rounded-lg font-medium transition-all
                      ${currentTabIndex === 0 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    ← Previous
                  </button>

                  <span className="text-sm text-gray-500">
                    Step {currentTabIndex + 1} of {tabs.length}
                  </span>

                  <button
                    onClick={() => {
                      const nextIndex = Math.min(tabs.length - 1, currentTabIndex + 1);
                      setActiveTab(tabs[nextIndex].id);
                    }}
                    disabled={currentTabIndex === tabs.length - 1}
                    className={`
                      px-4 py-2 rounded-lg font-medium transition-all
                      ${currentTabIndex === tabs.length - 1 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
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
      `}</style>
    </div>
  );
};

export default PhotographerSetup;