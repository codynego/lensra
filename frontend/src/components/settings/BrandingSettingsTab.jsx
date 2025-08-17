import React, { useState } from "react";
import { 
  Palette, 
  Type, 
  Image, 
  Upload, 
  Save,
  Eye,
  Sparkles,
  CheckCircle,
  AlertCircle,
  X,
  Camera,
  Monitor
} from "lucide-react";

export default function BrandingSettingsTab({ studio, onSave }) {
  const [brandColor, setBrandColor] = useState(studio?.brand_color || "#6366f1");
  const [secondaryColor, setSecondaryColor] = useState(studio?.secondary_color || "#8b5cf6");
  const [logo, setLogo] = useState(studio?.logo || null);
  const [favicon, setFavicon] = useState(studio?.favicon || null);
  const [brandFont, setBrandFont] = useState(studio?.brand_font || "Default");
  const [logoPreview, setLogoPreview] = useState(studio?.logo || null);
  const [faviconPreview, setFaviconPreview] = useState(studio?.favicon || null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogoUpload = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setLogo(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setFavicon(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => setFaviconPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogo(null);
    setLogoPreview(null);
  };

  const removeFavicon = () => {
    setFavicon(null);
    setFaviconPreview(null);
  };

  const handleSubmit = () => {
    setSaving(true);
    setMessage("");
    
    const formData = new FormData();
    formData.append("brand_color", brandColor);
    formData.append("secondary_color", secondaryColor);
    formData.append("brand_font", brandFont);
    if (logo) formData.append("logo", logo);
    if (favicon) formData.append("favicon", favicon);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Branding settings saved:", { brandColor, secondaryColor, brandFont, logo, favicon });
      if (onSave) onSave(formData);
      setMessage("Branding settings saved successfully!");
      setSaving(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    }, 1500);
  };

  const fontOptions = [
    { value: "Default", label: "Default (System)" },
    { value: "Montserrat", label: "Montserrat" },
    { value: "Poppins", label: "Poppins" },
    { value: "Lato", label: "Lato" },
    { value: "Roboto", label: "Roboto" },
    { value: "Open Sans", label: "Open Sans" },
    { value: "Inter", label: "Inter" },
    { value: "Playfair Display", label: "Playfair Display" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-900 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl shadow-lg">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
            Branding Settings
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

        <div className="space-y-6 lg:space-y-8">
          <div className="grid gap-6 lg:gap-8">
            {/* Brand Colors Card */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-6 lg:p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  Brand Colors
                </h3>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <input
                        type="color"
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                        className="w-16 h-16 rounded-2xl border-4 border-white dark:border-gray-600 shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200"
                        style={{ backgroundColor: brandColor }}
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                        className="w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 border border-gray-200/50 dark:border-gray-600/50 rounded-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent backdrop-blur-sm transition-all duration-200 font-mono"
                        placeholder="#6366f1"
                      />
                      <div
                        className="mt-2 h-3 rounded-full shadow-inner"
                        style={{ backgroundColor: brandColor }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Secondary Color
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-16 h-16 rounded-2xl border-4 border-white dark:border-gray-600 shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200"
                        style={{ backgroundColor: secondaryColor }}
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 border border-gray-200/50 dark:border-gray-600/50 rounded-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent backdrop-blur-sm transition-all duration-200 font-mono"
                        placeholder="#8b5cf6"
                      />
                      <div
                        className="mt-2 h-3 rounded-full shadow-inner"
                        style={{ backgroundColor: secondaryColor }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Color Preview */}
              <div className="mt-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-700/50 rounded-2xl p-4 border border-gray-200/30 dark:border-gray-600/30">
                <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3 flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  Color Preview
                </h4>
                <div className="flex items-center space-x-4">
                  <div
                    className="px-4 py-2 rounded-xl text-white font-medium shadow-md"
                    style={{ backgroundColor: brandColor }}
                  >
                    Primary Button
                  </div>
                  <div
                    className="px-4 py-2 rounded-xl text-white font-medium shadow-md"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    Secondary Button
                  </div>
                </div>
              </div>
            </div>

            {/* Typography Card */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-6 lg:p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl">
                  <Type className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  Typography
                </h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Brand Font Family
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Type className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={brandFont}
                    onChange={(e) => setBrandFont(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-gray-700/70 border border-gray-200/50 dark:border-gray-600/50 rounded-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent backdrop-blur-sm transition-all duration-200 appearance-none cursor-pointer"
                  >
                    {fontOptions.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Font Preview */}
                <div className="mt-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-2xl p-4 border border-cyan-200/30 dark:border-cyan-800/30">
                  <h4 className="font-medium text-cyan-800 dark:text-cyan-300 mb-3">
                    Font Preview:
                  </h4>
                  <div
                    className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2"
                    style={{ fontFamily: brandFont === 'Default' ? 'system-ui' : brandFont }}
                  >
                    Your Studio Name
                  </div>
                  <div
                    className="text-base text-gray-600 dark:text-gray-400"
                    style={{ fontFamily: brandFont === 'Default' ? 'system-ui' : brandFont }}
                  >
                    This is how your brand font will look across your website and materials.
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Assets Card */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-6 lg:p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                  <Image className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  Brand Assets
                </h3>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Studio Logo
                  </label>
                  
                  {logoPreview ? (
                    <div className="relative bg-white/50 dark:bg-gray-700/50 rounded-2xl p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
                      <div className="relative inline-block">
                        <img 
                          src={logoPreview} 
                          alt="Logo preview" 
                          className="h-24 max-w-full object-contain rounded-xl shadow-lg"
                        />
                        <button
                          type="button"
                          onClick={removeLogo}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                        Click to change logo
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  ) : (
                    <div className="relative bg-white/50 dark:bg-gray-700/50 rounded-2xl p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 text-center hover:bg-white/70 dark:hover:bg-gray-700/70 transition-colors cursor-pointer">
                      <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Upload Studio Logo
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG up to 2MB
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {/* Favicon Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Favicon
                  </label>
                  
                  {faviconPreview ? (
                    <div className="relative bg-white/50 dark:bg-gray-700/50 rounded-2xl p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
                      <div className="relative inline-block">
                        <img 
                          src={faviconPreview} 
                          alt="Favicon preview" 
                          className="h-12 w-12 object-contain rounded-lg shadow-lg mx-auto"
                        />
                        <button
                          type="button"
                          onClick={removeFavicon}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                        Click to change favicon
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFaviconUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  ) : (
                    <div className="relative bg-white/50 dark:bg-gray-700/50 rounded-2xl p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 text-center hover:bg-white/70 dark:hover:bg-gray-700/70 transition-colors cursor-pointer">
                      <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Upload Favicon
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        16x16 or 32x32 px recommended
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFaviconUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-4 border border-amber-200/30 dark:border-amber-800/30">
                <div className="flex items-start space-x-3">
                  <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-1">
                      Brand Asset Tips:
                    </h4>
                    <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
                      <li>• Logo should be high resolution (at least 300x300px)</li>
                      <li>• Use transparent PNG for logos with complex backgrounds</li>
                      <li>• Favicon appears in browser tabs and bookmarks</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="group relative px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-2xl font-medium text-lg shadow-xl hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-pink-300/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
            >
              <div className="flex items-center space-x-3">
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                )}
                <span>{saving ? "Saving Branding..." : "Save Branding Settings"}</span>
              </div>
            </button>
          </div>
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