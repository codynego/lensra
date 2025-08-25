import { useState, useEffect } from "react";
import { Save, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../../AuthContext";

const GeneralInfoForm = ({ theme = 'dark' }) => {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    tagline: "",
    about: "",
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");
  const { apiFetch } = useAuth();

  useEffect(() => {
    fetchGeneralInfo();
  }, [apiFetch]);

  const fetchGeneralInfo = async () => {
    try {
      setInitialLoading(true);
      setApiError("");
      const response = await apiFetch("/studio/general-info/", {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        if (process.env.NODE_ENV === 'development') {
          console.log("Fetched general info:", data);
        }
        setFormData({
          name: data.name || "",
          slug: data.slug || "",
          tagline: data.tagline || "",
          about: data.about || "",
        });
      } else if (response.status !== 404) {
        const errorData = await response.json();
        setApiError(errorData.message || "Failed to load existing information");
      }
    } catch (error) {
      console.error("Error fetching general info:", error);
      setApiError("Network error occurred");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (success) {
      setSuccess(false);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "name" && {
        slug: value
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
          .slice(0, 50),
      }),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Business name is required";
    } else if (formData.name.length > 100) {
      newErrors.name = "Business name cannot exceed 100 characters";
    }

    // Slug validation
    if (!formData.slug.trim()) {
      newErrors.slug = "Subdomain is required";
    } else if (formData.slug.length < 3) {
      newErrors.slug = "Subdomain must be at least 3 characters";
    } else if (formData.slug.length > 50) {
      newErrors.slug = "Subdomain cannot exceed 50 characters";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = "Subdomain can only contain lowercase letters, numbers, and hyphens";
    }

    // Tagline validation
    if (formData.tagline.length > 100) {
      newErrors.tagline = "Tagline cannot exceed 100 characters";
    }

    // About validation
    if (formData.about.length > 1000) {
      newErrors.about = "About section cannot exceed 1000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setApiError("");

    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        tagline: formData.tagline.trim(),
        about: formData.about.trim(),
      };

      if (process.env.NODE_ENV === 'development') {
        console.log("Submitting general info:", JSON.stringify(payload, null, 2));
      }

      const response = await apiFetch("/studio/general-info/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        if (responseData.errors) {
          const backendErrors = {};
          Object.entries(responseData.errors).forEach(([key, value]) => {
            const frontendKey = key === "business_name" ? "name" : key;
            backendErrors[frontendKey] = Array.isArray(value) ? value[0] : value;
          });
          setErrors(backendErrors);
        } else {
          setApiError(responseData.message || "Failed to save information");
        }
      }
    } catch (error) {
      console.error("Error saving general info:", error);
      setApiError("Network error occurred while saving");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className={`
          rounded-2xl shadow-xl border overflow-hidden
          ${theme === 'dark'
            ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/60'
            : 'bg-white/90 border-gray-200'
          }
        `}>
          <div className="flex items-center justify-center py-12">
            <Loader2 className={`w-8 h-8 animate-spin ${
              theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
            }`} />
            <span className={`ml-2 ${
              theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
            }`}>Loading your information...</span>
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
          ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/60'
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
          <h2 className={`text-lg sm:text-xl lg:text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>General Information</h2>
          <p className={`text-sm mt-1 ${
            theme === 'dark' ? 'text-indigo-200' : 'text-gray-600'
          }`}>Set up your basic business details</p>
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
            <span className={theme === 'dark' ? 'text-green-300' : 'text-green-800'}>
              Information saved successfully!
            </span>
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
            <span className={theme === 'dark' ? 'text-red-300' : 'text-red-800'}>
              {apiError}
            </span>
          </div>
        )}

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="lg:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-slate-200' : 'text-gray-700'
              }`}>
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`
                  w-full px-4 py-3 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-200 backdrop-blur-sm
                  ${theme === 'dark'
                    ? errors.name
                      ? 'bg-red-500/10 border-red-500/30 text-slate-100 placeholder-slate-400'
                      : 'bg-slate-700/50 border-slate-600/50 text-slate-100 placeholder-slate-400 hover:bg-slate-700/70'
                    : errors.name
                      ? 'bg-red-50/80 border-red-200 text-gray-900 placeholder-gray-400'
                      : 'bg-white/70 border-gray-200/50 text-gray-900 placeholder-gray-400 hover:bg-white/90'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                placeholder="Enter your business name"
                disabled={loading}
              />
              {errors.name && (
                <p className={`mt-1 text-sm ${
                  theme === 'dark' ? 'text-red-400' : 'text-red-600'
                }`}>{errors.name}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-slate-200' : 'text-gray-700'
              }`}>
                Subdomain <span className="text-red-500">*</span>
              </label>
              <input
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className={`
                  w-full px-4 py-3 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-200 backdrop-blur-sm
                  ${theme === 'dark'
                    ? errors.slug
                      ? 'bg-red-500/10 border-red-500/30 text-slate-100 placeholder-slate-400'
                      : 'bg-slate-700/50 border-slate-600/50 text-slate-100 placeholder-slate-400 hover:bg-slate-700/70'
                    : errors.slug
                      ? 'bg-red-50/80 border-red-200 text-gray-900 placeholder-gray-400'
                      : 'bg-white/70 border-gray-200/50 text-gray-900 placeholder-gray-400 hover:bg-white/90'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                placeholder="your-subdomain"
                disabled={loading}
              />
              <div className={`
                mt-2 p-3 rounded-lg
                ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'}
              `}>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  Your site will be at:{" "}
                  <span className={`font-mono font-medium ${
                    theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                  }`}>
                    {formData.slug || "your-subdomain"}.lensra.com
                  </span>
                </p>
              </div>
              {errors.slug && (
                <p className={`mt-1 text-sm ${
                  theme === 'dark' ? 'text-red-400' : 'text-red-600'
                }`}>{errors.slug}</p>
              )}
            </div>

            <div className="lg:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-slate-200' : 'text-gray-700'
              }`}>
                Tagline
              </label>
              <input
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                className={`
                  w-full px-4 py-3 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-200 backdrop-blur-sm
                  ${theme === 'dark'
                    ? errors.tagline
                      ? 'bg-red-500/10 border-red-500/30 text-slate-100 placeholder-slate-400'
                      : 'bg-slate-700/50 border-slate-600/50 text-slate-100 placeholder-slate-400 hover:bg-slate-700/70'
                    : errors.tagline
                      ? 'bg-red-50/80 border-red-200 text-gray-900 placeholder-gray-400'
                      : 'bg-white/70 border-gray-200/50 text-gray-900 placeholder-gray-400 hover:bg-white/90'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                placeholder="A brief description of what you do"
                disabled={loading}
              />
              {errors.tagline && (
                <p className={`mt-1 text-sm ${
                  theme === 'dark' ? 'text-red-400' : 'text-red-600'
                }`}>{errors.tagline}</p>
              )}
            </div>

            <div className="lg:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-slate-200' : 'text-gray-700'
              }`}>
                About
              </label>
              <textarea
                name="about"
                value={formData.about}
                onChange={handleChange}
                rows={4}
                className={`
                  w-full px-4 py-3 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-200 backdrop-blur-sm resize-vertical
                  ${theme === 'dark'
                    ? errors.about
                      ? 'bg-red-500/10 border-red-500/30 text-slate-100 placeholder-slate-400'
                      : 'bg-slate-700/50 border-slate-600/50 text-slate-100 placeholder-slate-400 hover:bg-slate-700/70'
                    : errors.about
                      ? 'bg-red-50/80 border-red-200 text-gray-900 placeholder-gray-400'
                      : 'bg-white/70 border-gray-200/50 text-gray-900 placeholder-gray-400 hover:bg-white/90'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                placeholder="Tell people about your business, services, and what makes you unique..."
                disabled={loading}
              />
              {errors.about && (
                <p className={`mt-1 text-sm ${
                  theme === 'dark' ? 'text-red-400' : 'text-red-600'
                }`}>{errors.about}</p>
              )}
            </div>
          </div>

          <div className="mt-6 sm:mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`
                inline-flex items-center px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-medium text-sm sm:text-base transition-all duration-300 transform hover:scale-105 shadow-lg
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
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save & Continue
                </>
              )}
            </button>
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
        .resize-vertical {
          resize: vertical;
        }
      `}</style>
    </div>
  );
};

export default GeneralInfoForm;