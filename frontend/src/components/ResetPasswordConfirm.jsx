import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ResetPasswordConfirm() {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    password2: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage(null);
    setLoading(true);

    if (formData.password !== formData.password2) {
      setErrors({ password2: "Passwords do not match." });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/accounts/password-reset-confirm/${uidb64}/${token}/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            password: formData.password,
            password2: formData.password2,
          }),
        }
      );

      setLoading(false);

      if (response.ok) {
        setMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        const data = await response.json();
        setErrors(data);
      }
    } catch {
      setMessage("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#dd183b]">Reset Password</h2>

        {message && (
          <div className="mb-4 text-green-600 text-center font-semibold">{message}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="password"
            name="password"
            placeholder="New Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#dd183b]"
            disabled={loading}
            required
          />
          {errors.password && (
            <p className="text-red-600 text-sm">{errors.password}</p>
          )}

          <input
            type="password"
            name="password2"
            placeholder="Confirm New Password"
            value={formData.password2}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#dd183b]"
            disabled={loading}
            required
          />
          {errors.password2 && (
            <p className="text-red-600 text-sm">{errors.password2}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded text-white ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#dd183b] hover:bg-red-700"
            } transition`}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
