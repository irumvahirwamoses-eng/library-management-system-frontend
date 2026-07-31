import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Mail, Lock, ArrowRight, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mustChange, setMustChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const { login, changePassword, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'superadmin') navigate('/admin/applications');
      else if (user.role === 'librarian') navigate('/dashboard');
      else navigate('/my-books');
    }
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(identifier, password);
      toast.success('Login successful!');
      if (res.mustChangePassword) {
        setMustChange(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await changePassword(password, newPassword);
      toast.success('Password changed! Redirecting...');
      setMustChange(false);
      setTimeout(() => navigate('/my-books'), 1000);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (mustChange) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-800 to-blue-700">
        <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Shield className="text-white" size={28} />
            </div>
            <h2 className="text-xl font-bold mt-4 text-gray-900">Change Your Password</h2>
            <p className="text-gray-500 text-sm mt-1">Please set a new password to continue</p>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400" size={16} />
                <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter new password" />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition shadow-md disabled:opacity-50">
              {loading ? 'Updating...' : 'Change Password & Continue'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-800 to-blue-700">
      <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <BookOpen className="text-white" size={28} />
          </div>
          <h2 className="text-2xl font-bold mt-4 text-gray-900">Welcome Back</h2>
          <p className="text-gray-500 text-sm">Sign in to your account</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email / NESA Code / National ID</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400" size={16} />
              <input value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Enter your email, NESA code, or ID" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={16} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Enter your password" required />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? 'Signing in...' : <>Sign In <ArrowRight /></>}
          </button>
        </form>
        <p className="text-center mt-6">
          <a href="/" className="text-sm text-gray-500 hover:text-blue-600 transition">Back to Home</a>
        </p>
      </div>
    </div>
  );
}
