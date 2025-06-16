// src/components/StudentTable.js
import React, { useState } from 'react';
import { User, Eye, EyeOff, X, Plus, Edit, Trash2, Download, Calendar, TrendingUp, Award, Target, BarChart3, Activity, Clock, Star, ArrowLeft, Filter, Search } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { formatDate, getTimeAgo, getRatingColor, getRatingBadgeColor, getRatingTitle } from '../utils/helpers';

const StudentTable = ({ students, onEdit, onDelete, onViewProfile, onAddStudent }) => {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.codeforcesHandle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    if (sortBy === 'name' || sortBy === 'email' || sortBy === 'codeforcesHandle') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Codeforces Handle', 'Current Rating', 'Max Rating', 'Last Updated', 'Reminder Count', 'Emails Disabled'];
    const csvContent = [
      headers.join(','),
      ...students.map(student => [
        `"${student.name}"`,
        `"${student.email}"`,
        `"${student.phoneNumber || ''}"`,
        `"${student.codeforcesHandle}"`,
        student.currentRating,
        student.maxRating,
        `"${formatDate(student.lastUpdated)}"`,
        student.reminderCount,
        student.disableEmail ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `students_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const SortIndicator = ({ field }) => {
    if (sortBy === field) {
      return sortOrder === 'asc' ? ' ↑' : ' ↓';
    }
    return null;
  };

  return (
    <div className={`${
      isDark ? 'bg-gray-800' : 'bg-white'
    } rounded-xl shadow-lg overflow-hidden`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-2xl font-bold flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <span>Students Overview</span>
            </h2>
            <p className="text-sm opacity-70 mt-1">
              {sortedStudents.length} of {students.length} students
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-40" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64 transition-all ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
            
            <button
              onClick={exportToCSV}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105"
            >
              <Download size={16} />
              <span>Export CSV</span>
            </button>
            
            <button
              onClick={onAddStudent}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              <Plus size={16} />
              <span>Add Student</span>
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <tr>
              {[
                { key: 'name', label: 'Student' },
                { key: 'codeforcesHandle', label: 'Handle' },
                { key: 'currentRating', label: 'Rating' },
                { key: 'maxRating', label: 'Max Rating' },
                { key: 'lastUpdated', label: 'Last Updated' },
                { key: 'reminderCount', label: 'Reminders' },
                { key: 'disableEmail', label: 'Emails' },
                { key: 'actions', label: 'Actions' }
              ].map(col => (
                <th
                  key={col.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => col.key !== 'actions' && handleSort(col.key)}
                >
                  <div className="flex items-center">
                    {col.label}
                    <SortIndicator field={col.key} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`${isDark ? 'divide-gray-700' : 'divide-gray-200'} divide-y`}>
            {sortedStudents.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No students found.
                </td>
              </tr>
            ) : (
              sortedStudents.map((student) => (
                <tr key={student._id} className={`${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-base font-semibold">{student.name}</p>
                        <p className="text-xs opacity-70">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600 dark:text-blue-400">
                    <a href={`https://codeforces.com/profile/${student.codeforcesHandle}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {student.codeforcesHandle}
                    </a>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getRatingColor(student.currentRating)}`}>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRatingBadgeColor(student.currentRating)}`}>
                      {student.currentRating} ({getRatingTitle(student.currentRating)})
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getRatingColor(student.maxRating)}`}>
                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRatingBadgeColor(student.maxRating)}`}>
                       {student.maxRating}
                     </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm opacity-80">
                    <div className="flex items-center space-x-1">
                      <Clock size={14} className="opacity-60" />
                      <span>{getTimeAgo(student.lastUpdated)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      student.reminderCount > 0 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {student.reminderCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {student.disableEmail ? (
                      <EyeOff className="h-5 w-5 text-gray-400" title="Email disabled" />
                    ) : (
                      <Eye className="h-5 w-5 text-green-500" title="Email enabled" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => onViewProfile(student)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="View Profile"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => onEdit(student)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Edit Student"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => onDelete(student._id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Delete Student"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentTable;