// src/utils/helpers.js

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const getTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 }
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count > 0) {
      return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
    }
  }

  return 'Just now';
};

export const getRatingColor = (rating) => {
  if (rating >= 2100) return 'text-red-600 dark:text-red-400';
  if (rating >= 1900) return 'text-orange-600 dark:text-orange-400';
  if (rating >= 1600) return 'text-purple-600 dark:text-purple-400';
  if (rating >= 1400) return 'text-blue-600 dark:text-blue-400';
  if (rating >= 1200) return 'text-green-600 dark:text-green-400';
  return 'text-gray-600 dark:text-gray-400';
};

export const getRatingBadgeColor = (rating) => {
  if (rating >= 2100) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  if (rating >= 1900) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
  if (rating >= 1600) return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
  if (rating >= 1400) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  if (rating >= 1200) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
};

export const getRatingTitle = (rating) => {
  if (rating >= 2100) return 'International Master';
  if (rating >= 1900) return 'Candidate Master';
  if (rating >= 1600) return 'Expert';
  if (rating >= 1400) return 'Specialist';
  if (rating >= 1200) return 'Pupil';
  return 'Newbie';
};