import { useState, useEffect } from "react";
import { Save, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useApi } from "../../useApi";

const GeneralInfoForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    tagline: "",
    about: "",
    photographer: {
      username: "",
      email: "",
      phone_number: "",
      location: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");
  const { apiFetch } = useApi();

  useEffect(() => {
    fetchGeneralInfo();
  }, []);

  const fetchGeneralInfo = async () => {
    try {
      const response = await apiFetch("/studio/general-info/", {
        method: "GET",
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched general info:", data);
        setFormData({
          name: data.name || "",
          slug: data.slug || "",
          tagline: data.tagline || "",
          about: data.about || "",
          photographer: {
            email: data.photographer.email || "",
            phone_number: data.photographer.phone_number || "",
            location: data.photographer.location || "",
            username: data.photographer.username || "",
          }
        
        });
        console.log("form data", formData)
      } else if (response.status !== 404) {
        setApiError("Failed to load existing information");
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
          .replace(/[^a-z0-9-]/g, ""),
      }),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Business name is required";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "slug is required";
    } else if (formData.slug.length < 3) {
      newErrors.slug = "slug must be at least 3 characters";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = "slug can only contain lowercase letters, numbers, and hyphens";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
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
        name: formData.name,
        slug: formData.slug,
        tagline: formData.tagline,
        about: formData.about,
        photographer: {
          username: formData.displayName,
          email: formData.email,
          phone_number: formData.phone,
          location: formData.location,
        },
      };

      console.log("Submitting general info:", payload);

      const response = await apiFetch("/studio/general-info/", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        if (responseData.errors) {
          const backendErrors = {};
          Object.keys(responseData.errors).forEach((key) => {
            const frontendKey =
              key === "business_name"
                ? "name"
                : key === "display_name"
                ? "displayName"
                : key;
            backendErrors[frontendKey] = responseData.errors[key][0] || responseData.errors[key];
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading your information...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">General Information</h2>
          <p className="text-gray-600 mt-1">Set up your basic business details</p>
        </div>

        {success && (
          <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-800">Information saved successfully!</span>
          </div>
        )}

        {apiError && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{apiError}</span>
          </div>
        )}

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 text-gray-900 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? "border-red-300 bg-red-50" : "border-gray-300 focus:border-blue-500"
                }`}
                placeholder="Enter your business name"

                disabled={loading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <input
                name="displayName"
                value={formData.photographer.username}
                onChange={handleChange}
                className="w-full px-4 py-3 text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="How you want to be displayed"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">Leave empty to use business name</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SubDomain<span className="text-red-500">*</span>
              </label>
              <input
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className={`w-full px-4 py-3 text-gray-900 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.slug ? "border-red-300 bg-red-50" : "border-gray-300 focus:border-blue-500"
                }`}
                placeholder="your-subdomain"
                disabled={loading}
              />
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Your site will be at:{" "}
                  <span className="font-mono font-medium text-blue-600">
                    {formData.slug || "your-subdomain"}.lensra.com
                  </span>
                </p>
              </div>
              {errors.slug && (
                <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
              )}
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tagline
              </label>
              <input
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                className="w-full px-4 py-3 text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="A brief description of what you do"
                disabled={loading}
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                About
              </label>
              <textarea
                name="about"
                value={formData.about}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
                placeholder="Tell people about your business, services, and what makes you unique..."
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.photographer.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg text-gray-900 border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? "border-red-300 bg-red-50" : "border-gray-300 focus:border-blue-500"
                }`}
                placeholder="your@email.com"
                disabled={loading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone / WhatsApp
              </label>
              <input
                name="phone"
                value={formData.photographer.phone_number}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="+234 xxx xxx xxxx"
                disabled={loading}
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                name="location"
                value={formData.photographer.location}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="City, State, Country"
                disabled={loading}
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
};

export default GeneralInfoForm;