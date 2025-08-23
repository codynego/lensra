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
  CheckCircle
} from "lucide-react";
import { useApi } from "../../useApi";

export default function NotificationSettingsTab() {
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
        const response = await apiFetch("/notifications/settings/", { method: "GET" });
        if (response.ok) {
          const data = await response.json();
          setEmailNotifications(data.email_notifications);
          setSmsNotifications(data.sms_notifications);
          setPushNotifications(data.push_notifications);
          setBookingReminders(data.booking_reminders);
          setPaymentAlerts(data.payment_alerts);
          setMarketingEmails(data.marketing_emails);
          setClientMessages(data.client_messages);
          setSystemUpdates(data.system_updates);
          setQuietHours(data.quiet_hours);
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
      checked: bookingReminders,
      onChange: setBookingReminders
    },
    {
      id: 'payment',
      title: 'Payment Alerts',
      description: 'Notifications for payments and invoices',
      icon: CreditCard,
      checked: paymentAlerts,
      onChange: setPaymentAlerts
    },
    {
      id: 'messages',
      title: 'Client Messages',
      description: 'New messages from clients',
      icon: User,
      checked: clientMessages,
      onChange: setClientMessages
    },
    {
      id: 'marketing',
      title: 'Marketing & Promotions',
      description: 'Tips, updates, and promotional content',
      icon: Camera,
      checked: marketingEmails,
      onChange: setMarketingEmails
    },
    {
      id: 'system',
      title: 'System Updates',
      description: 'Important system and security updates',
      icon: Bell,
      checked: systemUpdates,
      onChange: setSystemUpdates
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-900">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600 dark:text-gray-300">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-900 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl shadow-lg">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
            Notification Settings
          </h2>
        </div>

        {success && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl flex items-center animate-fadeIn">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
            <span className="text-green-800 dark:text-green-300">{success}</span>
          </div>
        )}

        {errors.api && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl flex items-center animate-fadeIn">
            <CheckCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            <span className="text-red-800 dark:text-red-300">{errors.api}</span>
          </div>
        )}

        <div className="grid gap-6 lg:gap-8">
          {/* Notification Channels Card */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-6 lg:p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                <Volume2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Notification Channels
              </h3>
            </div>

            <div className="grid gap-4 md:gap-6">
              {notificationChannels.map((channel) => {
                const Icon = channel.icon;
                return (
                  <div
                    key={channel.id}
                    className="flex items-center justify-between p-4 bg-white/40 dark:bg-gray-700/40 rounded-2xl border border-gray-200/30 dark:border-gray-600/30 hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 bg-gradient-to-r ${channel.color} rounded-xl shadow-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-100">{channel.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{channel.description}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={channel.checked}
                        onChange={() => channel.onChange(!channel.checked)}
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gradient-to-r peer-checked:${channel.color}`}></div>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notification Types Card */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-6 lg:p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                What to notify me about
              </h3>
            </div>

            <div className="grid gap-4 md:gap-6">
              {notificationTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <div
                    key={type.id}
                    className="flex items-center justify-between p-4 bg-white/40 dark:bg-gray-700/40 rounded-2xl border border-gray-200/30 dark:border-gray-600/30 hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-xl">
                        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-100">{type.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{type.description}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={type.checked}
                        onChange={() => type.onChange(!type.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quiet Hours Card */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-6 lg:p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Quiet Hours
              </h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white/40 dark:bg-gray-700/40 rounded-2xl border border-gray-200/30 dark:border-gray-600/30">
                <div className="flex items-center space-x-3">
                  {quietHours ? (
                    <VolumeX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">Enable Quiet Hours</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pause non-urgent notifications during specified hours</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quietHours}
                    onChange={() => setQuietHours(!quietHours)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-blue-500"></div>
                </label>
              </div>

              {quietHours && (
                <div className="grid gap-4 md:grid-cols-2 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={quietStart}
                      onChange={(e) => setQuietStart(e.target.value)}
                      className="w-full bg-white/70 dark:bg-gray-700/70 border border-gray-200/50 dark:border-gray-600/50 rounded-2xl px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={quietEnd}
                      onChange={(e) => setQuietEnd(e.target.value)}
                      className="w-full bg-white/70 dark:bg-gray-700/70 border border-gray-200/50 dark:border-gray-600/50 rounded-2xl px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="group relative px-8 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-2xl font-medium text-lg shadow-xl hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-300/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
          >
            <div className="flex items-center space-x-3">
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              )}
              <span>{saving ? "Saving Settings..." : "Save Settings"}</span>
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