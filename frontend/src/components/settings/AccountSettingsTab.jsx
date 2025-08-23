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
  Facebook 
} from "lucide-react";
import { useApi } from "../../useApi";

export default function AccountSettingsTab() {
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
  const { apiFetch } = useApi();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await apiFetch("/accounts/profile/", { method: "GET" });
        if (response.ok) {
          const data = await response.json();
          setFormData({
            username: data.username || "",
            email: data.email || "",
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            phone_number: data.phone_number || "",
            bio: data.bio || "",
            location: data.location || "",
            profile_picture: data.profile_picture || null,
            instagram: data.instagram || "",
            facebook: data.facebook || "",
            experience_years: data.experience_years || "",
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
  }, []);

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
      setErrors({ profile_picture: "Please select a valid image file" });
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
      submitData.append("instagram", formData.instagram);
      submitData.append("facebook", formData.facebook);
      submitData.append("experience_years", formData.experience_years);
      if (formData.profile_picture instanceof File) {
        submitData.append("profile_picture", formData.profile_picture);
      }
      if (formData.currentPassword && formData.password) {
        submitData.append("current_password", formData.currentPassword);
        submitData.append("password", formData.password);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-900">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600 dark:text-gray-300">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-900 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-3 animate-slideInDown">
          <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl shadow-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Account Settings
          </h2>
        </div>

        {success && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl flex items-center animate-fadeIn">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
            <span className="text-green-800 dark:text-green-300">{success}</span>
          </div>
        )}

        {errors.api && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl flex items-center animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            <span className="text-red-800 dark:text-red-300">{errors.api}</span>
          </div>
        )}

        <div className="grid gap-6 lg:gap-8">
          {/* Personal Information Card */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-6 lg:p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 animate-slideInUp">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                <User className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Personal Information
              </h3>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-gray-700/70 border rounded-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent backdrop-blur-sm transition-all duration-200 ${
                      errors.username ? 'border-red-300 focus:ring-red-500/50' : 'border-gray-200/50 dark:border-gray-600/50 focus:ring-blue-500/50'
                    }`}
                    placeholder="Enter your username"
                  />
                </div>
                {errors.username && (
                  <div className="flex items-center mt-2 text-red-600 dark:text-red-400 text-sm animate-fadeIn">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.username}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-gray-700/70 border rounded-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent backdrop-blur-sm transition-all duration-200 ${
                      errors.email ? 'border-red-300 focus:ring-red-500/50' : 'border-gray-200/50 dark:border-gray-600/50 focus:ring-blue-500/50'
                    }`}
                    placeholder="Enter your email address"
                  />
                </div>
                {errors.email && (
                  <div className="flex items-center mt-2 text-red-600 dark:text-red-400 text-sm animate-fadeIn">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-gray-700/70 border rounded-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent backdrop-blur-sm transition-all duration-200 ${
                      errors.first_name ? 'border-red-300 focus:ring-red-500/50' : 'border-gray-200/50 dark:border-gray-600/50 focus:ring-blue-500/50'
                    }`}
                    placeholder="Enter your first name"
                  />
                </div>
                {errors.first_name && (
                  <div className="flex items-center mt-2 text-red-600 dark:text-red-400 text-sm animate-fadeIn">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.first_name}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-gray-700/70 border rounded-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent backdrop-blur-sm transition-all duration-200 ${
                      errors.last_name ? 'border-red-300 focus:ring-red-500/50' : 'border-gray-200/50 dark:border-gray-600/50 focus:ring-blue-500/50'
                    }`}
                    placeholder="Enter your last name"
                  />
                </div>
                {errors.last_name && (
                  <div className="flex items-center mt-2 text-red-600 dark:text-red-400 text-sm animate-fadeIn">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.last_name}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-gray-700/70 border rounded-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent backdrop-blur-sm transition-all duration-200 ${
                      errors.phone_number ? 'border-red-300 focus:ring-red-500/50' : 'border-gray-200/50 dark:border-gray-600/50 focus:ring-blue-500/50'
                    }`}
                    placeholder="Enter your phone number"
                  />
                </div>
                {errors.phone_number && (
                  <div className="flex items-center mt-2 text-red-600 dark:text-red-400 text-sm animate-fadeIn">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.phone_number}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-gray-700/70 border rounded-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent backdrop-blur-sm transition-all duration-200 ${
                      errors.location ? 'border-red-300 focus:ring-red-500/50' : 'border-gray-200/50 dark:border-gray-600/50 focus:ring-blue-500/50'
                    }`}
                    placeholder="Enter your location"
                  />
                </div>
                {errors.location && (
                  <div className="flex items-center mt-2 text-red-600 dark:text-red-400 text-sm animate-fadeIn">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.location}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Instagram Profile
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Instagram className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-gray-700/70 border rounded-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent backdrop-blur-sm transition-all duration-200 ${
                      errors.instagram ? 'border-red-300 focus:ring-red-500/50' : 'border-gray-200/50 dark:border-gray-600/50 focus:ring-blue-500/50'
                    }`}
                    placeholder="Enter your Instagram URL"
                  />
                </div>
                {errors.instagram && (
                  <div className="flex items-center mt-2 text-red-600 dark:text-red-400 text-sm animate-fadeIn">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.instagram}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Facebook Profile
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Facebook className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-gray-700/70 border rounded-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent backdrop-blur-sm transition-all duration-200 ${
                      errors.facebook ? 'border-red-300 focus:ring-red-500/50' : 'border-gray-200/50 dark:border-gray-600/50 focus:ring-blue-500/50'
                    }`}
                    placeholder="Enter your Facebook URL"
                  />
                </div>
                {errors.facebook && (
                  <div className="flex items-center mt-2 text-red-600 dark:text-red-400 text-sm animate-fadeIn">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.facebook}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Bio
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-0 pl-4 flex items-start pointer-events-none">
                    <Edit className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-gray-700/70 border rounded-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent backdrop-blur-sm transition-all duration-200 resize-none ${
                      errors.bio ? 'border-red-300 focus:ring-red-500/50' : 'border-gray-200/50 dark:border-gray-600/50 focus:ring-blue-500/50'
                    }`}
                    placeholder="Tell us about yourself"
                  />
                </div>
                {errors.bio && (
                  <div className="flex items-center mt-2 text-red-600 dark:text-red-400 text-sm animate-fadeIn">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.bio}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Picture Card */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-6 lg:p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 animate-slideInUp">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <User className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Profile Picture
              </h3>
            </div>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl relative hover:border-purple-400 dark:hover:border-purple-600 transition-colors">
              {previewImage ? (
                <div className="relative">
                  <img
                    src={previewImage}
                    alt="Profile Preview"
                    className="w-32 h-32 object-cover rounded-lg mx-auto"
                  />
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <button
                      type="button"
                      onClick={removeProfilePicture}
                      disabled={saving}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove profile picture"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">Upload a profile picture</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Recommended: 200x200px, max 5MB</p>
                  <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">JPG, PNG, or WebP</p>
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
              <div className="flex items-center mt-2 text-red-600 dark:text-red-400 text-sm animate-fadeIn">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.profile_picture}
              </div>
            )}
          </div>

          {/* Professional Profile Card */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-6 lg:p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 animate-slideInUp">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Professional Profile
              </h3>
            </div>

            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Years of Experience
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Settings className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="experience_years"
                    value={formData.experience_years}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-gray-700/70 border rounded-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent backdrop-blur-sm transition-all duration-200 ${
                      errors.experience_years ? 'border-red-300 focus:ring-red-500/50' : 'border-gray-200/50 dark:border-gray-600/50 focus:ring-teal-500/50'
                    }`}
                    placeholder="Enter years of experience"
                  />
                </div>
                {errors.experience_years && (
                  <div className="flex items-center mt-2 text-red-600 dark:text-red-400 text-sm animate-fadeIn">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.experience_years}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Security Settings Card */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-6 lg:p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 animate-slideInUp">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Security Settings
              </h3>
            </div>

            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-3 bg-white/70 dark:bg-gray-700/70 border border-gray-200/50 dark:border-gray-600/50 rounded-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-12 py-3 bg-white/70 dark:bg-gray-700/70 border rounded-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent backdrop-blur-sm transition-all duration-200 ${
                      errors.password ? 'border-red-300 focus:ring-red-500/50' : 'border-gray-200/50 dark:border-gray-600/50 focus:ring-red-500/50'
                    }`}
                    placeholder="Leave blank to keep current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <div className="flex items-center mt-2 text-red-600 dark:text-red-400 text-sm animate-fadeIn">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.password}
                  </div>
                )}
              </div>

              {formData.password && (
                <div className="animate-slideInUp">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-12 py-3 bg-white/70 dark:bg-gray-700/70 border rounded-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent backdrop-blur-sm transition-all duration-200 ${
                        errors.confirmPassword ? 'border-red-300 focus:ring-red-500/50' : 'border-gray-200/50 dark:border-gray-600/50 focus:ring-red-500/50'
                      }`}
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <div className="flex items-center mt-2 text-red-600 dark:text-red-400 text-sm animate-fadeIn">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>
              )}

              {formData.password && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 animate-slideInUp">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                    Password Requirements:
                  </h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                    <li className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      At least 8 characters long
                    </li>
                    <li className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${/[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Contains uppercase letter
                    </li>
                    <li className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${/[0-9]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Contains number
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-medium text-lg shadow-xl hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300/50 dark:focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
          >
            <div className="flex items-center space-x-3">
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              )}
              <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
            </div>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideInDown { animation: slideInDown 0.5s ease-out; }
        .animate-slideInUp { animation: slideInUp 0.5s ease-out; }
      `}</style>
    </div>
  );
}