import React, { useState } from 'react';
import { Edit, Sparkles, Palette, Scissors, Eraser, Users, Image, Plus, ArrowLeft, Grid3X3, Menu, X, ChevronDown } from 'lucide-react';
import ToolTab from './ToolTab';
import SmartEditor from './SmartEditor';
import AiEnhancer from './AiEnhancer';
import AiColorGrading from './AiColorGrading';
import BackgroundRemoval from './BackgroundRemoval';
import ObjectRemoval from './ObjectRemoval';
import FaceSwap from './FaceSwap';
import AiAutoCulling from './AiAutoCulling';

const AiToolsDashboard = ({ theme = 'dark' }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const isDark = theme === 'dark';

  const tools = [
    {
      id: 'smart-editor',
      title: 'Smart Editor',
      description: 'Advanced AI-powered image editor with intelligent tools',
      icon: Edit,
      category: 'Editor',
      available: true,
      component: SmartEditor
    },
    {
      id: 'ai-enhancer',
      title: 'AI Enhancer',
      description: 'Enhance image quality and resolution using AI',
      icon: Sparkles,
      category: 'Enhancement',
      available: false,
      component: AiEnhancer
    },
    {
      id: 'ai-color-grading',
      title: 'AI Color Grading',
      description: 'Apply cinematic color grading automatically',
      icon: Palette,
      category: 'Color',
      available: false,
      component: AiColorGrading
    },
    {
      id: 'background-removal',
      title: 'Background Removal',
      description: 'Remove backgrounds with pixel-perfect precision',
      icon: Scissors,
      category: 'Manipulation',
      available: true,
      component: BackgroundRemoval
    },
    {
      id: 'object-removal',
      title: 'Object Removal',
      description: 'Erase unwanted objects seamlessly',
      icon: Eraser,
      category: 'Manipulation',
      available: false,
      component: ObjectRemoval
    },
    {
      id: 'face-swap',
      title: 'Face Swap',
      description: 'Swap faces with realistic AI technology',
      icon: Users,
      category: 'Creative',
      available: false,
      component: FaceSwap
    },
    {
      id: 'ai-auto-culling',
      title: 'AI Auto-Culling',
      description: 'Automatically select the best shots from batches',
      icon: Image,
      category: 'Organization',
      available: false,
      component: AiAutoCulling
    }
  ];

  const categories = [...new Set(tools.map(tool => tool.category))];

  const ToolCard = ({ tool }) => {
    const IconComponent = tool.icon;

    return (
      <div
        onClick={() => tool.available && setActiveTab(tool.id)}
        className={`group relative overflow-hidden rounded-2xl transition-all duration-500 transform ${
          tool.available 
            ? 'cursor-pointer hover:scale-[1.02] hover:-translate-y-1 bg-gradient-to-br from-slate-800/80 to-slate-900/80 hover:from-slate-700/90 hover:to-slate-800/90 border border-slate-700/50 hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10' 
            : 'cursor-not-allowed bg-slate-800/40 border border-slate-700/30 opacity-75'
        } backdrop-blur-xl`}
      >
        {/* Gradient overlay on hover */}
        {tool.available && (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        )}
        
        {/* Animated border gradient */}
        {tool.available && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10" />
        )}
        
        <div className="relative p-4 sm:p-6">
          {/* Status indicator and category */}
          <div className="flex items-center justify-between mb-4">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              isDark 
                ? 'bg-slate-700/60 text-white' 
                : 'bg-slate-200 text-slate-600'
            }`}>
              {tool.category}
            </span>
            <div className="flex items-center gap-2">
              {!tool.available && (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Coming Soon
                </span>
              )}
              <div className={`w-2 h-2 rounded-full ${
                tool.available 
                  ? 'bg-gradient-to-r from-indigo-400 to-purple-400 shadow-lg shadow-indigo-400/50' 
                  : 'bg-slate-500'
              }`} />
            </div>
          </div>

          {/* Icon with animated background */}
          <div className="relative mb-4 sm:mb-6">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
              tool.available 
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 group-hover:scale-110 group-hover:rotate-3 group-hover:from-indigo-600 group-hover:to-purple-700' 
                : 'bg-gradient-to-br from-slate-600 to-slate-700'
            }`}>
              <IconComponent className={`w-6 h-6 sm:w-7 sm:h-7 ${tool.available ? 'text-white' : 'text-slate-400'}`} />
            </div>
            {/* Glow effect */}
            {tool.available && (
              <div className="absolute inset-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h3 className={`text-base sm:text-lg font-bold ${
              tool.available 
                ? 'bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:from-indigo-300 group-hover:via-purple-300 group-hover:to-pink-300' 
                : 'text-white'
            } transition-all duration-300`}>
              {tool.title}
            </h3>
            <p className={`text-sm leading-relaxed ${
              tool.available 
                ? isDark ? 'text-white group-hover:text-white' : 'text-slate-600'
                : 'text-white'
            } transition-colors duration-300`}>
              {tool.description}
            </p>
          </div>

          {/* Coming soon overlay for unavailable tools */}
          {!tool.available && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <div className="text-center p-4">
                <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <IconComponent className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-amber-400 font-semibold text-sm">Coming Soon</span>
                <p className="text-white text-xs mt-1">Stay tuned for updates</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const TabButton = ({ icon: Icon, label, isActive, onClick, isDisabled = false }) => (
    <button
      onClick={() => {
        onClick();
        setIsMobileNavOpen(false); // Close mobile nav when tab is selected
      }}
      disabled={isDisabled}
      className={`relative group px-4 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 min-w-fit w-full md:w-auto ${
        isActive
          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 scale-105'
          : isDisabled
          ? 'text-white cursor-not-allowed bg-slate-700/30'
          : 'text-white hover:text-white hover:bg-gradient-to-r hover:from-indigo-600/20 hover:to-purple-700/20 hover:scale-105'
      }`}
    >
      <Icon className="w-4 h-4" />
      <div className="flex flex-col items-start">
        <span className="whitespace-nowrap">{label}</span>
        {isDisabled && (
          <span className="text-xs text-amber-400 font-medium -mt-0.5">Coming Soon</span>
        )}
      </div>
      
      {isActive && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20 blur-xl" />
      )}
    </button>
  );

  const renderToolComponent = () => {
    const activeTool = tools.find((tool) => tool.id === activeTab);
    if (!activeTool || activeTab === 'dashboard') return null;

    const ToolComponent = activeTool.component;
    return (
      <ToolComponent
        theme={theme}
        onClose={() => setActiveTab('dashboard')}
        {...(activeTool.id === 'smart-editor'
          ? { image: { src: 'https://via.placeholder.com/800x600', caption: 'Sample Image' } }
          : {})}
      />
    );
  };

  const StatCard = ({ value, label, gradient }) => (
    <div className="text-center group">
      <div className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-1 group-hover:scale-110 transition-transform duration-300`}>
        {value}
      </div>
      <div className="text-xs sm:text-sm text-white font-medium">
        {label}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950' 
        : 'bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 -right-4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 p-4 sm:p-6 md:p-8 lg:p-12 max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12 px-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 md:mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
              AI Tools Suite
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white font-light max-w-2xl mx-auto leading-relaxed px-2">
              Your comprehensive AI image editing toolkit powered by cutting-edge technology
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-center mb-8 md:mb-12 px-2">
            {/* Desktop Navigation */}
            <div className="hidden md:block bg-slate-800/60 backdrop-blur-xl rounded-2xl p-2 border border-slate-700/50 shadow-2xl">
              <div className="flex gap-1 flex-wrap justify-center">
                <ToolTab
                  icon={Grid3X3}
                  name="Dashboard"
                  isActive={activeTab === 'dashboard'}
                  onClick={() => setActiveTab('dashboard')}
                  theme={theme}
                />
                {tools.map((tool) => (
                  <ToolTab
                    key={tool.id}
                    icon={tool.icon}
                    name={tool.available ? tool.title : `${tool.title} (Coming Soon)`}
                    isActive={activeTab === tool.id}
                    onClick={() => tool.available && setActiveTab(tool.id)}
                    theme={theme}
                  />
                ))}
              </div>
            </div>

            {/* Mobile Navigation Dropdown */}
            <div className="md:hidden relative w-full max-w-sm">
              <button
                onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                className="w-full bg-slate-800/60 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50 shadow-2xl flex items-center justify-between text-white hover:text-white transition-colors duration-300"
              >
                <div className="flex items-center gap-3">
                  {activeTab === 'dashboard' ? (
                    <Grid3X3 className="w-5 h-5" />
                  ) : (
                    React.createElement(tools.find(t => t.id === activeTab)?.icon || Grid3X3, { className: "w-5 h-5" })
                  )}
                  <span className="font-medium">
                    {activeTab === 'dashboard' ? 'Dashboard' : tools.find(t => t.id === activeTab)?.title || 'Dashboard'}
                  </span>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isMobileNavOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isMobileNavOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl z-50 overflow-hidden">
                  <div className="p-2 space-y-1">
                    <TabButton
                      icon={Grid3X3}
                      label="Dashboard"
                      isActive={activeTab === 'dashboard'}
                      onClick={() => setActiveTab('dashboard')}
                    />
                    {tools.map((tool) => (
                      <TabButton
                        key={tool.id}
                        icon={tool.icon}
                        label={tool.title}
                        isActive={activeTab === tool.id}
                        onClick={() => tool.available && setActiveTab(tool.id)}
                        isDisabled={!tool.available}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Backdrop for mobile nav */}
              {isMobileNavOpen && (
                <div
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                  onClick={() => setIsMobileNavOpen(false)}
                />
              )}
            </div>
          </div>

          {/* Main Content */}
          {activeTab === 'dashboard' ? (
            <div className="space-y-8 md:space-y-12 px-2 sm:px-4">
              {/* Tools Grid */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8 text-center">
                  Available Tools
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  {tools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                  
                  {/* Coming Soon Card */}
                  <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl border-2 border-dashed border-slate-700/50 hover:border-indigo-500/30 transition-all duration-500 cursor-pointer transform hover:scale-[1.02] p-4 sm:p-6">
                    <div className="flex flex-col items-center justify-center h-full text-center py-6 sm:py-8">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Plus className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:text-white" />
                      </div>
                      <span className="font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent text-sm sm:text-base">
                        More AI Tools
                      </span>
                      <span className="text-xs sm:text-sm text-white mt-1">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-6 sm:mb-8 text-center">
                  Platform Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                  <StatCard 
                    value="1" 
                    label="Active Tools" 
                    gradient="from-indigo-400 to-purple-500"
                  />
                  <StatCard 
                    value="6" 
                    label="Coming Soon" 
                    gradient="from-amber-400 to-orange-400"
                  />
                  <StatCard 
                    value="100%" 
                    label="AI Powered" 
                    gradient="from-indigo-400 via-purple-400 to-pink-400"
                  />
                  <StatCard 
                    value="24/7" 
                    label="Available" 
                    gradient="from-pink-400 to-indigo-400"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="px-2 sm:px-4">
              {renderToolComponent()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiToolsDashboard;