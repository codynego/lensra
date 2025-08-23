import React from 'react';

const ToolTab = ({ icon: Icon, name, isActive, onClick, theme = 'light' }) => {
    const isDark = theme === 'dark';

    return (
        <button
            onClick={onClick}
            className={`
                px-6 py-3 
                rounded-lg 
                font-medium 
                transition-all 
                duration-200 
                flex items-center 
                gap-3
                ${isActive 
                    ? `bg-teal-600 text-white shadow-md` 
                    : isDark 
                        ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
            `}
        >
            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-600'}`} />
            <span>{name}</span>
        </button>
    );
};

export default ToolTab;