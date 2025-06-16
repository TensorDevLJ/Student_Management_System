// src/utils/mockData.js

export const generateMockStudents = () => [
  {
    _id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phoneNumber: '+1-555-0123',
    codeforcesHandle: 'alice_codes',
    currentRating: 1547,
    maxRating: 1650,
    lastUpdated: new Date().toISOString(),
    reminderCount: 2,
    disableEmail: false
  },
  {
    _id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    phoneNumber: '+1-555-0124',
    codeforcesHandle: 'bob_solver',
    currentRating: 1234,
    maxRating: 1400,
    lastUpdated: new Date(Date.now() - 86400000).toISOString(),
    reminderCount: 0,
    disableEmail: false
  },
  {
    _id: '3',
    name: 'Carol Davis',
    email: 'carol@example.com',
    phoneNumber: '+1-555-0125',
    codeforcesHandle: 'carol_dev',
    currentRating: 1789,
    maxRating: 1850,
    lastUpdated: new Date(Date.now() - 172800000).toISOString(),
    reminderCount: 1,
    disableEmail: true
  },
  {
    _id: '4',
    name: 'David Wilson',
    email: 'david@example.com',
    phoneNumber: '+1-555-0126',
    codeforcesHandle: 'david_cp',
    currentRating: 2150,
    maxRating: 2200,
    lastUpdated: new Date(Date.now() - 43200000).toISOString(),
    reminderCount: 0,
    disableEmail: false
  },
  {
    _id: '5',
    name: 'Eve Brown',
    email: 'eve@example.com',
    phoneNumber: '+1-555-0127',
    codeforcesHandle: 'eve_coding',
    currentRating: 950,
    maxRating: 1100,
    lastUpdated: new Date(Date.now() - 259200000).toISOString(),
    reminderCount: 3,
    disableEmail: false
  }
];

export const generateMockContestHistory = (studentId) => [
  {
    contestId: 1851,
    contestName: 'Codeforces Round #850 (Div. 2)',
    rank: 145,
    oldRating: 1500,
    newRating: 1547,
    ratingUpdatedAt: new Date('2024-01-15').toISOString(),
    unsolvedProblems: 2
  },
  {
    contestId: 1849,
    contestName: 'Educational Codeforces Round #162',
    rank: 89,
    oldRating: 1450,
    newRating: 1500,
    ratingUpdatedAt: new Date('2024-01-10').toISOString(),
    unsolvedProblems: 1
  },
  {
    contestId: 1848,
    contestName: 'Codeforces Round #851 (Div. 2)',
    rank: 234,
    oldRating: 1400,
    newRating: 1450,
    ratingUpdatedAt: new Date('2024-01-05').toISOString(),
    unsolvedProblems: 3
  },
  {
    contestId: 1847,
    contestName: 'Codeforces Round #849 (Div. 1)',
    rank: 567,
    oldRating: 1450,
    newRating: 1400,
    ratingUpdatedAt: new Date('2023-12-28').toISOString(),
    unsolvedProblems: 4
  },
  {
    contestId: 1846,
    contestName: 'Codeforces Round #848 (Div. 2)',
    rank: 123,
    oldRating: 1380,
    newRating: 1450,
    ratingUpdatedAt: new Date('2023-12-20').toISOString(),
    unsolvedProblems: 2
  }
];

export const generateMockProblemData = (studentId) => {
  const generateHeatmapData = () => {
    const data = [];
    const today = new Date();
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 6)
      });
    }
    return data;
  };

  return {
    mostDifficultProblem: {
      name: 'Tree Queries and Updates',
      rating: 1800,
      contestId: 1851,
      index: 'D'
    },
    totalProblems: 45,
    averageRating: 1350,
    averagePerDay: 2.1,
    ratingDistribution: [
      { range: '800-1000', count: 12 },
      { range: '1000-1200', count: 15 },
      { range: '1200-1400', count: 10 },
      { range: '1400-1600', count: 6 },
      { range: '1600+', count: 2 }
    ],
    submissionHeatmap: generateHeatmapData(),
    recentSubmissions: [
      {
        problemName: 'Binary Search',
        rating: 1200,
        verdict: 'OK',
        submissionTime: new Date(Date.now() - 3600000).toISOString()
      },
      {
        problemName: 'Graph Traversal',
        rating: 1400,
        verdict: 'WRONG_ANSWER',
        submissionTime: new Date(Date.now() - 7200000).toISOString()
      },
      {
        problemName: 'Dynamic Programming',
        rating: 1600,
        verdict: 'OK',
        submissionTime: new Date(Date.now() - 10800000).toISOString()
      }
    ]
  };
};