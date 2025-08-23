import React from 'react';
import { Sparkles } from 'lucide-react';

const AiEnhancer = ({ theme = 'light', onClose }) => {
  const isDark = theme === 'dark';

  return (
    <div
      className={`rounded-xl p-6 ${
        isDark
          ? 'bg-gray-800/60 backdrop-blur-sm border border-gray-700/50'
          : 'bg-white/60 backdrop-blur-sm border border-gray-200/50'
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-coral-500 to-teal-500 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            AI Enhancer
          </h2>
        </div>
        <button
          onClick={onClose}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isDark
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          Back to Dashboard
        </button>
      </div>
      <div
        className={`h-96 rounded-lg border-2 border-dashed ${
          isDark ? 'border-gray-600' : 'border-gray-300'
        } flex items-center justify-center`}
      >
        <div className="text-center">
          <Sparkles className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-coral-400' : 'text-coral-500'}`} />
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            AI Enhancer interface will be loaded here
          </p>
        </div>
      </div>

      <style jsx>{`
        :root {
          --teal-500: #0D9488;
          --coral-500: #F43F5E;
          --amber-500: #F59E0B;
          --gray-900: #111827;
          --gray-50: #F9FAFB;
          --gray-200: #E5E7EB;
        }
      `}</style>
    </div>
  );
};

export default AiEnhancer;