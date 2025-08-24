import React, { useState, useEffect } from "react";
import {
  CreditCard,
  DollarSign,
  Save,
  CheckCircle,
  AlertCircle,
  Building2,
  Wallet,
  Globe,
  Zap,
  Shield,
  Info,
  Eye,
  EyeOff,
} from "lucide-react";
import { useApi } from "../../useApi";

export default function PaymentSettingsTab({ studioId, theme = "dark" }) {
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [accountDetails, setAccountDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [errors, setErrors] = useState({});
  const { apiFetch } = useApi();

  const paymentOptions = [
    {
      value: "bank_transfer",
      label: "Bank Transfer",
      icon: Building2,
      description: "Direct bank account transfers",
      gradient: "from-blue-500 to-cyan-500",
      popular: true,
    },
    {
      value: "paypal",
      label: "PayPal",
      icon: Wallet,
      description: "PayPal payments and transfers",
      gradient: "from-blue-600 to-indigo-600",
    },
    {
      value: "stripe",
      label: "Stripe",
      icon: CreditCard,
      description: "Credit card processing via Stripe",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      value: "flutterwave",
      label: "Flutterwave",
      icon: Zap,
      description: "African payment gateway",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  useEffect(() => {
    const fetchPaymentSettings = async () => {
      setLoading(true);
      setErrors({});
      setSuccess("");
      try {
        const response = await apiFetch(`/payments/settings/${studioId}/`, {
          method: "GET",
        });
        if (response.ok) {
          const data = await response.json();
          setPaymentMethod(data.payment_method || "bank_transfer");
          setAccountDetails(data.account_details || "");
        } else {
          setErrors({ api: "Failed to load payment settings" });
        }
      } catch (err) {
        setErrors({ api: "Network error occurred" });
        console.error("Error fetching payment settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentSettings();
  }, [studioId, apiFetch]);

  const validateForm = () => {
    const newErrors = {};

    if (!paymentMethod) {
      newErrors.paymentMethod = "Please select a payment method";
    }

    if (!accountDetails.trim()) {
      newErrors.accountDetails = "Account details are required";
    } else {
      if (paymentMethod === "bank_transfer") {
        if (!accountDetails.includes("Bank Name") || !accountDetails.includes("Account Number") || !accountDetails.includes("Account Name")) {
          newErrors.accountDetails = "Please include Bank Name, Account Number, and Account Name";
        }
      } else if (paymentMethod === "paypal") {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountDetails.split("\n")[0])) {
          newErrors.accountDetails = "Please provide a valid PayPal email address";
        }
      } else if (paymentMethod === "stripe") {
        if (!accountDetails.includes("sk_") || !accountDetails.includes("pk_")) {
          newErrors.accountDetails = "Please provide valid Stripe Secret and Publishable keys";
        }
      } else if (paymentMethod === "flutterwave") {
        if (!accountDetails.includes("FLWPUBK_") || !accountDetails.includes("FLWSECK_")) {
          newErrors.accountDetails = "Please provide valid Flutterwave Public and Secret keys";
        }
      }
      if (accountDetails.trim().length < 10) {
        newErrors.accountDetails = "Account details seem too short";
      }
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
      const response = await apiFetch(`/payments/settings/${studioId}/`, {
        method: "POST",
        body: JSON.stringify({
          payment_method: paymentMethod,
          account_details: accountDetails,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setSuccess("Payment settings saved successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorData = await response.json();
        setErrors({ api: errorData.message || "Failed to save payment settings" });
      }
    } catch (err) {
      setErrors({ api: "Network error occurred" });
      console.error("Error saving payment settings:", err);
    } finally {
      setSaving(false);
    }
  };

  const getSelectedPaymentOption = () => {
    return paymentOptions.find((option) => option.value === paymentMethod);
  };

  const getPlaceholderText = () => {
    switch (paymentMethod) {
      case "bank_transfer":
        return "Bank Name: First Bank\nAccount Number: 1234567890\nAccount Name: John Doe\nSort Code: 123456";
      case "paypal":
        return "PayPal Email: your.email@example.com\nPayPal Business ID (optional): ABC123XYZ";
      case "stripe":
        return "Stripe Secret Key: sk_live_...\nStripe Publishable Key: pk_live_...\nWebhook Endpoint: https://yoursite.com/webhook";
      case "flutterwave":
        return "Public Key: FLWPUBK_...\nSecret Key: FLWSECK_...\nEncryption Key: FLWSECK_...";
      default:
        return "Enter your payment account details...";
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950' 
          : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
      } p-4 sm:p-6 lg:p-12`}>
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-xl shadow-lg backdrop-blur-xl ${
                theme === 'dark' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-emerald-400 to-teal-400'
              }`}>
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r ${
                theme === 'dark' ? 'from-emerald-400 to-teal-400' : 'from-emerald-600 to-teal-600'
              }`}>
                Payment Settings
              </h2>
            </div>

            <div className={`rounded-2xl shadow-xl border p-8 flex items-center justify-center ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl border-slate-700/60' 
                : 'bg-white/90 border-gray-200'
            }`}>
              <div className={`w-8 h-8 border-4 rounded-full animate-spin ${
                theme === 'dark' ? 'border-indigo-400 border-t-transparent' : 'border-indigo-600 border-t-transparent'
              }`}></div>
              <span className={`ml-3 text-sm sm:text-base ${
                theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
              }`}>Loading payment settings...</span>
            </div>
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
            theme === 'dark' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-emerald-400 to-teal-400'
          }`}>
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r ${
            theme === 'dark' ? 'from-emerald-400 to-teal-400' : 'from-emerald-600 to-teal-600'
          }`}>
            Payment Settings
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
          {/* Payment Method Selection */}
          <div className={`rounded-2xl shadow-xl border transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl border-slate-700/60' 
              : 'bg-white/90 border-gray-200'
          }`}>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-2 rounded-xl shadow-lg ${
                  theme === 'dark' ? 'bg-gradient-to-r from-violet-500 to-purple-500' : 'bg-gradient-to-r from-violet-400 to-purple-400'
                }`}>
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <h3 className={`text-xl sm:text-2xl font-bold ${
                  theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                }`}>Payment Method</h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {paymentOptions.map((option) => {
                  const IconComponent = option.icon;
                  const isSelected = paymentMethod === option.value;

                  return (
                    <div
                      key={option.value}
                      onClick={() => setPaymentMethod(option.value)}
                      className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                        isSelected
                          ? theme === 'dark'
                            ? 'border-indigo-400 bg-indigo-900/20'
                            : 'border-indigo-300 bg-indigo-50/80'
                          : theme === 'dark'
                            ? 'border-slate-700/50 bg-slate-800/60 hover:bg-slate-800/80'
                            : 'border-gray-200/50 bg-white/70 hover:bg-white/90'
                      }`}
                    >
                      {option.popular && (
                        <div className={`absolute -top-2 -right-2 text-xs font-bold px-2 py-1 rounded-full shadow-lg ${
                          theme === 'dark'
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                            : 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
                        }`}>
                          Popular
                        </div>
                      )}
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-xl shadow-lg bg-gradient-to-r ${option.gradient}`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold ${
                            theme === 'dark' ? 'text-slate-100' : 'text-gray-800'
                          } mb-1`}>
                            {option.label}
                          </h4>
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                          }`}>
                            {option.description}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle className={`w-5 h-5 ${
                            theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                          }`} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {errors.paymentMethod && (
                <div className={`flex items-center mt-4 text-sm animate-fadeIn ${
                  theme === 'dark' ? 'text-red-400' : 'text-red-600'
                }`}>
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.paymentMethod}
                </div>
              )}
            </div>
          </div>

          {/* Account Details */}
          {paymentMethod && (
            <div className={`rounded-2xl shadow-xl border transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 animate-fadeIn ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl border-slate-700/60' 
                : 'bg-white/90 border-gray-200'
            }`}>
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`p-2 rounded-xl shadow-lg bg-gradient-to-r ${getSelectedPaymentOption()?.gradient}`}>
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <h3 className={`text-xl sm:text-2xl font-bold ${
                    theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                  }`}>
                    {getSelectedPaymentOption()?.label} Account Details
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className={`block text-sm font-medium ${
                        theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                      }`}>
                        Account Configuration *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowDetails(!showDetails)}
                        className={`flex items-center space-x-1 text-sm transition-colors ${
                          theme === 'dark' 
                            ? 'text-slate-400 hover:text-slate-200' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        <span>{showDetails ? "Hide" : "Show"} Details</span>
                      </button>
                    </div>
                    <div className="relative">
                      <textarea
                        value={accountDetails}
                        onChange={(e) => setAccountDetails(e.target.value)}
                        placeholder={getPlaceholderText()}
                        className={`w-full px-4 py-4 rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:border-transparent backdrop-blur-xl transition-all duration-200 resize-none h-32 ${
                          showDetails ? "font-mono" : "font-sans"
                        } ${
                          errors.accountDetails
                            ? "border-red-400 focus:ring-red-500/50"
                            : theme === 'dark'
                              ? 'bg-slate-800/60 border-slate-700/50 text-slate-100 hover:bg-slate-800/80 focus:ring-indigo-500/50'
                              : 'bg-white/70 border-gray-200/50 text-gray-900 hover:bg-white/90 focus:ring-indigo-500/50'
                        } ${!showDetails ? "blur-sm hover:blur-none focus:blur-none" : ""}`}
                        style={{ filter: showDetails ? "none" : "blur(2px)" }}
                      />
                      {!showDetails && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className={`px-4 py-2 rounded-xl border shadow-lg backdrop-blur-xl ${
                            theme === 'dark' ? 'bg-slate-800/90 border-slate-700/50' : 'bg-white/90 border-gray-200/50'
                          }`}>
                            <p className={`text-sm font-medium flex items-center ${
                              theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                            }`}>
                              <Eye className="w-4 h-4 mr-2" />
                              Click "Show Details" to view/edit
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    {errors.accountDetails && (
                      <div className={`flex items-center mt-2 text-sm animate-fadeIn ${
                        theme === 'dark' ? 'text-red-400' : 'text-red-600'
                      }`}>
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.accountDetails}
                      </div>
                    )}
                  </div>

                  {/* Payment Method Info */}
                  <div className={`rounded-2xl p-4 border animate-fadeIn ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-800/30'
                      : 'bg-gradient-to-r from-blue-400/10 to-cyan-400/10 border-blue-200/30'
                  }`}>
                    <div className="flex items-start space-x-3">
                      <Info className={`w-5 h-5 mt-0.5 ${
                        theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                      }`} />
                      <div>
                        <h4 className={`font-medium mb-2 ${
                          theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                        }`}>
                          {getSelectedPaymentOption()?.label} Integration Guide:
                        </h4>
                        <div className={`text-sm space-y-1 ${
                          theme === 'dark' ? 'text-blue-400' : 'text-blue-700'
                        }`}>
                          {paymentMethod === "bank_transfer" && (
                            <>
                              <p>• Provide your bank account details for direct transfers</p>
                              <p>• Include bank name, account number, and account holder name</p>
                              <p>• Add sort code or routing number if required</p>
                            </>
                          )}
                          {paymentMethod === "paypal" && (
                            <>
                              <p>• Enter your PayPal business email address</p>
                              <p>• Optionally include your PayPal Business ID</p>
                              <p>• Ensure your PayPal account can receive payments</p>
                            </>
                          )}
                          {paymentMethod === "stripe" && (
                            <>
                              <p>• Add your Stripe API keys (Secret and Publishable)</p>
                              <p>• Configure webhook endpoint for payment notifications</p>
                              <p>• Test with Stripe's test keys before going live</p>
                            </>
                          )}
                          {paymentMethod === "flutterwave" && (
                            <>
                              <p>• Provide your Flutterwave API keys</p>
                              <p>• Include Public Key, Secret Key, and Encryption Key</p>
                              <p>• Perfect for African market payments</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={saving || !paymentMethod}
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
              <span className="truncate">{saving ? "Saving Settings..." : "Save Payment Settings"}</span>
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