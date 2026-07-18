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

// Company pages
import CompanyInternships from './pages/company/ManageInternships';
import PostInternship from './pages/company/PostInternship';
import Applicants from './pages/company/Applicants';
import CompanyChat from './pages/company/Chat';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminInternships from './pages/admin/Internships';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
      <BrowserRouter>
        <Navbar />
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
        </Routes>
      </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;