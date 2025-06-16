// src/components/StudentProfile.js
import React, { useState } from 'react';
import { User, Mail, Phone, Clock, ArrowLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { getTimeAgo, getRatingColor, getRatingBadgeColor, getRatingTitle } from '../utils/helpers';
import ContestHistoryTab from './StudentProfile/ContestHistoryTab';
import ProblemSolvingDataTab from './StudentProfile/ProblemSolvingDataTab';

const StudentProfile = ({ student, onBack }) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('contestHistory');

  if (!student) {
    return <div className="text-center py-10">No student selected.</div>;
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <button
        onClick={onBack}
        className={`mb-6 flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
          isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
        }`}
      >
        <ArrowLeft size={18} />
        <span>Back to Students</span>
      </button>

      <div className={`${
        isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
      } rounded-xl shadow-lg p-6 mb-8`}>
        <div className="flex items-center space-x-6">
          <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
            <User className="h-10 w-10 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold flex items-center space-x-2">
              <span>{student.name}</span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRatingBadgeColor(student.currentRating)}`}>
                {student.currentRating} ({getRatingTitle(student.currentRating)})
              </span>
            </h2>
            <p className="text-lg opacity-80 mt-1">@{student.codeforcesHandle}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm opacity-70">
              <span className="flex items-center space-x-1"><Mail size={16} /> {student.email}</span>
              {student.phoneNumber && <span className="flex items-center space-x-1"><Phone size={16} /> {student.phoneNumber}</span>}
              <span className="flex items-center space-x-1"><Clock size={16} /> Last Updated: {getTimeAgo(student.lastUpdated)}</span>
            </div>
            <p className="text-sm opacity-70 mt-2">Max Rating: <span className={`font-semibold ${getRatingColor(student.maxRating)}`}>{student.maxRating}</span></p>
          </div>
        </div>
      </div>

      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab('contestHistory')}
              className={`px-5 py-2 text-lg font-medium rounded-lg transition-colors ${
                activeTab === 'contestHistory'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Contest History
            </button>
            <button
              onClick={() => setActiveTab('problemSolvingData')}
              className={`px-5 py-2 text-lg font-medium rounded-lg transition-colors ${
                activeTab === 'problemSolvingData'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Problem Solving Data
            </button>
          </nav>
        </div>
        <div className="p-6">
          {activeTab === 'contestHistory' && <ContestHistoryTab studentId={student._id} />}
          {activeTab === 'problemSolvingData' && <ProblemSolvingDataTab studentId={student._id} />}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;