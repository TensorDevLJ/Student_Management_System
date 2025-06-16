// src/hooks/useStudents.js

import { useState, useEffect, useCallback } from 'react';
import * as studentApi from '../api/studentApi'; // Import all functions from studentApi

const useStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await studentApi.getStudents();
      setStudents(data);
    } catch (err) {
      console.error("Failed to fetch students:", err);
      setError('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]); // Depend on fetchStudents to ensure it re-runs if memoization breaks (though useCallback prevents this)

  const addStudent = async (studentData) => {
    setLoading(true);
    setError(null);
    try {
      const newStudent = await studentApi.addStudent(studentData);
      setStudents(prevStudents => [...prevStudents, newStudent]);
      return true; // Indicate success
    } catch (err) {
      console.error("Failed to add student:", err);
      setError('Failed to add student. Please check inputs.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateStudent = async (id, studentData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await studentApi.updateStudent(id, studentData);
      setStudents(prevStudents =>
        prevStudents.map(s => (s._id === id ? updated : s))
      );
      return true;
    } catch (err) {
      console.error("Failed to update student:", err);
      setError('Failed to update student. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteStudent = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await studentApi.deleteStudent(id);
      setStudents(prevStudents => prevStudents.filter(s => s._id !== id));
      return true;
    } catch (err) {
      console.error("Failed to delete student:", err);
      setError('Failed to delete student. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    students,
    loading,
    error,
    fetchStudents, // Allow refetching if needed
    addStudent,
    updateStudent,
    deleteStudent,
  };
};

export default useStudents;