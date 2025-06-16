// src/components/StudentProfile/ContestHistoryTab.js
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatDate, getRatingColor } from '../../utils/helpers';
import * as studentApi from '../../api/studentApi'; // Import studentApi

const ContestHistoryTab = ({ studentId }) => {
  const { isDark } = useTheme();
  const [contestHistory, setContestHistory] = useState([]);
  const [filterDays, setFilterDays] = useState(365);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await studentApi.getContestHistory(studentId, filterDays);
        setContestHistory(data);
      } catch (err) {
        console.error("Error fetching contest history:", err);
        setError('Could not load contest history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [studentId, filterDays]);

  const graphData = contestHistory.map(c => ({
    name: formatDate(c.ratingUpdatedAt),
    rating: c.newRating
  }));

  if (loading) {
    return <div className="text-center py-10">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-2 text-gray-500 dark:text-gray-400">Loading contest history...</p>
    </div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end space-x-2">
        <select
          value={filterDays}
          onChange={(e) => setFilterDays(Number(e.target.value))}
          className={`px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
        >
          <option value={30}>Last 30 Days</option>
          <option value={90}>Last 90 Days</option>
          <option value={365}>Last 365 Days</option>
        </select>
      </div>

      <div className={`${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} p-5 rounded-xl shadow-md`}>
        <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2 text-blue-600 dark:text-blue-400">
          <TrendingUp size={20} /> <span>Rating History</span>
        </h3>
        {contestHistory.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={graphData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#4A5568' : '#E2E8F0'} />
              <XAxis dataKey="name" tickFormatter={(tick) => {
                const date = new Date(tick);
                return date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear()
                       ? date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
                       : date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
              }} style={{ fontSize: '0.75rem' }} />
              <YAxis domain={['dataMin - 100', 'dataMax + 100']} style={{ fontSize: '0.75rem' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#374151' : '#FFFFFF',
                  borderColor: isDark ? '#4B5563' : '#E5E7EB',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
                labelStyle={{ color: isDark ? '#D1D5DB' : '#4B5563' }}
                itemStyle={{ color: isDark ? '#D1D5DB' : '#4B5563' }}
                formatter={(value, name) => [`Rating: ${value}`, name]}
              />
              <Line type="monotone" dataKey="rating" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-10">No contest history available for the selected period.</p>
        )}
      </div>

      <div className={`${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} p-5 rounded-xl shadow-md`}>
        <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2 text-purple-600 dark:text-purple-400">
          <Calendar size={20} /> <span>Recent Contests</span>
        </h3>
        {contestHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className={`${isDark ? 'bg-gray-600' : 'bg-gray-50'}`}>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contest Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rank</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Old Rating</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">New Rating</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Unsolved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {contestHistory.map((contest, index) => (
                  <tr key={index} className={`${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                      <a href={`https://codeforces.com/contest/${contest.contestId}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {contest.contestName}
                      </a>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">{contest.rank}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">{contest.oldRating}</td>
                    <td className={`px-4 py-2 whitespace-nowrap text-sm font-semibold ${getRatingColor(contest.newRating)}`}>
                      {contest.newRating} <span className="ml-1 text-xs opacity-70">({contest.newRating - contest.oldRating > 0 ? '+' : ''}{contest.newRating - contest.oldRating})</span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">{formatDate(contest.ratingUpdatedAt)}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">{contest.unsolvedProblems}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">No recent contests found.</p>
        )}
      </div>
    </div>
  );
};

export default ContestHistoryTab;