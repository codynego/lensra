import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterForm() {
  const navigate = useNavigate();

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

  const BRAND_COLOR = '#6366f1';

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRoleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      role: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setErrors({});
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900 p-4">
      <div className="w-full max-w-md p-6 bg-gray-800/50 rounded-2xl shadow-lg border border-gray-700/50 backdrop-blur-sm">
        <h2 className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Register
        </h2>
        {message && (
          <div className="mb-4 p-3 text-red-200 text-center font-semibold bg-red-900/50 border border-red-500/50 rounded-lg">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-8 mb-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="client"
                checked={formData.role === "client"}
                onChange={handleRoleChange}
                disabled={loading}
                className="form-radio h-5 w-5 text-indigo-500 border-2 border-gray-600 focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-gray-300 font-medium">Client</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="photographer"
                checked={formData.role === "photographer"}
                onChange={handleRoleChange}
                disabled={loading}
                className="form-radio h-5 w-5 text-indigo-500 border-2 border-gray-600 focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-gray-300 font-medium">Photographer</span>
            </label>
          </div>
          {errors.role && (
            <p className="text-red-200 text-sm text-center">{errors.role}</p>
          )}

          <input
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg text-white bg-gray-700/50 border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
            required
            disabled={loading}
          />
          {errors.username && (
            <p className="text-red-200 text-sm">{errors.username}</p>
          )}

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg text-white bg-gray-700/50 border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
            required
            disabled={loading}
          />
          {errors.email && <p className="text-red-200 text-sm">{errors.email}</p>}

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg text-white bg-gray-700/50 border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
            required
            disabled={loading}
          />
          {errors.password && (
            <p className="text-red-200 text-sm">{errors.password}</p>
          )}

          <input
            name="password2"
            type="password"
            placeholder="Confirm Password"
            value={formData.password2}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg text-white bg-gray-700/50 border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
            required
            disabled={loading}
          />
          {errors.password2 && (
            <p className="text-red-200 text-sm">{errors.password2}</p>
          )}

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className={`w-full max-w-xs py-2 rounded-lg text-white font-medium transition-all duration-200 shadow-lg ${
                loading
                  ? "bg-gray-600/50 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 hover:shadow-indigo-500/40"
              } flex justify-center items-center`}
            >
              {loading && (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              {loading ? "Registering..." : "Register"}
            </button>
          </div>
        </form>

        <div className="flex justify-between items-center mt-6 text-sm text-gray-300">
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors duration-200">
            Already have an account? Login
          </Link>
          <Link to="/forgot-password" className="text-indigo-400 hover:text-indigo-300 transition-colors duration-200">
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
}