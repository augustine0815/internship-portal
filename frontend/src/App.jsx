import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student pages
import StudentInternships from './pages/student/Internships';
import StudentApplications from './pages/student/MyApplications';
import StudentOffers from './pages/student/MyOffers';
import StudentChat from './pages/student/Chat';
import StudentProfile from './pages/student/Profile';
import StudentGrades from './pages/student/Grades';

// Company pages
import CompanyInternships from './pages/company/ManageInternships';
import PostInternship from './pages/company/PostInternship';
import Applicants from './pages/company/Applicants';
import CompanyChat from './pages/company/Chat';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminInternships from './pages/admin/Internships';
import StudentLogbook from './pages/student/Logbook';
import AdminLogbook from './pages/admin/LogbookReview';

import CoordinatorDashboard from './pages/coordinator/Dashboard';
import CoordinatorStudents from './pages/coordinator/Students';
import CoordinatorLogbooks from './pages/coordinator/Logbooks';
import CoordinatorGrades from './pages/coordinator/Grades';
import CoordinatorInternships from './pages/coordinator/Internships';
import CoordinatorApplications from './pages/coordinator/Applications';
import CoordinatorChat from './pages/coordinator/Chat';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Navbar />
          <div className="main-content">
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Student */}
          <Route path="/student/internships" element={
            <PrivateRoute roles={['student']}><StudentInternships /></PrivateRoute>
          } />
          <Route path="/student/applications" element={
            <PrivateRoute roles={['student']}><StudentApplications /></PrivateRoute>
          } />
          <Route path="/student/offers" element={
            <PrivateRoute roles={['student']}><StudentOffers /></PrivateRoute>
          } />
          <Route path="/student/chat" element={
            <PrivateRoute roles={['student']}><StudentChat /></PrivateRoute>
          } />
          <Route path="/student/profile" element={
            <PrivateRoute roles={['student']}><StudentProfile /></PrivateRoute>
          } />
          <Route path="/student/grades" element={
            <PrivateRoute roles={['student']}><StudentGrades /></PrivateRoute>
          } />

          {/* Company */}
          <Route path="/company/internships" element={
            <PrivateRoute roles={['company']}><CompanyInternships /></PrivateRoute>
          } />
          <Route path="/company/post" element={
            <PrivateRoute roles={['company']}><PostInternship /></PrivateRoute>
          } />
          <Route path="/company/applicants/:id" element={
            <PrivateRoute roles={['company']}><Applicants /></PrivateRoute>
          } />
          <Route path="/company/chat" element={
            <PrivateRoute roles={['company']}><CompanyChat /></PrivateRoute>
          } />

          {/* Admin */}
          <Route path="/admin/dashboard" element={
            <PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>
          } />
          <Route path="/admin/users" element={
            <PrivateRoute roles={['admin']}><AdminUsers /></PrivateRoute>
          } />
          <Route path="/admin/internships" element={
            <PrivateRoute roles={['admin']}><AdminInternships /></PrivateRoute>
          } />
          <Route path="/student/logbook" element={
            <PrivateRoute roles={['student']}><StudentLogbook /></PrivateRoute>
          } />
          <Route path="/admin/logbooks" element={
            <PrivateRoute roles={['admin']}><AdminLogbook /></PrivateRoute>
          } />

        {/* Coordinator */}
        <Route path="/coordinator/dashboard" element={
          <PrivateRoute roles={['coordinator']}><CoordinatorDashboard /></PrivateRoute>
        } />
        <Route path="/coordinator/students" element={
          <PrivateRoute roles={['coordinator']}><CoordinatorStudents /></PrivateRoute>
        } />
        <Route path="/coordinator/logbooks" element={
          <PrivateRoute roles={['coordinator']}><CoordinatorLogbooks /></PrivateRoute>
        } />
        <Route path="/coordinator/grades" element={
          <PrivateRoute roles={['coordinator']}><CoordinatorGrades /></PrivateRoute>
        } />
        <Route path="/coordinator/internships" element={
          <PrivateRoute roles={['coordinator']}><CoordinatorInternships /></PrivateRoute>
        } />
        <Route path="/coordinator/applications" element={
          <PrivateRoute roles={['coordinator']}><CoordinatorApplications /></PrivateRoute>
        } />
        <Route path="/coordinator/chat" element={
  <PrivateRoute roles={['coordinator']}><CoordinatorChat /></PrivateRoute>
} />
        </Routes>
          </div>
        </div>
      </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;