// src/App.js
import React, { useState } from 'react';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import StudentModal from './components/StudentModal';
import StudentTable from './components/StudentTable';
import StudentProfile from './components/StudentProfile';
import { useTheme } from './contexts/ThemeContext';
import useStudents from './hooks/useStudents'; // Import the custom hook

const App = () => {
  const { students, loading, error, addStudent, updateStudent, deleteStudent } = useStudents(); // Use the custom hook

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const { isDark } = useTheme();

  const handleAddStudent = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleSaveStudent = async (formData) => {
    let success;
    if (editingStudent) {
      success = await updateStudent(editingStudent._id, formData);
    } else {
      success = await addStudent(formData);
    }
    if (success) {
      setIsModalOpen(false);
    }
    // Error state is handled within useStudents hook and can be displayed if needed
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      await deleteStudent(studentId);
    }
  };

  const handleViewProfile = (student) => {
    setViewingStudent(student);
  };

  const handleBackToTable = () => {
    setViewingStudent(null);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'} transition-colors duration-300`}>
      <Header studentsCount={students.length} />
      <main className="container mx-auto px-6 py-8">
        {viewingStudent ? (
          <StudentProfile student={viewingStudent} onBack={handleBackToTable} />
        ) : (
          <>
            <StatsCards students={students} />
            {loading && !isModalOpen ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4">Loading student data...</p>
              </div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">
                <p>{error}</p>
              </div>
            ) : (
              <StudentTable
                students={students}
                onAddStudent={handleAddStudent}
                onEdit={handleEditStudent}
                onDelete={handleDeleteStudent}
                onViewProfile={handleViewProfile}
              />
            )}
          </>
        )}
      </main>

      <StudentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingStudent(null);
        }}
        student={editingStudent}
        onSave={handleSaveStudent}
        loading={loading} // Pass loading prop to disable modal buttons
      />
    </div>
  );
};

export default App;