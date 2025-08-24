import React, { useState, useEffect } from "react";
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Save, 
  Volume2, 
  VolumeX,
  Clock,
  Calendar,
  User,
  Camera,
  CreditCard,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useApi } from "../../useApi";

export default function NotificationSettingsTab({ theme = "dark" }) {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [bookingReminders, setBookingReminders] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [clientMessages, setClientMessages] = useState(true);
  const [systemUpdates, setSystemUpdates] = useState(true);
  const [quietHours, setQuietHours] = useState(false);
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("08:00");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState({});
  const { apiFetch } = useApi();

  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        setLoading(true);
        const response = await apiFetch("/notifications/settings/", { method: "GET" });
        if (response.ok) {
          const data = await response.json();
          setEmailNotifications(data.email_notifications ?? true);
          setSmsNotifications(data.sms_notifications ?? false);
          setPushNotifications(data.push_notifications ?? true);
          setBookingReminders(data.booking_reminders ?? true);
          setPaymentAlerts(data.payment_alerts ?? true);
          setMarketingEmails(data.marketing_emails ?? false);
          setClientMessages(data.client_messages ?? true);
          setSystemUpdates(data.system_updates ?? true);
          setQuietHours(data.quiet_hours ?? false);
          setQuietStart(data.quiet_start || "22:00");
          setQuietEnd(data.quiet_end || "08:00");
        } else {
          setErrors({ api: "Failed to load notification settings" });
        }
      } catch (error) {
        console.error("Error fetching notification settings:", error);
        setErrors({ api: "Network error occurred" });
      } finally {
        setLoading(false);
      }
    };
    fetchNotificationSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setErrors({});
    setSuccess("");

    const data = {
      email_notifications: emailNotifications,
      sms_notifications: smsNotifications,
      push_notifications: pushNotifications,
      booking_reminders: bookingReminders,
      payment_alerts: paymentAlerts,
      marketing_emails: marketingEmails,
      client_messages: clientMessages,
      system_updates: systemUpdates,
      quiet_hours: quietHours,
      quiet_start: quietHours ? quietStart : null,
      quiet_end: quietHours ? quietEnd : null,
    };

    try {
      const response = await apiFetch("/notifications/settings/", {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setSuccess("Notification settings saved successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorData = await response.json();
        setErrors({ api: errorData.message || "Failed to save notification settings" });
      }
    } catch (error) {
      console.error("Error saving notification settings:", error);
      setErrors({ api: "Network error occurred" });
    } finally {
      setSaving(false);
    }
  };

  const notificationChannels = [
    {
      id: 'email',
      title: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: Mail,
      color: 'from-blue-500 to-cyan-500',
      checked: emailNotifications,
      onChange: setEmailNotifications
    },
    {
      id: 'sms',
      title: 'SMS Notifications',
      description: 'Receive notifications via text message',
      icon: MessageSquare,
      color: 'from-green-500 to-emerald-500',
      checked: smsNotifications,
      onChange: setSmsNotifications
    },
    {
      id: 'push',
      title: 'Push Notifications',
      description: 'Receive browser and mobile push notifications',
      icon: Smartphone,
      color: 'from-purple-500 to-pink-500',
      checked: pushNotifications,
      onChange: setPushNotifications
    }
  ];

  const notificationTypes = [
    {
      id: 'booking',
      title: 'Booking Reminders',
      description: 'Get notified about upcoming appointments',
      icon: Calendar,
      color: 'from-indigo-500 to-blue-500',
      checked: bookingReminders,
      onChange: setBookingReminders
    },
    {
      id: 'payment',
      title: 'Payment Alerts',
      description: 'Notifications for payments and invoices',
      icon: CreditCard,
      color: 'from-emerald-500 to-teal-500',
      checked: paymentAlerts,
      onChange: setPaymentAlerts
    },
    {
      id: 'messages',
      title: 'Client Messages',
      description: 'New messages from clients',
      icon: User,
      color: 'from-blue-500 to-cyan-500',
      checked: clientMessages,
      onChange: setClientMessages
    },
    {
      id: 'marketing',
      title: 'Marketing & Promotions',
      description: 'Tips, updates, and promotional content',
      icon: Camera,
      color: 'from-pink-500 to-rose-500',
      checked: marketingEmails,
      onChange: setMarketingEmails
    },
    {
      id: 'system',
      title: 'System Updates',
      description: 'Important system and security updates',
      icon: Bell,
      color: 'from-yellow-500 to-orange-500',
      checked: systemUpdates,
      onChange: setSystemUpdates
    }
  ];

  if (loading) {
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
            }`}>Loading notification settings...</span>
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
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-xl shadow-lg backdrop-blur-xl ${
            theme === 'dark' ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gradient-to-r from-indigo-400 to-purple-500'
          }`}>
            <Bell className="w-6 h-6 text-white" />
          </div>
          <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r ${
            theme === 'dark' ? 'from-indigo-400 to-purple-400' : 'from-indigo-600 to-purple-600'
          }`}>
            Notification Settings
          </h2>
        </div>

        {/* Messages */}
        {(success || errors.api) && (
          <div className={`border rounded-xl p-4 flex items-center backdrop-blur-xl animate-fadeIn ${
            success
              ? theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50/80 border-emerald-200'
              : theme === 'dark' ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50/80 border-red-200'
          }`}>
            {success ? (
              <CheckCircle className={`w-5 h-5 mr-3 flex-shrink-0 ${
                theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
              }`} />
            ) : (
              <AlertCircle className={`w-5 h-5 mr-3 flex-shrink-0 ${
                theme === 'dark' ? 'text-red-400' : 'text-red-600'
              }`} />
            )}
            <p className={`font-medium text-sm sm:text-base break-words ${
              success 
                ? theme === 'dark' ? 'text-emerald-300' : 'text-emerald-800'
                : theme === 'dark' ? 'text-red-300' : 'text-red-800'
            }`}>
              {success || errors.api}
            </p>
          </div>
        )}

        <div className="grid gap-6 lg:gap-8">
          {/* Notification Channels Card */}
          <div className={`rounded-2xl shadow-xl border transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl border-slate-700/60' 
              : 'bg-white/90 border-gray-200'
          }`}>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-2 rounded-xl shadow-lg ${
                  theme === 'dark' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gradient-to-r from-blue-400 to-cyan-400'
                }`}>
                  <Volume2 className="w-5 h-5 text-white" />
                </div>
                <h3 className={`text-xl sm:text-2xl font-bold ${
                  theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                }`}>Notification Channels</h3>
              </div>

              <div className="grid gap-4 md:gap-6">
                {notificationChannels.map((channel) => {
                  const Icon = channel.icon;
                  return (
                    <div
                      key={channel.id}
                      className={`flex items-center justify-between p-4 rounded-2xl border backdrop-blur-xl transition-all duration-200 ${
                        theme === 'dark'
                          ? 'bg-slate-800/40 border-slate-600/30 hover:bg-slate-800/60'
                          : 'bg-white/40 border-gray-200/30 hover:bg-white/60'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-xl shadow-lg bg-gradient-to-r ${channel.color}`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className={`font-medium text-sm sm:text-base ${
                            theme === 'dark' ? 'text-slate-200' : 'text-gray-800'
                          }`}>{channel.title}</p>
                          <p className={`text-xs sm:text-sm ${
                            theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                          }`}>{channel.description}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={channel.checked}
                          onChange={() => channel.onChange(!channel.checked)}
                          className="sr-only peer"
                        />
                        <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                          theme === 'dark'
                            ? `bg-slate-700 border-slate-600 peer-focus:ring-indigo-800 peer-checked:bg-gradient-to-r peer-checked:${channel.color}`
                            : `bg-gray-200 border-gray-300 peer-focus:ring-indigo-300 peer-checked:bg-gradient-to-r peer-checked:${channel.color.replace('500', '400')}`
                        }`}></div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Notification Types Card */}
          <div className={`rounded-2xl shadow-xl border transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl border-slate-700/60' 
              : 'bg-white/90 border-gray-200'
          }`}>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-2 rounded-xl shadow-lg ${
                  theme === 'dark' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-purple-400 to-pink-400'
                }`}>
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className={`text-xl sm:text-2xl font-bold ${
                  theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                }`}>What to Notify Me About</h3>
              </div>

              <div className="grid gap-4 md:gap-6">
                {notificationTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div
                      key={type.id}
                      className={`flex items-center justify-between p-4 rounded-2xl border backdrop-blur-xl transition-all duration-200 ${
                        theme === 'dark'
                          ? 'bg-slate-800/40 border-slate-600/30 hover:bg-slate-800/60'
                          : 'bg-white/40 border-gray-200/30 hover:bg-white/60'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-xl shadow-lg bg-gradient-to-r ${type.color}`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className={`font-medium text-sm sm:text-base ${
                            theme === 'dark' ? 'text-slate-200' : 'text-gray-800'
                          }`}>{type.title}</p>
                          <p className={`text-xs sm:text-sm ${
                            theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                          }`}>{type.description}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={type.checked}
                          onChange={() => type.onChange(!type.checked)}
                          className="sr-only peer"
                        />
                        <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                          theme === 'dark'
                            ? `bg-slate-700 border-slate-600 peer-focus:ring-indigo-800 peer-checked:bg-gradient-to-r peer-checked:${type.color}`
                            : `bg-gray-200 border-gray-300 peer-focus:ring-indigo-300 peer-checked:bg-gradient-to-r peer-checked:${type.color.replace('500', '400')}`
                        }`}></div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quiet Hours Card */}
          <div className={`rounded-2xl shadow-xl border transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl border-slate-700/60' 
              : 'bg-white/90 border-gray-200'
          }`}>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-2 rounded-xl shadow-lg ${
                  theme === 'dark' ? 'bg-gradient-to-r from-indigo-500 to-blue-500' : 'bg-gradient-to-r from-indigo-400 to-blue-400'
                }`}>
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <h3 className={`text-xl sm:text-2xl font-bold ${
                  theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                }`}>Quiet Hours</h3>
              </div>

              <div className="space-y-6">
                <div className={`flex items-center justify-between p-4 rounded-2xl border backdrop-blur-xl ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-indigo-900/20 to-blue-900/20 border-indigo-800/30'
                    : 'bg-gradient-to-r from-indigo-50/80 to-blue-50/80 border-indigo-200/30'
                }`}>
                  <div className="flex items-center space-x-3">
                    {quietHours ? (
                      <VolumeX className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`} />
                    ) : (
                      <Volume2 className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`} />
                    )}
                    <div>
                      <p className={`font-medium text-sm sm:text-base ${
                        theme === 'dark' ? 'text-slate-200' : 'text-gray-800'
                      }`}>Enable Quiet Hours</p>
                      <p className={`text-xs sm:text-sm ${
                        theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                      }`}>Pause non-urgent notifications during specified hours</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quietHours}
                      onChange={() => setQuietHours(!quietHours)}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                      theme === 'dark'
                        ? 'bg-slate-700 border-slate-600 peer-focus:ring-indigo-800 peer-checked:bg-indigo-600'
                        : 'bg-gray-200 border-gray-300 peer-focus:ring-indigo-300 peer-checked:bg-indigo-500'
                    }`}></div>
                  </label>
                </div>

                {quietHours && (
                  <div className="grid gap-4 sm:grid-cols-2 animate-fadeIn">
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
                          value={quietStart}
                          onChange={(e) => setQuietStart(e.target.value)}
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
                          value={quietEnd}
                          onChange={(e) => setQuietEnd(e.target.value)}
                          className={`w-full pl-12 pr-4 py-3 rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent backdrop-blur-xl transition-all duration-200 ${
                            theme === 'dark'
                              ? 'bg-slate-800/60 border-slate-700/50 text-slate-100 hover:bg-slate-800/80'
                              : 'bg-white/70 border-gray-200/50 text-gray-900 hover:bg-white/90'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`group relative px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base lg:text-lg shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 disabled:hover:transform-none backdrop-blur-xl border ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed border-indigo-400/30'
                : 'bg-gradient-to-r from-indigo-400 to-purple-500 text-white hover:from-indigo-500 hover:to-purple-600 focus:ring-indigo-400/30 disabled:opacity-50 disabled:cursor-not-allowed border-indigo-300/30'
            }`}
          >
            <div className="flex items-center justify-center space-x-2 sm:space-x-3">
              {saving ? (
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-200" />
              )}
              <span className="truncate">{saving ? "Saving Settings..." : "Save Notification Settings"}</span>
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