// src/components/Header.js
import React from 'react';
import { Code, Moon, Sun, Activity } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Header = ({ studentsCount }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className={`${
      isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-200'
    } shadow-lg border-b transition-colors duration-300`}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
              <Code className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Student Progress Management
              </h1>
              <p className="text-sm opacity-70 mt-1">
                Codeforces Progress Tracking System • {studentsCount} Students
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm opacity-70">
              <Activity className="h-4 w-4" />
              <span>Live Tracking</span>
            </div>
            
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;