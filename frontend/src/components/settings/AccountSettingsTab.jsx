import React, { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Lock, 
  Save, 
  Eye, 
  EyeOff, 
  Shield, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  Trash2, 
  Phone, 
  MapPin, 
  Edit,
  Instagram,
  Facebook,
  DollarSign
} from "lucide-react";
import { useAuth } from "../../AuthContext";

// Currency symbols mapping
const CURRENCY_SYMBOLS = {
  "USD": "$", "EUR": "€", "GBP": "£", "JPY": "¥", "CNY": "¥", "INR": "₹",
  "NGN": "₦", "GHS": "₵", "ZAR": "R", "KES": "KSh", "UGX": "USh", "TZS": "TSh",
  "RWF": "FRw", "BIF": "FBu", "CDF": "FC", "XAF": "FCFA", "XOF": "CFA", "XPF": "₣",
  "MAD": "د.م.", "DZD": "د.ج", "TND": "د.ت", "LYD": "ل.د", "EGP": "£", "SDG": "ج.س.",
  "SSP": "£", "ETB": "Br", "ERN": "Nfk", "MZN": "MT", "AOA": "Kz", "ZMW": "ZK",
  "MWK": "MK", "LSL": "L", "SZL": "E", "MUR": "₨", "SCR": "₨", "MRU": "UM",
  "GNF": "FG", "SLL": "Le", "LRD": "$", "BWP": "P", "NAD": "N$", "MGA": "Ar",
  "KMF": "CF", "STN": "Db", "SOS": "Sh"
};

export default function AccountSettingsTab({ theme = "dark" }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    bio: "",
    location: "",
    profile_picture: null,
    instagram: "",
    facebook: "",
    experience_years: "",
    currency: "USD",
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState({});
  const { apiFetch } = useAuth();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const response = await apiFetch("/accounts/profile/", { method: "GET" });
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched profile data:", data);
          setFormData({
            username: data.username || "",
            email: data.email || "",
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            phone_number: data.phone_number || "",
            bio: data.bio || "",
            location: data.location || "",
            profile_picture: data.profile_picture || null,
            instagram: data.photographer?.instagram || "",
            facebook: data.photographer?.facebook || "",
            experience_years: data.photographer?.years_of_experience || "",
            currency: data.photographer?.currency || "USD",
            currentPassword: "",
            password: "",
            confirmPassword: "",
          });
          if (data.profile_picture) {
            setPreviewImage(data.profile_picture);
          }
        } else {
          setErrors({ api: "Failed to load profile data" });
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setErrors({ api: "Network error occurred" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [apiFetch]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }
    if (formData.phone_number && !/^\+?[\d\s-]{7,15}$/.test(formData.phone_number)) {
      newErrors.phone_number = "Please enter a valid phone number";
    }
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = "Bio must be 500 characters or less";
    }
    if (formData.location && formData.location.length > 100) {
      newErrors.location = "Location must be 100 characters or less";
    }
    if (formData.instagram && !/^https?:\/\/(www\.)?instagram\.com\/.+$/.test(formData.instagram)) {
      newErrors.instagram = "Please enter a valid Instagram URL";
    }
    if (formData.facebook && !/^https?:\/\/(www\.)?facebook\.com\/.+$/.test(formData.facebook)) {
      newErrors.facebook = "Please enter a valid Facebook URL";
    }
    if (formData.experience_years && isNaN(formData.experience_years)) {
      newErrors.experience_years = "Experience years must be a number";
    }
    if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.currency || !CURRENCY_SYMBOLS[formData.currency]) {
      newErrors.currency = "Please select a valid currency";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (success) setSuccess("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ profile_picture: "Image size must be less than 5MB" });
      return;
    }
    if (!file.type.startsWith("image/")) {
      setErrors({ profile_picture: "Please select a valid image file (JPG, PNG, WebP)" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => setPreviewImage(e.target.result);
    reader.readAsDataURL(file);

    setFormData((prev) => ({ ...prev, profile_picture: file }));
    setErrors((prev) => ({ ...prev, profile_picture: null }));
  };

  const removeProfilePicture = () => {
    setFormData((prev) => ({ ...prev, profile_picture: null }));
    setPreviewImage(null);
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = "";
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setErrors({});

    try {
      const submitData = new FormData();
      submitData.append("username", formData.username);
      submitData.append("email", formData.email);
      submitData.append("first_name", formData.first_name);
      submitData.append("last_name", formData.last_name);
      submitData.append("phone_number", formData.phone_number);
      submitData.append("bio", formData.bio);
      submitData.append("location", formData.location);
      submitData.append("photographer.instagram", formData.instagram);
      submitData.append("photographer.facebook", formData.facebook);
      submitData.append("photographer.years_of_experience", formData.experience_years);
      submitData.append("photographer.currency", formData.currency);
      if (formData.profile_picture instanceof File) {
        submitData.append("profile_picture", formData.profile_picture);
      }
      if (formData.currentPassword && formData.password) {
        submitData.append("current_password", formData.currentPassword);
        submitData.append("new_password", formData.password);
      }

      const response = await apiFetch("/accounts/profile/", {
        method: "PUT",
        body: submitData,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({
          ...prev,
          profile_picture: data.profile_picture || prev.profile_picture,
          instagram: data.photographer?.instagram || prev.instagram,
          facebook: data.photographer?.facebook || prev.facebook,
          experience_years: data.photographer?.years_of_experience || prev.experience_years,
          currency: data.photographer?.currency || prev.currency,
          currentPassword: "",
          password: "",
          confirmPassword: "",
        }));
        setPreviewImage(data.profile_picture || previewImage);
        setSuccess("Profile updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorData = await response.json();
        setErrors({ api: errorData.message || "Failed to update profile" });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrors({ api: "Network error occurred" });
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
      } p-4 sm:p-6 lg:p-8`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 border-4 rounded-full animate-spin ${
              theme === 'dark' ? 'border-indigo-400 border-t-transparent' : 'border-indigo-600 border-t-transparent'
            }`}></div>
            <span className={`ml-3 text-sm sm:text-base ${
              theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
            }`}>Loading profile settings...</span>
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
            theme === 'dark' ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gradient-to-r from-indigo-400 to-purple-500'
          }`}>
            <User className="w-6 h-6 text-white" />
          </div>
          <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r ${
            theme === 'dark' ? 'from-indigo-400 to-purple-400' : 'from-indigo-600 to-purple-600'
          }`}>
            Account Settings
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
          {/* Personal Information Card */}
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
                  <User className="w-5 h-5 text-white" />
                </div>
                <h3 className={`text-xl sm:text-2xl font-bold ${
                  theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                }`}>Personal Information</h3>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                  }`}>Username</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`} />
                    </div>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent backdrop-blur-xl transition-all duration-200 ${
                        errors.username 
                          ? 'border-red-400 focus:ring-red-500/50' 
                          : theme === 'dark' 
                            ? 'bg-slate-800/60 border-slate-700/50 text-slate-100 hover:bg-slate-800/80'
                            : 'bg-white/70 border-gray-200/50 text-gray-900 hover:bg-white/90'
                      }`}
                      placeholder="Enter your username"
                    />
                  </div>
                  {errors.username && (
                    <div className={`flex items-center mt-2 text-sm animate-fadeIn ${
                      theme === 'dark' ? 'text-red-400' : 'text-red-600'
                    }`}>
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.username}
                    </div>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                  }`}>Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent backdrop-blur-xl transition-all duration-200 ${
                        errors.email 
                          ? 'border-red-400 focus:ring-red-500/50' 
                          : theme === 'dark' 
                            ? 'bg-slate-800/60 border-slate-700/50 text-slate-100 hover:bg-slate-800/80'
                            : 'bg-white/70 border-gray-200/50 text-gray-900 hover:bg-white/90'
                      }`}
                      placeholder="Enter your email address"
                    />
                  </div>
                  {errors.email && (
                    <div className={`flex items-center mt-2 text-sm animate-fadeIn ${
                      theme === 'dark' ? 'text-red-400' : 'text-red-600'
                    }`}>
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.email}
                    </div>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                  }`}>First Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`} />
                    </div>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent backdrop-blur-xl transition-all duration-200 ${
                        errors.first_name 
                          ? 'border-red-400 focus:ring-red-500/50' 
                          : theme === 'dark' 
                            ? 'bg-slate-800/60 border-slate-700/50 text-slate-100 hover:bg-slate-800/80'
                            : 'bg-white/70 border-gray-200/50 text-gray-900 hover:bg-white/90'
                      }`}
                      placeholder="Enter your first name"
                    />
                  </div>
                  {errors.first_name && (
                    <div className={`flex items-center mt-2 text-sm animate-fadeIn ${
                      theme === 'dark' ? 'text-red-400' : 'text-red-600'
                    }`}>
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.first_name}
                    </div>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                  }`}>Last Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`} />
                    </div>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent backdrop-blur-xl transition-all duration-200 ${
                        errors.last_name 
                          ? 'border-red-400 focus:ring-red-500/50' 
                          : theme === 'dark' 
                            ? 'bg-slate-800/60 border-slate-700/50 text-slate-100 hover:bg-slate-800/80'
                            : 'bg-white/70 border-gray-200/50 text-gray-900 hover:bg-white/90'
                      }`}
                      placeholder="Enter your last name"
                    />
                  </div>
                  {errors.last_name && (
                    <div className={`flex items-center mt-2 text-sm animate-fadeIn ${
                      theme === 'dark' ? 'text-red-400' : 'text-red-600'
                    }`}>
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.last_name}
                    </div>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                  }`}>Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`} />
                    </div>
                    <input
                      type="text"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent backdrop-blur-xl transition-all duration-200 ${
                        errors.phone_number 
                          ? 'border-red-400 focus:ring-red-500/50' 
                          : theme === 'dark' 
                            ? 'bg-slate-800/60 border-slate-700/50 text-slate-100 hover:bg-slate-800/80'
                            : 'bg-white/70 border-gray-200/50 text-gray-900 hover:bg-white/90'
                      }`}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  {errors.phone_number && (
                    <div className={`flex items-center mt-2 text-sm animate-fadeIn ${
                      theme === 'dark' ? 'text-red-400' : 'text-red-600'
                    }`}>
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.phone_number}
                    </div>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                  }`}>Location</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <MapPin className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`} />
                    </div>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent backdrop-blur-xl transition-all duration-200 ${
                        errors.location 
                          ? 'border-red-400 focus:ring-red-500/50' 
                          : theme === 'dark' 
                            ? 'bg-slate-800/60 border-slate-700/50 text-slate-100 hover:bg-slate-800/80'
                            : 'bg-white/70 border-gray-200/50 text-gray-900 hover:bg-white/90'
                      }`}
                      placeholder="Enter your location"
                    />
                  </div>
                  {errors.location && (
                    <div className={`flex items-center mt-2 text-sm animate-fadeIn ${
                      theme === 'dark' ? 'text-red-400' : 'text-red-600'
                    }`}>
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.location}
                    </div>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                  }`}>Preferred Currency</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <DollarSign className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`} />
                    </div>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-10 py-3 rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent backdrop-blur-xl transition-all duration-200 appearance-none cursor-pointer ${
                        errors.currency 
                          ? 'border-red-400 focus:ring-red-500/50' 
                          : theme === 'dark' 
                            ? 'bg-slate-800/60 border-slate-700/50 text-slate-100 hover:bg-slate-800/80'
                            : 'bg-white/70 border-gray-200/50 text-gray-900 hover:bg-white/90'
                      }`}
                    >
                      {Object.entries(CURRENCY_SYMBOLS).map(([code, symbol]) => (
                        <option key={code} value={code}>
                          {code} ({symbol})
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <svg className={`h-5 w-5 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {errors.currency && (
                    <div className={`flex items-center mt-2 text-sm animate-fadeIn ${
                      theme === 'dark' ? 'text-red-400' : 'text-red-600'
                    }`}>
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.currency}
                    </div>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                  }`}>Instagram Profile</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Instagram className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`} />
                    </div>
                    <input
                      type="text"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent backdrop-blur-xl transition-all duration-200 ${
                        errors.instagram 
                          ? 'border-red-400 focus:ring-red-500/50' 
                          : theme === 'dark' 
                            ? 'bg-slate-800/60 border-slate-700/50 text-slate-100 hover:bg-slate-800/80'
                            : 'bg-white/70 border-gray-200/50 text-gray-900 hover:bg-white/90'
                      }`}
                      placeholder="Enter your Instagram URL"
                    />
                  </div>
                  {errors.instagram && (
                    <div className={`flex items-center mt-2 text-sm animate-fadeIn ${
                      theme === 'dark' ? 'text-red-400' : 'text-red-600'
                    }`}>
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.instagram}
                    </div>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                  }`}>Facebook Profile</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Facebook className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`} />
                    </div>
                    <input
                      type="text"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent backdrop-blur-xl transition-all duration-200 ${
                        errors.facebook 
                          ? 'border-red-400 focus:ring-red-500/50' 
                          : theme === 'dark' 
                            ? 'bg-slate-800/60 border-slate-700/50 text-slate-100 hover:bg-slate-800/80'
                            : 'bg-white/70 border-gray-200/50 text-gray-900 hover:bg-white/90'
                      }`}
                      placeholder="Enter your Facebook URL"
                    />
                  </div>
                  {errors.facebook && (
                    <div className={`flex items-center mt-2 text-sm animate-fadeIn ${
                      theme === 'dark' ? 'text-red-400' : 'text-red-600'
                    }`}>
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.facebook}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                  }`}>Bio</label>
                  <div className="relative">
                    <div className="absolute top-3 left-0 pl-4 flex items-start pointer-events-none">
                      <Edit className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`} />
                    </div>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={4}
                      className={`w-full pl-12 pr-4 py-3 rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent backdrop-blur-xl transition-all duration-200 resize-none ${
                        errors.bio 
                          ? 'border-red-400 focus:ring-red-500/50' 
                          : theme === 'dark' 
                            ? 'bg-slate-800/60 border-slate-700/50 text-slate-100 hover:bg-slate-800/80'
                            : 'bg-white/70 border-gray-200/50 text-gray-900 hover:bg-white/90'
                      }`}
                      placeholder="Tell us about yourself"
                    />
                  </div>
                  {errors.bio && (
                    <div className={`flex items-center mt-2 text-sm animate-fadeIn ${
                      theme === 'dark' ? 'text-red-400' : 'text-red-600'
                    }`}>
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.bio}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Picture Card */}
          <div className={`rounded-2xl shadow-xl border transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl border-slate-700/60' 
              : 'bg-white/90 border-gray-200'
          }`}>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-2 rounded-xl shadow-lg ${
                  theme === 'dark' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-emerald-400 to-teal-400'
                }`}>
                  <User className="w-5 h-5 text-white" />
                </div>
                <h3 className={`text-xl sm:text-2xl font-bold ${
                  theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                }`}>Profile Picture</h3>
              </div>

              <div className={`relative rounded-2xl p-6 border-2 border-dashed text-center transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-slate-800/50 border-slate-600 hover:bg-slate-800/70 hover:border-indigo-400'
                  : 'bg-white/50 border-gray-300 hover:bg-white/70 hover:border-indigo-300'
              }`}>
                {previewImage ? (
                  <div className="relative inline-block">
                    <img
                      src={previewImage}
                      alt="Profile Preview"
                      className="w-32 h-32 object-cover rounded-xl shadow-lg mx-auto"
                    />
                    <button
                      type="button"
                      onClick={removeProfilePicture}
                      disabled={saving}
                      className={`absolute -top-2 -right-2 p-1.5 rounded-full shadow-lg transition-colors ${
                        theme === 'dark' 
                          ? 'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-500/50' 
                          : 'bg-red-400 text-white hover:bg-red-500 disabled:bg-red-400/50'
                      }`}
                      title="Remove profile picture"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`} />
                    <p className={`text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                    }`}>Upload a Profile Picture</p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                      Recommended: 200x200px, max 5MB (JPG, PNG, WebP)
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={saving}
                />
              </div>
              {errors.profile_picture && (
                <div className={`flex items-center mt-2 text-sm animate-fadeIn ${
                  theme === 'dark' ? 'text-red-400' : 'text-red-600'
                }`}>
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.profile_picture}
                </div>
              )}
            </div>
          </div>

          {/* Professional Profile Card */}
          <div className={`rounded-2xl shadow-xl border transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl border-slate-700/60' 
              : 'bg-white/90 border-gray-200'
          }`}>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-2 rounded-xl shadow-lg ${
                  theme === 'dark' ? 'bg-gradient-to-r from-teal-500 to-cyan-500' : 'bg-gradient-to-r from-teal-400 to-cyan-400'
                }`}>
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <h3 className={`text-xl sm:text-2xl font-bold ${
                  theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                }`}>Professional Profile</h3>
              </div>

              <div className="grid gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                  }`}>Years of Experience</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Settings className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`} />
                    </div>
                    <input
                      type="number"
                      name="experience_years"
                      value={formData.experience_years}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent backdrop-blur-xl transition-all duration-200 ${
                        errors.experience_years 
                          ? 'border-red-400 focus:ring-red-500/50' 
                          : theme === 'dark' 
                            ? 'bg-slate-800/60 border-slate-700/50 text-slate-100 hover:bg-slate-800/80'
                            : 'bg-white/70 border-gray-200/50 text-gray-900 hover:bg-white/90'
                      }`}
                      placeholder="Enter years of experience"
                    />
                  </div>
                  {errors.experience_years && (
                    <div className={`flex items-center mt-2 text-sm animate-fadeIn ${
                      theme === 'dark' ? 'text-red-400' : 'text-red-600'
                    }`}>
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.experience_years}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings Card */}
          <div className={`rounded-2xl shadow-xl border transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl border-slate-700/60' 
              : 'bg-white/90 border-gray-200'
          }`}>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-2 rounded-xl shadow-lg ${
                  theme === 'dark' ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gradient-to-r from-red-400 to-pink-400'
                }`}>
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h3 className={`text-xl sm:text-2xl font-bold ${
                  theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                }`}>Security Settings</h3>
              </div>

              <div className="grid gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                  }`}>Current Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`} />
                    </div>
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-12 py-3 rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent backdrop-blur-xl transition-all duration-200 ${
                        theme === 'dark' 
                          ? 'bg-slate-800/60 border-slate-700/50 text-slate-100 hover:bg-slate-800/80'
                          : 'bg-white/70 border-gray-200/50 text-gray-900 hover:bg-white/90'
                      }`}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-colors ${
                        theme === 'dark' ? 'text-slate-400 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                  }`}>New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-12 py-3 rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent backdrop-blur-xl transition-all duration-200 ${
                        errors.password 
                          ? 'border-red-400 focus:ring-red-500/50' 
                          : theme === 'dark' 
                            ? 'bg-slate-800/60 border-slate-700/50 text-slate-100 hover:bg-slate-800/80'
                            : 'bg-white/70 border-gray-200/50 text-gray-900 hover:bg-white/90'
                      }`}
                      placeholder="Leave blank to keep current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-colors ${
                        theme === 'dark' ? 'text-slate-400 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <div className={`flex items-center mt-2 text-sm animate-fadeIn ${
                      theme === 'dark' ? 'text-red-400' : 'text-red-600'
                    }`}>
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.password}
                    </div>
                  )}
                </div>

                {formData.password && (
                  <div className="animate-fadeIn">
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                    }`}>Confirm New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`} />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-12 py-3 rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent backdrop-blur-xl transition-all duration-200 ${
                          errors.confirmPassword 
                            ? 'border-red-400 focus:ring-red-500/50' 
                            : theme === 'dark' 
                              ? 'bg-slate-800/60 border-slate-700/50 text-slate-100 hover:bg-slate-800/80'
                              : 'bg-white/70 border-gray-200/50 text-gray-900 hover:bg-white/90'
                        }`}
                        placeholder="Confirm your new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-colors ${
                          theme === 'dark' ? 'text-slate-400 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <div className={`flex items-center mt-2 text-sm animate-fadeIn ${
                        theme === 'dark' ? 'text-red-400' : 'text-red-600'
                      }`}>
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.confirmPassword}
                      </div>
                    )}
                  </div>
                )}

                {formData.password && (
                  <div className={`rounded-2xl p-4 animate-fadeIn ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-indigo-900/20 to-blue-900/20 border border-indigo-800/30'
                      : 'bg-gradient-to-r from-indigo-50/80 to-blue-50/80 border border-indigo-200/30'
                  }`}>
                    <h4 className={`text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-indigo-300' : 'text-indigo-800'
                    }`}>Password Requirements:</h4>
                    <ul className={`text-sm space-y-1.5 ${
                      theme === 'dark' ? 'text-indigo-400' : 'text-indigo-700'
                    }`}>
                      <li className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          formData.password.length >= 8 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                            : theme === 'dark' ? 'bg-slate-600' : 'bg-gray-300'
                        }`}></div>
                        At least 8 characters long
                      </li>
                      <li className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          /[A-Z]/.test(formData.password) 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                            : theme === 'dark' ? 'bg-slate-600' : 'bg-gray-300'
                        }`}></div>
                        Contains uppercase letter
                      </li>
                      <li className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          /[0-9]/.test(formData.password) 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                            : theme === 'dark' ? 'bg-slate-600' : 'bg-gray-300'
                        }`}></div>
                        Contains number
                      </li>
                    </ul>
                  </div>
                )}
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
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-200" />
              )}
              <span className="truncate">{saving ? "Saving Changes..." : "Save Account Changes"}</span>
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
}