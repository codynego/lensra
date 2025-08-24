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
  EyeOff
} from "lucide-react";

export default function PaymentSettingsTab({ studioId }) {
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [accountDetails, setAccountDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [errors, setErrors] = useState({});

  // Sample data for demo
  useEffect(() => {
    // Simulate API fetch
    console.log("Loading payment settings for studio:", studioId);
    // You can remove this timeout in real implementation
    setTimeout(() => {
      setAccountDetails("Sample account details loaded...");
    }, 500);
  }, [studioId]);

  const paymentOptions = [
    {
      value: "bank_transfer",
      label: "Bank Transfer",
      icon: Building2,
      description: "Direct bank account transfers",
      gradient: "from-blue-500 to-cyan-500",
      popular: true
    },
    {
      value: "paypal",
      label: "PayPal",
      icon: Wallet,
      description: "PayPal payments and transfers",
      gradient: "from-blue-600 to-indigo-600"
    },
    {
      value: "stripe",
      label: "Stripe",
      icon: CreditCard,
      description: "Credit card processing via Stripe",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      value: "flutterwave",
      label: "Flutterwave",
      icon: Zap,
      description: "African payment gateway",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!paymentMethod) {
      newErrors.paymentMethod = "Please select a payment method";
    }
    
    if (!accountDetails.trim()) {
      newErrors.accountDetails = "Account details are required";
    } else if (accountDetails.trim().length < 10) {
      newErrors.accountDetails = "Account details seem too short";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setSaved(false);
    setMessage("");

    // Simulate API call
    setTimeout(() => {
      console.log("Payment settings saved:", { paymentMethod, accountDetails });
      setSaved(true);
      setMessage("Payment settings saved successfully!");
      setLoading(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage("");
        setSaved(false);
      }, 3000);
    }, 1500);
  };

  const getSelectedPaymentOption = () => {
    return paymentOptions.find(option => option.value === paymentMethod);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-900 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-lg">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Payment Settings
          </h2>
        </div>

        {/* Success Message */}
        {message && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 animate-fadeIn">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
              <p className="text-green-800 dark:text-green-200 font-medium">{message}</p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:gap-8">
          {/* Payment Method Selection */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-6 lg:p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Payment Method
              </h3>
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
                        ? 'border-violet-300 bg-violet-50 dark:bg-violet-900/20 dark:border-violet-600 shadow-lg'
                        : 'border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 hover:bg-white/70 dark:hover:bg-gray-700/70'
                    }`}
                  >
                    {option.popular && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        Popular
                      </div>
                    )}
                    
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 bg-gradient-to-r ${option.gradient} rounded-xl`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
                          {option.label}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {option.description}
                        </p>
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {errors.paymentMethod && (
              <div className="flex items-center mt-4 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.paymentMethod}
              </div>
            )}
          </div>

          {/* Account Details */}
          {paymentMethod && (
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-6 lg:p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 animate-fadeIn">
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-2 bg-gradient-to-r ${getSelectedPaymentOption()?.gradient} rounded-xl`}>
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  {getSelectedPaymentOption()?.label} Account Details
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Account Configuration *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowDetails(!showDetails)}
                      className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    >
                      {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      <span>{showDetails ? 'Hide' : 'Show'} Details</span>
                    </button>
                  </div>
                  
                  <div className="relative">
                    <textarea
                      value={accountDetails}
                      onChange={(e) => setAccountDetails(e.target.value)}
                      placeholder={getPlaceholderText()}
                      className={`w-full px-4 py-4 bg-white/70 dark:bg-gray-700/70 border rounded-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent backdrop-blur-sm transition-all duration-200 resize-none h-32 ${
                        showDetails ? 'font-mono text-sm' : 'font-sans'
                      } ${
                        errors.accountDetails 
                          ? 'border-red-300 focus:ring-red-500/50' 
                          : 'border-gray-200/50 dark:border-gray-600/50 focus:ring-violet-500/50'
                      } ${!showDetails ? 'blur-sm hover:blur-none focus:blur-none' : ''}`}
                      style={{ filter: showDetails ? 'none' : 'blur(2px)' }}
                    />
                    {!showDetails && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-white/90 dark:bg-gray-800/90 px-4 py-2 rounded-xl border shadow-lg">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                            <Eye className="w-4 h-4 mr-2" />
                            Click "Show Details" to view/edit
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {errors.accountDetails && (
                    <div className="flex items-center mt-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.accountDetails}
                    </div>
                  )}
                </div>

                {/* Payment Method Info */}
                <div className={`bg-gradient-to-r ${getSelectedPaymentOption()?.gradient.replace('from-', 'from-').replace('to-', 'to-')}/10 rounded-2xl p-4 border border-gray-200/30 dark:border-gray-600/30`}>
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                        {getSelectedPaymentOption()?.label} Integration Guide:
                      </h4>
                      <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
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
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={loading || !paymentMethod}
            className="group relative px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-medium text-lg shadow-xl hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-300/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
          >
            <div className="flex items-center space-x-3">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              )}
              <span>{loading ? "Saving Settings..." : "Save Payment Settings"}</span>
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