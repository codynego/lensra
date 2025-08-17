import { useState, useEffect } from "react";
import { Globe, Shield, CheckCircle, AlertCircle, Crown, ExternalLink, Copy, Loader2, Save } from "lucide-react";
import { useApi } from "../../useApi";

const DomainSettingsForm = ({ isPremium = false }) => {
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
  }, []);

  const fetchDomainSettings = async () => {
    try {
      const response = await apiFetch("/studio/domain-settings/", {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
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
        setApiError("Failed to load domain settings");
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

    if (success) {
      setSuccess("");
    }

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
        custom_domain: formData.customDomain,
        enable_ssl: formData.enableSsl,
        redirect_www: formData.redirectWww,
      };

      const response = await apiFetch("/studio/domain-settings/", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (response.ok) {
        setSuccess("Domain settings saved successfully!");

        if (responseData.domain_verified !== undefined) {
          setDomainStatus((prev) => ({
            ...prev,
            verified: responseData.domain_verified,
            sslActive: responseData.ssl_active || false,
            lastChecked: responseData.last_checked || new Date().toISOString(),
          }));
        }

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

    setLoading(true);
    setApiError("");

    try {
      const response = await apiFetch("/studio/domain-settings/verify/", {
        method: "POST",
        body: JSON.stringify({ domain: formData.customDomain }),
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
    }
  };

  if (initialLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            <span className="ml-2 text-gray-600">Loading domain settings...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Crown className="w-6 h-6 text-orange-600 mr-2" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Domain Settings</h2>
                <p className="text-gray-600 mt-1">Premium Feature - Custom domain configuration</p>
              </div>
            </div>
          </div>

          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium Feature</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Custom domain functionality is available for premium subscribers. Upgrade your plan to use your own domain name.
            </p>
            <div className="space-y-3 text-sm text-gray-500 mb-6">
              <div className="flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Custom domain (yourdomain.com)
              </div>
              <div className="flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                SSL certificates
              </div>
              <div className="flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Professional appearance
              </div>
            </div>
            <button className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors">
              Upgrade to Premium
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Globe className="w-6 h-6 text-orange-600 mr-2" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Domain Settings</h2>
              <p className="text-gray-600 mt-1">Configure your custom domain and SSL settings</p>
            </div>
          </div>
        </div>

        {success && (
          <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-800">{success}</span>
          </div>
        )}

        {apiError && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{apiError}</span>
          </div>
        )}

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Domain
                </label>
                <div className="flex">
                  <input
                    type="text"
                    name="customDomain"
                    value={formData.customDomain}
                    onChange={handleChange}
                    placeholder="yourdomain.com"
                    className="flex-1 border-gray-300 rounded-l-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={verifyDomain}
                    disabled={loading}
                    className="px-4 py-2 bg-orange-600 text-white rounded-r-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-500"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
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
                  className="h-4 w-4 text-orange-600 border-gray-300 rounded"
                />
                <label htmlFor="enableSsl" className="ml-2 block text-sm text-gray-700">
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
                  className="h-4 w-4 text-orange-600 border-gray-300 rounded"
                />
                <label htmlFor="redirectWww" className="ml-2 block text-sm text-gray-700">
                  Redirect www.yourdomain.com to yourdomain.com
                </label>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-500"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Settings
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Domain Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    {domainStatus.verified ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    )}
                    <span className="text-gray-800">
                      {domainStatus.verified ? "Domain Verified" : "Domain Not Verified"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    {domainStatus.sslActive ? (
                      <Shield className="w-5 h-5 text-green-500 mr-2" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    )}
                    <span className="text-gray-800">
                      {domainStatus.sslActive ? "SSL Active" : "SSL Not Active"}
                    </span>
                  </div>
                  {domainStatus.lastChecked && (
                    <p className="text-xs text-gray-500">
                      Last checked: {new Date(domainStatus.lastChecked).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {formData.customDomain && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">DNS Instructions</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Point your domain's CNAME or A record to:
                  </p>
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                    <code className="flex-1 text-sm text-gray-800">studio.example.com</code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("studio.example.com")}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      {copySuccess ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
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
    </div>
  );
};

export default DomainSettingsForm;