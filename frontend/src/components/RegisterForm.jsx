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
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-4xl font-bold mb-6 text-center text-[#dd183b]">Register</h2>
        {message && (
          <div className="mb-4 text-red-600 text-center font-semibold">{message}</div>
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
                className="form-radio h-5 w-5 text-[#dd183b] border-2 border-gray-300 focus:ring-2 focus:ring-[#dd183b]"
              />
              <span className="text-gray-700 font-medium">Client</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="photographer"
                checked={formData.role === "photographer"}
                onChange={handleRoleChange}
                disabled={loading}
                className="form-radio h-5 w-5 text-[#dd183b] border-2 border-gray-300 focus:ring-2 focus:ring-[#dd183b]"
              />
              <span className="text-gray-700 font-medium">Photographer</span>
            </label>
          </div>

          <input
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#dd183b]"
            required
            disabled={loading}
          />
          {errors.username && (
            <p className="text-red-600 text-sm">{errors.username}</p>
          )}

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#dd183b]"
            required
            disabled={loading}
          />
          {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#dd183b]"
            required
            disabled={loading}
          />
          {errors.password && (
            <p className="text-red-600 text-sm">{errors.password}</p>
          )}

          <input
            name="password2"
            type="password"
            placeholder="Confirm Password"
            value={formData.password2}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#dd183b]"
            required
            disabled={loading}
          />
          {errors.password2 && (
            <p className="text-red-600 text-sm">{errors.password2}</p>
          )}

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className={`w-full max-w-xs py-2 rounded text-white ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#dd183b] hover:bg-red-700"
              } transition flex justify-center items-center`}
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

        <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
          <Link to="/login" className="text-[#dd183b] hover:underline">
            Already have an account? Login
          </Link>
          <Link to="/forgot-password" className="text-[#dd183b] hover:underline">
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
}
