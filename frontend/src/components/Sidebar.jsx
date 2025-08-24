import React, { useState } from 'react';
import { Menu, X, BarChart3, Users, Camera, Image, Sparkles, Settings, Info, RotateCcw } from 'lucide-react';
import { useAuth } from '../AuthContext'; // Assuming AuthContext is in a file named AuthContext.js

const Sidebar = ({ activeTab, setActiveTab, isMenuOpen, closeMenu }) => {
  const { user } = useAuth();
  const [showStatsModal, setShowStatsModal] = useState(false);

  const defaultStats = {
    galleries_count: 0,
    photos_count: 0,
    storage_used_gb: 0,
    bookings_count: 0,
    clients_count: 0,
    plan_limits: {
      max_galleries_count: 5,
      max_photos_count: 500,
      storage_gb: 5,
      max_bookings_count: 100,
      max_clients_count: 100,
      ai_tools: [],
    },
    plan_name: 'Free',
  };

  const stats = user?.stats || defaultStats;

  const mainMenu = [
    { label: 'Bookings', icon: BarChart3 },
    { label: 'Clients', icon: Users },
    { label: 'Studio', icon: Camera },
    { label: 'Gallery', icon: Image },
    { label: 'Messages', icon: Sparkles },
    { label: 'AI Tools', icon: Sparkles },
    { label: 'Settings', icon: Settings },
  ];

  const formatStorageSize = (gb) => {
    if (gb === undefined || gb === null) return '0 GB';
    if (gb === 'unlimited') return 'Unlimited';
    const num = parseFloat(gb);
    if (isNaN(num)) return '0 GB';
    if (num >= 1024) return `${(num / 1024).toFixed(1)} TB`;
    return `${num.toFixed(1)} GB`;
  };

  const getStoragePercentage = () => {
    if (!stats?.storage_used_gb || !stats?.plan_limits?.storage_gb) return 0;
    const usedGB = parseFloat(stats.storage_used_gb);
    const limitGB = parseFloat(stats.plan_limits.storage_gb);
    if (limitGB === 0) return 0;
    return Math.min((usedGB / limitGB) * 100, 100);
  };

  const getPlanName = () => {
    return stats?.plan_name || 'Free';
  };

  const getPlanColor = (planName) => {
    if (!planName) return '#64748B'; // Slate-500
    const plan = planName.toLowerCase();
    if (plan.includes('starter') || plan.includes('free')) return '#64748B'; // Slate-500
    if (plan.includes('pro')) return '#4F46E5'; // Indigo-600
    if (plan.includes('premium')) return '#9333EA'; // Purple-600
    return '#64748B'; // Slate-500
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return '#EF4444'; // Red-500
    if (percentage >= 75) return '#F59E0B'; // Amber-500
    return '#4F46E5'; // Indigo-600 (Brand color)
  };

  const getUsagePercentage = (current, max) => {
    if (!max || max === -1) return 0;
    return Math.min((current / max) * 100, 100);
  };

  const isUnlimited = (limit) => {
    return !limit || limit === -1 || limit === 0;
  };

  const isStarterPlan = () => {
    const planName = getPlanName().toLowerCase();
    return planName.includes('starter') || planName.includes('free');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => closeMenu()}
        className="lg:hidden fixed top-4 left-4 z-50 bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-700/50 hover:bg-slate-800 transition-all duration-200"
      >
        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {isMenuOpen && (
        <div
          className="lg:hidden fixed top-0 left-0 right-0 bottom-0 bg-black/50 z-30"
          onClick={() => closeMenu()}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40 w-80 lg:w-64 
          bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 
          shadow-2xl border-r border-slate-700/50
          transform transition-transform duration-300 ease-in-out
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col h-screen overflow-hidden
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Lensra
            </h1>
            <button
              onClick={() => closeMenu()}
              className="lg:hidden text-white hover:text-indigo-300 p-1 rounded-lg hover:bg-slate-800 transition-colors"
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
                  ${
                    activeTab === label
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
                      : 'text-white hover:text-indigo-300 hover:bg-slate-800/50'
                  }
                `}
              >
                <Icon
                  size={18}
                  className={`${
                    activeTab === label ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                  } transition-colors`}
                />
                <span className="font-medium">{label}</span>
                {activeTab === label && (
                  <div className="absolute right-2 w-2 h-2 bg-white rounded-full opacity-80" />
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Stats Card */}
        <div className="p-4 border-t border-slate-700/50">
          <div
            onClick={() => setShowStatsModal(true)}
            className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 border border-slate-700/50 backdrop-blur-xl group"
          >
            {/* Plan Info */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shadow-lg"
                  style={{
                    backgroundColor: getPlanColor(getPlanName()),
                    boxShadow: `0 0 8px ${getPlanColor(getPlanName())}40`,
                  }}
                />
                <span className="text-xs font-semibold text-white uppercase tracking-wider">
                  {getPlanName()}
                </span>
              </div>
              <span className="text-xs text-white font-medium">{formatStorageSize(stats.storage_used_gb)}</span>
            </div>

            {/* Progress Bar */}
            <div className="relative mb-3">
              <div className="w-full bg-slate-700/40 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out relative"
                  style={{
                    width: `${getStoragePercentage()}%`,
                    background: `linear-gradient(90deg, ${getUsageColor(getStoragePercentage())}, ${getUsageColor(
                      getStoragePercentage()
                    )}cc)`,
                    boxShadow: `0 0 12px ${getUsageColor(getStoragePercentage())}40`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </div>
              </div>
            </div>

            {/* Storage Details */}
            <div className="flex justify-between items-center text-xs mb-3">
              <span className="text-white">Storage Usage</span>
              <span className="text-white font-semibold">{getStoragePercentage().toFixed(1)}%</span>
            </div>

            {/* View Details and Upgrade Button */}
            <div className="flex justify-between items-center">
              <div className="inline-flex items-center gap-1.5 text-xs text-white group-hover:text-indigo-400 transition-colors">
                <Info size={12} />
                <span>View account details</span>
              </div>
              {isStarterPlan() && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent modal from opening
                    setActiveTab('Settings');
                    closeMenu();
                  }}
                  className="text-xs px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-indigo-500/30"
                >
                  Upgrade
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Stats Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 via-slate-850 to-indigo-950 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-700/50 transform transition-all duration-300 scale-100 max-h-[70vh] overflow-y-auto backdrop-blur-xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-700/50">
              <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Account Overview
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="text-white hover:text-indigo-300 transition-colors p-2 hover:bg-slate-800 rounded-xl"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Plan Card */}
              <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl p-5 border border-indigo-500/30">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white text-sm font-medium">Current Plan</span>
                  <span
                    className="text-sm font-bold px-4 py-2 rounded-full text-white shadow-lg"
                    style={{ backgroundColor: getPlanColor(getPlanName()) }}
                  >
                    {getPlanName()}
                  </span>
                </div>

                {/* Storage Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-white">
                    <span className="font-medium">Storage Usage</span>
                    <span className="font-bold">{getStoragePercentage().toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-700/30 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-3 rounded-full transition-all duration-700 relative"
                      style={{
                        width: `${getStoragePercentage()}%`,
                        background: `linear-gradient(90deg, ${getUsageColor(getStoragePercentage())}, ${getUsageColor(
                          getStoragePercentage()
                        )}dd)`,
                        boxShadow: `0 0 15px ${getUsageColor(getStoragePercentage())}50`,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-white">
                    <span>{formatStorageSize(stats.storage_used_gb)}</span>
                    <span>{isUnlimited(stats?.plan_limits?.storage_gb) ? '∞' : formatStorageSize(stats?.plan_limits?.storage_gb)}</span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Galleries', count: stats.galleries_count ?? 0, max: stats.plan_limits?.max_galleries_count, color: 'indigo' },
                  { label: 'Photos', count: stats.photos_count ?? 0, max: stats.plan_limits?.max_photos_count, color: 'green' },
                  { label: 'Bookings', count: stats.bookings_count ?? 0, max: stats.plan_limits?.max_bookings_count, color: 'purple' },
                  { label: 'Clients', count: stats.clients_count ?? 0, max: stats.plan_limits?.max_clients_count, color: 'pink' },
                ].map((stat) => {
                  const colorMap = {
                    indigo: '#4F46E5', // Indigo-600
                    green: '#10B981', // Green-500
                    purple: '#9333EA', // Purple-600
                    pink: '#EC4899', // Pink-500
                  };
                  return (
                    <div key={stat.label} className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/30 relative overflow-hidden">
                      <div className="text-3xl font-bold text-white mb-1">{stat.count.toLocaleString()}</div>
                      <div className="text-sm text-white font-medium mb-1">{stat.label}</div>
                      <div className="text-xs text-white">
                        {isUnlimited(stat.max) ? 'Unlimited' : `of ${stat.max?.toLocaleString() ?? 'N/A'}`}
                      </div>
                      {!isUnlimited(stat.max) && (
                        <div className="absolute bottom-0 left-0 h-1 bg-slate-700/50 w-full">
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
              {stats.plan_limits?.ai_tools?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">AI Tools Available</h3>
                  <div className="flex flex-wrap gap-2">
                    {stats.plan_limits.ai_tools.map((tool, index) => (
                      <span
                        key={index}
                        className="text-xs px-3 py-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30 font-medium"
                      >
                        {tool.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
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
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-3 px-4 rounded-xl transition-all duration-200 font-medium shadow-lg shadow-indigo-500/25"
                >
                  Manage Plan
                </button>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="flex-1 bg-slate-700/50 hover:bg-slate-600 text-white py-3 px-4 rounded-xl transition-all duration-200 font-medium border border-slate-500/50"
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