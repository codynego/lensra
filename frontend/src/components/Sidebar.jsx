import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, BarChart3, Users, Camera, Image, Sparkles, Settings, Info, RotateCcw } from 'lucide-react';
import { useApi } from '../useApi';

const Sidebar = ({ activeTab, setActiveTab, isMenuOpen, closeMenu }) => {
  const { apiFetch } = useApi();
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchingRef = useRef(false);
  const CACHE_KEY = 'lensra_user_stats';
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  const BRAND_COLOR = '#6366f1';

  // Load cached stats from localStorage
  const loadCachedStats = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();
        if (now - timestamp < CACHE_DURATION) {
          return data;
        }
      }
    } catch (error) {
      console.error('Error loading cached stats:', error);
    }
    return null;
  };

  // Save stats to localStorage
  const saveStatsToCache = (data) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error saving stats to cache:', error);
    }
  };

  // Check if cache needs refresh
  const shouldRefreshCache = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return true;
      const { timestamp } = JSON.parse(cached);
      const now = Date.now();
      return (now - timestamp) >= CACHE_DURATION;
    } catch (error) {
      return true;
    }
  };

  // Fetch fresh stats from server
  const fetchFreshStats = async () => {
    if (fetchingRef.current) return null;
    try {
      fetchingRef.current = true;
      const response = await apiFetch('/subscriptions/me/stats/');
      if (!response.ok) {
        throw new Error('Failed to fetch user stats');
      }
      const data = await response.json();
      saveStatsToCache(data);
      return data;
    } catch (error) {
      console.error('Error fetching fresh stats:', error);
      throw error;
    } finally {
      fetchingRef.current = false;
    }
  };

  // Initialize stats from cache and fetch if needed
  useEffect(() => {
    let isMounted = true;

    const initializeStats = async () => {
      if (!isMounted) return;

      const cachedStats = loadCachedStats();
      if (cachedStats) {
        setUserStats(cachedStats);
        setLoading(false);
        if (shouldRefreshCache()) {
          try {
            const freshStats = await fetchFreshStats();
            if (isMounted && freshStats) {
              setUserStats(freshStats);
            }
          } catch (error) {
            console.error('Background refresh failed:', error);
          }
        }
      } else {
        try {
          setLoading(true);
          setError(null);
          const freshStats = await fetchFreshStats();
          if (isMounted && freshStats) {
            setUserStats(freshStats);
          }
        } catch (error) {
          if (isMounted) {
            setError(error.message || 'Failed to load user data');
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    };

    initializeStats();
    return () => {
      isMounted = false;
    };
  }, []);

  // Function to manually refresh stats
  const refreshStats = async () => {
    try {
      setError(null);
      const freshStats = await fetchFreshStats();
      if (freshStats) {
        setUserStats(freshStats);
      }
    } catch (error) {
      setError(error.message || 'Failed to refresh stats');
    }
  };

  const mainMenu = [
    { label: 'Bookings', icon: BarChart3 },
    { label: 'Clients', icon: Users },
    { label: 'Studio', icon: Camera },
    { label: 'Gallery', icon: Image },
    { label: 'AI Tools', icon: Sparkles },
    { label: 'Settings', icon: Settings },
  ];

  const formatStorageSize = (bytes) => {
    if (bytes === undefined || bytes === null) return '0 B';
    if (bytes === 'unlimited') return 'Unlimited';

    const num = parseFloat(bytes);
    if (isNaN(num)) return '0 B';

    if (num >= 1024 ** 4) {
      return `${(num / (1024 ** 4)).toFixed(1)} TB`;
    } else if (num >= 1024 ** 3) {
      return `${(num / (1024 ** 3)).toFixed(1)} GB`;
    } else if (num >= 1024 ** 2) {
      return `${(num / (1024 ** 2)).toFixed(1)} MB`;
    } else if (num >= 1024) {
      return `${(num / 1024).toFixed(1)} KB`;
    }
    return `${num} B`;
  };

  const getStoragePercentage = () => {
    if (!userStats?.storage_used || !userStats?.plan_limits?.storage_gb) return 0;
    const usedGB = parseFloat(userStats.storage_used);
    const limitGB = parseFloat(userStats.plan_limits.storage_gb);
    if (limitGB === 0) return 0;
    return Math.min((usedGB / limitGB) * 100, 100);
  };

  const getPlanName = () => {
    return userStats?.plan_name || 'Free';
  };

  const getPlanColor = (planName) => {
    if (!planName) return '#6B7280';
    const plan = planName.toLowerCase();
    if (plan.includes('starter') || plan.includes('free')) return '#6B7280';
    if (plan.includes('pro')) return '#3B82F6';
    if (plan.includes('premium')) return '#8B5CF6';
    return '#6B7280';
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return '#EF4444';
    if (percentage >= 75) return '#F59E0B';
    return BRAND_COLOR;
  };

  const getUsagePercentage = (current, max) => {
    if (!max || max === -1) return 0;
    return Math.min((current / max) * 100, 100);
  };

  const isUnlimited = (limit) => {
    return !limit || limit === -1 || limit === 0;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => closeMenu()}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white p-3 rounded-xl shadow-lg border border-gray-700 hover:bg-gray-800 transition-all duration-200"
      >
        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {isMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => closeMenu()}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-80 lg:w-64 
        bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 
        shadow-2xl border-r border-gray-700/50
        transform transition-transform duration-300 ease-in-out
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col h-screen overflow-hidden
      `}>
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Lensra
            </h1>
            <button
              onClick={() => closeMenu()}
              className="lg:hidden text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {mainMenu.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => {
                  setActiveTab(label);
                  closeMenu();
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium
                  transition-all duration-200 group relative overflow-hidden
                  ${activeTab === label 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  }
                `}
              >
                <Icon size={18} className={`${activeTab === label ? 'text-white' : 'text-gray-400 group-hover:text-indigo-400'} transition-colors`} />
                <span className="font-medium">{label}</span>
                {activeTab === label && (
                  <div className="absolute right-2 w-2 h-2 bg-white rounded-full opacity-80" />
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Stats Card */}
        <div className="p-4 border-t border-gray-700/50">
          {loading ? (
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-4 border border-gray-600/50">
              <div className="animate-pulse space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-3 bg-gray-600 rounded-full w-16"></div>
                  <div className="h-3 bg-gray-600 rounded-full w-12"></div>
                </div>
                <div className="h-2 bg-gray-600 rounded-full"></div>
                <div className="h-3 bg-gray-600 rounded-full w-20"></div>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-4 text-center">
              <p className="text-red-400 text-sm">{error}</p>
              <button 
                onClick={refreshStats}
                className="mt-2 text-xs text-red-300 hover:text-red-200 underline"
              >
                Retry
              </button>
            </div>
          ) : (
            <div
              onClick={() => setShowStatsModal(true)}
              className="bg-gradient-to-br from-gray-700 via-gray-750 to-gray-800 
                         rounded-2xl p-4 cursor-pointer transition-all duration-300 
                         hover:from-gray-600 hover:via-gray-700 hover:to-gray-750
                         border border-gray-600/50 shadow-lg group"
            >
              {/* Plan Info */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shadow-lg"
                    style={{ 
                      backgroundColor: getPlanColor(getPlanName()),
                      boxShadow: `0 0 8px ${getPlanColor(getPlanName())}40`
                    }}
                  />
                  <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    {getPlanName()}
                  </span>
                </div>
                <span className="text-xs text-gray-400 font-medium">
                  {formatStorageSize(userStats?.storage_used)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="relative mb-3">
                <div className="w-full bg-gray-600/40 rounded-full h-2 overflow-hidden backdrop-blur-sm">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out relative"
                    style={{
                      width: `${getStoragePercentage()}%`,
                      background: `linear-gradient(90deg, ${getUsageColor(getStoragePercentage())}, ${getUsageColor(getStoragePercentage())}cc)`,
                      boxShadow: `0 0 12px ${getUsageColor(getStoragePercentage())}40`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Storage Details */}
              <div className="flex justify-between items-center text-xs mb-3">
                <span className="text-gray-400">Storage Usage</span>
                <span className="text-gray-200 font-semibold">
                  {getStoragePercentage().toFixed(1)}%
                </span>
              </div>

              {/* View Details */}
              <div className="text-center">
                <div className="inline-flex items-center gap-1.5 text-xs text-gray-400 group-hover:text-indigo-400 transition-colors">
                  <Info size={12} />
                  <span>View account details</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Stats Modal */}
      {showStatsModal && userStats && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 via-gray-850 to-gray-900 
                         rounded-3xl w-full max-w-lg shadow-2xl border border-gray-600/50 
                         transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-700/50">
              <h2 className="text-2xl font-bold text-white">Account Overview</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={refreshStats}
                  disabled={loading}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-xl disabled:opacity-50"
                  title="Refresh stats"
                >
                  <RotateCcw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-xl"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Plan Card */}
              <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl p-5 border border-indigo-500/30">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-300 text-sm font-medium">Current Plan</span>
                  <span
                    className="text-sm font-bold px-4 py-2 rounded-full text-white shadow-lg"
                    style={{ backgroundColor: getPlanColor(getPlanName()) }}
                  >
                    {getPlanName()}
                  </span>
                </div>
                
                {/* Storage Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-300">
                    <span className="font-medium">Storage Usage</span>
                    <span className="font-bold text-white">
                      {getStoragePercentage().toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-600/30 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                    <div
                      className="h-3 rounded-full transition-all duration-700 relative"
                      style={{
                        width: `${getStoragePercentage()}%`,
                        background: `linear-gradient(90deg, ${getUsageColor(getStoragePercentage())}, ${getUsageColor(getStoragePercentage())}dd)`,
                        boxShadow: `0 0 15px ${getUsageColor(getStoragePercentage())}50`,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{formatStorageSize(userStats.storage_used)}</span>
                    <span>{isUnlimited(userStats?.plan_limits?.storage_gb) 
                      ? '∞' 
                      : formatStorageSize(userStats?.plan_limits?.storage_gb)}</span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Galleries', count: userStats.galleries_count, max: userStats.plan_limits.max_galleries_count, color: 'blue' },
                  { label: 'Photos', count: userStats.photos_count, max: userStats.plan_limits.max_photos_count, color: 'green' },
                  { label: 'Bookings', count: userStats.bookings_count, max: userStats.plan_limits.max_bookings_count, color: 'purple' },
                  { label: 'Clients', count: userStats.clients_count, max: userStats.plan_limits.max_clients_count, color: 'orange' }
                ].map((stat) => {
                  const colorMap = {
                    blue: '#3B82F6',
                    green: '#10B981',
                    purple: '#8B5CF6',
                    orange: '#F59E0B'
                  };
                  
                  return (
                    <div key={stat.label} className="bg-gray-700/30 rounded-2xl p-4 border border-gray-600/30 relative overflow-hidden backdrop-blur-sm">
                      <div className="text-3xl font-bold text-white mb-1">
                        {stat.count.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-300 font-medium mb-1">{stat.label}</div>
                      <div className="text-xs text-gray-400">
                        {isUnlimited(stat.max) ? 'Unlimited' : `of ${stat.max.toLocaleString()}`}
                      </div>
                      
                      {!isUnlimited(stat.max) && (
                        <div className="absolute bottom-0 left-0 h-1 bg-gray-600/50 w-full">
                          <div
                            className="h-full transition-all duration-500"
                            style={{
                              width: `${getUsagePercentage(stat.count, stat.max)}%`,
                              backgroundColor: colorMap[stat.color],
                              boxShadow: `0 0 8px ${colorMap[stat.color]}40`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* AI Tools */}
              {userStats.plan_limits.ai_tools && userStats.plan_limits.ai_tools.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">AI Tools Available</h3>
                  <div className="flex flex-wrap gap-2">
                    {userStats.plan_limits.ai_tools.map((tool, index) => (
                      <span
                        key={index}
                        className="text-xs px-3 py-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 
                                 text-indigo-300 border border-indigo-500/30 font-medium"
                      >
                        {tool.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowStatsModal(false);
                    setActiveTab('Settings');
                    closeMenu();
                  }}
                  className="flex-1 bg-gray-600/50 hover:bg-gray-600 text-white py-3 px-4 rounded-xl 
                           transition-all duration-200 font-medium border border-gray-500/50 backdrop-blur-sm"
                >
                  Manage Plan
                </button>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 
                           text-white py-3 px-4 rounded-xl transition-all duration-200 font-medium shadow-lg shadow-indigo-500/25"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;