import React from 'react';

const AiToolSetup = ({ theme = 'light' }) => {
  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
        isDark
          ? 'bg-gradient-to-br from-gray-900 via-indigo-900 to-blue-900'
          : 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100'
      }`}
    >
      <div
        className={`relative max-w-lg w-full rounded-2xl shadow-2xl p-8 text-center transition-all duration-500 hover:shadow-3xl ${
          isDark ? 'bg-gray-800/80 backdrop-blur-lg border border-gray-700/50' : 'bg-white/80 backdrop-blur-lg border border-gray-200/50'
        }`}
      >
        {/* Decorative Floating Elements */}
        <div
          className={`absolute -top-4 -left-4 w-12 h-12 rounded-full animate-pulse ${
            isDark ? 'bg-indigo-600/30' : 'bg-indigo-200/30'
          }`}
        />
        <div
          className={`absolute -bottom-4 -right-4 w-16 h-16 rounded-full animate-pulse delay-200 ${
            isDark ? 'bg-blue-600/30' : 'bg-blue-200/30'
          }`}
        />

        {/* Header */}
        <h2
          className={`text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r ${
            isDark ? 'from-indigo-400 to-blue-300' : 'from-indigo-600 to-blue-500'
          }`}
        >
          AI Tool Setup
        </h2>

        {/* Coming Soon Message */}
        <p
          className={`text-lg mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
        >
          Get ready! Our cutting-edge AI tool setup is coming soon. Stay tuned for a seamless and powerful experience.
        </p>

        {/* Placeholder Icon */}
        <div className="mb-6">
          <svg
            className={`w-16 h-16 mx-auto animate-spin-slow ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
        </div>

        {/* Call to Action */}
        <p
          className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
        >
          We're working hard to bring you the best AI setup experience. Check back soon!
        </p>
      </div>

      {/* Custom Animation for Spin */}
      <style jsx>{`
        @keyframes spin-slow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AiToolSetup;