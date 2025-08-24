import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Settings,
  Save,
  CheckCircle,
  AlertCircle,
  CreditCard,
  UserCheck,
  Zap,
  DollarSign,
  Info,
} from "lucide-react";
import { useAuth } from "../../AuthContext";

export default function BookingPreferencesTab({ theme = "dark" }) {
  const [preferences, setPreferences] = useState({
    available_days: [],
    start_time: "09:00",
    end_time: "17:00",
    min_notice_hours: 24,
    max_future_days: 90,
    allow_same_day: false,
    deposit_required: true,
    deposit_percentage: 50,
    auto_confirm: false,
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const { apiFetch } = useAuth();

  const daysOfWeek = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
  ];

  useEffect(() => {
    fetchBookingPreferences();
  }, []);

  const fetchBookingPreferences = async () => {
    try {
      setFetchLoading(true);
      const response = await apiFetch("/bookings/preferences/", {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences({
          available_days: data.available_days || [],
          start_time: data.start_time || "09:00",
          end_time: data.end_time || "17:00",
          min_notice_hours: data.min_notice_hours || 24,
          max_future_days: data.max_future_days || 90,
          allow_same_day: data.allow_same_day || false,
          deposit_required: data.deposit_required || true,
          deposit_percentage: data.deposit_percentage || 50,
          auto_confirm: data.auto_confirm || false,
          notes: data.notes || "",
        });
      } else {
        console.error("Failed to fetch booking preferences");
        setMessage("Failed to fetch preferences. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching booking preferences:", error);
      setMessage("An error occurred while fetching preferences. Please try again.");
    } finally {
      setFetchLoading(false);
    }
  };

  const validatePreferences = () => {
    const newErrors = {};

    if (preferences.available_days.length === 0) {
      newErrors.available_days = "At least one day must be selected";
    }

    if (preferences.min_notice_hours < 1) {
      newErrors.min_notice_hours = "Minimum notice must be at least 1 hour";
    }

    if (preferences.max_future_days < 1) {
      newErrors.max_future_days = "Maximum future days must be at least 1";
    }

    if (preferences.deposit_required && (preferences.deposit_percentage < 1 || preferences.deposit_percentage > 100)) {
      newErrors.deposit_percentage = "Deposit percentage must be between 1-100%";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferences((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDayToggle = (dayValue) => {
    setPreferences((prev) => ({
      ...prev,
      available_days: prev.available_days.includes(dayValue)
        ? prev.available_days.filter((day) => day !== dayValue)
        : [...prev.available_days, dayValue].sort((a, b) => a - b),
    }));
  };

  const handleSave = async () => {
    if (!validatePreferences()) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await apiFetch("/bookings/preferences/", {
        method: "PUT",
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        setMessage("Booking preferences saved successfully!");
        setErrors({});
        setTimeout(() => setMessage(""), 3000);
      } else {
        const errorData = await response.json();
        setMessage("Failed to save preferences. Please try again.");
        console.error("Save failed:", errorData);
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      setMessage("An error occurred while saving. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className={`min-h-screen ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950' 
          : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
      } p-4 sm:p-6 lg:p-8`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 border-4 rounded-full animate-spin ${
              theme === 'dark' ? 'border-indigo-400 border-t-transparent' : 'border-indigo-600 border-t-transparent'
            }`}></div>
            <span className={`ml-3 text-sm sm:text-base ${
              theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
            }`}>Loading booking preferences...</span>
          </div>
        </div>
      </div>
    );
  }

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

      <div className="relative z-10 p-4 sm:p-6 lg:p-12 max-w-7xl mx-auto space-y-6 lg:space-y-8">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-xl shadow-lg backdrop-blur-xl ${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600' 
              : 'bg-gradient-to-r from-indigo-400 to-purple-500'
          }`}>
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r ${
            theme === 'dark' ? 'from-indigo-400 to-purple-400' : 'from-indigo-600 to-purple-600'
          }`}>
            Booking Preferences
          </h2>
        </div>

        {message && (
          <div className={`border rounded-xl p-4 flex items-center backdrop-blur-xl animate-fadeIn ${
            message.includes("success")
              ? theme === 'dark' 
                ? 'bg-emerald-500/10 border-emerald-500/30' 
                : 'bg-emerald-50/80 border-emerald-200'
              : theme === 'dark' 
                ? 'bg-red-500/10 border-red-500/30' 
                : 'bg-red-50/80 border-red-200'
          }`}>
            {message.includes("success") ? (
              <CheckCircle className={`w-5 h-5 mr-3 flex-shrink-0 ${
                theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
              }`} />
            ) : (
              <AlertCircle className={`w-5 h-5 mr-3 flex-shrink-0 ${
                theme === 'dark' ? 'text-red-400' : 'text-red-600'
              }`} />
            )}
            <p className={`font-medium text-sm sm:text-base break-words ${
              message.includes("success") 
                ? theme === 'dark' ? 'text-emerald-300' : 'text-emerald-800'
                : theme === 'dark' ? 'text-red-300' : 'text-red-800'
            }`}>
              {message}
            </p>
          </div>
        )}

        <div className="grid gap-6 lg:gap-8">
          <div className={`rounded-2xl shadow-xl border transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl border-slate-700/60' 
              : 'bg-white/90 border-gray-200'
          }`}>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-2 rounded-xl shadow-lg ${
                  theme === 'dark' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-emerald-400 to-teal-400'
                }`}>
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h3 className={`text-xl sm:text-2xl font-bold ${
                  theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                }`}>Availability Settings</h3>
              </div>

              <div className="mb-6">
                <label className={`block text-sm font-medium mb-3 ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                }`}>Available Days *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
                  {daysOfWeek.map((day) => (
                    <label
                      key={day.value}
                      className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                        preferences.available_days.includes(day.value)
                          ? theme === 'dark'
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 border-indigo-500/50 text-white'
                            : 'bg-gradient-to-r from-indigo-400 to-purple-500 border-indigo-400/50 text-white'
                          : theme === 'dark'
                            ? 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:bg-slate-800/80 hover:border-slate-600/50'
                            : 'bg-white/50 border-gray-200/50 text-gray-700 hover:bg-white/70 hover:border-gray-300/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={preferences.available_days.includes(day.value)}
                        onChange={() => handleDayToggle(day.value)}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">{day.label}</span>
                    </label>
                  ))}
                </div>
                {errors.available_days && (
                  <div className={`flex items-center mt-2 text-sm ${
                    theme === 'dark' ? 'text-red-400' : 'text-red-600'
                  }`}>
                    <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                    {errors.available_days}
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 mb-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                  }`}>Start Time</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Clock className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`} />
                    </div>
                    <input
                      type="time"
                      name="start_time"
                      value={preferences.start_time}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3 rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent backdrop-blur-xl transition-all duration-200 ${
                        theme === 'dark'
                          ? 'bg-slate-800/60 border-slate-700/50 text-slate-100 hover:bg-slate-800/80'
                          : 'bg-white/70 border-gray-200/50 text-gray-900 hover:bg-white/90'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                  }`}>End Time</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Clock className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`} />
                    </div>
                    <input
                      type="time"
                      name="end_time"
                      value={preferences.end_time}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3 rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent backdrop-blur-xl transition-all duration-200 ${
                        theme === 'dark'
                          ? 'bg-slate-800/60 border-slate-700/50 text-slate-100 hover:bg-slate-800/80'
                          : 'bg-white/70 border-gray-200/50 text-gray-900 hover:bg-white/90'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl shadow-xl border transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl border-slate-700/60' 
              : 'bg-white/90 border-gray-200'
          }`}>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-2 rounded-xl shadow-lg ${
                  theme === 'dark' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-blue-400 to-indigo-400'
                }`}>
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <h3 className={`text-xl sm:text-2xl font-bold ${
                  theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                }`}>Booking Rules</h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 mb-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                  }`}>Minimum Notice (Hours) *</label>
                  <input
                    type="number"
                    name="min_notice_hours"
                    value={preferences.min_notice_hours}
                    onChange={handleInputChange}
                    min="1"
                    className={`w-full px-4 py-3 rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:border-transparent backdrop-blur-xl transition-all duration-200 ${
                      errors.min_notice_hours
                        ? 'border-red-300 focus:ring-red-500/50'
                        : theme === 'dark'
                          ? 'bg-slate-800/60 border-slate-700/50 text-slate-100 hover:bg-slate-800/80 focus:ring-indigo-500/50'
                          : 'bg-white/70 border-gray-200/50 text-gray-900 hover:bg-white/90 focus:ring-indigo-500/50'
                    }`}
                    placeholder="24"
                  />
                  {errors.min_notice_hours && (
                    <div className={`flex items-center mt-2 text-sm ${
                      theme === 'dark' ? 'text-red-400' : 'text-red-600'
                    }`}>
                      <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                      {errors.min_notice_hours}
                    </div>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                  }`}>Max Future Booking (Days) *</label>
                  <input
                    type="number"
                    name="max_future_days"
                    value={preferences.max_future_days}
                    onChange={handleInputChange}
                    min="1"
                    className={`w-full px-4 py-3 rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:border-transparent backdrop-blur-xl transition-all duration-200 ${
                      errors.max_future_days
                        ? 'border-red-300 focus:ring-red-500/50'
                        : theme === 'dark'
                          ? 'bg-slate-800/60 border-slate-700/50 text-slate-100 hover:bg-slate-800/80 focus:ring-indigo-500/50'
                          : 'bg-white/70 border-gray-200/50 text-gray-900 hover:bg-white/90 focus:ring-indigo-500/50'
                    }`}
                    placeholder="90"
                  />
                  {errors.max_future_days && (
                    <div className={`flex items-center mt-2 text-sm ${
                      theme === 'dark' ? 'text-red-400' : 'text-red-600'
                    }`}>
                      <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                      {errors.max_future_days}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className={`flex items-center justify-between p-4 rounded-2xl border backdrop-blur-xl ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-blue-800/30'
                    : 'bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-blue-200/30'
                }`}>
                  <div className="flex items-center space-x-3">
                    <Calendar className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div>
                      <p className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>
                        Allow Same-Day Booking
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                        Clients can book appointments for today
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="allow_same_day"
                      checked={preferences.allow_same_day}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                      theme === 'dark'
                        ? 'bg-slate-700 border-slate-600 peer-focus:ring-indigo-800 peer-checked:bg-indigo-600'
                        : 'bg-gray-200 border-gray-300 peer-focus:ring-indigo-300 peer-checked:bg-indigo-500'
                    }`}></div>
                  </label>
                </div>

                <div className={`flex items-center justify-between p-4 rounded-2xl border backdrop-blur-xl ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-orange-900/20 to-red-900/20 border-orange-800/30'
                    : 'bg-gradient-to-r from-orange-50/80 to-red-50/80 border-orange-200/30'
                }`}>
                  <div className="flex items-center space-x-3">
                    {preferences.auto_confirm ? (
                      <Zap className={`w-5 h-5 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`} />
                    ) : (
                      <UserCheck className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                    )}
                    <div>
                      <p className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>
                        Auto-Confirm Bookings
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                        {preferences.auto_confirm ? "Bookings are automatically confirmed" : "Manual review required for each booking"}
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="auto_confirm"
                      checked={preferences.auto_confirm}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                      theme === 'dark'
                        ? 'bg-slate-700 border-slate-600 peer-focus:ring-orange-800 peer-checked:bg-orange-600'
                        : 'bg-gray-200 border-gray-300 peer-focus:ring-orange-300 peer-checked:bg-orange-500'
                    }`}></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl shadow-xl border transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl border-slate-700/60' 
              : 'bg-white/90 border-gray-200'
          }`}>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-2 rounded-xl shadow-lg ${
                  theme === 'dark' ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-gradient-to-r from-emerald-400 to-green-400'
                }`}>
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <h3 className={`text-xl sm:text-2xl font-bold ${
                  theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                }`}>Payment Settings</h3>
              </div>

              <div className="space-y-4">
                <div className={`flex items-center justify-between p-4 rounded-2xl border backdrop-blur-xl ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-emerald-900/20 to-green-900/20 border-emerald-800/30'
                    : 'bg-gradient-to-r from-emerald-50/80 to-green-50/80 border-emerald-200/30'
                }`}>
                  <div className="flex items-center space-x-3">
                    <DollarSign className={`w-5 h-5 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <div>
                      <p className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>
                        Deposit Required ($)
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                        Require payment to confirm booking
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="deposit_required"
                      checked={preferences.deposit_required}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                      theme === 'dark'
                        ? 'bg-slate-700 border-slate-600 peer-focus:ring-emerald-800 peer-checked:bg-emerald-600'
                        : 'bg-gray-200 border-gray-300 peer-focus:ring-emerald-300 peer-checked:bg-emerald-500'
                    }`}></div>
                  </label>
                </div>

                {preferences.deposit_required && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                    }`}>Deposit Percentage ($) *</label>
                    <div className="relative">
                      <input
                        type="number"
                        name="deposit_percentage"
                        value={preferences.deposit_percentage}
                        onChange={handleInputChange}
                        min="1"
                        max="100"
                        className={`w-full px-4 py-3 pr-12 rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:border-transparent backdrop-blur-xl transition-all duration-200 ${
                          errors.deposit_percentage
                            ? 'border-red-300 focus:ring-red-500/50'
                            : theme === 'dark'
                              ? 'bg-slate-800/60 border-slate-700/50 text-slate-100 hover:bg-slate-800/80 focus:ring-emerald-500/50'
                              : 'bg-white/70 border-gray-200/50 text-gray-900 hover:bg-white/90 focus:ring-emerald-500/50'
                        }`}
                        placeholder="50"
                      />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <span className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>%</span>
                      </div>
                    </div>
                    {errors.deposit_percentage && (
                      <div className={`flex items-center mt-2 text-sm ${
                        theme === 'dark' ? 'text-red-400' : 'text-red-600'
                      }`}>
                        <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                        {errors.deposit_percentage}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={`rounded-2xl shadow-xl border transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl border-slate-700/60' 
              : 'bg-white/90 border-gray-200'
          }`}>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-2 rounded-xl shadow-lg ${
                  theme === 'dark' ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-gradient-to-r from-indigo-400 to-purple-400'
                }`}>
                  <Info className="w-5 h-5 text-white" />
                </div>
                <h3 className={`text-xl sm:text-2xl font-bold ${
                  theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                }`}>Additional Notes</h3>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                }`}>Booking Instructions & Notes</label>
                <textarea
                  name="notes"
                  value={preferences.notes}
                  onChange={handleInputChange}
                  rows="4"
                  className={`w-full px-4 py-3 rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent backdrop-blur-xl transition-all duration-200 resize-none ${
                    theme === 'dark'
                      ? 'bg-slate-800/60 border-slate-700/50 text-slate-100 hover:bg-slate-800/80'
                      : 'bg-white/70 border-gray-200/50 text-gray-900 hover:bg-white/90'
                  }`}
                  placeholder="Additional instructions for clients when booking appointments..."
                />
                <p className={`mt-2 text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                  These notes will be displayed to clients during the booking process.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className={`group relative px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base lg:text-lg shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 disabled:hover:transform-none backdrop-blur-xl border ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed border-indigo-400/30'
                : 'bg-gradient-to-r from-indigo-400 to-purple-500 text-white hover:from-indigo-500 hover:to-purple-600 focus:ring-indigo-400/30 disabled:opacity-50 disabled:cursor-not-allowed border-indigo-300/30'
            }`}
          >
            <div className="flex items-center justify-center space-x-2 sm:space-x-3">
              {loading ? (
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-200" />
              )}
              <span className="truncate">{loading ? "Saving Changes..." : "Save Booking Preferences"}</span>
            </div>
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${
              theme === 'dark' 
                ? 'from-indigo-500 to-purple-600' 
                : 'from-indigo-400 to-purple-500'
            } opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`} />
          </button>
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