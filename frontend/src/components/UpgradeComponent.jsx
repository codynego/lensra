import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../useApi';

const UpgradeComponent = ({ isOpen, onClose, BRAND_COLOR = '#3B82F6' }) => {
  const { apiFetch } = useApi();
  const [loading, setLoading] = useState(false); // Changed from true to false
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentStats, setCurrentStats] = useState(null);
  const [plans, setPlans] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false); // Add flag to track if data has been loaded
  isOpen = true; // Ensure isOpen is always a boolean

  // Memoize the fetch function to prevent recreating it on every render
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user stats
      const statsResponse = await apiFetch('/subscriptions/me/stats/');
      if (!statsResponse.ok) {
        throw new Error('Failed to fetch user stats');
      }
      const statsData = await statsResponse.json();
      console.log('Fetched user stats:', statsData);
      // Convert storage_used from bytes to GB for consistency with UI
      setCurrentStats({
        ...statsData,
        storage_used: statsData.storage_used / (1024 * 1024 * 1024), // Convert bytes to GB
      });

      // Fetch plans
      const plansResponse = await apiFetch('/subscriptions/plans/');
      if (!plansResponse.ok) {
        throw new Error('Failed to fetch plans');
      }
      const plansData = await plansResponse.json();
      
      // Convert storage_gb from bytes to GB for consistency
      setPlans(
        plansData.map((plan) => ({
          ...plan,
          features: {
            ...plan.features,
            storage_gb: plan.features.storage_gb / (1024 * 1024 * 1024), // Convert bytes to GB
          },
        }))
      );
      
      setDataLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  // Only fetch data when modal opens and data hasn't been loaded yet
  useEffect(() => {
    if (isOpen && !dataLoaded) {
      console.log('Fetching data with isOpen:', isOpen);
      fetchData();
    }
  }, [isOpen, dataLoaded, fetchData]);

  // Reset data when modal closes (optional - remove if you want to keep data cached)
  useEffect(() => {
    if (!isOpen) {
      setDataLoaded(false);
      setCurrentStats(null);
      setPlans([]);
      setError(null);
    }
  }, [isOpen]);

  // Fallback data if API fails or data is not yet loaded
  const defaultStats = {
    galleries_count: 0,
    photos_count: 0,
    storage_used: 0,
    bookings_count: 0,
    clients_count: 0,
    plan_limits: {
      max_galleries_count: 5,
      max_photos_count: 500,
      storage_gb: 5,
      max_bookings_count: 100,
      max_clients_count: 100,
    },
    plan_name: 'Free',
  };

  const stats = currentStats || defaultStats;

  // Get usage percentage and color
  const getUsageInfo = (current, max) => {
    if (max === -1 || max === 0) return { percentage: 0, color: '#10B981', status: 'unlimited' };
    const percentage = (current / max) * 100;
    if (percentage >= 100) return { percentage: 100, color: '#EF4444', status: 'at-limit' };
    if (percentage >= 80) return { percentage, color: '#F59E0B', status: 'warning' };
    return { percentage, color: '#10B981', status: 'good' };
  };

  const formatLimit = (limit) => {
    if (limit === -1 || limit === 0) return '∞';
    return limit.toLocaleString();
  };

  const formatPrice = (price) => {
    if (price === 0) return 'Free';
    return `$${price}/month`;
  };

  const handleUpgrade = async (plan) => {
    if (plan.name === stats.plan_name) return;

    setLoading(true);
    setSelectedPlan(plan.id);

    try {
      // Simulate API call to upgrade plan (replace with actual endpoint)
      const response = await apiFetch('/subscriptions/user-subscriptions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan_id: plan.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to upgrade plan');
      }

      alert(`Successfully upgraded to ${plan.name} plan!`);
      onClose(); // Close the modal on successful upgrade
    } catch (error) {
      console.error('Error upgrading plan:', error);
      setError(error.message || 'Failed to upgrade plan');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const isCurrentPlan = (planName) => planName === stats.plan_name;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 p-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Upgrade Your Plan</h2>
              <p className="text-gray-400">
                You're currently on the <span className="text-white font-semibold">{stats.plan_name}</span> plan. 
                Unlock more features by upgrading.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-xl"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {loading ? (
            <div className="text-center text-gray-400 text-lg">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-400 text-lg">{error}</div>
          ) : (
            <>
              {/* Current Usage Overview */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl p-6 border border-gray-600/50">
                <h3 className="text-xl font-semibold text-white mb-6">Current Usage Overview</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Galleries */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 font-medium">Galleries</span>
                      <span className="text-white font-bold">
                        {stats.galleries_count} / {formatLimit(stats.plan_limits.max_galleries_count)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 shadow-lg"
                        style={{
                          width: `${getUsageInfo(stats.galleries_count, stats.plan_limits.max_galleries_count).percentage}%`,
                          backgroundColor: getUsageInfo(stats.galleries_count, stats.plan_limits.max_galleries_count).color,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Photos */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 font-medium">Photos</span>
                      <span className="text-white font-bold">
                        {stats.photos_count} / {formatLimit(stats.plan_limits.max_photos_count)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 shadow-lg"
                        style={{
                          width: `${getUsageInfo(stats.photos_count, stats.plan_limits.max_photos_count).percentage}%`,
                          backgroundColor: getUsageInfo(stats.photos_count, stats.plan_limits.max_photos_count).color,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Storage */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 font-medium">Storage</span>
                      <span className="text-white font-bold">
                        {stats.storage_used.toFixed(2)} GB / {formatLimit(stats.plan_limits.storage_gb)} GB
                      </span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 shadow-lg"
                        style={{
                          width: `${getUsageInfo(stats.storage_used, stats.plan_limits.storage_gb).percentage}%`,
                          backgroundColor: getUsageInfo(stats.storage_used, stats.plan_limits.storage_gb).color,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Bookings */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 font-medium">Bookings</span>
                      <span className="text-white font-bold">
                        {stats.bookings_count} / {formatLimit(stats.plan_limits.max_bookings_count)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 shadow-lg"
                        style={{
                          width: `${getUsageInfo(stats.bookings_count, stats.plan_limits.max_bookings_count).percentage}%`,
                          backgroundColor: getUsageInfo(stats.bookings_count, stats.plan_limits.max_bookings_count).color,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Clients */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 font-medium">Clients</span>
                      <span className="text-white font-bold">
                        {stats.clients_count} / {formatLimit(stats.plan_limits.max_clients_count)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 shadow-lg"
                        style={{
                          width: `${getUsageInfo(stats.clients_count, stats.plan_limits.max_clients_count).percentage}%`,
                          backgroundColor: getUsageInfo(stats.clients_count, stats.plan_limits.max_clients_count).color,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan Options */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-white text-center">Choose Your Plan</h3>
                
                {plans.length === 0 ? (
                  <div className="text-center text-gray-400 text-lg">No plans available</div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                      <div
                        key={plan.id}
                        className={`relative bg-gradient-to-b from-gray-800 to-gray-700 rounded-2xl p-6 border transition-all duration-300 ${
                          isCurrentPlan(plan.name)
                            ? 'border-green-500 shadow-lg shadow-green-500/20'
                            : plan.popular
                            ? 'border-blue-500 shadow-lg shadow-blue-500/20 scale-105'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        {/* Popular Badge */}
                        {plan.popular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <span className="bg-blue-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                              Most Popular
                            </span>
                          </div>
                        )}

                        {/* Current Plan Badge */}
                        {isCurrentPlan(plan.name) && (
                          <div className="absolute -top-3 right-4">
                            <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                              Current Plan
                            </span>
                          </div>
                        )}

                        <div className="text-center mb-6">
                          <h4 className="text-2xl font-bold text-white mb-2">{plan.name}</h4>
                          <div className="text-4xl font-extrabold text-white mb-2">
                            {formatPrice(plan.price)}
                          </div>
                          <p className="text-gray-400 text-sm">{plan.description}</p>
                        </div>

                        {/* Features */}
                        <div className="space-y-4 mb-8">
                          <div className="flex justify-between items-center py-2 border-b border-gray-600/50">
                            <span className="text-gray-300">Galleries</span>
                            <span className="text-white font-semibold">{formatLimit(plan.features.max_galleries_count)}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-600/50">
                            <span className="text-gray-300">Photos</span>
                            <span className="text-white font-semibold">{formatLimit(plan.features.max_photos_count)}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-600/50">
                            <span className="text-gray-300">Storage</span>
                            <span className="text-white font-semibold">{formatLimit(plan.features.storage_gb)} GB</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-600/50">
                            <span className="text-gray-300">Bookings</span>
                            <span className="text-white font-semibold">{formatLimit(plan.features.max_bookings_count)}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-600/50">
                            <span className="text-gray-300">Clients</span>
                            <span className="text-white font-semibold">{formatLimit(plan.features.max_clients_count)}</span>
                          </div>

                          {/* AI Tools */}
                          {plan.features.ai_tools?.length > 0 && (
                            <div className="pt-2">
                              <span className="text-gray-300 text-sm block mb-2">AI Tools:</span>
                              <div className="flex flex-wrap gap-1">
                                {plan.features.ai_tools.map((tool, index) => (
                                  <span
                                    key={index}
                                    className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30"
                                  >
                                    {tool.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Custom Domain */}
                          {plan.features.custom_domain && (
                            <div className="flex items-center gap-2 pt-2">
                              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className="text-green-400 text-sm font-medium">Custom Domain</span>
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <button
                          onClick={() => handleUpgrade(plan)}
                          disabled={isCurrentPlan(plan.name) || loading}
                          className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                            isCurrentPlan(plan.name)
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : plan.popular
                              ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-500/30'
                              : 'bg-gray-600 hover:bg-gray-500 text-white'
                          }`}
                        >
                          {loading && selectedPlan === plan.id ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              Processing...
                            </div>
                          ) : isCurrentPlan(plan.name) ? (
                            'Current Plan'
                          ) : (
                            `Upgrade to ${plan.name}`
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpgradeComponent;