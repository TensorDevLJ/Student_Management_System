// src/components/StudentProfile/ProblemSolvingDataTab.js
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Star, Target, Award, Clock } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { getTimeAgo } from '../../utils/helpers';
import * as studentApi from '../../api/studentApi'; // Import studentApi

const ProblemSolvingDataTab = ({ studentId }) => {
  const { isDark } = useTheme();
  const [problemData, setProblemData] = useState(null);
  const [filterDays, setFilterDays] = useState(90);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await studentApi.getProblemData(studentId, filterDays);
        setProblemData(data);
      } catch (err) {
        console.error("Error fetching problem data:", err);
        setError('Could not load problem data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [studentId, filterDays]);

  if (loading) {
    return <div className="text-center py-10">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-2 text-gray-500 dark:text-gray-400">Loading problem data...</p>
    </div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  const { mostDifficultProblem, totalProblems, averageRating, averagePerDay, ratingDistribution, submissionHeatmap, recentSubmissions } = problemData;

  const getHeatmapColor = (count) => {
    if (count === 0) return 'bg-gray-200 dark:bg-gray-700';
    if (count === 1) return 'bg-green-200 dark:bg-green-800';
    if (count === 2) return 'bg-green-300 dark:bg-green-700';
    if (count === 3) return 'bg-green-400 dark:bg-green-600';
    if (count >= 4) return 'bg-green-500 dark:bg-green-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end space-x-2">
        <select
          value={filterDays}
          onChange={(e) => setFilterDays(Number(e.target.value))}
          className={`px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
        >
          <option value={7}>Last 7 Days</option>
          <option value={30}>Last 30 Days</option>
          <option value={90}>Last 90 Days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} p-5 rounded-xl shadow-md flex items-center space-x-4`}>
          <div className="p-3 bg-blue-100 rounded-lg dark:bg-blue-900">
            <Star size={24} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm opacity-70">Most Difficult Solved</p>
            <p className="font-semibold text-lg">{mostDifficultProblem.name} ({mostDifficultProblem.rating})</p>
          </div>
        </div>
        <div className={`${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} p-5 rounded-xl shadow-md flex items-center space-x-4`}>
          <div className="p-3 bg-green-100 rounded-lg dark:bg-green-900">
            <Target size={24} className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm opacity-70">Total Problems Solved</p>
            <p className="font-semibold text-lg">{totalProblems}</p>
          </div>
        </div>
        <div className={`${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} p-5 rounded-xl shadow-md flex items-center space-x-4`}>
          <div className="p-3 bg-orange-100 rounded-lg dark:bg-orange-900">
            <Award size={24} className="text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-sm opacity-70">Average Problem Rating</p>
            <p className="font-semibold text-lg">{averageRating}</p>
          </div>
        </div>
        <div className={`${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} p-5 rounded-xl shadow-md flex items-center space-x-4`}>
          <div className="p-3 bg-purple-100 rounded-lg dark:bg-purple-900">
            <Clock size={24} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm opacity-70">Avg. Problems per Day</p>
            <p className="font-semibold text-lg">{averagePerDay}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} p-5 rounded-xl shadow-md`}>
          <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
            <BarChart size={20} /> <span>Problems Solved by Rating</span>
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ratingDistribution} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#4A5568' : '#E2E8F0'} />
              <XAxis dataKey="range" style={{ fontSize: '0.75rem' }} />
              <YAxis allowDecimals={false} style={{ fontSize: '0.75rem' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#374151' : '#FFFFFF',
                  borderColor: isDark ? '#4B5563' : '#E5E7EB',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
                labelStyle={{ color: isDark ? '#D1D5DB' : '#4B5563' }}
                itemStyle={{ color: isDark ? '#D1D5DB' : '#4B5563' }}
              />
              <Bar dataKey="count" fill="#82ca9d" barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={`${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} p-5 rounded-xl shadow-md`}>
          <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2 text-teal-600 dark:text-teal-400">
            <Calendar size={20} /> <span>Submission Heatmap</span>
          </h3>
          <div className="grid grid-cols-auto-fill-minmax-16 gap-1 mt-4">
            {submissionHeatmap.map((day, index) => (
              <div
                key={index}
                title={`${day.date}: ${day.count} submissions`}
                className={`${getHeatmapColor(day.count)} w-4 h-4 rounded-sm transition-colors duration-100`}
              ></div>
            ))}
          </div>
          <p className="text-right text-xs opacity-60 mt-3">Less <span className={`${getHeatmapColor(0)} inline-block w-3 h-3 rounded-sm`}></span> <span className={`${getHeatmapColor(1)} inline-block w-3 h-3 rounded-sm`}></span> <span className={`${getHeatmapColor(2)} inline-block w-3 h-3 rounded-sm`}></span> <span className={`${getHeatmapColor(3)} inline-block w-3 h-3 rounded-sm`}></span> <span className={`${getHeatmapColor(4)} inline-block w-3 h-3 rounded-sm`}></span> More</p>
        </div>
      </div>
       <div className={`${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} p-5 rounded-xl shadow-md`}>
        <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2 text-rose-600 dark:text-rose-400">
          <Clock size={20} /> <span>Recent Submissions</span>
        </h3>
        {recentSubmissions.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-600">
            {recentSubmissions.map((sub, index) => (
              <li key={index} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">{sub.problemName} <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: `rgba(130, 202, 157, 0.2)`, color: '#82ca9d' }}>{sub.rating}</span></p>
                  <p className={`text-sm ${sub.verdict === 'OK' ? 'text-green-500' : 'text-red-500'}`}>{sub.verdict}</p>
                </div>
                <span className="text-sm opacity-70">{getTimeAgo(sub.submissionTime)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">No recent submissions.</p>
        )}
      </div>
    </div>
  );
};

export default ProblemSolvingDataTab;