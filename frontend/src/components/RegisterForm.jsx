import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, User, Mail, Lock, Camera, Users, Check } from "lucide-react";

export default function RegisterForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "client",
    password: "",
    password2: "",
  });

  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: null }));
    }
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => ({
      ...prev,
      role: role,
    }));
    if (errors.role) {
      setErrors(prev => ({ ...prev, role: null }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch(step) {
      case 1:
        if (!formData.role) newErrors.role = "Please select a role";
        break;
      case 2:
        if (!formData.username.trim()) newErrors.username = "Username is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
        break;
      case 3:
        if (!formData.password) newErrors.password = "Password is required";
        else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
        if (!formData.password2) newErrors.password2 = "Please confirm your password";
        else if (formData.password !== formData.password2) newErrors.password2 = "Passwords don't match";
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    
    setMessage(null);
    setLoading(true);

    try {
      const response = await fetch(
        "http://lvh.me:8000/api/accounts/register/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      setLoading(false);

      if (response.ok) {
        navigate("/registration-success");
      } else {
        const data = await response.json();
        setErrors(data);
      }
    } catch (error) {
      setLoading(false);
      setMessage("An error occurred. Please try again.");
    }
  };

  const getStepTitle = () => {
    switch(currentStep) {
      case 1: return "Choose Your Role";
      case 2: return "Basic Information";
      case 3: return "Secure Your Account";
      default: return "";
    }
  };

  const getStepSubtitle = () => {
    switch(currentStep) {
      case 1: return "Tell us how you'll be using our platform";
      case 2: return "Let's get to know you better";
      case 3: return "Create a strong password to protect your account";
      default: return "";
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300
                  ${currentStep >= step 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30' 
                    : 'bg-slate-700/50 text-slate-400 border border-slate-600'
                  }
                `}>
                  {currentStep > step ? <Check size={16} /> : step}
                </div>
                {step < 3 && (
                  <div className={`
                    flex-1 h-1 mx-4 rounded-full transition-all duration-300
                    ${currentStep > step ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-slate-700/50'}
                  `}></div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-slate-400 text-sm">Step {currentStep} of {totalSteps}</p>
          </div>
        </div>

        {/* Main form card */}
        <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {getStepTitle()}
            </h2>
            <p className="text-slate-400">
              {getStepSubtitle()}
            </p>
          </div>

          {message && (
            <div className="mb-6 p-4 text-red-200 text-center font-medium bg-red-900/30 border border-red-500/30 rounded-xl backdrop-blur-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Role Selection */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
                <div className="grid grid-cols-1 gap-4">
                  <div 
                    onClick={() => handleRoleChange("client")}
                    className={`
                      group cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02]
                      ${formData.role === "client" 
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/20' 
                        : 'border-slate-600/50 bg-slate-700/30 hover:border-slate-500'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`
                        p-3 rounded-xl transition-all duration-300
                        ${formData.role === "client" 
                          ? 'bg-indigo-500 text-white' 
                          : 'bg-slate-600/50 text-slate-300 group-hover:bg-slate-600'
                        }
                      `}>
                        <Users size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">Client</h3>
                        <p className="text-slate-400 text-sm">Looking to hire talented photographers for your projects</p>
                      </div>
                      <div className={`
                        w-5 h-5 rounded-full border-2 transition-all duration-300
                        ${formData.role === "client" 
                          ? 'border-indigo-500 bg-indigo-500' 
                          : 'border-slate-500'
                        }
                      `}>
                        {formData.role === "client" && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div 
                    onClick={() => handleRoleChange("photographer")}
                    className={`
                      group cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02]
                      ${formData.role === "photographer" 
                        ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20' 
                        : 'border-slate-600/50 bg-slate-700/30 hover:border-slate-500'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`
                        p-3 rounded-xl transition-all duration-300
                        ${formData.role === "photographer" 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-slate-600/50 text-slate-300 group-hover:bg-slate-600'
                        }
                      `}>
                        <Camera size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">Photographer</h3>
                        <p className="text-slate-400 text-sm">Ready to showcase your skills and find exciting projects</p>
                      </div>
                      <div className={`
                        w-5 h-5 rounded-full border-2 transition-all duration-300
                        ${formData.role === "photographer" 
                          ? 'border-purple-500 bg-purple-500' 
                          : 'border-slate-500'
                        }
                      `}>
                        {formData.role === "photographer" && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {errors.role && (
                  <p className="text-red-400 text-sm text-center animate-in fade-in duration-200">{errors.role}</p>
                )}
              </div>
            )}

            {/* Step 2: Basic Information */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`
                      w-full pl-12 pr-4 py-4 rounded-xl text-white bg-slate-700/50 border transition-all duration-200 backdrop-blur-sm
                      ${errors.username 
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-slate-600/50 focus:border-indigo-500 focus:ring-indigo-500/20'
                      }
                      focus:outline-none focus:ring-2 placeholder-slate-400
                    `}
                    disabled={loading}
                  />
                  {errors.username && (
                    <p className="text-red-400 text-sm mt-2 animate-in fade-in duration-200">{errors.username}</p>
                  )}
                </div>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    className={`
                      w-full pl-12 pr-4 py-4 rounded-xl text-white bg-slate-700/50 border transition-all duration-200 backdrop-blur-sm
                      ${errors.email 
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-slate-600/50 focus:border-indigo-500 focus:ring-indigo-500/20'
                      }
                      focus:outline-none focus:ring-2 placeholder-slate-400
                    `}
                    disabled={loading}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-2 animate-in fade-in duration-200">{errors.email}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Password */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`
                      w-full pl-12 pr-4 py-4 rounded-xl text-white bg-slate-700/50 border transition-all duration-200 backdrop-blur-sm
                      ${errors.password 
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-slate-600/50 focus:border-indigo-500 focus:ring-indigo-500/20'
                      }
                      focus:outline-none focus:ring-2 placeholder-slate-400
                    `}
                    disabled={loading}
                  />
                  {errors.password && (
                    <p className="text-red-400 text-sm mt-2 animate-in fade-in duration-200">{errors.password}</p>
                  )}
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    name="password2"
                    type="password"
                    placeholder="Confirm Password"
                    value={formData.password2}
                    onChange={handleChange}
                    className={`
                      w-full pl-12 pr-4 py-4 rounded-xl text-white bg-slate-700/50 border transition-all duration-200 backdrop-blur-sm
                      ${errors.password2 
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-slate-600/50 focus:border-indigo-500 focus:ring-indigo-500/20'
                      }
                      focus:outline-none focus:ring-2 placeholder-slate-400
                    `}
                    disabled={loading}
                  />
                  {errors.password2 && (
                    <p className="text-red-400 text-sm mt-2 animate-in fade-in duration-200">{errors.password2}</p>
                  )}
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between items-center pt-6">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1 || loading}
                className={`
                  flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200
                  ${currentStep === 1 || loading
                    ? 'text-slate-500 cursor-not-allowed'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }
                `}
              >
                <ChevronLeft size={20} />
                <span>Back</span>
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={loading}
                  className="flex items-center space-x-2 px-8 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <span>Continue</span>
                  <ChevronRight size={20} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-8 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading && (
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                  )}
                  <span>{loading ? "Creating Account..." : "Create Account"}</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Footer links */}
        <div className="flex justify-center items-center mt-8 text-sm text-slate-400 space-x-6">
          <Link 
            to="/login" 
            className="hover:text-indigo-400 transition-colors duration-200 flex items-center space-x-1"
          >
            <span>Already have an account?</span>
            <span className="text-indigo-400 font-medium">Login</span>
          </Link>
          <span className="text-slate-600">•</span>
          <Link 
            to="/forgot-password" 
            className="text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
          >
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
}