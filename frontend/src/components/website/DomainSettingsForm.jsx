import { useState, useEffect } from "react";
import { Globe, Shield, CheckCircle, AlertCircle, Crown, ExternalLink, Copy, Loader2, Save } from "lucide-react";
import { useApi } from "../../useApi";

const DomainSettingsForm = ({ isPremium = false, theme = 'dark' }) => {
  const [formData, setFormData] = useState({
    customDomain: "",
    enableSsl: true,
    redirectWww: true,
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [domainStatus, setDomainStatus] = useState({
    verified: false,
    sslActive: false,
    lastChecked: null,
  });
  const [success, setSuccess] = useState("");
  const [apiError, setApiError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const { apiFetch } = useApi();

  useEffect(() => {
    fetchDomainSettings();
  }, [apiFetch]);

  const fetchDomainSettings = async () => {
    try {
      const response = await apiFetch("/studio/domain-settings/", {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        if (process.env.NODE_ENV === 'development') {
          console.log("Fetched domain settings:", data);
        }
        setFormData({
          customDomain: data.custom_domain || "",
          enableSsl: data.enable_ssl ?? true,
          redirectWww: data.redirect_www ?? true,
        });
        setDomainStatus({
          verified: data.domain_verified || false,
          sslActive: data.ssl_active || false,
          lastChecked: data.last_checked || null,
        });
      } else if (response.status === 403) {
        setApiError("Premium subscription required for custom domain features");
      } else if (response.status !== 404) {
        const errorData = await response.json();
        setApiError(errorData.message || "Failed to load domain settings");
      }
    } catch (error) {
      console.error("Error fetching domain settings:", error);
      setApiError("Network error occurred");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (success) setSuccess("");
    if (apiError) setApiError("");

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateDomain = (domain) => {
    if (!domain) return true;
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isPremium) {
      setApiError("Premium subscription required for custom domain features");
      return;
    }

    if (formData.customDomain && !validateDomain(formData.customDomain)) {
      setApiError("Please enter a valid domain name (e.g., yourdomain.com)");
      return;
    }

    setLoading(true);
    setApiError("");

    try {
      const payload = {
        custom_domain: formData.customDomain.trim() || null,
        enable_ssl: formData.enableSsl,
        redirect_www: formData.redirectWww,
      };

      if (process.env.NODE_ENV === 'development') {
        console.log("Submitting domain settings:", payload);
      }

      const response = await apiFetch("/studio/domain-settings/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (response.ok) {
        setSuccess("Domain settings saved successfully!");
        setDomainStatus((prev) => ({
          ...prev,
          verified: responseData.domain_verified ?? prev.verified,
          sslActive: responseData.ssl_active ?? prev.sslActive,
          lastChecked: responseData.last_checked || new Date().toISOString(),
        }));
        setTimeout(() => setSuccess(""), 3000);
      } else if (response.status === 403) {
        setApiError("Premium subscription required for custom domain features");
      } else {
        setApiError(responseData.message || "Failed to save domain settings");
      }
    } catch (error) {
      console.error("Error saving domain settings:", error);
      setApiError("Network error occurred while saving");
    } finally {
      setLoading(false);
    }
  };

  const verifyDomain = async () => {
    if (!formData.customDomain) {
      setApiError("Please enter a custom domain first");
      return;
    }

    if (!validateDomain(formData.customDomain)) {
      setApiError("Please enter a valid domain name (e.g., yourdomain.com)");
      return;
    }

    setLoading(true);
    setApiError("");

    try {
      const response = await apiFetch("/studio/domain-settings/verify/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain: formData.customDomain.trim() }),
      });

      const responseData = await response.json();

      if (response.ok) {
        setDomainStatus((prev) => ({
          ...prev,
          verified: responseData.verified,
          sslActive: responseData.ssl_active || false,
          lastChecked: new Date().toISOString(),
        }));
        if (responseData.verified) {
          setSuccess("Domain verified successfully!");
        } else {
          setApiError("Domain verification failed. Please check your DNS settings.");
        }
      } else {
        setApiError(responseData.message || "Failed to verify domain");
      }
    } catch (error) {
      console.error("Error verifying domain:", error);
      setApiError("Network error occurred during verification");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      setApiError("Failed to copy to clipboard");
    }
  };

  if (initialLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className={`
          rounded-2xl shadow-xl border overflow-hidden
          ${theme === 'dark'
            ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl border-slate-700/60'
            : 'bg-white/90 border-gray-200'
          }
        `}>
          <div className="flex items-center justify-center py-12">
            <Loader2 className={`w-8 h-8 animate-spin ${
              theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
            }`} />
            <span className={`ml-2 text-sm font-medium ${
              theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
            }`}>Loading domain settings...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className={`
          rounded-2xl shadow-xl border overflow-hidden transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1
          ${theme === 'dark'
            ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl border-slate-700/60'
            : 'bg-white/90 border-gray-200'
          }
        `}>
          <div className={`
            px-4 sm:px-6 py-4 border-b
            ${theme === 'dark'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 border-slate-700/60'
              : 'bg-gradient-to-r from-indigo-400 to-purple-500 border-gray-200'
            }
            backdrop-blur-xl
          `}>
            <div className="flex items-center">
              <Crown className={`w-6 h-6 ${
                theme === 'dark' ? 'text-pink-400' : 'text-pink-500'
              } mr-2`} />
              <div>
                <h2 className={`text-lg sm:text-xl lg:text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Domain Settings</h2>
                <p className={`text-sm mt-1 ${
                  theme === 'dark' ? 'text-indigo-200' : 'text-gray-600'
                }`}>Premium Feature - Custom domain configuration</p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-8 text-center">
            <div className={`
              w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4
              ${theme === 'dark' ? 'bg-indigo-500/20' : 'bg-indigo-100'}
            `}>
              <Crown className={`w-8 h-8 ${
                theme === 'dark' ? 'text-pink-400' : 'text-pink-500'
              }`} />
            </div>
            <h3 className={`text-lg sm:text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
            }`}>Premium Feature</h3>
            <p className={`text-sm mb-6 max-w-md mx-auto ${
              theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
            }`}>
              Custom domain functionality is available for premium subscribers. Upgrade your plan to use your own domain name.
            </p>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex items-center justify-center">
                <CheckCircle className={`w-4 h-4 mr-2 ${
                  theme === 'dark' ? 'text-green-400' : 'text-green-600'
                }`} />
                <span className={theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}>
                  Custom domain (yourdomain.com)
                </span>
              </div>
              <div className="flex items-center justify-center">
                <CheckCircle className={`w-4 h-4 mr-2 ${
                  theme === 'dark' ? 'text-green-400' : 'text-green-600'
                }`} />
                <span className={theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}>
                  SSL certificates
                </span>
              </div>
              <div className="flex items-center justify-center">
                <CheckCircle className={`w-4 h-4 mr-2 ${
                  theme === 'dark' ? 'text-green-400' : 'text-green-600'
                }`} />
                <span className={theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}>
                  Professional appearance
                </span>
              </div>
            </div>
            <a
              href="/upgrade"
              className={`
                inline-flex items-center px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-medium text-sm sm:text-base transition-all duration-300 transform hover:scale-105 shadow-lg
                ${theme === 'dark'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-indigo-500/25'
                  : 'bg-gradient-to-r from-indigo-400 to-purple-500 text-white hover:from-indigo-500 hover:to-purple-600 shadow-indigo-400/25'
                }
              `}
            >
              Upgrade to Premium
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className={`
        rounded-2xl shadow-xl border overflow-hidden transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1
        ${theme === 'dark'
          ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl border-slate-700/60'
          : 'bg-white/90 border-gray-200'
        }
      `}>
        <div className={`
          px-4 sm:px-6 py-4 border-b
          ${theme === 'dark'
            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 border-slate-700/60'
            : 'bg-gradient-to-r from-indigo-400 to-purple-500 border-gray-200'
          }
          backdrop-blur-xl
        `}>
          <div className="flex items-center">
            <Globe className={`w-6 h-6 ${
              theme === 'dark' ? 'text-pink-400' : 'text-pink-500'
            } mr-2`} />
            <div>
              <h2 className={`text-lg sm:text-xl lg:text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Domain Settings</h2>
              <p className={`text-sm mt-1 ${
                theme === 'dark' ? 'text-indigo-200' : 'text-gray-600'
              }`}>Configure your custom domain and SSL settings</p>
            </div>
          </div>
        </div>

        {success && (
          <div className={`
            mx-4 sm:mx-6 mt-4 p-4 rounded-xl flex items-center animate-fadeIn
            ${theme === 'dark'
              ? 'bg-green-500/10 border border-green-500/30 backdrop-blur-xl'
              : 'bg-green-50/80 border border-green-200'
            }
          `}>
            <CheckCircle className={`w-5 h-5 mr-2 ${
              theme === 'dark' ? 'text-green-400' : 'text-green-600'
            }`} />
            <span className={`text-sm font-medium ${
              theme === 'dark' ? 'text-green-300' : 'text-green-800'
            }`}>{success}</span>
          </div>
        )}

        {apiError && (
          <div className={`
            mx-4 sm:mx-6 mt-4 p-4 rounded-xl flex items-center animate-fadeIn
            ${theme === 'dark'
              ? 'bg-red-500/10 border border-red-500/30 backdrop-blur-xl'
              : 'bg-red-50/80 border border-red-200'
            }
          `}>
            <AlertCircle className={`w-5 h-5 mr-2 ${
              theme === 'dark' ? 'text-red-400' : 'text-red-600'
            }`} />
            <span className={`text-sm font-medium ${
              theme === 'dark' ? 'text-red-300' : 'text-red-800'
            }`}>{apiError}</span>
          </div>
        )}

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-slate-200' : 'text-gray-700'
                }`}>Custom Domain</label>
                <div className="flex">
                  <input
                    type="text"
                    name="customDomain"
                    value={formData.customDomain}
                    onChange={handleChange}
                    placeholder="yourdomain.com"
                    className={`
                      flex-1 px-4 py-3 rounded-l-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-200 backdrop-blur-sm
                      ${theme === 'dark'
                        ? 'bg-slate-700/50 border-slate-600/50 text-slate-100 placeholder-slate-400 hover:bg-slate-700/70'
                        : 'bg-white/70 border-gray-200/50 text-gray-900 placeholder-gray-400 hover:bg-white/90'
                      }
                      ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={verifyDomain}
                    disabled={loading}
                    className={`
                      px-4 sm:px-6 py-3 rounded-r-xl font-medium text-sm sm:text-base transition-all duration-300 transform hover:scale-105
                      ${loading
                        ? theme === 'dark'
                          ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : theme === 'dark'
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-indigo-500/25'
                          : 'bg-gradient-to-r from-indigo-400 to-purple-500 text-white hover:from-indigo-500 hover:to-purple-600 shadow-indigo-400/25'
                      }
                    `}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Verify"
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableSsl"
                  name="enableSsl"
                  checked={formData.enableSsl}
                  onChange={handleChange}
                  className={`
                    h-4 w-4 rounded focus:ring-2 focus:ring-indigo-500/50
                    ${theme === 'dark'
                      ? 'bg-slate-700/50 border-slate-600/50 text-indigo-500'
                      : 'bg-white/70 border-gray-200/50 text-indigo-600'
                    }
                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  disabled={loading}
                />
                <label
                  htmlFor="enableSsl"
                  className={`ml-2 block text-sm ${
                    theme === 'dark' ? 'text-slate-200' : 'text-gray-700'
                  }`}
                >
                  Enable SSL (HTTPS)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="redirectWww"
                  name="redirectWww"
                  checked={formData.redirectWww}
                  onChange={handleChange}
                  className={`
                    h-4 w-4 rounded focus:ring-2 focus:ring-indigo-500/50
                    ${theme === 'dark'
                      ? 'bg-slate-700/50 border-slate-600/50 text-indigo-500'
                      : 'bg-white/70 border-gray-200/50 text-indigo-600'
                    }
                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  disabled={loading}
                />
                <label
                  htmlFor="redirectWww"
                  className={`ml-2 block text-sm ${
                    theme === 'dark' ? 'text-slate-200' : 'text-gray-700'
                  }`}
                >
                  Redirect www.yourdomain.com to yourdomain.com
                </label>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={`
                  inline-flex items-center px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-medium text-sm sm:text-base transition-all duration-300 transform hover:scale-105 shadow-lg
                  ${loading
                    ? theme === 'dark'
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : theme === 'dark'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-indigo-500/25'
                      : 'bg-gradient-to-r from-indigo-400 to-purple-500 text-white hover:from-indigo-500 hover:to-purple-600 shadow-indigo-400/25'
                  }
                `}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className={`text-base sm:text-lg font-semibold mb-4 ${
                  theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                }`}>Domain Status</h3>
                <div className={`
                  border rounded-xl p-4 space-y-4
                  ${theme === 'dark'
                    ? 'bg-slate-700/50 border-slate-600/50 backdrop-blur-sm'
                    : 'bg-white/70 border-gray-200/50'
                  }
                `}>
                  <div className="flex items-center">
                    {domainStatus.verified ? (
                      <CheckCircle className={`w-5 h-5 mr-2 ${
                        theme === 'dark' ? 'text-green-400' : 'text-green-600'
                      }`} />
                    ) : (
                      <AlertCircle className={`w-5 h-5 mr-2 ${
                        theme === 'dark' ? 'text-red-400' : 'text-red-600'
                      }`} />
                    )}
                    <span className={theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}>
                      {domainStatus.verified ? "Domain Verified" : "Domain Not Verified"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    {domainStatus.sslActive ? (
                      <Shield className={`w-5 h-5 mr-2 ${
                        theme === 'dark' ? 'text-green-400' : 'text-green-600'
                      }`} />
                    ) : (
                      <AlertCircle className={`w-5 h-5 mr-2 ${
                        theme === 'dark' ? 'text-red-400' : 'text-red-600'
                      }`} />
                    )}
                    <span className={theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}>
                      {domainStatus.sslActive ? "SSL Active" : "SSL Not Active"}
                    </span>
                  </div>
                  {domainStatus.lastChecked && (
                    <p className={`text-xs ${
                      theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                    }`}>
                      Last checked: {new Date(domainStatus.lastChecked).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {formData.customDomain && (
                <div>
                  <h4 className={`text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-slate-200' : 'text-gray-700'
                  }`}>DNS Instructions</h4>
                  <p className={`text-sm mb-2 ${
                    theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    Point your domain's CNAME or A record to:
                  </p>
                  <div className={`
                    flex items-center border rounded-xl px-3 py-2
                    ${theme === 'dark'
                      ? 'bg-slate-700/50 border-slate-600/50 backdrop-blur-sm'
                      : 'bg-white/70 border-gray-200/50'
                    }
                  `}>
                    <code className={`flex-1 text-sm ${
                      theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
                    }`}>studio.example.com</code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("studio.example.com")}
                      className={`
                        p-1 rounded transition-all duration-200 transform hover:scale-105
                        ${theme === 'dark'
                          ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-600/50'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      {copySuccess ? (
                        <CheckCircle className={`w-4 h-4 animate-pulse ${
                          theme === 'dark' ? 'text-green-400' : 'text-green-600'
                        }`} />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
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
      `}</style>
    </div>
  );
};

export default DomainSettingsForm;