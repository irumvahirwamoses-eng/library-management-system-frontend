import { useState, useRef, useEffect } from 'react';
import { LogOut, User, ChevronDown, Bell, CheckCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const pageNames = {
  '/dashboard': 'Dashboard',
  '/books': 'Books',
  '/students': 'Students',
  '/teachers': 'Teachers',
  '/borrowed': 'Borrow / Return',
  '/requests': 'Book Requests',
  '/allocations': 'Book Allocations',
  '/reports': 'Reports',
  '/profile': 'Profile',
  '/archive': 'Archived Books',
  '/activity': 'Activity Log',
  '/my-books': 'Available Books',
  '/my-requests': 'My Requests',
  '/my-history': 'My Borrow History',
  '/admin/applications': 'Applications',
  '/admin/schools': 'Schools',
  '/admin/system': 'System Management',
};

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const ref = useRef();
  const notifRef = useRef();

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
      const int = setInterval(loadNotifications, 15000);
      return () => clearInterval(int);
    }
  }, [user]);

  const markAllRead = async () => {
    try {
      await Promise.all(notifications.filter(n => !n.isRead).map(n => api.put(`/notifications/${n._id}/read`)));
      loadNotifications();
    } catch { /* ignore */ }
  };

  const unread = notifications.filter(n => !n.isRead).length;
  const currentPage = pageNames[location.pathname] || 'Page';
  const displayName = user?.email || user?.studentName || user?.teacherName || 'User';

  return (
    <header className="bg-white border-b border-gray-200 px-6 lg:px-8 py-3 flex items-center justify-between sticky top-0 z-30">
      <h2 className="text-lg font-semibold text-gray-900">{currentPage}</h2>
      <div className="flex items-center gap-2">
        <div className="relative" ref={notifRef}>
          <button onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) loadNotifications(); }}
            className="relative p-2 rounded-xl hover:bg-gray-50 transition">
            <Bell size={18} className="text-gray-500" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-lg py-2 z-50">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">Notifications</p>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    <CheckCheck size={12} /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-8">No notifications</p>
                ) : notifications.map((n) => (
                  <div key={n._id} className={`px-4 py-3 border-b border-gray-50 ${n.isRead ? '' : 'bg-blue-50/50'}`}>
                    <p className="text-sm text-gray-700">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="relative" ref={ref}>
          <button onClick={() => setOpen(!open)} className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm">
              {displayName?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-[150px] truncate">{displayName}</span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-50">
              <button onClick={() => { setOpen(false); navigate('/profile'); }} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                <User size={15} /> Edit Profile
              </button>
              <hr className="border-gray-100" />
              <button onClick={() => { setOpen(false); logout(); }} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition">
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
