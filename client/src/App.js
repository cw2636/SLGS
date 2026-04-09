import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/shared/ThemeToggle';
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
import StudentFinance    from './pages/student/StudentFinance';
import StudentCourseList from './pages/student/StudentCourseList';
import StudentCourse     from './pages/student/StudentCourse';

// Teacher
import TeacherLogin       from './pages/teacher/TeacherLogin';
import TeacherDashboard   from './pages/teacher/TeacherDashboard';
import TeacherGrades      from './pages/teacher/TeacherGrades';
import TeacherMessages    from './pages/teacher/TeacherMessages';
import TeacherMeetings    from './pages/teacher/TeacherMeetings';
import TeacherCourseList  from './pages/teacher/TeacherCourseList';
import TeacherCourse      from './pages/teacher/TeacherCourse';

// Academic Staff
import StaffLogin     from './pages/staff/StaffLogin';
import StaffDashboard from './pages/staff/StaffDashboard';

// IT Content Manager
import ITLogin     from './pages/it/ITLogin';
import ITDashboard from './pages/it/ITDashboard';

// Principal
import PrincipalLogin         from './pages/principal/PrincipalLogin';
import PrincipalDashboard     from './pages/principal/PrincipalDashboard';
import PrincipalStudents      from './pages/principal/PrincipalStudents';
import PrincipalTeachers      from './pages/principal/PrincipalTeachers';
import PrincipalReports       from './pages/principal/PrincipalReports';
import PrincipalAnnouncements from './pages/principal/PrincipalAnnouncements';

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Public */}
                        <Route path="/"                  element={<Landing />} />
                        <Route path="/student/login"     element={<StudentLogin />} />
                        <Route path="/student/signup"    element={<StudentSignup />} />
                        <Route path="/teacher/login"     element={<TeacherLogin />} />
                        <Route path="/staff/login"       element={<StaffLogin />} />
                        <Route path="/principal/login"   element={<PrincipalLogin />} />
                        <Route path="/it/login"          element={<ITLogin />} />

                        {/* Student portal */}
                        <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
                        <Route path="/student/grades"    element={<ProtectedRoute role="student"><StudentGrades /></ProtectedRoute>} />
                        <Route path="/student/classes"   element={<ProtectedRoute role="student"><StudentClasses /></ProtectedRoute>} />
                        <Route path="/student/profile"   element={<ProtectedRoute role="student"><StudentProfile /></ProtectedRoute>} />
                        <Route path="/student/messages"  element={<ProtectedRoute role="student"><StudentMessages /></ProtectedRoute>} />
                        <Route path="/student/finance"   element={<ProtectedRoute role="student"><StudentFinance /></ProtectedRoute>} />
                        <Route path="/student/courses"   element={<ProtectedRoute role="student"><StudentCourseList /></ProtectedRoute>} />
                        <Route path="/student/courses/:courseId" element={<ProtectedRoute role="student"><StudentCourse /></ProtectedRoute>} />

                        {/* Teacher portal */}
                        <Route path="/teacher/dashboard" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
                        <Route path="/teacher/courses"   element={<ProtectedRoute role="teacher"><TeacherCourseList /></ProtectedRoute>} />
                        <Route path="/teacher/courses/:courseId" element={<ProtectedRoute role="teacher"><TeacherCourse /></ProtectedRoute>} />
                        <Route path="/teacher/grades"    element={<ProtectedRoute role="teacher"><TeacherGrades /></ProtectedRoute>} />
                        <Route path="/teacher/messages"  element={<ProtectedRoute role="teacher"><TeacherMessages /></ProtectedRoute>} />
                        <Route path="/teacher/meetings"  element={<ProtectedRoute role="teacher"><TeacherMeetings /></ProtectedRoute>} />

                        {/* Academic staff portal */}
                        <Route path="/staff/dashboard"   element={<ProtectedRoute role="staff"><StaffDashboard /></ProtectedRoute>} />

                        {/* IT Content Manager */}
                        <Route path="/it/dashboard" element={<ITDashboard />} />

                        {/* Principal portal */}
                        <Route path="/principal/dashboard"     element={<ProtectedRoute role="principal"><PrincipalDashboard /></ProtectedRoute>} />
                        <Route path="/principal/students"      element={<ProtectedRoute role="principal"><PrincipalStudents /></ProtectedRoute>} />
                        <Route path="/principal/teachers"      element={<ProtectedRoute role="principal"><PrincipalTeachers /></ProtectedRoute>} />
                        <Route path="/principal/reports"       element={<ProtectedRoute role="principal"><PrincipalReports /></ProtectedRoute>} />
                        <Route path="/principal/announcements" element={<ProtectedRoute role="principal"><PrincipalAnnouncements /></ProtectedRoute>} />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                    {/* Floating theme picker — accessible on every page */}
                    <ThemeToggle />
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}
