import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/shared/ProtectedRoute';

// Landing
import Landing from './pages/Landing';

// Student
import StudentLogin   from './pages/student/StudentLogin';
import StudentSignup  from './pages/student/StudentSignup';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentGrades  from './pages/student/StudentGrades';
import StudentClasses from './pages/student/StudentClasses';
import StudentProfile from './pages/student/StudentProfile';
import StudentMessages from './pages/student/StudentMessages';

// Teacher
import TeacherLogin     from './pages/teacher/TeacherLogin';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherGrades    from './pages/teacher/TeacherGrades';
import TeacherMessages  from './pages/teacher/TeacherMessages';
import TeacherMeetings  from './pages/teacher/TeacherMeetings';

// Principal
import PrincipalLogin     from './pages/principal/PrincipalLogin';
import PrincipalDashboard from './pages/principal/PrincipalDashboard';

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public */}
                    <Route path="/"                  element={<Landing />} />
                    <Route path="/student/login"     element={<StudentLogin />} />
                    <Route path="/student/signup"    element={<StudentSignup />} />
                    <Route path="/teacher/login"     element={<TeacherLogin />} />
                    <Route path="/principal/login"   element={<PrincipalLogin />} />

                    {/* Student portal */}
                    <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
                    <Route path="/student/grades"    element={<ProtectedRoute role="student"><StudentGrades /></ProtectedRoute>} />
                    <Route path="/student/classes"   element={<ProtectedRoute role="student"><StudentClasses /></ProtectedRoute>} />
                    <Route path="/student/profile"   element={<ProtectedRoute role="student"><StudentProfile /></ProtectedRoute>} />
                    <Route path="/student/messages"  element={<ProtectedRoute role="student"><StudentMessages /></ProtectedRoute>} />

                    {/* Teacher portal */}
                    <Route path="/teacher/dashboard" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
                    <Route path="/teacher/grades"    element={<ProtectedRoute role="teacher"><TeacherGrades /></ProtectedRoute>} />
                    <Route path="/teacher/messages"  element={<ProtectedRoute role="teacher"><TeacherMessages /></ProtectedRoute>} />
                    <Route path="/teacher/meetings"  element={<ProtectedRoute role="teacher"><TeacherMeetings /></ProtectedRoute>} />

                    {/* Principal portal */}
                    <Route path="/principal/dashboard" element={<ProtectedRoute role="principal"><PrincipalDashboard /></ProtectedRoute>} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
