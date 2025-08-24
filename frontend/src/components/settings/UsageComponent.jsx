import React, { useState, useEffect, useRef } from "react";
import { Sparkles, CheckCircle, AlertCircle, CreditCard, ArrowRight, Users, Camera, HardDrive, Calendar, Image } from "lucide-react";
import { useAuth } from "../../AuthContext";

export default function UsageComponent({ theme = "dark" }) {
  const { authState, apiFetch, fetchUserStats } = useAuth();
  const [formData, setFormData] = useState({
    selectedPlanId: null,
  });
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState({});
  const isFetching = useRef(false);

  useEffect(() => {
    if (isFetching.current) return;

    const fetchData = async () => {
      isFetching.current = true;
      try {
        setLoading(true);
        setErrors({});

        // Fetch plans
        const plansResponse = await apiFetch('/subscriptions/plans/');
        if (!plansResponse.ok) throw new Error('Failed to fetch plans');
        const plansData = await plansResponse.json();
        setPlans(
          plansData.map((plan) => ({
            ...plan,
            features: {
              ...plan.features,
              storage_gb: plan.features.storage_gb ? plan.features.storage_gb / (1024 * 1024 * 1024) : 0,
            },
          }))
        );

        // Refresh user stats if needed
        if (!authState.user?.stats) {
          await fetchUserStats();
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrors({ api: error.message || 'Failed to load data' });
      } finally {
        setLoading(false);
        isFetching.current = false;
      }
    };

    fetchData();
  }, [apiFetch, authState.user?.stats, fetchUserStats]);

  const refetchData = async () => {
    if (isFetching.current) return;

    isFetching.current = true;
    try {
      setLoading(true);
      setErrors({});

      // Refresh user stats
      await fetchUserStats();

      // Fetch plans
      const plansResponse = await apiFetch('/subscriptions/plans/');
      if (!plansResponse.ok) throw new Error('Failed to fetch plans');
      const plansData = await plansResponse.json();
      setPlans(
        plansData.map((plan) => ({
          ...plan,
          features: {
            ...plan.features,
            storage_gb: plan.features.storage_gb ? plan.features.storage_gb / (1024 * 1024 * 1024) : 0,
          },
        }))
      );
    } catch (error) {
      console.error('Error refetching data:', error);
      setErrors({ api: error.message || 'Failed to load data' });
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  const defaultStats = {
    galleries_count: 0,
    photos_count: 0,
    storage_used: 0,
    bookings_count: 0,
    clients_count: 0,
    sparks_remaining: 0,
    max_sparks: 100,
    plan_limits: {
      max_galleries_count: 5,
      max_photos_count: 500,
      storage_gb: 5,
      max_bookings_count: 100,
      max_clients_count: 100,
      max_sparks: 100,
    },
    plan_name: 'Free',
  };

  // Use stats from AuthContext, with fallback to default
  const stats = authState.user?.stats
    ? {
        ...authState.user.stats,
        storage_used: authState.user.stats.storage_used_gb || (authState.user.stats.storage_used / (1024 * 1024 * 1024)) || 0,
        sparks_remaining: authState.user.stats.sparks_remaining ?? defaultStats.sparks_remaining,
        max_sparks: authState.user.stats.max_sparks ?? defaultStats.max_sparks,
        plan_limits: {
          max_galleries_count: authState.user.stats.plan_limits?.max_galleries_count ?? defaultStats.plan_limits.max_galleries_count,
          max_photos_count: authState.user.stats.plan_limits?.max_photos_count ?? defaultStats.plan_limits.max_photos_count,
          storage_gb: authState.user.stats.plan_limits?.storage_gb ?? defaultStats.plan_limits.storage_gb,
          max_bookings_count: authState.user.stats.plan_limits?.max_bookings_count ?? defaultStats.plan_limits.max_bookings_count,
          max_clients_count: authState.user.stats.plan_limits?.max_clients_count ?? defaultStats.plan_limits.max_clients_count,
          max_sparks: authState.user.stats.plan_limits?.max_sparks ?? defaultStats.plan_limits.max_sparks,
        },
      }
    : defaultStats;

  const getUsageInfo = (current, max) => {
    if (max === -1 || max === 0) return { percentage: 0, color: theme === 'dark' ? '#10B981' : '#059669', status: 'unlimited' };
    const percentage = (current / max) * 100;
    if (percentage >= 100) return { percentage: 100, color: theme === 'dark' ? '#EF4444' : '#DC2626', status: 'at-limit' };
    if (percentage >= 80) return { percentage, color: theme === 'dark' ? '#F59E0B' : '#D97706', status: 'warning' };
    return { percentage, color: theme === 'dark' ? '#10B981' : '#059669', status: 'good' };
  };

  const formatLimit = (limit) => {
    if (limit === null || limit === undefined) return 'N/A';
    if (limit === -1 || limit === 0) return '∞';
    return Number(limit).toLocaleString();
  };

  const formatPrice = (price) => (price === 0 ? 'Free' : `$${price}/month`);

  const handlePlanSelect = (planId) => {
    if (success) setSuccess("");
    setFormData((prev) => ({ ...prev, selectedPlanId: planId }));
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.selectedPlanId) {
      newErrors.selectedPlanId = 'Please select a plan to upgrade';
    } else if (plans.find((plan) => plan.id === formData.selectedPlanId)?.name === stats.plan_name) {
      newErrors.selectedPlanId = 'This is your current plan';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    setErrors({});
    setSuccess("");

    try {
      const response = await apiFetch('/subscriptions/user-subscriptions/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: formData.selectedPlanId }),
      });
      if (!response.ok) throw new Error('Failed to upgrade plan');
      const selectedPlan = plans.find((plan) => plan.id === formData.selectedPlanId);
      setSuccess(`Successfully upgraded to ${selectedPlan.name} plan!`);
      setTimeout(() => setSuccess(""), 5000);
      setFormData({ selectedPlanId: null });
      await refetchData();
    } catch (error) {
      console.error('Error upgrading plan:', error);
      setErrors({ api: error.message || 'Failed to upgrade plan' });
    } finally {
      setSaving(false);
    }
  };

  const handleFeatureComparison = () => {
    window.location.href = '/upgrade';
  };

  if (authState.loading || loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950' 
          : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
      }`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-2 mx-auto mb-3 sm:mb-4 ${
            theme === 'dark' ? 'border-indigo-400 border-t-transparent' : 'border-indigo-600 border-t-transparent'
          }`}></div>
          <p className={`font-medium text-sm sm:text-base ${
            theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
          }`}>Loading subscription data...</p>
        </div>
      </div>
    );
  }

  const usageItems = [
    { 
      label: 'Galleries', 
      current: stats.galleries_count ?? 0, 
      max: stats.plan_limits.max_galleries_count,
      icon: Camera,
      color: 'from-blue-500 to-indigo-600'
    },
    { 
      label: 'Photos', 
      current: stats.photos_count ?? 0, 
      max: stats.plan_limits.max_photos_count,
      icon: Image,
      color: 'from-purple-500 to-pink-600'
    },
    { 
      label: 'Storage', 
      current: Number(stats.storage_used).toFixed(1), 
      max: stats.plan_limits.storage_gb, 
      unit: 'GB',
      icon: HardDrive,
      color: 'from-green-500 to-teal-600'
    },
    { 
      label: 'Bookings', 
      current: stats.bookings_count ?? 0, 
      max: stats.plan_limits.max_bookings_count,
      icon: Calendar,
      color: 'from-orange-500 to-red-600'
    },
    { 
      label: 'Clients', 
      current: stats.clients_count ?? 0, 
      max: stats.plan_limits.max_clients_count,
      icon: Users,
      color: 'from-cyan-500 to-blue-600'
    },
    { 
      label: 'Sparks', 
      current: stats.sparks_remaining ?? 0, 
      max: stats.plan_limits.max_sparks,
      icon: Sparkles,
      color: 'from-yellow-500 to-orange-600'
    },
  ];

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

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg backdrop-blur-xl ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600' 
                  : 'bg-gradient-to-r from-indigo-400 to-purple-500'
              }`}>
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
            <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 leading-tight px-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Upgrade Your <span className={`text-transparent bg-clip-text bg-gradient-to-r ${
                theme === 'dark' ? 'from-indigo-400 to-purple-400' : 'from-indigo-600 to-purple-600'
              }`}>Experience</span>
            </h1>
            <p className={`text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed px-2 ${
              theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
            }`}>
              You're currently on the <span className={`font-semibold ${
                theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
              }`}>{stats.plan_name}</span> plan. 
              Unlock powerful features and scale your photography business.
            </p>
            {authState.user && (
              <p className={`text-sm sm:text-base mt-2 ${
                theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
              }`}>
                Welcome back, <span className={`font-medium ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                }`}>{authState.user.first_name || authState.user.username}</span>!
              </p>
            )}
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="max-w-4xl mx-auto mb-6 sm:mb-8">
              <div className={`bg-emerald-500/10 border rounded-xl p-3 sm:p-4 flex items-center backdrop-blur-xl animate-fade-in ${
                theme === 'dark' ? 'border-emerald-500/30' : 'border-emerald-200'
              }`}>
                <CheckCircle className={`w-5 h-5 sm:w-6 sm:h-6 mr-3 flex-shrink-0 ${
                  theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                }`} />
                <span className={`font-medium text-sm sm:text-base break-words ${
                  theme === 'dark' ? 'text-emerald-300' : 'text-emerald-800'
                }`}>{success}</span>
              </div>
            </div>
          )}

          {errors.api && (
            <div className="max-w-4xl mx-auto mb-6 sm:mb-8">
              <div className={`bg-red-500/10 border rounded-xl p-3 sm:p-4 flex items-center backdrop-blur-xl animate-fade-in ${
                theme === 'dark' ? 'border-red-500/30' : 'border-red-200'
              }`}>
                <AlertCircle className={`w-5 h-5 sm:w-6 sm:h-6 mr-3 flex-shrink-0 ${
                  theme === 'dark' ? 'text-red-400' : 'text-red-600'
                }`} />
                <span className={`font-medium text-sm sm:text-base break-words ${
                  theme === 'dark' ? 'text-red-300' : 'text-red-800'
                }`}>{errors.api}</span>
              </div>
            </div>
          )}

          {/* Current Usage Overview */}
          <div className="max-w-6xl mx-auto mb-8 sm:mb-12 lg:mb-16">
            <div className={`rounded-2xl shadow-2xl border overflow-hidden ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl border-slate-700/60' 
                : 'bg-white border-gray-200'
            }`}>
              <div className={`px-4 sm:px-6 lg:px-8 py-4 sm:py-6 ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600' 
                  : 'bg-gradient-to-r from-indigo-400 to-purple-500'
              }`}>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2">Current Usage Overview</h2>
                <p className="text-indigo-100 text-sm sm:text-base">Track your usage across all features</p>
              </div>
              
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
                  {usageItems.map((item, index) => {
                    const usage = getUsageInfo(item.current, item.max);
                    const IconComponent = item.icon;
                    
                    return (
                      <div key={index} className="text-center group">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-500`}>
                          <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <h3 className={`text-base sm:text-lg font-bold mb-1 sm:mb-2 truncate ${
                          theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                        }`}>{item.label}</h3>
                        <div className={`text-xs sm:text-sm mb-2 sm:mb-3 break-words ${
                          theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                        }`}>
                          {item.current} / {formatLimit(item.max)} {item.unit || ''}
                        </div>
                        <div className={`w-full rounded-full h-1.5 sm:h-2 overflow-hidden backdrop-blur-xl border ${
                          theme === 'dark' ? 'bg-slate-700/50 border-slate-600/30' : 'bg-gray-200 border-gray-300/50'
                        }`}>
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ 
                              width: `${Math.min(usage.percentage, 100)}%`,
                              background: `linear-gradient(90deg, ${usage.color})`
                            }}
                          ></div>
                        </div>
                        <div className={`text-xs mt-1 sm:mt-2 ${
                          theme === 'dark' ? 'text-slate-500' : 'text-gray-500'
                        }`}>
                          {usage.status === 'unlimited' ? 'Unlimited' : `${Math.round(usage.percentage)}% used`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Plans Section */}
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 sm:mb-10 lg:mb-12">
              <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-black mb-3 sm:mb-4 leading-tight ${
                theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
              }`}>Choose Your Perfect Plan</h2>
              <p className={`text-base sm:text-lg max-w-2xl mx-auto leading-relaxed px-2 ${
                theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
              }`}>Scale your photography business with features designed for growth</p>
            </div>

            {plans.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className={`text-base sm:text-lg ${
                  theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                }`}>No plans available at the moment</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
                {plans.map((plan, index) => {
                  const isCurrent = plan.name === stats.plan_name;
                  const isSelected = formData.selectedPlanId === plan.id;
                  const isPopular = plan.popular;
                  
                  return (
                    <div
                      key={plan.id}
                      className={`relative rounded-2xl shadow-xl border-2 transition-all duration-500 cursor-pointer transform hover:scale-[1.02] hover:-translate-y-1 ${
                        theme === 'dark'
                          ? `bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl ${
                              isSelected
                                ? 'border-indigo-500/60 shadow-indigo-500/30 scale-[1.02] -translate-y-1'
                                : isCurrent
                                ? 'border-emerald-500/60 shadow-emerald-500/30'
                                : isPopular
                                ? 'border-indigo-400/40 shadow-indigo-500/20 lg:scale-105'
                                : 'border-slate-700/60 hover:border-indigo-500/40'
                            }`
                          : `bg-white ${
                              isSelected
                                ? 'border-indigo-500 shadow-indigo-500/20 scale-[1.02] -translate-y-1'
                                : isCurrent
                                ? 'border-emerald-500 shadow-emerald-500/20'
                                : isPopular
                                ? 'border-indigo-300 shadow-indigo-500/10 lg:scale-105'
                                : 'border-gray-200 hover:border-indigo-300'
                            }`
                      }`}
                      onClick={() => handlePlanSelect(plan.id)}
                    >
                      {/* Glow effect */}
                      {(isSelected || isPopular) && (
                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${
                          theme === 'dark' 
                            ? 'from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-xl' 
                            : 'from-indigo-200/10 via-purple-200/10 to-pink-200/10 blur-lg'
                        }`} />
                      )}

                      {/* Plan Badges */}
                      {isPopular && !isCurrent && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                          <div className={`text-xs sm:text-sm font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg backdrop-blur-xl border ${
                            theme === 'dark' 
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-400/30' 
                              : 'bg-gradient-to-r from-indigo-400 to-purple-500 text-white border-indigo-300/30'
                          }`}>
                            Most Popular
                          </div>
                        </div>
                      )}
                      
                      {isCurrent && (
                        <div className="absolute -top-3 right-4 sm:right-6 z-10">
                          <div className={`text-xs sm:text-sm font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg backdrop-blur-xl border ${
                            theme === 'dark' 
                              ? 'bg-emerald-500 text-white border-emerald-400/30' 
                              : 'bg-emerald-400 text-white border-emerald-300/30'
                          }`}>
                            Current Plan
                          </div>
                        </div>
                      )}

                      {isSelected && !isCurrent && (
                        <div className="absolute -top-3 left-4 sm:left-6 z-10">
                          <div className={`text-xs sm:text-sm font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg backdrop-blur-xl border ${
                            theme === 'dark' 
                              ? 'bg-indigo-500 text-white border-indigo-400/30' 
                              : 'bg-indigo-400 text-white border-indigo-300/30'
                          }`}>
                            Selected
                          </div>
                        </div>
                      )}

                      <div className="relative p-4 sm:p-6 lg:p-8 z-10">
                        {/* Plan Header */}
                        <div className="text-center mb-6 sm:mb-8">
                          <div className={`inline-flex p-3 rounded-2xl mb-3 sm:mb-4 shadow-lg ${
                            theme === 'dark'
                              ? isSelected || isPopular 
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600' 
                                : 'bg-slate-700/60 backdrop-blur-xl border border-slate-600/30'
                              : isSelected || isPopular 
                                ? 'bg-gradient-to-r from-indigo-400 to-purple-500' 
                                : 'bg-gray-100 border border-gray-200/50'
                          }`}>
                            <CreditCard className={`w-6 h-6 sm:w-8 sm:h-8 ${
                              isSelected || isPopular 
                                ? 'text-white' 
                                : theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                            }`} />
                          </div>
                          <h3 className={`text-xl sm:text-2xl font-black mb-2 truncate ${
                            theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                          }`}>{plan.name}</h3>
                          <div className={`text-3xl sm:text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r ${
                            theme === 'dark' ? 'from-indigo-400 to-purple-400' : 'from-indigo-600 to-purple-600'
                          }`}>
                            {formatPrice(plan.name === "Free" ? 0 : plan.price || 10)}
                          </div>
                          <p className={`text-sm sm:text-base leading-relaxed break-words ${
                            theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                          }`}>{plan.description}</p>
                        </div>

                        {/* Features List */}
                        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                          {[
                            { label: 'Galleries', value: plan.features.max_galleries_count },
                            { label: 'Photos', value: plan.features.max_photos_count },
                            { label: 'Storage', value: plan.features.storage_gb, unit: 'GB' },
                            { label: 'Bookings', value: plan.features.max_bookings_count },
                            { label: 'Clients', value: plan.features.max_clients_count },
                            { label: 'Sparks', value: plan.features.max_sparks },
                          ].map((feature, featureIndex) => (
                            <div key={featureIndex} className={`flex justify-between items-center py-2 sm:py-3 border-b ${
                              theme === 'dark' ? 'border-slate-700/50' : 'border-gray-100'
                            }`}>
                              <span className={`font-medium text-sm sm:text-base truncate pr-2 ${
                                theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                              }`}>{feature.label}</span>
                              <span className={`font-bold text-sm sm:text-base flex-shrink-0 ${
                                theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                              }`}>
                                {formatLimit(feature.value)} {feature.unit || ''}
                              </span>
                            </div>
                          ))}
                          
                          {/* AI Tools */}
                          {plan.features.ai_tools?.length > 0 && (
                            <div className="pt-3 sm:pt-4">
                              <div className={`font-medium mb-2 sm:mb-3 text-sm sm:text-base ${
                                theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                              }`}>AI Tools:</div>
                              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                {plan.features.ai_tools.map((tool, toolIndex) => (
                                  <span
                                    key={toolIndex}
                                    className={`inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium backdrop-blur-xl border ${
                                      theme === 'dark'
                                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                                        : 'bg-indigo-100 text-indigo-800 border-indigo-200/50'
                                    }`}
                                  >
                                    {tool.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Custom Domain */}
                          {plan.features.custom_domain && (
                            <div className="flex items-center gap-2 pt-2 sm:pt-3">
                              <CheckCircle className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${
                                theme === 'dark' ? 'text-emerald-400' : 'text-emerald-500'
                              }`} />
                              <span className={`font-medium text-sm sm:text-base ${
                                theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                              }`}>Custom Domain Included</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Error for plan selection */}
            {errors.selectedPlanId && (
              <div className={`flex items-center justify-center mb-6 sm:mb-8 animate-fade-in px-4 ${
                theme === 'dark' ? 'text-red-400' : 'text-red-600'
              }`}>
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base text-center break-words">{errors.selectedPlanId}</span>
              </div>
            )}

            {/* Upgrade Button */}
            <div className="flex justify-center mb-8 sm:mb-12 lg:mb-16">
              <button
                onClick={handleSave}
                disabled={saving || !formData.selectedPlanId || plans.find((plan) => plan.id === formData.selectedPlanId)?.name === stats.plan_name}
                className={`group relative px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base lg:text-lg shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 disabled:hover:transform-none backdrop-blur-xl border w-full max-w-xs sm:max-w-sm ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed border-indigo-400/30'
                    : 'bg-gradient-to-r from-indigo-400 to-purple-500 text-white hover:from-indigo-500 hover:to-purple-600 focus:ring-indigo-400/30 disabled:opacity-50 disabled:cursor-not-allowed border-indigo-300/30'
                }`}
              >
                <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                  {saving ? (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-200" />
                  )}
                  <span className="truncate">{saving ? "Processing..." : "Upgrade Plan"}</span>
                </div>
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${
                  theme === 'dark' 
                    ? 'from-indigo-500 to-purple-600' 
                    : 'from-indigo-400 to-purple-500'
                } opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`} />
              </button>
            </div>

            {/* Help Section */}
            <div className="max-w-4xl mx-auto">
              <div className={`rounded-2xl shadow-xl border p-4 sm:p-6 lg:p-8 ${
                theme === 'dark' 
                  ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl border-slate-700/60' 
                  : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-xl sm:text-2xl font-black text-center mb-3 sm:mb-4 ${
                  theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                }`}>Need Help Choosing?</h3>
                <p className={`text-center text-sm sm:text-base leading-relaxed mb-4 sm:mb-6 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  Our plans are designed to grow with your photography business. Start with what you need today 
                  and upgrade as your client base expands.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <button className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base transition-all duration-300 border ${
                    theme === 'dark'
                      ? 'bg-slate-700/60 text-slate-300 hover:bg-slate-700/80 border-slate-600/30 hover:border-slate-500/50 backdrop-blur-xl'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200/50 hover:border-gray-300/50'
                  }`}>
                    Contact Support
                  </button>
                  <button 
                    onClick={handleFeatureComparison}
                    className={`group px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-white ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
                        : 'bg-gradient-to-r from-indigo-400 to-purple-500 hover:from-indigo-500 hover:to-purple-600'
                    }`}>
                    <span>View Feature Comparison</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        * {
          word-wrap: break-word;
          overflow-wrap: break-word;
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
}