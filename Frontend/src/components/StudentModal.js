// src/components/StudentModal.js
import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Code, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const StudentModal = ({ isOpen, onClose, student, onSave, loading = false }) => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    codeforcesHandle: '',
    disableEmail: false
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        email: student.email || '',
        phoneNumber: student.phoneNumber || '',
        codeforcesHandle: student.codeforcesHandle || '',
        disableEmail: student.disableEmail || false
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phoneNumber: '',
        codeforcesHandle: '',
        disableEmail: false
      });
    }
    setErrors({});
  }, [student, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.codeforcesHandle.trim()) {
      newErrors.codeforcesHandle = 'Codeforces handle is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${
        isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
      } rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-100`}>
        
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <span>{student ? 'Edit Student' : 'Add New Student'}</span>
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
              <User size={16} />
              <span>Full Name *</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${
                isDark ? 'bg-gray-700 border-gray-600 text-white focus:bg-gray-600' : 'bg-white border-gray-300 focus:bg-gray-50'
              } ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Enter student's full name"
              disabled={loading}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
              <Mail size={16} />
              <span>Email Address *</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${
                isDark ? 'bg-gray-700 border-gray-600 text-white focus:bg-gray-600' : 'bg-white border-gray-300 focus:bg-gray-50'
              } ${errors.email ? 'border-red-500' : ''}`}
              placeholder="Enter email address"
              disabled={loading}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
              <Phone size={16} />
              <span>Phone Number</span>
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${
                isDark ? 'bg-gray-700 border-gray-600 text-white focus:bg-gray-600' : 'bg-white border-gray-300 focus:bg-gray-50'
              }`}
              placeholder="Enter phone number"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
              <Code size={16} />
              <span>Codeforces Handle *</span>
            </label>
            <input
              type="text"
              value={formData.codeforcesHandle}
              onChange={(e) => handleInputChange('codeforcesHandle', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-mono ${
                isDark ? 'bg-gray-700 border-gray-600 text-white focus:bg-gray-600' : 'bg-white border-gray-300 focus:bg-gray-50'
              } ${errors.codeforcesHandle ? 'border-red-500' : ''}`}
              placeholder="Enter Codeforces handle"
              disabled={loading}
            />
            {errors.codeforcesHandle && <p className="text-red-500 text-sm mt-1">{errors.codeforcesHandle}</p>}
          </div>

          <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <input
              type="checkbox"
              id="disableEmail"
              checked={formData.disableEmail}
              onChange={(e) => handleInputChange('disableEmail', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={loading}
            />
            <label htmlFor="disableEmail" className="text-sm flex items-center space-x-2">
              <Mail size={16} className="opacity-70" />
              <span>Disable email notifications</span>
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-3 border-2 rounded-xl font-medium transition-all ${
                isDark
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
              }`}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 transform hover:scale-105"
              disabled={loading}
            >
              {loading ? 'Saving...' : (student ? 'Update' : 'Add')} Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentModal;