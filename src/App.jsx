import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Borrowed from './pages/Borrowed';
import Requests from './pages/Requests';
import Allocations from './pages/Allocations';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Archive from './pages/Archive';
import ActivityLog from './pages/ActivityLog';
import MyBooks from './pages/MyBooks';
import MyRequests from './pages/MyRequests';
import MyHistory from './pages/MyHistory';
import Applications from './pages/SuperAdmin/Applications';
import Schools from './pages/SuperAdmin/Schools';
import System from './pages/SuperAdmin/System';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', padding: '12px 16px', fontSize: '14px' } }} />
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute roles={['librarian']}><Dashboard /></ProtectedRoute>} />
            <Route path="/books" element={<ProtectedRoute roles={['librarian', 'superadmin']}><Books /></ProtectedRoute>} />
            <Route path="/students" element={<ProtectedRoute roles={['librarian', 'superadmin']}><Students /></ProtectedRoute>} />
            <Route path="/teachers" element={<ProtectedRoute roles={['librarian', 'superadmin']}><Teachers /></ProtectedRoute>} />
            <Route path="/borrowed" element={<ProtectedRoute roles={['librarian', 'superadmin']}><Borrowed /></ProtectedRoute>} />
            <Route path="/requests" element={<ProtectedRoute roles={['librarian', 'superadmin']}><Requests /></ProtectedRoute>} />
            <Route path="/allocations" element={<ProtectedRoute roles={['librarian', 'superadmin']}><Allocations /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute roles={['librarian', 'superadmin']}><Reports /></ProtectedRoute>} />
            <Route path="/archive" element={<ProtectedRoute roles={['librarian', 'superadmin']}><Archive /></ProtectedRoute>} />
            <Route path="/activity" element={<ProtectedRoute roles={['librarian', 'superadmin']}><ActivityLog /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute roles={['librarian', 'superadmin', 'student', 'teacher']}><Profile /></ProtectedRoute>} />
            <Route path="/my-books" element={<ProtectedRoute roles={['student', 'teacher']}><MyBooks /></ProtectedRoute>} />
            <Route path="/my-requests" element={<ProtectedRoute roles={['student', 'teacher']}><MyRequests /></ProtectedRoute>} />
            <Route path="/my-history" element={<ProtectedRoute roles={['student', 'teacher']}><MyHistory /></ProtectedRoute>} />
            <Route path="/admin/applications" element={<ProtectedRoute roles={['superadmin']}><Applications /></ProtectedRoute>} />
            <Route path="/admin/schools" element={<ProtectedRoute roles={['superadmin']}><Schools /></ProtectedRoute>} />
            <Route path="/admin/system" element={<ProtectedRoute roles={['superadmin']}><System /></ProtectedRoute>} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}
