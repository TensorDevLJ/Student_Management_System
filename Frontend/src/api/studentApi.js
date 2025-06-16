// src/api/studentApi.js

import { generateMockStudents, generateMockContestHistory, generateMockProblemData } from '../utils/mockData';

const BASE_URL = '/api'; // This would be your backend URL (e.g., 'http://localhost:5000/api')

// Simulate network delay
const simulateDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Data Store (for demonstration until a real backend is hooked)
let currentMockStudents = generateMockStudents();

// --- Student Management APIs ---

export const getStudents = async () => {
  await simulateDelay(500); // Simulate network latency
  // In a real app:
  // const response = await fetch(`${BASE_URL}/students`);
  // if (!response.ok) throw new Error('Failed to fetch students');
  // return response.json();
  return currentMockStudents;
};

export const addStudent = async (studentData) => {
  await simulateDelay(700);
  const newStudent = {
    _id: (currentMockStudents.length + 1).toString(), // Simple ID for mock
    ...studentData,
    currentRating: 1200, // Default rating for new student
    maxRating: 1200,
    lastUpdated: new Date().toISOString(),
    reminderCount: 0
  };
  currentMockStudents.push(newStudent);
  // In a real app:
  // const response = await fetch(`${BASE_URL}/students`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(studentData),
  // });
  // if (!response.ok) throw new Error('Failed to add student');
  // return response.json(); // Returns the newly created student with its ID from DB
  return newStudent;
};

export const updateStudent = async (id, studentData) => {
  await simulateDelay(700);
  currentMockStudents = currentMockStudents.map(s =>
    s._id === id ? { ...s, ...studentData, lastUpdated: new Date().toISOString() } : s
  );
  // In a real app:
  // const response = await fetch(`${BASE_URL}/students/${id}`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(studentData),
  // });
  // if (!response.ok) throw new Error('Failed to update student');
  // return response.json(); // Returns the updated student
  return currentMockStudents.find(s => s._id === id);
};

export const deleteStudent = async (id) => {
  await simulateDelay(500);
  currentMockStudents = currentMockStudents.filter(s => s._id !== id);
  // In a real app:
  // const response = await fetch(`${BASE_URL}/students/${id}`, {
  //   method: 'DELETE',
  // });
  // if (!response.ok) throw new Error('Failed to delete student');
  // return { message: 'Student deleted successfully' };
  return { message: 'Student deleted successfully' };
};

// --- Codeforces Data APIs ---

export const getContestHistory = async (studentId, days) => {
  await simulateDelay(600);
  // In a real app:
  // const response = await fetch(`${BASE_URL}/students/${studentId}/contest-history?days=${days}`);
  // if (!response.ok) throw new Error('Failed to fetch contest history');
  // return response.json();
  const mockData = generateMockContestHistory(studentId);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  return mockData.filter(contest => new Date(contest.ratingUpdatedAt) >= cutoffDate)
                 .sort((a, b) => new Date(a.ratingUpdatedAt) - new Date(b.ratingUpdatedAt));
};

export const getProblemData = async (studentId, days) => {
  await simulateDelay(600);
  // In a real app:
  // const response = await fetch(`${BASE_URL}/students/${studentId}/problem-data?days=${days}`);
  // if (!response.ok) throw new Error('Failed to fetch problem data');
  // return response.json();
  // Mock data for problem data is generally less time-sensitive for a demo
  // but you could add filtering logic here based on `days` if your mock data allowed for it.
  return generateMockProblemData(studentId);
};

// (Optional) Configuration API for cron job schedule - not implemented in frontend demo
// export const updateSyncConfig = async (config) => { ... };