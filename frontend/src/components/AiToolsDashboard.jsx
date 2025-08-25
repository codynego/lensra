import React, { useState, useEffect } from 'react';
import { Edit, Sparkles, Palette, Scissors, Eraser, Users, Image, Plus, Grid3X3, ChevronDown, Zap, Activity } from 'lucide-react';
import ToolTab from './ToolTab';
import SmartEditor from './SmartEditor';
import AiEnhancer from './AiEnhancer';
import AiColorGrading from './AiColorGrading';
import BackgroundRemoval from './BackgroundRemoval';
import ObjectRemoval from './ObjectRemoval';
import FaceSwap from './FaceSwap';
import AiAutoCulling from './AiAutoCulling';
import { useAuth } from '../AuthContext';

const AiToolsDashboard = ({ theme = 'dark' }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState(null);
  const [sparkAnimation, setSparkAnimation] = useState(false);
  const isDark = theme === 'dark';
  const { apiFetch } = useAuth();

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
      id: 'background-removal',
      title: 'Background Removal',
      description: 'Remove backgrounds with pixel-perfect precision',
      icon: Scissors,
      category: 'Manipulation',
      available: true,
      component: BackgroundRemoval
    },
    {
      id: 'ai-enhancer',
      title: 'AI Enhancer',
      description: 'Enhance image quality with AI upscaling',
      icon: Sparkles,
      category: 'Enhancement',
      available: false,
      component: AiEnhancer
    },
    {
      id: 'color-grading',
      title: 'Color Grading',
      description: 'Apply cinematic color grading automatically',
      icon: Palette,
      category: 'Color',
      available: false,
      component: AiColorGrading
    },
  ];

  const fetchStats = async () => {
    try {
      const response = await apiFetch('/subscriptions/me/stats/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (process.env.NODE_ENV === 'development') {
          console.log("Stats data:", data);
        }
        setStats({
          ...data,
          storage_used_gb: data.storage_used / (1024 * 1024 * 1024),
        });
        setStatsError(null);
      } else {
        const errorData = await response.json();
        setStatsError(errorData.message || `Failed to fetch stats: ${response.status}`);
        setStats(null);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStatsError('Network error occurred. Please check your connection or login status.');
      setStats(null);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [apiFetch]);

  useEffect(() => {
    if (stats?.sparks_used !== undefined) {
      setSparkAnimation(true);
      const timer = setTimeout(() => setSparkAnimation(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [stats?.sparks_used]);

  const ToolCard = ({ tool }) => {
    const IconComponent = tool.icon;
    const isDisabled = !tool.available || (stats?.sparks_remaining === 0);

    return (
      <div
        onClick={() => !isDisabled && setActiveTab(tool.id)}
        className={`
          group relative overflow-hidden rounded-2xl transition-all duration-700 transform
          ${!isDisabled
            ? `cursor-pointer hover:scale-[1.03] hover:-translate-y-2
               ${theme === 'dark'
                 ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 hover:from-slate-700/95 hover:to-slate-800/95 border border-slate-700/60 hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/20'
                 : 'bg-gradient-to-br from-white/90 to-gray-50/90 hover:from-gray-50/95 hover:to-white/95 border border-gray-200 hover:border-indigo-400/40 hover:shadow-2xl hover:shadow-indigo-400/20'
               }`
            : `cursor-not-allowed
               ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700/40' : 'bg-gray-100/50 border-gray-200/40'} opacity-75`
          }
          backdrop-blur-2xl shadow-xl
        `}
      >
        {!isDisabled && (
          <>
            <div className={`absolute inset-0
              ${theme === 'dark'
                ? 'bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10'
                : 'bg-gradient-to-br from-indigo-200/10 via-purple-200/10 to-pink-200/10'
              } opacity-0 group-hover:opacity-100 transition-all duration-700`} />
            <div className={`absolute inset-0 rounded-2xl
              ${theme === 'dark'
                ? 'bg-gradient-to-r from-indigo-400/20 via-purple-500/20 to-pink-400/20'
                : 'bg-gradient-to-r from-indigo-300/20 via-purple-300/20 to-pink-300/20'
              } opacity-0 group-hover:opacity-30 transition-all duration-700 blur-xl`} />
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
          </>
        )}
        <div className="relative p-6 z-10">
          <div className="flex items-center justify-between mb-6">
            <span className={`
              px-3 py-1.5 text-xs font-semibold rounded-full backdrop-blur-xl
              ${theme === 'dark'
                ? 'bg-slate-700/80 text-slate-200 border border-slate-600/50'
                : 'bg-gray-200 text-gray-600 border border-gray-300/50'
              }
            `}>
              {tool.category}
            </span>
            <div className="flex items-center gap-3">
              {!tool.available && (
                <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 backdrop-blur-xl animate-pulse">
                  Coming Soon
                </span>
              )}
              <div className={`
                w-2.5 h-2.5 rounded-full
                ${!isDisabled
                  ? theme === 'dark'
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg shadow-green-400/50 animate-pulse'
                    : 'bg-gradient-to-r from-green-300 to-emerald-400 shadow-lg shadow-green-300/50 animate-pulse'
                  : theme === 'dark' ? 'bg-slate-500' : 'bg-gray-400'
                }
              `} />
            </div>
          </div>
          <div className="relative mb-6">
            <div className={`
              w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500
              ${!isDisabled
                ? theme === 'dark'
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 group-hover:scale-110 group-hover:rotate-6 group-hover:from-indigo-400 group-hover:to-purple-500 shadow-xl shadow-indigo-500/30'
                  : 'bg-gradient-to-br from-indigo-400 to-purple-500 group-hover:scale-110 group-hover:rotate-6 group-hover:from-indigo-300 group-hover:to-purple-400 shadow-xl shadow-indigo-400/30'
                : theme === 'dark'
                  ? 'bg-gradient-to-br from-slate-600 to-slate-700'
                  : 'bg-gradient-to-br from-gray-300 to-gray-400'
              }
            `}>
              <IconComponent className={`
                w-8 h-8
                ${!isDisabled ? 'text-white' : theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}
                transition-all duration-300 group-hover:scale-110
              `} />
            </div>
            {!isDisabled && (
              <div className={`
                absolute inset-0 w-16 h-16 rounded-2xl
                ${theme === 'dark'
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                  : 'bg-gradient-to-br from-indigo-400 to-purple-500'
                } blur-2xl opacity-0 group-hover:opacity-40 transition-all duration-700
              `} />
            )}
          </div>
          <div className="space-y-3">
            <h3 className={`
              text-xl font-bold
              ${!isDisabled
                ? theme === 'dark'
                  ? 'bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:from-indigo-300 group-hover:via-purple-300 group-hover:to-pink-300'
                  : 'bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:from-indigo-300 group-hover:via-purple-300 group-hover:to-pink-300'
                : theme === 'dark' ? 'text-slate-300' : 'text-gray-500'
              }
              transition-all duration-500
            `}>
              {tool.title}
            </h3>
            <p className={`
              text-sm leading-relaxed
              ${!isDisabled
                ? theme === 'dark'
                  ? 'text-slate-300 group-hover:text-slate-200'
                  : 'text-gray-600 group-hover:text-gray-500'
                : theme === 'dark' ? 'text-slate-400' : 'text-gray-400'
              }
              transition-all duration-300
            `}>
              {tool.description}
            </p>
          </div>
          {tool.available && stats?.sparks_remaining === 0 && (
            <div className={`
              absolute inset-0 rounded-2xl flex items-center justify-center
              ${theme === 'dark' ? 'bg-slate-900/70 backdrop-blur-sm' : 'bg-gray-100/70 backdrop-blur-sm'}
            `}>
              <div className="text-center p-6">
                <Zap className={`w-6 h-6 mb-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} />
                <span className={`font-bold text-lg ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}>
                  No Sparks Available
                </span>
                <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>
                  <a
                    href="https://x.ai/subscriptions"
                    className={theme === 'dark' ? 'text-indigo-400 underline hover:text-indigo-300' : 'text-indigo-500 underline hover:text-indigo-600'}
                  >
                    Get more sparks
                  </a>
                </p>
              </div>
            </div>
          )}
          {!tool.available && (
            <div className={`
              absolute inset-0 rounded-2xl flex items-center justify-center
              ${theme === 'dark' ? 'bg-slate-900/70 backdrop-blur-sm' : 'bg-gray-100/70 backdrop-blur-sm'}
            `}>
              <div className="text-center p-6">
                <div className={`
                  w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center backdrop-blur-xl
                  ${theme === 'dark' ? 'bg-amber-500/20 border-amber-500/30' : 'bg-amber-100 border-amber-200/50'}
                `}>
                  <IconComponent className={`w-6 h-6 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-500'}`} />
                </div>
                <span className={`font-bold text-lg ${theme === 'dark' ? 'text-amber-400' : 'text-amber-500'}`}>
                  Coming Soon
                </span>
                <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>
                  Stay tuned for updates
                </p>
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
        setIsMobileNavOpen(false);
      }}
      disabled={isDisabled}
      className={`
        relative group px-4 sm:px-5 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-500 flex items-center gap-2 sm:gap-3 min-w-fit w-full md:w-auto overflow-hidden
        ${isActive
          ? theme === 'dark'
            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/30 scale-105 border border-indigo-400/50'
            : 'bg-gradient-to-r from-indigo-400 to-purple-500 text-white shadow-xl shadow-indigo-400/30 scale-105 border border-indigo-300/50'
          : isDisabled
            ? theme === 'dark'
              ? 'text-slate-400 cursor-not-allowed bg-slate-700/30'
              : 'text-gray-400 cursor-not-allowed bg-gray-200/30'
            : theme === 'dark'
              ? 'text-slate-200 hover:text-white hover:bg-gradient-to-r hover:from-indigo-600/30 hover:to-purple-700/30 hover:scale-105 hover:shadow-lg'
              : 'text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-indigo-500/30 hover:to-purple-600/30 hover:scale-105 hover:shadow-lg'
        }
      `}>
      {isActive && (
        <div className={`
          absolute inset-0 rounded-xl
          ${theme === 'dark' ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gradient-to-r from-indigo-400 to-purple-500'}
          opacity-30 blur-xl
        `} />
      )}
      <Icon className="w-5 h-5 z-10 transition-transform duration-300 group-hover:scale-110" />
      <div className="flex flex-col items-start z-10">
        <span className="text-sm sm:text-base whitespace-nowrap">{label}</span>
        {isDisabled && (
          <span className={`text-xs font-medium -mt-0.5 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-500'}`}>
            Coming Soon
          </span>
        )}
      </div>
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
        sparksRemaining={stats?.sparks_remaining ?? 0}
        {...(activeTool.id === 'smart-editor'
          ? { image: { src: 'https://via.placeholder.com/800x600', caption: 'Sample Image' } }
          : {})}
      />
    );
  };

  const StatCard = ({ value, label, gradient, icon: Icon }) => (
    <div className="text-center group relative">
      <div className="relative">
        {Icon && (
          <div className={`
            w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center backdrop-blur-xl
            ${theme === 'dark'
              ? 'bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-slate-600/30'
              : 'bg-gradient-to-br from-gray-100/50 to-white/50 border-gray-200/30'
            } group-hover:scale-110 transition-all duration-500
          `}>
            <Icon className={`w-6 h-6 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`} />
          </div>
        )}
        <div className={`
          text-3xl sm:text-4xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-all duration-500
        `}>
          {value}
        </div>
        <div className={`
          text-sm font-medium group-hover:text-opacity-80 transition-colors duration-300
          ${theme === 'dark' ? 'text-slate-300 group-hover:text-slate-200' : 'text-gray-600 group-hover:text-gray-500'}
        `}>
          {label}
        </div>
      </div>
    </div>
  );

  const totalSparks = stats?.max_sparks ?? 'N/A';
  const sparksUsed = stats?.sparks_used ?? 'N/A';
  const sparksRemaining = totalSparks !== 'N/A' && sparksUsed !== 'N/A'
    ? totalSparks - sparksUsed
    : 'N/A';
  const sparksPercentage = totalSparks !== 'N/A' && sparksRemaining !== 'N/A'
    ? (sparksRemaining / totalSparks) * 100
    : 0;

  return (
    <div className={`
      min-h-screen transition-colors duration-500
      ${theme === 'dark'
        ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950'
        : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
      }
    `}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`
          absolute top-1/4 -left-4 w-96 h-96 rounded-full blur-3xl animate-pulse
          ${theme === 'dark' ? 'bg-indigo-500/10' : 'bg-indigo-200/10'}
        `} />
        <div className={`
          absolute top-3/4 -right-4 w-[32rem] h-[32rem] rounded-full blur-3xl animate-pulse delay-1000
          ${theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-200/10'}
        `} />
        <div className={`
          absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl animate-pulse delay-500
          ${theme === 'dark' ? 'bg-pink-500/10' : 'bg-pink-200/10'}
        `} />
        <div className={`
          absolute top-20 left-20 w-2 h-2 rounded-full animate-bounce delay-300
          ${theme === 'dark' ? 'bg-indigo-400/30' : 'bg-indigo-300/30'}
        `} />
        <div className={`
          absolute top-40 right-32 w-1 h-1 rounded-full animate-ping delay-700
          ${theme === 'dark' ? 'bg-purple-400/40' : 'bg-purple-300/40'}
        `} />
        <div className={`
          absolute bottom-32 left-40 w-1.5 h-1.5 rounded-full animate-pulse delay-1000
          ${theme === 'dark' ? 'bg-pink-400/35' : 'bg-pink-300/35'}
        `} />
      </div>

      <div className="relative z-10 p-4 sm:p-6 md:p-8 lg:p-12 max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-12 px-4">
            <div className="relative">
              <h1 className={`
                text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 md:mb-8 leading-tight animate-pulse
                bg-gradient-to-r ${theme === 'dark'
                  ? 'from-indigo-400 via-purple-400 to-pink-400'
                  : 'from-indigo-500 via-purple-500 to-pink-500'
                } bg-clip-text text-transparent
              `}>
                AI Tools Suite
              </h1>
              <div className={`
                absolute inset-0 bg-gradient-to-r
                ${theme === 'dark'
                  ? 'from-indigo-400 via-purple-400 to-pink-400'
                  : 'from-indigo-500 via-purple-500 to-pink-500'
                } bg-clip-text text-transparent opacity-20 blur-2xl animate-pulse delay-500
              `}>
                AI Tools Suite
              </div>
            </div>
            <p className={`
              text-xl sm:text-2xl md:text-3xl font-light max-w-3xl mx-auto leading-relaxed px-2
              ${theme === 'dark' ? 'text-slate-200' : 'text-gray-700'}
            `}>
              Your comprehensive AI image editing toolkit powered by cutting-edge technology
            </p>
          </div>

          <div className="mb-8 md:mb-10 px-4">
            <div className="relative max-w-2xl mx-auto">
              <div className={`
                relative rounded-2xl p-4 sm:p-6 shadow-xl overflow-hidden
                ${theme === 'dark'
                  ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl border border-slate-700/60'
                  : 'bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-2xl border border-gray-200'
                } ${sparkAnimation ? 'animate-pulse' : ''}
              `}>
                <div className={`
                  absolute inset-0
                  ${theme === 'dark'
                    ? 'bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-blue-500/10'
                    : 'bg-gradient-to-r from-teal-300/10 via-cyan-300/10 to-blue-300/10'
                  } animate-pulse
                `} />
                <div className={`
                  absolute top-3 right-6 w-1 h-1 rounded-full animate-ping delay-300
                  ${theme === 'dark' ? 'bg-teal-400' : 'bg-teal-300'}
                `} />
                <div className={`
                  absolute bottom-4 left-8 w-0.5 h-0.5 rounded-full animate-pulse delay-700
                  ${theme === 'dark' ? 'bg-cyan-400' : 'bg-cyan-300'}
                `} />
                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="relative">
                      <Zap className={`w-5 h-5 animate-pulse ${theme === 'dark' ? 'text-teal-400' : 'text-teal-500'}`} />
                    </div>
                    <span className={`
                      text-lg sm:text-xl font-bold
                      bg-gradient-to-r ${theme === 'dark'
                        ? 'from-teal-400 via-cyan-400 to-blue-400'
                        : 'from-teal-300 via-cyan-300 to-blue-300'
                      } bg-clip-text text-transparent
                    `}>
                      Sparks: {sparksRemaining !== 'N/A' ? sparksRemaining : '---'} / {totalSparks !== 'N/A' ? totalSparks : '---'}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="relative">
                      <div className={`
                        w-full h-2 rounded-full overflow-hidden backdrop-blur-xl
                        ${theme === 'dark' ? 'bg-slate-700/50 border-slate-600/30' : 'bg-gray-200/50 border-gray-300/30'}
                      `}>
                        <div
                          className={`
                            h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden
                            ${sparksRemaining !== 'N/A' && sparksRemaining < 2
                              ? theme === 'dark'
                                ? 'bg-gradient-to-r from-red-400 via-red-500 to-red-600'
                                : 'bg-gradient-to-r from-red-300 via-red-400 to-red-500'
                              : theme === 'dark'
                                ? 'bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400'
                                : 'bg-gradient-to-r from-teal-300 via-cyan-300 to-blue-300'
                            }
                          `}
                          style={{ width: `${sparksPercentage}%` }}
                        >
                          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                        </div>
                      </div>
                      <div className={`
                        flex justify-between text-xs mt-1
                        ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}
                      `}>
                        <span>Used: {sparksUsed !== 'N/A' ? sparksUsed : '---'}</span>
                        <span>{sparksPercentage > 0 ? `${sparksPercentage.toFixed(1)}% remaining` : 'Loading...'}</span>
                      </div>
                    </div>
                    {sparksRemaining !== 'N/A' && sparksRemaining < 5 && (
                      <div className="text-center mt-4">
                        <a
                          href="https://x.ai/subscriptions"
                          className={`
                            inline-block px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-medium text-sm sm:text-base transition-all duration-300 transform hover:scale-105
                            ${theme === 'dark'
                              ? 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-indigo-500/25'
                              : 'bg-indigo-400 text-white hover:bg-indigo-500 shadow-indigo-400/25'
                            }
                          `}
                          aria-label="Purchase more sparks"
                        >
                          Get More Sparks
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {(statsError || stats === null) && (
                <div className={`
                  absolute inset-0 rounded-2xl flex items-center justify-center
                  ${theme === 'dark' ? 'bg-slate-900/80 backdrop-blur-sm' : 'bg-gray-100/80 backdrop-blur-sm'}
                `}>
                  <div className="text-center p-4">
                    <Activity className={`w-8 h-8 mx-auto mb-2 animate-pulse ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} />
                    <p className={`font-semibold text-sm mb-1 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}`}>
                      Unable to Load Sparks
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                      {statsError || 'Fetching sparks data...'}
                    </p>
                    <button
                      onClick={fetchStats}
                      className={`
                        mt-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-medium text-sm sm:text-base transition-all duration-300 transform hover:scale-105
                        ${theme === 'dark'
                          ? 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-indigo-500/25'
                          : 'bg-indigo-400 text-white hover:bg-indigo-500 shadow-indigo-400/25'
                        }
                      `}
                    >
                      Retry
                    </button>
                    <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                      Or <a
                        href="https://x.ai/subscriptions"
                        className={theme === 'dark' ? 'text-indigo-400 underline hover:text-indigo-300' : 'text-indigo-500 underline hover:text-indigo-600'}
                      >
                        check your subscription
                      </a>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center mb-12 md:mb-16 px-2">
            <div className={`
              hidden md:block rounded-3xl p-3 shadow-2xl
              ${theme === 'dark'
                ? 'bg-slate-800/80 backdrop-blur-2xl border border-slate-700/60'
                : 'bg-white/80 backdrop-blur-2xl border border-gray-200'
              }
            `}>
              <div className="flex gap-2 flex-wrap justify-center">
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
                    onClick={() => tool.available && stats?.sparks_remaining !== 0 && setActiveTab(tool.id)}
                    isDisabled={!tool.available || stats?.sparks_remaining === 0}
                  />
                ))}
              </div>
            </div>
            <div className="md:hidden relative w-full max-w-sm">
              <button
                onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                className={`
                  w-full rounded-3xl p-5 shadow-2xl flex items-center justify-between transition-all duration-300 transform hover:scale-105
                  ${theme === 'dark'
                    ? 'bg-slate-800/80 backdrop-blur-2xl border border-slate-700/60 text-slate-200 hover:text-white'
                    : 'bg-white/80 backdrop-blur-2xl border border-gray-200 text-gray-700 hover:text-gray-900'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  {activeTab === 'dashboard' ? (
                    <Grid3X3 className="w-6 h-6" />
                  ) : (
                    React.createElement(tools.find(t => t.id === activeTab)?.icon || Grid3X3, { className: "w-6 h-6" })
                  )}
                  <span className="font-semibold text-lg">
                    {activeTab === 'dashboard' ? 'Dashboard' : tools.find(t => t.id === activeTab)?.title || 'Dashboard'}
                  </span>
                </div>
                <ChevronDown className={`w-6 h-6 transition-transform duration-500 ${isMobileNavOpen ? 'rotate-180' : ''}`} />
              </button>
              {isMobileNavOpen && (
                <div className={`
                  absolute top-full left-0 right-0 mt-3 rounded-3xl z-50 overflow-hidden
                  ${theme === 'dark'
                    ? 'bg-slate-800/95 backdrop-blur-2xl border border-slate-700/60'
                    : 'bg-white/95 backdrop-blur-2xl border border-gray-200'
                  }
                `}>
                  <div className="p-3 space-y-2">
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
                        onClick={() => tool.available && stats?.sparks_remaining !== 0 && setActiveTab(tool.id)}
                        isDisabled={!tool.available || stats?.sparks_remaining === 0}
                      />
                    ))}
                  </div>
                </div>
              )}
              {isMobileNavOpen && (
                <div
                  className={`
                    fixed inset-0 z-40
                    ${theme === 'dark' ? 'bg-black/30 backdrop-blur-sm' : 'bg-black/10 backdrop-blur-sm'}
                  `}
                  onClick={() => setIsMobileNavOpen(false)}
                />
              )}
            </div>
          </div>

          {activeTab === 'dashboard' ? (
            <div className="space-y-12 md:space-y-16 px-2 sm:px-4">
              <div>
                <h2 className={`
                  text-3xl sm:text-4xl font-black mb-8 sm:mb-12 text-center
                  bg-gradient-to-r ${theme === 'dark'
                    ? 'from-slate-200 to-slate-400'
                    : 'from-gray-700 to-gray-900'
                  } bg-clip-text text-transparent
                `}>
                  Available Tools
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
                  {tools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                  <div className={`
                    group relative overflow-hidden rounded-2xl cursor-pointer transform hover:scale-[1.03] hover:-translate-y-2 p-6 shadow-xl
                    ${theme === 'dark'
                      ? 'bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-2 border-dashed border-slate-700/60 hover:border-indigo-500/40'
                      : 'bg-gradient-to-br from-white/60 to-gray-50/60 border-2 border-dashed border-gray-200/60 hover:border-indigo-400/40'
                    }
                    backdrop-blur-2xl
                  `}>
                    <div className={`
                      absolute inset-0
                      ${theme === 'dark'
                        ? 'bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5'
                        : 'bg-gradient-to-br from-indigo-200/5 via-purple-200/5 to-pink-200/5'
                      } opacity-0 group-hover:opacity-100 transition-opacity duration-700
                    `} />
                    <div className="flex flex-col items-center justify-center h-full text-center py-8 relative z-10">
                      <div className={`
                        w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-xl
                        ${theme === 'dark'
                          ? 'bg-gradient-to-br from-slate-700 to-slate-800'
                          : 'bg-gradient-to-br from-gray-100 to-white'
                        }
                      `}>
                        <Plus className={`
                          w-8 h-8
                          ${theme === 'dark' ? 'text-slate-300 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'}
                          transition-colors duration-300
                        `} />
                      </div>
                      <span className={`
                        font-bold text-xl mb-2
                        bg-gradient-to-r ${theme === 'dark'
                          ? 'from-indigo-400 to-purple-400'
                          : 'from-indigo-500 to-purple-500'
                        } bg-clip-text text-transparent
                      `}>
                        More AI Tools
                      </span>
                      <span className={theme === 'dark' ? 'text-slate-400 text-sm' : 'text-gray-500 text-sm'}>
                        Coming Soon
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`
                rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden
                ${theme === 'dark'
                  ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl border border-slate-700/60'
                  : 'bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-2xl border border-gray-200'
                }
              `}>
                <div className={`
                  absolute inset-0
                  ${theme === 'dark'
                    ? 'bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5'
                    : 'bg-gradient-to-r from-indigo-200/5 via-purple-200/5 to-pink-200/5'
                  }
                `} />
                <div className="relative z-10">
                  <h3 className={`
                    text-2xl sm:text-3xl font-black mb-8 sm:mb-12 text-center
                    bg-gradient-to-r ${theme === 'dark'
                      ? 'from-slate-200 to-slate-400'
                      : 'from-gray-700 to-gray-900'
                    } bg-clip-text text-transparent
                  `}>
                    Platform Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8 md:gap-12">
                    <StatCard
                      value="2"
                      label="Active Tools"
                      gradient={theme === 'dark' ? 'from-indigo-400 to-purple-500' : 'from-indigo-500 to-purple-600'}
                      icon={Zap}
                    />
                    <StatCard
                      value="2"
                      label="Coming Soon"
                      gradient={theme === 'dark' ? 'from-amber-400 to-orange-400' : 'from-amber-500 to-orange-500'}
                      icon={Sparkles}
                    />
                    <StatCard
                      value="100%"
                      label="AI Powered"
                      gradient={theme === 'dark' ? 'from-indigo-400 via-purple-400 to-pink-400' : 'from-indigo-500 via-purple-500 to-pink-500'}
                      icon={Activity}
                    />
                    <StatCard
                      value="24/7"
                      label="Available"
                      gradient={theme === 'dark' ? 'from-pink-400 to-indigo-400' : 'from-pink-500 to-indigo-500'}
                    />
                    <StatCard
                      value={totalSparks === 'N/A' ? sparksRemaining : `${sparksUsed}/${totalSparks}`}
                      label={totalSparks === 'N/A' ? 'Sparks Remaining' : 'Sparks Used/Total'}
                      gradient={theme === 'dark' ? 'from-teal-400 to-cyan-400' : 'from-teal-300 to-cyan-300'}
                      icon={Zap}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-2 sm:px-4">
              <div className={`
                rounded-3xl p-8 shadow-2xl
                ${theme === 'dark'
                  ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl border border-slate-700/60'
                  : 'bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-2xl border border-gray-200'
                }
              `}>
                {renderToolComponent()}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 2s infinite; }
      `}</style>
    </div>
  );
};

export default AiToolsDashboard;