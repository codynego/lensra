import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthContext'; // Assuming AuthContext is in a file named AuthContext.js
import { X, CheckCircle, ArrowLeft } from 'lucide-react';

const UpgradeComponent = ({ isOpen = true, onClose }) => {
  const { user, apiFetch } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const plansResponse = await apiFetch('/subscriptions/plans/');
      if (!plansResponse.ok) throw new Error('Failed to fetch plans');
      const plansData = await plansResponse.json();
      setPlans(
        plansData.map((plan) => ({
          ...plan,
          features: {
            max_galleries_count: plan.features?.max_galleries_count ?? 0,
            max_photos_count: plan.features?.max_photos_count ?? 0,
            storage_gb: plan.features?.storage_gb ? plan.features.storage_gb / (1024 * 1024 * 1024) : 0,
            max_bookings_count: plan.features?.max_bookings_count ?? 0,
            max_clients_count: plan.features?.max_clients_count ?? 0,
            ai_tools: plan.features?.ai_tools ?? [],
            custom_domain: plan.features?.custom_domain ?? false,
          },
        }))
      );
      setDataLoaded(true);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setError(error.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    if (isOpen && !dataLoaded) fetchPlans();
  }, [isOpen, dataLoaded, fetchPlans]);

  useEffect(() => {
    if (!isOpen) {
      setDataLoaded(false);
      setPlans([]);
      setError(null);
    }
  }, [isOpen]);

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

  const stats = user?.stats || defaultStats;

  const getUsageInfo = (current, max) => {
    if (max === -1 || max === 0) return { percentage: 0, color: '#10B981', status: 'unlimited' };
    const percentage = (current / max) * 100;
    if (percentage >= 100) return { percentage: 100, color: '#EF4444', status: 'at-limit' };
    if (percentage >= 80) return { percentage, color: '#F59E0B', status: 'warning' };
    return { percentage, color: '#10B981', status: 'good' };
  };

  const formatLimit = (limit) => {
    if (limit === undefined || limit === null) return 'N/A';
    if (limit === -1 || limit === 0) return '∞';
    return limit.toLocaleString();
  };

  const formatPrice = (price) => (price === 0 ? 'Free' : `$${price}/month`);

  const handleUpgrade = async (plan) => {
    if (plan.name === stats.plan_name) return;
    setLoading(true);
    setSelectedPlan(plan.id);

    try {
      const response = await apiFetch('/subscriptions/user-subscriptions/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: plan.id }),
      });

      if (!response.ok) throw new Error('Failed to upgrade plan');
      alert(`Successfully upgraded to ${plan.name} plan!`);
      onClose();
    } catch (error) {
      console.error('Error upgrading plan:', error);
      setError(error.message || 'Failed to upgrade plan');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/dashboard';
    }
  };

  const isCurrentPlan = (planName) => planName === stats.plan_name;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 flex items-center justify-center z-50 p-4 sm:p-6 overflow-auto">
      <div className="relative bg-slate-900 rounded-3xl w-full max-w-7xl max-h-[95vh] overflow-y-auto shadow-2xl border border-slate-700/50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-3/4 -right-4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500" />
        </div>

        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 p-6 sm:p-8 rounded-t-3xl z-10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="text-white hover:text-indigo-300 transition-colors p-2 rounded-full hover:bg-slate-800"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="text-center sm:text-left">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Upgrade Your Plan
                </h2>
                <p className="text-white text-base sm:text-lg">
                  You're on the <span className="font-semibold">{stats.plan_name}</span> plan. Unlock premium features with a new plan.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-indigo-300 transition-colors p-2 rounded-full hover:bg-slate-800"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-12 space-y-12">
          {loading ? (
            <div className="text-center text-white text-lg flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-400"></div>
              Loading...
            </div>
          ) : error ? (
            <div className="text-center text-red-400 text-lg bg-red-900/50 border border-red-700/50 rounded-xl p-4">
              {error}
            </div>
          ) : (
            <>
              {/* Current Usage Overview */}
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-6 sm:p-8 border border-slate-700/50 backdrop-blur-xl">
                <h3 className="text-xl sm:text-2xl font-semibold text-white mb-6 text-center">Current Usage</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
                  {[
                    { label: 'Galleries', current: stats.galleries_count ?? 0, max: stats.plan_limits?.max_galleries_count ?? 5 },
                    { label: 'Photos', current: stats.photos_count ?? 0, max: stats.plan_limits?.max_photos_count ?? 500 },
                    { label: 'Storage', current: (stats.storage_used_gb ?? 0).toFixed(2), max: stats.plan_limits?.storage_gb ?? 5, unit: 'GB' },
                    { label: 'Bookings', current: stats.bookings_count ?? 0, max: stats.plan_limits?.max_bookings_count ?? 100 },
                    { label: 'Clients', current: stats.clients_count ?? 0, max: stats.plan_limits?.max_clients_count ?? 100 },
                  ].map((item, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">{item.label}</span>
                        <span className="text-white font-bold">
                          {item.unit ? `${item.current} ${item.unit}` : item.current} / {formatLimit(item.max)} {item.unit || ''}
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 shadow-lg"
                          style={{
                            width: `${getUsageInfo(item.current, item.max).percentage}%`,
                            backgroundColor: getUsageInfo(item.current, item.max).color,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plan Options */}
              <div className="space-y-6">
                <h3 className="text-2xl sm:text-3xl font-semibold text-white text-center bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Choose Your Plan
                </h3>
                {plans.length === 0 ? (
                  <div className="text-center text-white text-lg bg-slate-800/50 rounded-xl p-4">No plans available</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {plans.map((plan) => (
                      <div
                        key={plan.id}
                        className={`relative group bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-6 border transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 ${
                          isCurrentPlan(plan.name)
                            ? 'border-green-500 shadow-lg shadow-green-500/20'
                            : plan.popular
                            ? 'border-indigo-500 shadow-lg shadow-indigo-500/20 scale-105'
                            : 'border-slate-700/50 hover:border-indigo-500/30'
                        } backdrop-blur-xl`}
                      >
                        {/* Badges */}
                        {plan.popular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                              Most Popular
                            </span>
                          </div>
                        )}
                        {isCurrentPlan(plan.name) && (
                          <div className="absolute -top-3 right-4">
                            <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                              Current Plan
                            </span>
                          </div>
                        )}

                        {/* Plan Details */}
                        <div className="text-center mb-6">
                          <h4 className="text-2xl font-bold text-white mb-2">{plan.name}</h4>
                          <div className="text-4xl font-extrabold text-white mb-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            {formatPrice(plan.price)}
                          </div>
                          <p className="text-white text-sm max-w-xs mx-auto">{plan.description}</p>
                        </div>

                        {/* Features */}
                        <div className="space-y-3 mb-8">
                          {[
                            { label: 'Galleries', value: plan.features.max_galleries_count },
                            { label: 'Photos', value: plan.features.max_photos_count },
                            { label: 'Storage', value: plan.features.storage_gb, unit: 'GB' },
                            { label: 'Bookings', value: plan.features.max_bookings_count },
                            { label: 'Clients', value: plan.features.max_clients_count },
                          ].map((feature, index) => (
                            <div key={index} className="flex justify-between items-center py-2 border-b border-slate-700/50">
                              <span className="text-white">{feature.label}</span>
                              <span className="text-white font-semibold">{formatLimit(feature.value)} {feature.unit || ''}</span>
                            </div>
                          ))}

                          {plan.features.ai_tools?.length > 0 && (
                            <div className="pt-3">
                              <span className="text-white text-sm block mb-2">AI Tools:</span>
                              <div className="flex flex-wrap gap-2">
                                {plan.features.ai_tools.map((tool, index) => (
                                  <span
                                    key={index}
                                    className="text-xs px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30"
                                  >
                                    {tool.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {plan.features.custom_domain && (
                            <div className="flex items-center gap-2 pt-3">
                              <CheckCircle className="w-4 h-4 text-green-400" />
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
                              ? 'bg-slate-700 text-white cursor-not-allowed'
                              : plan.popular
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-indigo-500/30'
                              : 'bg-gradient-to-r from-slate-700 to-slate-600 text-white hover:from-indigo-600 hover:to-purple-700'
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