// src/components/StatsCards.js
import React from 'react';
import { User, Activity, Award, TrendingUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const StatsCards = ({ students }) => {
  const { isDark } = useTheme();
  
  const stats = {
    total: students.length,
    active: students.filter(s => new Date() - new Date(s.lastUpdated) < 7 * 24 * 60 * 60 * 1000).length,
    highRated: students.filter(s => s.currentRating >= 1600).length,
    avgRating: Math.round(students.reduce((sum, s) => sum + s.currentRating, 0) / students.length) || 0
  };

  const cards = [
    {
      title: 'Total Students',
      value: stats.total,
      icon: User,
      color: 'blue',
      subtitle: 'Registered'
    },
    {
      title: 'Active Students',
      value: stats.active,
      icon: Activity,
      color: 'green',
      subtitle: 'Last 7 days'
    },
    {
      title: 'High Rated',
      value: stats.highRated,
      icon: Award,
      color: 'purple',
      subtitle: 'Rating ≥ 1600'
    },
    {
      title: 'Average Rating',
      value: stats.avgRating,
      icon: TrendingUp,
      color: 'orange',
      subtitle: 'All students'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600'
    };
    return colors[color];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div key={index} className={`${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } rounded-xl p-6 border shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-70 mb-1">{card.title}</p>
              <p className="text-3xl font-bold">{card.value}</p>
              <p className="text-xs opacity-60 mt-1">{card.subtitle}</p>
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-r ${getColorClasses(card.color)}`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;