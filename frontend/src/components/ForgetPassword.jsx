import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setErrors(null);
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/accounts/password-reset/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      setLoading(false);

      if (response.ok) {
        setMessage("If an account with that email exists, a reset link has been sent.");
        setEmail("");
      } else {
        const data = await response.json();
        setErrors(data);
      }
    } catch (error) {
      setLoading(false);
      setErrors({ general: "An error occurred. Please try again." });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-[#dd183b]">Forgot Password</h2>

        {message && (
          <div className="mb-4 text-green-600 text-center font-semibold">{message}</div>
        )}

        {errors && errors.general && (
          <div className="mb-4 text-red-600 text-center font-semibold">{errors.general}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="w-full px-3 py-2 border rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#dd183b]"
          />
          {errors && errors.email && (
            <p className="text-red-600 text-sm">{errors.email}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded text-white ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#dd183b] hover:bg-red-700"
            } transition`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        <Link to="/login" className="text-[#dd183b] hover:underline">
            Remember password? Login
        </Link>
        </form>

      </div>
    </div>
  );
}
