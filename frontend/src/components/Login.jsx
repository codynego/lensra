import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const BRAND_COLOR = '#6366f1';

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch("http://lvh.me:8000/api/accounts/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok && data.access && data.refresh) {
        login(data.access, data.refresh);
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 500);
      } else {
        setError(data.detail || "Invalid username or password");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900 p-4">
        <div className="w-full max-w-md bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700/50 backdrop-blur-sm text-center">
          <p className="text-green-400 text-lg font-medium">You are already logged in.</p>
          <p className="mt-2 text-sm text-gray-300">
            Redirecting to{" "}
            <Link to="/dashboard" className="text-indigo-400 hover:text-indigo-300 transition-colors duration-200">
              dashboard
            </Link>
            ...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700/50 backdrop-blur-sm">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Login
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-900/50 border border-green-500/50 rounded-lg text-green-200 text-sm text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg text-white bg-gray-700/50 border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
            required
            disabled={loading}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg text-white bg-gray-700/50 border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
            required
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-medium transition-all duration-200 shadow-lg ${
              loading
                ? "bg-gray-600/50 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 hover:shadow-indigo-500/40"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-4 text-center space-y-2">
          <Link to="/forgot-password" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors duration-200">
            Forgot Password?
          </Link>
          <p className="text-sm text-gray-300">
            Don’t have an account?{" "}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors duration-200">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}