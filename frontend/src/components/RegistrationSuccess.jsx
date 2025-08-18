import React from "react";
import { Link } from "react-router-dom";

export default function RegistrationSuccess() {
  const BRAND_COLOR = '#6366f1';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900 p-4">
      <div className="max-w-md bg-gray-800/50 p-8 rounded-2xl shadow-lg border border-gray-700/50 backdrop-blur-sm text-center">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Registration Successful!
        </h2>
        <p className="text-gray-300 mb-6">
          Please check your email to activate your account.
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-2 rounded-lg text-white font-medium bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-indigo-500/40"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}