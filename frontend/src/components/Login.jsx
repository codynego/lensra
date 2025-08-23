import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext"; // Import useAuth for auth context
import { User, Lock, LogIn, Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth(); // Use auth context
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Use environment variable for API URL
  const API_URL = process.env.REACT_APP_API_URL || "http://lvh.me:8000";

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    // Clear errors when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/accounts/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok && data.access && data.refresh) {
        login(data.access, data.refresh); // Use auth context to handle login
        setSuccess("Login successful! Redirecting to dashboard...");
        // Redirection handled by useEffect
      } else {
        setError(data.detail || "Invalid username or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to connect to the server. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Main login card */}
        <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30">
              <LogIn size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="text-slate-400">
              Sign in to your account to continue
            </p>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mb-6 p-4 text-red-200 text-center font-medium bg-red-900/30 border border-red-500/30 rounded-xl backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 text-green-200 text-center font-medium bg-green-900/30 border border-green-500/30 rounded-xl backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
              {success}
            </div>
          )}

          {/* Login Form */}
          <div className="space-y-6">
            {/* Username Field */}
            <div className="relative group">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors duration-200" size={20} />
              <input
                type="text"
                name="username"
                placeholder="Username or Email"
                value={formData.username}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 rounded-xl text-white bg-slate-700/50 border border-slate-600/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all duration-200 backdrop-blur-sm placeholder-slate-400"
                required
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors duration-200" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-12 pr-12 py-4 rounded-xl text-white bg-slate-700/50 border border-slate-600/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all duration-200 backdrop-blur-sm placeholder-slate-400"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-indigo-400 transition-colors duration-200"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Login Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 rounded-xl text-white font-medium transition-all duration-200 shadow-lg relative overflow-hidden group
                bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 
                hover:shadow-indigo-500/40 hover:scale-[1.02] 
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                disabled:hover:shadow-none"
            >
              {/* Button background animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              
              <div className="relative flex items-center justify-center space-x-2">
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
                <span>{loading ? "Signing In..." : "Sign In"}</span>
                {!loading && <LogIn size={18} />}
              </div>
            </button>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700/50 text-indigo-500 focus:ring-indigo-500/20 focus:ring-2"
                  disabled={loading}
                />
                <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-200">
                  Remember me
                </span>
              </label>
              <Link 
                to="/forgot-password"
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
              >
                Forgot Password?
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-400 text-sm">
            Don't have an account?{" "}
            <Link 
              to="/register"
              className="text-indigo-400 hover:text-indigo-300 transition-colors duration-200 font-medium"
            >
              Create one here
            </Link>
          </p>
        </div>

        {/* Additional Features */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="h-px bg-slate-600 flex-1"></div>
            <span className="text-slate-500 text-sm font-medium">Or continue with</span>
            <div className="h-px bg-slate-600 flex-1"></div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button className="p-3 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 rounded-xl transition-all duration-200 hover:scale-105">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                f
              </div>
            </button>
            <button className="p-3 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 rounded-xl transition-all duration-200 hover:scale-105">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                G
              </div>
            </button>
            <button className="p-3 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 rounded-xl transition-all duration-200 hover:scale-105">
              <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold">
                𝕏
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
