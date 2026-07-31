import { useState } from 'react';
import { Mail, Lock, User as UserIcon, School, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const roleIcons = { superadmin: Shield, librarian: School, student: UserIcon, teacher: UserIcon };

export default function Profile() {
  const { user, changePassword, changeEmail } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [emailLoading, setEmailLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailLoading(true);
    try {
      await changeEmail(email);
      toast.success('Email updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update email');
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setPassLoading(false);
    }
  };

  const RoleIcon = roleIcons[user?.role] || UserIcon;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
            <RoleIcon className="text-white" size={26} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Profile</h1>
            <p className="text-sm text-gray-500 capitalize">{user?.role === 'superadmin' ? 'Super Admin' : user?.role}</p>
          </div>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-gray-100 pb-2.5">
            <span className="text-gray-500 flex items-center gap-2"><UserIcon size={14} /> Name</span>
            <span className="font-medium text-gray-900">{user?.studentName || user?.teacherName || user?.email || '-'}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-2.5">
            <span className="text-gray-500 flex items-center gap-2"><Shield size={14} /> Role</span>
            <span className="font-medium capitalize text-gray-900">{user?.role}</span>
          </div>
          {user?.school?.name && <div className="flex justify-between border-b border-gray-100 pb-2.5">
            <span className="text-gray-500 flex items-center gap-2"><School size={14} /> School</span>
            <span className="font-medium text-gray-900">{user.school.name}</span>
          </div>}
        </div>
      </div>

      {(user?.role === 'superadmin' || user?.role === 'librarian') && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Mail size={16} /> Change Email</h2>
          <form onSubmit={handleEmailSubmit} className="space-y-3 max-w-sm">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" placeholder="New email address" />
            <button type="submit" disabled={emailLoading}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-md disabled:opacity-50 text-sm">
              {emailLoading ? 'Updating...' : 'Update Email'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Lock size={16} /> Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-3 max-w-sm">
          <input type="password" required placeholder="Current Password" value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
          <input type="password" required placeholder="New Password" value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
          <button type="submit" disabled={passLoading}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-md disabled:opacity-50 text-sm">
            {passLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
