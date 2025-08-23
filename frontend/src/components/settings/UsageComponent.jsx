import React, { useState, useEffect, useRef } from "react";
import { Sparkles, CheckCircle, AlertCircle, CreditCard } from "lucide-react";
import { useAuth } from "../../AuthContext";

export default function UsageComponent() {
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
              storage_gb: plan.features.storage_gb / (1024 * 1024 * 1024), // Convert bytes to GB
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
            storage_gb: plan.features.storage_gb / (1024 * 1024 * 1024),
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
    plan_limits: {
      max_galleries_count: 5,
      max_photos_count: 500,
      storage_gb: 5,
      max_bookings_count: 100,
      max_clients_count: 100,
    },
    plan_name: 'Free',
  };

  // Use stats from AuthContext, with fallback to default
  const stats = authState.user?.stats ? {
    ...authState.user.stats,
    storage_used: authState.user.stats.storage_used_gb || authState.user.stats.storage_used / (1024 * 1024 * 1024)
  } : defaultStats;

  const getUsageInfo = (current, max) => {
    if (max === -1 || max === 0) return { percentage: 0, color: '#10B981', status: 'unlimited' };
    const percentage = (current / max) * 100;
    if (percentage >= 100) return { percentage: 100, color: '#EF4444', status: 'at-limit' };
    if (percentage >= 80) return { percentage, color: '#F59E0B', status: 'warning' };
    return { percentage, color: '#10B981', status: 'good' };
  };

  const formatLimit = (limit) => (limit === -1 || limit === 0 ? '∞' : limit.toLocaleString());
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
      
      // Refresh user stats after successful upgrade
      await refetchData();
    } catch (error) {
      console.error('Error upgrading plan:', error);
      setErrors({ api: error.message || 'Failed to upgrade plan' });
    } finally {
      setSaving(false);
    }
  };

  // Show loading if auth is still loading or component is loading
  if (authState.loading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading subscription data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Upgrade Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Experience</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            You're currently on the <span className="font-semibold text-indigo-600">{stats.plan_name}</span> plan. 
            Unlock powerful features and scale your photography business with our premium plans.
          </p>
          {authState.user && (
            <p className="text-gray-500 mt-2">
              Welcome back, <span className="font-medium">{authState.user.first_name || authState.user.username}</span>!
            </p>
          )}
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center animate-fade-in">
              <CheckCircle className="w-6 h-6 text-emerald-600 mr-3 flex-shrink-0" />
              <span className="text-emerald-800 font-medium">{success}</span>
            </div>
          </div>
        )}

        {errors.api && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center animate-fade-in">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" />
              <span className="text-red-800 font-medium">{errors.api}</span>
            </div>
          </div>
        )}

        {/* Current Usage Overview */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white mb-2">Current Usage Overview</h2>
              <p className="text-indigo-100">Track your usage across all features</p>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {[
                  { 
                    label: 'Galleries', 
                    current: stats.galleries_count, 
                    max: stats.plan_limits.max_galleries_count,
                    icon: '📸'
                  },
                  { 
                    label: 'Photos', 
                    current: stats.photos_count, 
                    max: stats.plan_limits.max_photos_count,
                    icon: '🖼️'
                  },
                  { 
                    label: 'Storage', 
                    current: Number(stats.storage_used).toFixed(2), 
                    max: stats.plan_limits.storage_gb, 
                    unit: 'GB',
                    icon: '💾'
                  },
                  { 
                    label: 'Bookings', 
                    current: stats.bookings_count, 
                    max: stats.plan_limits.max_bookings_count,
                    icon: '📅'
                  },
                  { 
                    label: 'Clients', 
                    current: stats.clients_count, 
                    max: stats.plan_limits.max_clients_count,
                    icon: '👥'
                  },
                ].map((item, index) => {
                  const usage = getUsageInfo(item.current, item.max);
                  return (
                    <div key={index} className="text-center">
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.label}</h3>
                      <div className="text-sm text-gray-600 mb-3">
                        {item.current} / {formatLimit(item.max)} {item.unit || ''}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.min(usage.percentage, 100)}%`,
                            backgroundColor: usage.color
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
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
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Perfect Plan</h2>
            <p className="text-lg text-gray-600">Scale your photography business with features designed for growth</p>
          </div>

          {plans.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No plans available at the moment</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 mb-8">
              {plans.map((plan, index) => {
                const isCurrent = plan.name === stats.plan_name;
                const isSelected = formData.selectedPlanId === plan.id;
                const isPopular = plan.popular;
                
                return (
                  <div
                    key={plan.id}
                    className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 shadow-indigo-500/20 transform scale-105'
                        : isCurrent
                        ? 'border-emerald-500 shadow-emerald-500/20'
                        : isPopular
                        ? 'border-indigo-300 shadow-indigo-500/10 transform lg:scale-105'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    {/* Plan Badges */}
                    {isPopular && !isCurrent && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                          Most Popular
                        </div>
                      </div>
                    )}
                    
                    {isCurrent && (
                      <div className="absolute -top-4 right-6 z-10">
                        <div className="bg-emerald-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                          Current Plan
                        </div>
                      </div>
                    )}

                    {isSelected && !isCurrent && (
                      <div className="absolute -top-4 left-6 z-10">
                        <div className="bg-indigo-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                          Selected
                        </div>
                      </div>
                    )}

                    <div className="p-8">
                      {/* Plan Header */}
                      <div className="text-center mb-8">
                        <div className={`inline-flex p-3 rounded-2xl mb-4 ${
                          isSelected || isPopular ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gray-100'
                        }`}>
                          <CreditCard className={`w-8 h-8 ${isSelected || isPopular ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                        <div className="text-4xl font-bold text-gray-900 mb-2">
                          {formatPrice(plan.price)}
                        </div>
                        <p className="text-gray-600">{plan.description}</p>
                      </div>

                      {/* Features List */}
                      <div className="space-y-4 mb-8">
                        {[
                          { label: 'Galleries', value: plan.features.max_galleries_count },
                          { label: 'Photos', value: plan.features.max_photos_count },
                          { label: 'Storage', value: plan.features.storage_gb, unit: 'GB' },
                          { label: 'Bookings', value: plan.features.max_bookings_count },
                          { label: 'Clients', value: plan.features.max_clients_count },
                        ].map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex justify-between items-center py-3 border-b border-gray-100">
                            <span className="text-gray-700 font-medium">{feature.label}</span>
                            <span className="text-gray-900 font-bold">
                              {formatLimit(feature.value)} {feature.unit || ''}
                            </span>
                          </div>
                        ))}
                        
                        {/* AI Tools */}
                        {plan.features.ai_tools?.length > 0 && (
                          <div className="pt-4">
                            <div className="text-gray-700 font-medium mb-3">AI Tools:</div>
                            <div className="flex flex-wrap gap-2">
                              {plan.features.ai_tools.map((tool, toolIndex) => (
                                <span
                                  key={toolIndex}
                                  className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full"
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
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                            <span className="text-emerald-600 font-medium">Custom Domain Included</span>
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
            <div className="flex items-center justify-center mb-8 text-red-600 animate-fade-in">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">{errors.selectedPlanId}</span>
            </div>
          )}

          {/* Upgrade Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSave}
              disabled={saving || !formData.selectedPlanId || plans.find((plan) => plan.id === formData.selectedPlanId)?.name === stats.plan_name}
              className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-300/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-1 disabled:hover:transform-none"
            >
              <div className="flex items-center space-x-3">
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                )}
                <span>{saving ? "Processing Upgrade..." : "Upgrade Plan"}</span>
              </div>
            </button>
          </div>

          {/* Help Section */}
          <div className="max-w-4xl mx-auto mt-16 text-center">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Need Help Choosing?</h3>
              <p className="text-gray-600 mb-6">
                Our plans are designed to grow with your photography business. Start with what you need today 
                and upgrade as your client base expands.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                  Contact Support
                </button>
                <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                  View Feature Comparison
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}