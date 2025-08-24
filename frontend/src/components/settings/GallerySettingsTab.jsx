import React, { useState, useEffect } from "react";
import {
  Image,
  Eye,
  EyeOff,
  Download,
  Type,
  Upload,
  Settings,
  Save,
  Loader2,
  Shield,
  Sliders,
  Grid,
  SortAsc,
  AlertCircle,
  CheckCircle,
  Trash2,
} from "lucide-react";
import { useApi } from "../../useApi";

const GallerySettingsTab = ({ theme = "dark" }) => {
  const [preferences, setPreferences] = useState({
    allow_public_view: true,
    allow_downloads: false,
    watermark_images: true,
    watermark_text: "",
    watermark_logo: null,
    items_per_page: 20,
    default_sort_order: "newest",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [previewLogo, setPreviewLogo] = useState(null);
  const { apiFetch } = useApi();

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    setLoading(true);
    setErrors({});
    setSuccess("");
    try {
      const response = await apiFetch("/gallery/preferences/", { method: "GET" });
      if (response.ok) {
        const data = await response.json();
        setPreferences({
          allow_public_view: data.allow_public_view ?? true,
          allow_downloads: data.allow_downloads ?? false,
          watermark_images: data.watermark_images ?? true,
          watermark_text: data.watermark_text || "",
          watermark_logo: data.watermark_logo || null,
          items_per_page: data.items_per_page || 20,
          default_sort_order: data.default_sort_order || "newest",
        });
        if (data.watermark_logo) {
          setPreviewLogo(data.watermark_logo);
        }
      } else {
        setErrors({ api: "Failed to fetch gallery preferences" });
      }
    } catch (err) {
      setErrors({ api: "Network error occurred" });
      console.error("Error fetching preferences:", err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (preferences.watermark_images && preferences.watermark_text && preferences.watermark_text.length > 100) {
      newErrors.watermark_text = "Watermark text must be 100 characters or less";
    }
    if (preferences.items_per_page < 1 || preferences.items_per_page > 100) {
      newErrors.items_per_page = "Items per page must be between 1 and 100";
    }
    if (preferences.watermark_images && preferences.watermark_logo instanceof File) {
      const file = preferences.watermark_logo;
      if (file.size > 10 * 1024 * 1024) {
        newErrors.watermark_logo = "Logo size must be less than 10MB";
      } else if (!file.type.startsWith("image/")) {
        newErrors.watermark_logo = "Please select a valid image file (JPG, PNG, WebP)";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, type, value, checked, files } = e.target;
    setSuccess("");
    setErrors((prev) => ({ ...prev, [name]: null }));
    if (type === "checkbox") {
      setPreferences((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      const file = files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => setPreviewLogo(e.target.result);
        reader.readAsDataURL(file);
        setPreferences((prev) => ({ ...prev, [name]: file }));
      }
    } else if (type === "number") {
      setPreferences((prev) => ({ ...prev, [name]: parseInt(value) || 1 }));
    } else {
      setPreferences((prev) => ({ ...prev, [name]: value }));
    }
  };

  const removeWatermarkLogo = () => {
    setPreferences((prev) => ({ ...prev, watermark_logo: null }));
    setPreviewLogo(null);
    const fileInput = document.querySelector('input[name="watermark_logo"]');
    if (fileInput) fileInput.value = "";
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setErrors({});
    setSuccess("");

    try {
      const formData = new FormData();
      Object.keys(preferences).forEach((key) => {
        if (key === "watermark_logo" && preferences[key] instanceof File) {
          formData.append(key, preferences[key]);
        } else if (preferences[key] !== null && preferences[key] !== undefined) {
          formData.append(key, preferences[key]);
        }
      });

      const response = await apiFetch("/gallery/preferences/", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setSuccess("Gallery preferences saved successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorData = await response.json();
        setErrors({ api: errorData.message || "Failed to save preferences" });
      }
    } catch (err) {
      setErrors({ api: "Network error occurred" });
      console.error("Error saving preferences:", err);
    } finally {
      setSaving(false);
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
                theme === 'dark' ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-gradient-to-r from-orange-400 to-red-500'
              }`}>
                <Image className="w-6 h-6 text-white" />
              </div>
              <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r ${
                theme === 'dark' ? 'from-orange-400 to-red-400' : 'from-orange-600 to-red-600'
              }`}>
                Gallery Preferences
              </h2>
            </div>

            <div className={`rounded-2xl shadow-xl border p-8 flex items-center justify-center ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl border-slate-700/60' 
                : 'bg-white/90 border-gray-200'
            }`}>
              <Loader2 className={`animate-spin h-8 w-8 mr-3 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
              <span className={`text-sm sm:text-base ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>
                Loading gallery preferences...
              </span>
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
            theme === 'dark' ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-gradient-to-r from-orange-400 to-red-500'
          }`}>
            <Image className="w-6 h-6 text-white" />
          </div>
          <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r ${
            theme === 'dark' ? 'from-orange-400 to-red-400' : 'from-orange-600 to-red-600'
          }`}>
            Gallery Preferences
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
          {/* Privacy & Visibility Card */}
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
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h3 className={`text-xl sm:text-2xl font-bold ${
                  theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                }`}>Privacy & Visibility</h3>
              </div>

              <div className="space-y-4">
                <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${
                  theme === 'dark' 
                    ? 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-800/80' 
                    : 'bg-white/70 border-gray-200/50 hover:bg-white/90'
                }`}>
                  <div className="flex items-center space-x-3">
                    <Eye className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`} />
                    <div>
                      <p className={`font-medium ${theme === 'dark' ? 'text-slate-100' : 'text-gray-800'}`}>
                        Allow Public View
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                        Let anyone view your galleries
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="allow_public_view"
                      checked={preferences.allow_public_view}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-4 transition-all duration-200 ${
                      theme === 'dark'
                        ? 'bg-slate-600 peer-focus:ring-blue-800/50 peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-cyan-500'
                        : 'bg-gray-200 peer-focus:ring-blue-300/50 peer-checked:bg-gradient-to-r peer-checked:from-blue-400 peer-checked:to-cyan-400'
                    } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                      theme === 'dark' ? 'after:border-slate-600' : 'after:border-gray-300'
                    }`}></div>
                  </label>
                </div>

                <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${
                  theme === 'dark' 
                    ? 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-800/80' 
                    : 'bg-white/70 border-gray-200/50 hover:bg-white/90'
                }`}>
                  <div className="flex items-center space-x-3">
                    <Download className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`} />
                    <div>
                      <p className={`font-medium ${theme === 'dark' ? 'text-slate-100' : 'text-gray-800'}`}>
                        Allow Downloads
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                        Let clients download photos from galleries
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="allow_downloads"
                      checked={preferences.allow_downloads}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-4 transition-all duration-200 ${
                      theme === 'dark'
                        ? 'bg-slate-600 peer-focus:ring-blue-800/50 peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-cyan-500'
                        : 'bg-gray-200 peer-focus:ring-blue-300/50 peer-checked:bg-gradient-to-r peer-checked:from-blue-400 peer-checked:to-cyan-400'
                    } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                      theme === 'dark' ? 'after:border-slate-600' : 'after:border-gray-300'
                    }`}></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Watermark Protection Card */}
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
                  <Type className="w-5 h-5 text-white" />
                </div>
                <h3 className={`text-xl sm:text-2xl font-bold ${
                  theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                }`}>Watermark Protection</h3>
              </div>

              <div className="space-y-4">
                <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${
                  theme === 'dark' 
                    ? 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-800/80' 
                    : 'bg-white/70 border-gray-200/50 hover:bg-white/90'
                }`}>
                  <div className="flex items-center space-x-3">
                    <Type className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`} />
                    <div>
                      <p className={`font-medium ${theme === 'dark' ? 'text-slate-100' : 'text-gray-800'}`}>
                        Watermark Images
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                        Add watermark to protect your images
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="watermark_images"
                      checked={preferences.watermark_images}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-4 transition-all duration-200 ${
                      theme === 'dark'
                        ? 'bg-slate-600 peer-focus:ring-purple-800/50 peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500'
                        : 'bg-gray-200 peer-focus:ring-purple-300/50 peer-checked:bg-gradient-to-r peer-checked:from-purple-400 peer-checked:to-pink-400'
                    } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                      theme === 'dark' ? 'after:border-slate-600' : 'after:border-gray-300'
                    }`}></div>
                  </label>
                </div>

                {preferences.watermark_images && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                      }`}>Watermark Text</label>
                      <input
                        type="text"
                        name="watermark_text"
                        value={preferences.watermark_text}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent backdrop-blur-xl transition-all duration-200 ${
                          errors.watermark_text 
                            ? 'border-red-400 focus:ring-red-500/50' 
                            : theme === 'dark' 
                              ? 'bg-slate-800/60 border-slate-700/50 text-slate-100 hover:bg-slate-800/80'
                              : 'bg-white/70 border-gray-200/50 text-gray-900 hover:bg-white/90'
                        }`}
                        placeholder="Enter watermark text..."
                      />
                      {errors.watermark_text && (
                        <div className={`flex items-center mt-2 text-sm animate-fadeIn ${
                          theme === 'dark' ? 'text-red-400' : 'text-red-600'
                        }`}>
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.watermark_text}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                      }`}>Watermark Logo</label>
                      <div className={`relative rounded-2xl p-6 border-2 border-dashed text-center transition-all duration-200 ${
                        theme === 'dark'
                          ? 'bg-slate-800/50 border-slate-600 hover:bg-slate-800/70 hover:border-indigo-400'
                          : 'bg-white/50 border-gray-300 hover:bg-white/70 hover:border-indigo-300'
                      }`}>
                        {previewLogo ? (
                          <div className="relative inline-block">
                            <img
                              src={previewLogo}
                              alt="Watermark Logo Preview"
                              className="w-32 h-32 object-contain rounded-xl shadow-lg mx-auto"
                            />
                            <button
                              type="button"
                              onClick={removeWatermarkLogo}
                              disabled={saving}
                              className={`absolute -top-2 -right-2 p-1.5 rounded-full shadow-lg transition-colors ${
                                theme === 'dark' 
                                  ? 'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-500/50' 
                                  : 'bg-red-400 text-white hover:bg-red-500 disabled:bg-red-400/50'
                              }`}
                              title="Remove watermark logo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <Upload className={`w-8 h-8 mx-auto mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`} />
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                              Upload Watermark Logo
                            </p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                              PNG, JPG, WebP up to 10MB
                            </p>
                          </div>
                        )}
                        <input
                          type="file"
                          name="watermark_logo"
                          accept="image/*"
                          onChange={handleChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={saving}
                          id="watermark-upload"
                        />
                      </div>
                      {errors.watermark_logo && (
                        <div className={`flex items-center mt-2 text-sm animate-fadeIn ${
                          theme === 'dark' ? 'text-red-400' : 'text-red-600'
                        }`}>
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.watermark_logo}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Display Settings Card */}
          <div className={`rounded-2xl shadow-xl border transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl border-slate-700/60' 
              : 'bg-white/90 border-gray-200'
          }`}>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-2 rounded-xl shadow-lg ${
                  theme === 'dark' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-green-400 to-emerald-400'
                }`}>
                  <Grid className="w-5 h-5 text-white" />
                </div>
                <h3 className={`text-xl sm:text-2xl font-bold ${
                  theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                }`}>Display Settings</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                  }`}>Items Per Page</label>
                  <input
                    type="number"
                    name="items_per_page"
                    value={preferences.items_per_page}
                    onChange={handleChange}
                    min="1"
                    max="100"
                    className={`w-full px-4 py-3 rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent backdrop-blur-xl transition-all duration-200 ${
                      errors.items_per_page 
                        ? 'border-red-400 focus:ring-red-500/50' 
                        : theme === 'dark' 
                          ? 'bg-slate-800/60 border-slate-700/50 text-slate-100 hover:bg-slate-800/80'
                          : 'bg-white/70 border-gray-200/50 text-gray-900 hover:bg-white/90'
                    }`}
                  />
                  {errors.items_per_page && (
                    <div className={`flex items-center mt-2 text-sm animate-fadeIn ${
                      theme === 'dark' ? 'text-red-400' : 'text-red-600'
                    }`}>
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.items_per_page}
                    </div>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                  }`}>Default Sort Order</label>
                  <div className="relative">
                    <select
                      name="default_sort_order"
                      value={preferences.default_sort_order}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 pr-10 rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent backdrop-blur-xl transition-all duration-200 appearance-none cursor-pointer ${
                        theme === 'dark' 
                          ? 'bg-slate-800/60 border-slate-700/50 text-slate-100 hover:bg-slate-800/80'
                          : 'bg-white/70 border-gray-200/50 text-gray-900 hover:bg-white/90'
                      }`}
                    >
                      <option value="newest">📅 Newest First</option>
                      <option value="oldest">🕐 Oldest First</option>
                      <option value="popular">👁️ Most Viewed</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
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
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <Save className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-200" />
              )}
              <span className="truncate">{saving ? "Saving Changes..." : "Save Gallery Preferences"}</span>
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
};

export default GallerySettingsTab;