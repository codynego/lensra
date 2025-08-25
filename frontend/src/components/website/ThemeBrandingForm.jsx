import React, { useState, useEffect } from "react";
import { Upload, Trash2, Save, Loader2, CheckCircle, AlertCircle, Palette, Zap } from "lucide-react";
import { useAuth } from "../../AuthContext";

const ThemeBrandingForm = ({ theme = 'dark' }) => {
  const [formData, setFormData] = useState({
    theme: "minimalist",
    primaryColor: "#3B82F6",
    secondaryColor: "#EF4444",
    font: "Inter",
    coverPhoto: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [success, setSuccess] = useState("");
  const [apiError, setApiError] = useState("");
  const { authState, apiFetch } = useAuth();
  const isProUser = authState?.user?.stats?.plan_name === "Pro" || authState?.user?.stats?.plan_name === "Premium";

  useEffect(() => {
    const fetchThemeData = async () => {
      if (!authState?.user?.stats) {
        setApiError("User stats not available");
        setInitialLoading(false);
        return;
      }

      try {
        const themeResponse = await apiFetch("/studio/theme-branding/", { method: "GET" });
        if (themeResponse.ok) {
          const themeData = await themeResponse.json();
          if (process.env.NODE_ENV === 'development') {
            console.log("Fetched theme data:", themeData);
          }
          setFormData({
            theme: themeData.theme || "minimalist",
            primaryColor: themeData.primary_color || "#3B82F6",
            secondaryColor: themeData.secondary_color || "#EF4444",
            font: themeData.font || "Inter",
            coverPhoto: themeData.cover_photo || null,
          });
          if (themeData.cover_photo) {
            setPreviewImage(themeData.cover_photo);
          }
        } else if (themeResponse.status !== 404) {
          const errorData = await themeResponse.json();
          setApiError(errorData.message || "Failed to load theme settings");
        }
      } catch (error) {
        console.error("Error fetching theme data:", error);
        setApiError("Network error occurred");
      } finally {
        setInitialLoading(false);
      }
    };

    if (authState?.user?.id && authState?.user?.stats) {
      fetchThemeData();
    } else {
      setInitialLoading(false);
    }
  }, [authState?.user?.id, authState?.user?.stats, apiFetch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (success) setSuccess("");
    if (apiError) setApiError("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setApiError("Image size must be less than 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setApiError("Please select a valid image file");
      return;
    }

    setUploadingImage(true);
    setApiError("");
    try {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
      setFormData((prev) => ({ ...prev, coverPhoto: file }));
    } catch (error) {
      console.error("Error handling image:", error);
      setApiError("Error processing image");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeCoverPhoto = () => {
    setFormData((prev) => ({ ...prev, coverPhoto: null }));
    setPreviewImage(null);
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError("");

    // Validate form data
    if (!formData.primaryColor.match(/^#[0-9A-Fa-f]{6}$/)) {
      setApiError("Primary color must be a valid hex code (e.g., #3B82F6)");
      setLoading(false);
      return;
    }
    if (!formData.secondaryColor.match(/^#[0-9A-Fa-f]{6}$/)) {
      setApiError("Secondary color must be a valid hex code (e.g., #EF4444)");
      setLoading(false);
      return;
    }
    const validFonts = ["Inter", "Poppins", "Playfair Display", "Roboto", "Open Sans", "Lora", "Sans-serif"];
    if (!validFonts.includes(formData.font)) {
      if (process.env.NODE_ENV === 'development') {
        console.log("Selected font:", formData.font);
      }
      setApiError("Invalid font selected");
      setLoading(false);
      return;
    }
    const validThemes = ["minimalist", "magazine", "retro"];
    if (!validThemes.includes(formData.theme)) {
      if (process.env.NODE_ENV === 'development') {
        console.log("Selected theme:", formData.theme);
      }
      setApiError("Invalid theme selected");
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append("theme", formData.theme);
      submitData.append("primary_color", formData.primaryColor);
      submitData.append("secondary_color", formData.secondaryColor);
      submitData.append("font", formData.font);

      // Handle cover_photo
      if (formData.coverPhoto instanceof File) {
        submitData.append("cover_photo", formData.coverPhoto);
      } else if (formData.coverPhoto === null) {
        submitData.append("cover_photo", "");
      }

      if (process.env.NODE_ENV === 'development') {
        console.log("FormData contents:");
        for (const [key, value] of submitData.entries()) {
          console.log(`${key}: ${value instanceof File ? value.name : value}`);
        }
      }

      const response = await apiFetch("/studio/theme-branding/", {
        method: "PATCH",
        body: submitData,
      });

      const responseData = await response.json();
      if (response.ok) {
        setSuccess("Theme settings saved successfully!");
        if (responseData.cover_photo) {
          setFormData((prev) => ({ ...prev, coverPhoto: responseData.cover_photo }));
          setPreviewImage(responseData.cover_photo);
        } else if (formData.coverPhoto === null) {
          setFormData((prev) => ({ ...prev, coverPhoto: null }));
          setPreviewImage(null);
        }
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorMessages = Object.entries(responseData)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(", ") : errors}`)
          .join("; ");
        setApiError(errorMessages || "Failed to save theme settings");
      }
    } catch (error) {
      console.error("Error saving theme:", error);
      setApiError("Network error occurred while saving");
    } finally {
      setLoading(false);
    }
  };

  const fontOptions = [
    { value: "Sans-serif", label: "Sans-serif (Default)", style: "font-sans" },
    { value: "Inter", label: "Inter (Modern)", style: "font-sans" },
    { value: "Poppins", label: "Poppins (Friendly)", style: "font-sans" },
    { value: "Playfair Display", label: "Playfair Display (Elegant)", style: "font-serif" },
    { value: "Roboto", label: "Roboto (Clean)", style: "font-sans" },
    { value: "Open Sans", label: "Open Sans (Readable)", style: "font-sans" },
    { value: "Lora", label: "Lora (Traditional)", style: "font-serif" },
  ];

  const themeOptions = [
    { value: "minimalist", label: "Minimalist (Clean, Modern)" },
    { value: "magazine", label: "Magazine (Vibrant, Bold)" },
    { value: "retro", label: "Retro (Classic, Nostalgic)" },
  ];

  if (initialLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className={`
          rounded-2xl shadow-xl border overflow-hidden
          ${theme === 'dark'
            ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90  border-slate-700/60'
            : 'bg-white/90 border-gray-200'
          }
        `}>
          <div className="flex items-center justify-center py-12">
            <Loader2 className={`w-8 h-8 animate-spin ${
              theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
            }`} />
            <span className={`ml-2 text-sm font-medium ${
              theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
            }`}>Loading theme settings...</span>
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
          ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90  border-slate-700/60'
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
          }`}>Theme & Branding</h2>
          <p className={`text-sm mt-1 ${
            theme === 'dark' ? 'text-indigo-200' : 'text-gray-600'
          }`}>Customize the look and feel of your site</p>
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
                <div className="flex items-center gap-2 mb-3">
                  <label className={`block text-sm font-medium ${
                    theme === 'dark' ? 'text-slate-200' : 'text-gray-700'
                  }`}>Theme</label>
                  {!isProUser && (
                    <span className={`
                      inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold
                      ${theme === 'dark'
                        ? 'bg-indigo-500/30 text-indigo-300'
                        : 'bg-indigo-100 text-indigo-800'
                      }
                    `}>
                      <Zap className="w-3 h-3 mr-1" />
                      Pro
                    </span>
                  )}
                </div>
                <select
                  name="theme"
                  value={formData.theme}
                  onChange={handleChange}
                  className={`
                    w-full px-4 py-2.5 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-200 backdrop-blur-sm
                    ${theme === 'dark'
                      ? isProUser
                        ? 'bg-slate-700/50 border-slate-600/50 text-slate-100 placeholder-slate-400 hover:bg-slate-700/70'
                        : 'bg-slate-700/50 border-slate-600/50 text-slate-100 placeholder-slate-400 opacity-50 cursor-not-allowed'
                      : isProUser
                        ? 'bg-white/70 border-gray-200/50 text-gray-900 placeholder-gray-400 hover:bg-white/90'
                        : 'bg-white/70 border-gray-200/50 text-gray-900 placeholder-gray-400 opacity-50 cursor-not-allowed'
                    }
                  `}
                  disabled={loading || !isProUser}
                  title={!isProUser ? "Upgrade to Pro to change theme" : ""}
                >
                  {themeOptions.map((theme) => (
                    <option key={theme.value} value={theme.value}>
                      {theme.label}
                    </option>
                  ))}
                </select>
                <p className={`text-sm mt-1 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                }`}>Choose the overall style of your site</p>
                {!isProUser && (
                  <p className={`text-sm mt-1 ${
                    theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                  }`}>
                    <a href="/upgrade" className="underline hover:text-indigo-300 dark:hover:text-indigo-300">
                      Upgrade to Pro
                    </a>{" "}
                    to unlock theme customization
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-3 ${
                  theme === 'dark' ? 'text-slate-200' : 'text-gray-700'
                }`}>Primary Color</label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <input
                      type="color"
                      name="primaryColor"
                      value={formData.primaryColor}
                      onChange={handleChange}
                      className={`
                        w-14 h-14 rounded-lg cursor-pointer
                        ${theme === 'dark' ? 'border-slate-600/50' : 'border-gray-200/50'}
                        ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                      disabled={loading}
                    />
                    <Palette className={`
                      absolute top-1 right-1 w-4 h-4 pointer-events-none
                      ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}
                    `} />
                  </div>
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className={`
                      w-28 px-3 py-2 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-200 backdrop-blur-sm
                      ${theme === 'dark'
                        ? 'bg-slate-700/50 border-slate-600/50 text-slate-100 placeholder-slate-400 hover:bg-slate-700/70'
                        : 'bg-white/70 border-gray-200/50 text-gray-900 placeholder-gray-400 hover:bg-white/90'
                      }
                      ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    placeholder="#3B82F6"
                    disabled={loading}
                  />
                </div>
                <p className={`text-sm mt-1 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                }`}>Used for buttons, links, and accents</p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-3 ${
                  theme === 'dark' ? 'text-slate-200' : 'text-gray-700'
                }`}>Secondary Color</label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <input
                      type="color"
                      name="secondaryColor"
                      value={formData.secondaryColor}
                      onChange={handleChange}
                      className={`
                        w-14 h-14 rounded-lg cursor-pointer
                        ${theme === 'dark' ? 'border-slate-600/50' : 'border-gray-200/50'}
                        ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                      disabled={loading}
                    />
                    <Palette className={`
                      absolute top-1 right-1 w-4 h-4 pointer-events-none
                      ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}
                    `} />
                  </div>
                  <input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className={`
                      w-28 px-3 py-2 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-200 backdrop-blur-sm
                      ${theme === 'dark'
                        ? 'bg-slate-700/50 border-slate-600/50 text-slate-100 placeholder-slate-400 hover:bg-slate-700/70'
                        : 'bg-white/70 border-gray-200/50 text-gray-900 placeholder-gray-400 hover:bg-white/90'
                      }
                      ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    placeholder="#EF4444"
                    disabled={loading}
                  />
                </div>
                <p className={`text-sm mt-1 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                }`}>Used for highlights and CTAs</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <label className={`block text-sm font-medium ${
                    theme === 'dark' ? 'text-slate-200' : 'text-gray-700'
                  }`}>Font Family</label>
                  {!isProUser && (
                    <span className={`
                      inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold
                      ${theme === 'dark'
                        ? 'bg-indigo-500/30 text-indigo-300'
                        : 'bg-indigo-100 text-indigo-800'
                      }
                    `}>
                      <Zap className="w-3 h-3 mr-1" />
                      Pro
                    </span>
                  )}
                </div>
                <select
                  name="font"
                  value={formData.font}
                  onChange={handleChange}
                  className={`
                    w-full px-4 py-2.5 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-200 backdrop-blur-sm
                    ${theme === 'dark'
                      ? isProUser
                        ? 'bg-slate-700/50 border-slate-600/50 text-slate-100 placeholder-slate-400 hover:bg-slate-700/70'
                        : 'bg-slate-700/50 border-slate-600/50 text-slate-100 placeholder-slate-400 opacity-50 cursor-not-allowed'
                      : isProUser
                        ? 'bg-white/70 border-gray-200/50 text-gray-900 placeholder-gray-400 hover:bg-white/90'
                        : 'bg-white/70 border-gray-200/50 text-gray-900 placeholder-gray-400 opacity-50 cursor-not-allowed'
                    }
                  `}
                  disabled={loading || !isProUser}
                  title={!isProUser ? "Upgrade to Pro to change font" : ""}
                >
                  {fontOptions.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
                <p className={`text-sm mt-1 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                }`}>This will be used for all text on your site</p>
                {!isProUser && (
                  <p className={`text-sm mt-1 ${
                    theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                  }`}>
                    <a href="/upgrade" className="underline hover:text-indigo-300 dark:hover:text-indigo-300">
                      Upgrade to Pro
                    </a>{" "}
                    to unlock font customization
                  </p>
                )}
              </div>

              <div className="mt-6">
                <h4 className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-slate-200' : 'text-gray-700'
                } mb-3`}>Preview</h4>
                <div className={`
                  border rounded-xl p-4 space-y-3 backdrop-blur-sm
                  ${theme === 'dark'
                    ? 'bg-slate-700/50 border-slate-600/50'
                    : 'bg-white/70 border-gray-200/50'
                  }
                `} style={{ fontFamily: formData.font }}>
                  <h3 className="text-lg font-semibold" style={{ color: formData.primaryColor }}>
                    Your Business Name
                  </h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    This is how your content will look with the selected {formData.theme} theme, font, and colors.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg text-white font-medium text-sm"
                      style={{ backgroundColor: formData.primaryColor }}
                    >
                      Primary Button
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg text-white font-medium text-sm"
                      style={{ backgroundColor: formData.secondaryColor }}
                    >
                      Secondary Button
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-3 ${
                  theme === 'dark' ? 'text-slate-200' : 'text-gray-700'
                }`}>Cover Photo</label>
                <div className={`
                  border-2 border-dashed rounded-xl relative hover:border-indigo-400 dark:hover:border-indigo-400 transition-all duration-300
                  ${theme === 'dark' ? 'border-slate-600/50' : 'border-gray-200/50'}
                `}>
                  {previewImage ? (
                    <div className="relative">
                      <img
                        src={previewImage}
                        alt="Cover Preview"
                        className="w-full h-48 object-cover rounded-xl"
                      />
                      <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <button
                          type="button"
                          onClick={removeCoverPhoto}
                          disabled={loading}
                          className={`
                            bg-red-500/80 text-white p-2 rounded-full hover:bg-red-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
                          `}
                          title="Remove cover photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      {uploadingImage ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className={`w-8 h-8 animate-spin ${
                            theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                          } mb-2`} />
                          <p className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                          }`}>Processing image...</p>
                        </div>
                      ) : (
                        <div>
                          <Upload className={`w-10 h-10 mx-auto mb-3 animate-bounce ${
                            theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                          }`} />
                          <p className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                          }`}>Upload a cover photo</p>
                          <p className={`text-xs ${
                            theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                          }`}>Recommended: 1200x600px, max 5MB</p>
                          <p className={`text-xs ${
                            theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                          } mt-1`}>JPG, PNG, or WebP</p>
                        </div>
                      )}
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={loading || uploadingImage}
                  />
                </div>
                {previewImage && (
                  <button
                    type="button"
                    onClick={removeCoverPhoto}
                    disabled={loading}
                    className={`
                      mt-2 text-sm transition-all duration-300
                      ${theme === 'dark'
                        ? 'text-red-400 hover:text-red-300'
                        : 'text-red-600 hover:text-red-800'
                      }
                      ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    title="Remove cover photo"
                  >
                    Remove cover photo
                  </button>
                )}
              </div>

              <div className={`
                rounded-xl p-4
                ${theme === 'dark'
                  ? 'bg-indigo-500/10 border border-indigo-500/30 backdrop-blur-xl'
                  : 'bg-indigo-50/80 border border-indigo-200'
                }
              `}>
                <h4 className={`text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-indigo-200' : 'text-indigo-800'
                }`}>Design Tips</h4>
                <ul className={`text-sm space-y-1 ${
                  theme === 'dark' ? 'text-indigo-300' : 'text-indigo-700'
                }`}>
                  <li>• Select a theme that aligns with your brand identity</li>
                  <li>• Use high-quality images that represent your brand</li>
                  <li>• Ensure good contrast between colors for readability</li>
                  <li>• Choose fonts that match your business style</li>
                  <li>• Test your design on different screen sizes</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={loading || uploadingImage}
              className={`
                group flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-medium text-sm sm:text-base transition-all duration-300 transform hover:scale-105 shadow-lg
                ${loading || uploadingImage
                  ? theme === 'dark'
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-indigo-500/25'
                    : 'bg-gradient-to-r from-indigo-400 to-purple-500 text-white hover:from-indigo-500 hover:to-purple-600 shadow-indigo-400/25'
                }
              `}
              title="Save Theme"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Theme...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  Save Theme
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
      `}</style>
    </div>
  );
};

export default ThemeBrandingForm;