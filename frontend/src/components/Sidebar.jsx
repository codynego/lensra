import React, { useState, useEffect, useRef } from 'react';
import { useApi } from '../useApi';

const Sidebar = ({ activeTab, setActiveTab, isMenuOpen, closeMenu, BRAND_COLOR }) => {
  const { apiFetch } = useApi();
  const [showStatsPopup, setShowStatsPopup] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchingRef = useRef(false);
  const CACHE_KEY = 'lensra_user_stats';
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Load cached stats from localStorage
  const loadCachedStats = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();
        
        // Check if cache is still valid
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

  // Common menu items for main navigation to switch tabs
  const mainMenu = [
    { label: 'Bookings' },
    { label: 'Clients' },
    { label: 'Studio' },
    { label: 'Gallery' },
    { label: 'AI Tools' },
    { label: 'Settings' },
  ];

  // Initialize stats from cache and fetch if needed
  useEffect(() => {
    let isMounted = true;

    const initializeStats = async () => {
      if (!isMounted) return;

      // First, try to load from cache
      const cachedStats = loadCachedStats();
      if (cachedStats) {
        setUserStats(cachedStats);
        setLoading(false);
        
        // If cache is getting old, fetch fresh data in background
        if (shouldRefreshCache()) {
          try {
            const freshStats = await fetchFreshStats();
            if (isMounted && freshStats) {
              setUserStats(freshStats);
            }
          } catch (error) {
            // Don't update error state since we have cached data
            console.error('Background refresh failed:', error);
          }
        }
      } else {
        // No cache available, fetch fresh data
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

  // Calculate storage usage percentage
// Calculate storage usage percentage
const getStoragePercentage = () => {
  if (!userStats?.storage_used || !userStats?.plan_limits?.storage_gb) return 0;

  const usedGB = parseFloat(userStats.storage_used) / (1024 ** 3); // bytes → GB
  const limitGB = parseFloat(userStats.plan_limits.storage_gb); // already in GB

  if (limitGB === 0) return 0; // avoid division by zero

  return Math.min((usedGB / limitGB) * 100, 100);
};


// Format storage size (input is in MB)
// Format storage size (input is in BYTES)
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

  // Get plan name from limits
  const getPlanName = () => {
    return userStats?.plan_name || 'Free';
  };

  // Get plan badge color
  const getPlanColor = (planName) => {
    if (!planName) return '#6B7280';
    const plan = planName.toLowerCase();
    if (plan.includes('starter') || plan.includes('free')) return '#6B7280';
    if (plan.includes('pro')) return '#3B82F6';
    if (plan.includes('premium')) return '#8B5CF6';
    return '#6B7280';
  };

  // Get usage color based on percentage
  const getUsageColor = (percentage) => {
    if (percentage >= 90) return '#EF4444'; // Red
    if (percentage >= 75) return '#F59E0B'; // Amber
    return BRAND_COLOR; // Brand color
  };

  // Get usage percentage for any stat
  const getUsagePercentage = (current, max) => {
    if (!max || max === -1) return 0; // -1 typically means unlimited
    return Math.min((current / max) * 100, 100);
  };

  // Check if limit is unlimited
  const isUnlimited = (limit) => {
    return !limit || limit === -1 || limit === 0;
  };

  return (
    <>
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
              onClick={() => {
                setActiveTab(label);
                if (isMenuOpen) closeMenu();
              }}
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
        {/* <div className="flex-1 overflow-y-auto">
          {activeTab === 'Bookings' && <BookingSidebar />}
          {activeTab === 'Gallery' && <GallerySidebar />}
          {activeTab === 'Studio' && <StudioSidebar />}
          {activeTab === 'AI Tools' && <AiToolSideBar />}
          {activeTab === 'Settings' && <SettingsSidebar />}
        </div> */}

        {/* Modern Storage Usage and Plan Info */}
        <div className="mt-auto">
          {loading ? (
            <div className="bg-gray-700 rounded-xl p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-600 rounded mb-2"></div>
                <div className="h-2 bg-gray-600 rounded mb-2"></div>
                <div className="h-3 bg-gray-600 rounded w-3/4"></div>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-center text-red-400 text-sm">
              Failed to load stats
            </div>
          ) : (
            <div
              className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-4 cursor-pointer hover:from-gray-600 hover:to-gray-700 transition-all duration-300 border border-gray-600/50 shadow-lg"
              onClick={() => setShowStatsPopup(true)}
            >
              {/* Plan Badge and Usage */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getPlanColor(getPlanName()) }}
                  ></div>
                  <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">
                    {getPlanName()}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {formatStorageSize(userStats?.storage_used)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-600/50 rounded-full h-1.5 mb-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out shadow-sm"
                  style={{
                    width: `${getStoragePercentage()}%`,
                    backgroundColor: getUsageColor(getStoragePercentage()),
                    boxShadow: `0 0 8px ${getUsageColor(getStoragePercentage())}20`,
                  }}
                ></div>
              </div>

              {/* Storage Info */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Storage</span>
                <span className="text-gray-300 font-medium">
                  {isUnlimited(userStats?.plan_limits?.storage_gb) 
                    ? '∞' 
                    : formatStorageSize(userStats?.plan_limits?.storage_gb)
                  }
                </span>
              </div>

              <div className="text-center mt-3">
                <div className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-300 transition-colors">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  View details
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Modern Stats Popup */}
      {showStatsPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-gray-600/50">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Account Overview</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={refreshStats}
                  className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded-lg"
                  title="Refresh stats"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => setShowStatsPopup(false)}
                  className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Plan Info Card */}
            <div className="bg-gradient-to-r from-gray-700 to-gray-600 rounded-xl p-4 mb-6 border border-gray-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 text-sm">Current Plan</span>
                <span
                  className="text-sm font-bold px-3 py-1 rounded-full text-white shadow-lg"
                  style={{ backgroundColor: getPlanColor(getPlanName()) }}
                >
                  {getPlanName()}
                </span>
              </div>
              
              {/* Storage Usage Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-sm text-gray-300 mb-2">
                  <span>Storage Usage</span>
                  <span className="font-medium">
                    {isUnlimited(userStats?.plan_limits?.storage_gb) 
                      ? `${formatStorageSize(userStats?.storage_used)} used`
                      : `${getStoragePercentage().toFixed(1)}%`
                    }
                  </span>
                </div>
                <div className="w-full bg-gray-600/50 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-500 shadow-lg"
                    style={{
                      width: `${getStoragePercentage()}%`,
                      backgroundColor: getUsageColor(getStoragePercentage()),
                      boxShadow: `0 0 10px ${getUsageColor(getStoragePercentage())}30`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{formatStorageSize(userStats?.storage_used)}</span>
                  <span>
                    {isUnlimited(userStats?.plan_limits?.storage_gb) 
                      ? '∞' 
                      : formatStorageSize(userStats?.plan_limits?.storage_gb)
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Usage Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Galleries */}
              <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/30 relative overflow-hidden">
                <div className="text-2xl font-bold text-white mb-1">
                  {userStats?.galleries_count || 0}
                </div>
                <div className="text-sm text-gray-400">Galleries</div>
                <div className="text-xs text-gray-500 mt-1">
                  {isUnlimited(userStats?.plan_limits?.max_galleries_count) 
                    ? 'Unlimited' 
                    : `of ${userStats?.plan_limits?.max_galleries_count || 0} max`
                  }
                </div>
                {!isUnlimited(userStats?.plan_limits?.max_galleries_count) && (
                  <div className="absolute bottom-0 left-0 h-1 bg-gray-600 w-full">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{
                        width: `${getUsagePercentage(
                          userStats?.galleries_count || 0,
                          userStats?.plan_limits?.max_galleries_count
                        )}%`,
                      }}
                    ></div>
                  </div>
                )}
              </div>

              {/* Photos */}
              <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/30 relative overflow-hidden">
                <div className="text-2xl font-bold text-white mb-1">
                  {userStats?.photos_count || 0}
                </div>
                <div className="text-sm text-gray-400">Photos</div>
                <div className="text-xs text-gray-500 mt-1">
                  {isUnlimited(userStats?.plan_limits?.max_photos_count) 
                    ? 'Unlimited' 
                    : `of ${userStats?.plan_limits?.max_photos_count || 0} max`
                  }
                </div>
                {!isUnlimited(userStats?.plan_limits?.max_photos_count) && (
                  <div className="absolute bottom-0 left-0 h-1 bg-gray-600 w-full">
                    <div
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{
                        width: `${getUsagePercentage(
                          userStats?.photos_count || 0,
                          userStats?.plan_limits?.max_photos_count
                        )}%`,
                      }}
                    ></div>
                  </div>
                )}
              </div>

              {/* Bookings */}
              <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/30 relative overflow-hidden">
                <div className="text-2xl font-bold text-white mb-1">
                  {userStats?.bookings_count || 0}
                </div>
                <div className="text-sm text-gray-400">Bookings</div>
                <div className="text-xs text-gray-500 mt-1">
                  {isUnlimited(userStats?.plan_limits?.max_bookings_count) 
                    ? 'Unlimited' 
                    : `of ${userStats?.plan_limits?.max_bookings_count || 0} max`
                  }
                </div>
                {!isUnlimited(userStats?.plan_limits?.max_bookings_count) && (
                  <div className="absolute bottom-0 left-0 h-1 bg-gray-600 w-full">
                    <div
                      className="h-full bg-purple-500 transition-all duration-300"
                      style={{
                        width: `${getUsagePercentage(
                          userStats?.bookings_count || 0,
                          userStats?.plan_limits?.max_bookings_count
                        )}%`,
                      }}
                    ></div>
                  </div>
                )}
              </div>

              {/* Clients */}
              <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/30 relative overflow-hidden">
                <div className="text-2xl font-bold text-white mb-1">
                  {userStats?.clients_count || 0}
                </div>
                <div className="text-sm text-gray-400">Clients</div>
                <div className="text-xs text-gray-500 mt-1">
                  {isUnlimited(userStats?.plan_limits?.max_clients_count) 
                    ? 'Unlimited' 
                    : `of ${userStats?.plan_limits?.max_clients_count || 0} max`
                  }
                </div>
                {!isUnlimited(userStats?.plan_limits?.max_clients_count) && (
                  <div className="absolute bottom-0 left-0 h-1 bg-gray-600 w-full">
                    <div
                      className="h-full bg-orange-500 transition-all duration-300"
                      style={{
                        width: `${getUsagePercentage(
                          userStats?.clients_count || 0,
                          userStats?.plan_limits?.max_clients_count
                        )}%`,
                      }}
                    ></div>
                  </div>
                )}
              </div>
            </div>

            {/* AI Tools Available */}
            {userStats?.plan_limits?.ai_tools && userStats.plan_limits.ai_tools.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-300 mb-3">AI Tools Available</h4>
                <div className="flex flex-wrap gap-2">
                  {userStats.plan_limits.ai_tools.map((tool, index) => (
                    <span
                      key={index}
                      className="text-xs px-3 py-1 rounded-full bg-gray-600 text-gray-300 border border-gray-500"
                    >
                      {tool.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowStatsPopup(false);
                  setActiveTab('Settings');
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 px-4 rounded-xl transition-all duration-200 font-medium border border-gray-500/50"
              >
                Manage Plan
              </button>
              <button
                onClick={() => setShowStatsPopup(false)}
                className="flex-1 text-white py-3 px-4 rounded-xl transition-all duration-200 font-medium shadow-lg"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;