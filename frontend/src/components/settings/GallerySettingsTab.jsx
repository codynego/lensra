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
} from "lucide-react";
import { useApi } from "../../useApi";

const GallerySettingsTab = () => {
  const [preferences, setPreferences] = useState({
    allow_public_view: true,
    allow_downloads: false,
    watermark_images: true,
    watermark_text: "",
    watermark_logo: null,
    items_per_page: 20,
    default_sort_order: "newest",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { apiFetch } = useApi();

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch("/gallery/preferences/", {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      } else {
        throw new Error("Failed to fetch preferences");
      }
    } catch (err) {
      setError("Failed to load gallery preferences");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, type, value, checked, files } = e.target;
    if (type === "checkbox") {
      setPreferences((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      setPreferences((prev) => ({ ...prev, [name]: files[0] }));
    } else if (type === "number") {
      setPreferences((prev) => ({ ...prev, [name]: parseInt(value) || 1 }));
    } else {
      setPreferences((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

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
        alert("Gallery preferences saved successfully!");
      } else {
        throw new Error("Failed to save preferences");
      }
    } catch (err) {
      setError("Failed to save preferences");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-900 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl">
                <Image className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Gallery Preferences
              </h2>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-xl">
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600 mr-3" />
                <span className="text-lg text-gray-600 dark:text-gray-300">Loading gallery preferences...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-900 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg">
            <Image className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Gallery Preferences
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="grid gap-6 lg:gap-8">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-6 lg:p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Privacy & Visibility</h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white/40 dark:bg-gray-700/40 rounded-2xl border border-gray-200/30 dark:border-gray-600/30">
                <div className="flex items-center space-x-3">
                  <Eye className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">Allow Public View</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Let anyone view your galleries</p>
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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-cyan-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/40 dark:bg-gray-700/40 rounded-2xl border border-gray-200/30 dark:border-gray-600/30">
                <div className="flex items-center space-x-3">
                  <Download className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">Allow Downloads</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Let clients download photos from galleries</p>
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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-cyan-500"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-6 lg:p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <Type className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Watermark Protection</h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white/40 dark:bg-gray-700/40 rounded-2xl border border-gray-200/30 dark:border-gray-600/30">
                <div className="flex items-center space-x-3">
                  <Type className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">Watermark Images</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Add watermark to protect your images</p>
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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
                </label>
              </div>

              {preferences.watermark_images && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Watermark Text
                    </label>
                    <input
                      type="text"
                      name="watermark_text"
                      value={preferences.watermark_text}
                      onChange={handleChange}
                      className="w-full bg-white/70 dark:bg-gray-700/70 border border-gray-200/50 dark:border-gray-600/50 rounded-2xl px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                      placeholder="Enter watermark text..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Upload Watermark Logo
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        name="watermark_logo"
                        accept="image/*"
                        onChange={handleChange}
                        className="hidden"
                        id="watermark-upload"
                      />
                      <label
                        htmlFor="watermark-upload"
                        className="flex items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl bg-white/30 dark:bg-gray-700/30 hover:bg-white/50 dark:hover:bg-gray-700/50 cursor-pointer transition-all duration-200"
                      >
                        <div className="text-center">
                          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {preferences.watermark_logo ? preferences.watermark_logo.name : "Click to upload or drag and drop"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG up to 10MB</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-6 lg:p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                <Grid className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Display Settings</h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Items Per Page
                </label>
                <input
                  type="number"
                  name="items_per_page"
                  value={preferences.items_per_page}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  className="w-full bg-white/70 dark:bg-gray-700/70 border border-gray-200/50 dark:border-gray-600/50 rounded-2xl px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Default Sort Order
                </label>
                <div className="relative">
                  <select
                    name="default_sort_order"
                    value={preferences.default_sort_order}
                    onChange={handleChange}
                    className="w-full bg-white/70 dark:bg-gray-700/70 border border-gray-200/50 dark:border-gray-600/50 rounded-2xl px-4 py-3 pr-10 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent backdrop-blur-sm transition-all duration-200 appearance-none cursor-pointer"
                  >
                    <option value="newest">📅 Newest First</option>
                    <option value="oldest">🕐 Oldest First</option>
                    <option value="popular">👁️ Most Viewed</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-medium text-lg shadow-xl hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
          >
            <div className="flex items-center space-x-3">
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              )}
              <span>{saving ? "Saving Changes..." : "Save Preferences"}</span>
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
};

export default GallerySettingsTab;