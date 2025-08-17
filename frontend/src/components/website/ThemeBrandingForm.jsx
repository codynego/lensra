import { useState, useEffect } from "react";
import { Upload, Trash2, Save, Loader2, CheckCircle, AlertCircle, Palette } from "lucide-react";
import { useApi } from "../../useApi";

const ThemeBrandingForm = () => {
  const [formData, setFormData] = useState({
    primaryColor: "#3B82F6",
    secondaryColor: "#EF4444",
    font: "Inter",
    coverPhoto: null,
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [success, setSuccess] = useState("");
  const [apiError, setApiError] = useState("");
  const { apiFetch } = useApi();

  useEffect(() => {
    fetchThemeData();
  }, []);

  const fetchThemeData = async () => {
    try {
      const response = await apiFetch("/studio/theme-branding/", {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({
          primaryColor: data.primary_color,
          secondaryColor: data.secondary_color,
          font: data.font || "Inter",
          coverPhoto: data.cover_photo || null,
        });
        console.log("Fetched theme data:", formData);


        if (data.coverPhoto) {
          setPreviewImage(data.coverPhoto);
        }
      } else if (response.status !== 404) {
        setApiError("Failed to load theme settings");
      }
    } catch (error) {
      console.error("Error fetching theme data:", error);
      setApiError("Network error occurred");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (success) {
      setSuccess("");
    }

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
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setApiError("");

    try {
      const submitData = new FormData();
      submitData.append("primary_color", formData.primaryColor);
      submitData.append("secondary_color", formData.secondaryColor);
      submitData.append("font", formData.font);

      if (formData.coverPhoto instanceof File) {
        submitData.append("cover_photo", formData.coverPhoto);
      }

      console.log("Submitting theme data:", submitData);
      const response = await apiFetch("/studio/theme-branding/", {
        method: "PUT",
        body: submitData,
      });

      const responseData = await response.json();

      if (response.ok) {
        setSuccess("Theme settings saved successfully!");

        if (responseData.coverPhoto) {
          setFormData((prev) => ({ ...prev, coverPhoto: responseData.coverPhoto }));
          setPreviewImage(responseData.coverPhoto);
        }

        setTimeout(() => setSuccess(""), 3000);
      } else {
        setApiError(responseData.message || "Failed to save theme settings");
      }
    } catch (error) {
      console.error("Error saving theme:", error);
      setApiError("Network error occurred while saving");
    } finally {
      setLoading(false);
    }
  };

  const fontOptions = [
    { value: "Inter", label: "Inter (Modern)", style: "font-sans" },
    { value: "Poppins", label: "Poppins (Friendly)", style: "font-sans" },
    { value: "Playfair Display", label: "Playfair Display (Elegant)", style: "font-serif" },
    { value: "Roboto", label: "Roboto (Clean)", style: "font-sans" },
    { value: "Open Sans", label: "Open Sans (Readable)", style: "font-sans" },
    { value: "Lora", label: "Lora (Traditional)", style: "font-serif" },
  ];

  if (initialLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <span className="ml-2 text-gray-600">Loading theme settings...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Theme & Branding</h2>
          <p className="text-gray-600 mt-1">Customize the look and feel of your site</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Primary Color
                </label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <input
                      type="color"
                      name="primaryColor"
                      value={formData.primaryColor}
                      onChange={handleChange}
                      className="w-16 h-16 border border-gray-300 rounded-lg cursor-pointer"
                      disabled={loading}
                    />
                    <Palette className="absolute top-1 right-1 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-28 px-3 py-2 border text-gray-900 border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="#3B82F6"
                      disabled={loading}
                    />
                    <p className="text-sm text-gray-500 mt-1">Used for buttons, links, and accents</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Secondary Color
                </label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <input
                      type="color"
                      name="secondaryColor"
                      value={formData.secondaryColor}
                      onChange={handleChange}
                      className="w-16 h-16 text-gray-900 border border-gray-300 rounded-lg cursor-pointer"
                      disabled={loading}
                    />
                    <Palette className="absolute top-1 right-1 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="w-28 px-3 py-2 border text-gray-900 border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="#EF4444"
                      disabled={loading}
                    />
                    <p className="text-sm text-gray-500 mt-1">Used for highlights and CTAs</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Font Family
                </label>
                <select
                  name="font"
                  value={formData.font}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  disabled={loading}
                >
                  {fontOptions.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">This will be used for all text on your site</p>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Preview</h4>
                <div className="border border-gray-200 rounded-lg p-4 space-y-3" style={{ fontFamily: formData.font }}>
                  <h3 className="text-lg font-semibold" style={{ color: formData.primaryColor }}>
                    Your Business Name
                  </h3>
                  <p className="text-gray-600">This is how your content will look with the selected font and colors.</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Cover Photo
                </label>

                <div className="border-2 border-dashed border-gray-300 rounded-lg relative hover:border-purple-400 transition-colors">
                  {previewImage ? (
                    <div className="relative">
                      <img
                        src={previewImage}
                        alt="Cover Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={removeCoverPhoto}
                          disabled={loading}
                          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Remove cover photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      {uploadingImage ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-2" />
                          <p className="text-gray-600">Processing image...</p>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">Upload a cover photo</p>
                          <p className="text-sm text-gray-500">Recommended: 1200x600px, max 5MB</p>
                          <p className="text-xs text-gray-400 mt-1">JPG, PNG, or WebP</p>
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
                    className="mt-2 text-sm text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Remove cover photo
                  </button>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Design Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Use high-quality images that represent your brand</li>
                  <li>• Ensure good contrast between colors for readability</li>
                  <li>• Choose fonts that match your business style</li>
                  <li>• Test your design on different screen sizes</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={loading || uploadingImage}
              className="inline-flex items-center px-8 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving Theme...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Theme
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeBrandingForm;