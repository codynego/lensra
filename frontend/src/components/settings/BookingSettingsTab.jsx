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
import { useApi } from "../../useApi";

export default function BookingPreferencesTab() {
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
  const { apiFetch } = useApi();

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-900 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading booking preferences...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-900 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Booking Preferences
          </h2>
        </div>

        {message && (
          <div
            className={`${
              message.includes("success")
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            } border rounded-2xl p-4 animate-fadeIn`}
          >
            <div className="flex items-center">
              {message.includes("success") ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
              )}
              <p
                className={`${
                  message.includes("success") ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"
                } font-medium`}
              >
                {message}
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:gap-8">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-6 lg:p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Availability Settings</h3>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Available Days *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
                {daysOfWeek.map((day) => (
                  <label
                    key={day.value}
                    className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                      preferences.available_days.includes(day.value)
                        ? "bg-emerald-100 dark:bg-emerald-900/50 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200"
                        : "bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/70"
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
                <div className="flex items-center mt-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.available_days}
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Time</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="time"
                    name="start_time"
                    value={preferences.start_time}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-gray-700/70 border border-gray-200/50 dark:border-gray-600/50 rounded-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Time</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="time"
                    name="end_time"
                    value={preferences.end_time}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-gray-700/70 border border-gray-200/50 dark:border-gray-600/50 rounded-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-6 lg:p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Booking Rules</h3>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Notice (Hours) *
                </label>
                <input
                  type="number"
                  name="min_notice_hours"
                  value={preferences.min_notice_hours}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 border rounded-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent backdrop-blur-sm transition-all duration-200 ${
                    errors.min_notice_hours
                      ? "border-red-300 focus:ring-red-500/50"
                      : "border-gray-200/50 dark:border-gray-600/50 focus:ring-blue-500/50"
                  }`}
                  placeholder="24"
                />
                {errors.min_notice_hours && (
                  <div className="flex items-center mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.min_notice_hours}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Future Booking (Days) *
                </label>
                <input
                  type="number"
                  name="max_future_days"
                  value={preferences.max_future_days}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 border rounded-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent backdrop-blur-sm transition-all duration-200 ${
                    errors.max_future_days
                      ? "border-red-300 focus:ring-red-500/50"
                      : "border-gray-200/50 dark:border-gray-600/50 focus:ring-blue-500/50"
                  }`}
                  placeholder="90"
                />
                {errors.max_future_days && (
                  <div className="flex items-center mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.max_future_days}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200/30 dark:border-blue-800/30">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">Allow Same-Day Booking</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Clients can book appointments for today</p>
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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl border border-orange-200/30 dark:border-orange-800/30">
                <div className="flex items-center space-x-3">
                  {preferences.auto_confirm ? (
                    <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  ) : (
                    <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  )}
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">Auto-Confirm Bookings</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-6 lg:p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Payment Settings</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl border border-emerald-200/30 dark:border-emerald-800/30">
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">Deposit Required</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Require payment to confirm booking</p>
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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {preferences.deposit_required && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Deposit Percentage *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="deposit_percentage"
                      value={preferences.deposit_percentage}
                      onChange={handleInputChange}
                      min="1"
                      max="100"
                      className={`w-full px-4 py-3 pr-12 bg-white/70 dark:bg-gray-700/70 border rounded-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent backdrop-blur-sm transition-all duration-200 ${
                        errors.deposit_percentage
                          ? "border-red-300 focus:ring-red-500/50"
                          : "border-gray-200/50 dark:border-gray-600/50 focus:ring-emerald-500/50"
                      }`}
                      placeholder="50"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">%</span>
                    </div>
                  </div>
                  {errors.deposit_percentage && (
                    <div className="flex items-center mt-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.deposit_percentage}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-6 lg:p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                <Info className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Additional Notes</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Booking Instructions & Notes
              </label>
              <textarea
                name="notes"
                value={preferences.notes}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 border border-gray-200/50 dark:border-gray-600/50 rounded-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent backdrop-blur-sm transition-all duration-200 resize-none"
                placeholder="Additional instructions for clients when booking appointments..."
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                These notes will be displayed to clients during the booking process.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-medium text-lg shadow-xl hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
          >
            <div className="flex items-center space-x-3">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              )}
              <span>{loading ? "Saving Changes..." : "Save Booking Preferences"}</span>
            </div>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}