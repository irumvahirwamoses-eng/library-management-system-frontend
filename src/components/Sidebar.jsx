import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Book, Users, Grid3X3, BookOpen, Send, BarChart3, FileText, User, LogOut, ChevronRight, BookOpenCheck, Archive, History, ClipboardList, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = {
  librarian: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/books', label: 'Books', icon: Book },
    { to: '/students', label: 'Students', icon: Users },
    { to: '/teachers', label: 'Teachers', icon: Grid3X3 },
    { to: '/borrowed', label: 'Borrowed', icon: BookOpen },
    { to: '/requests', label: 'Requests', icon: Send },
    { to: '/allocations', label: 'Allocations', icon: BarChart3 },
    { to: '/reports', label: 'Reports', icon: FileText },
    { to: '/archive', label: 'Archive', icon: Archive },
    { to: '/activity', label: 'Activity Log', icon: Activity },
  ],
  student: [
    { to: '/my-books', label: 'Available Books', icon: BookOpen },
    { to: '/my-requests', label: 'My Requests', icon: Send },
    { to: '/my-history', label: 'Borrow History', icon: History },
  ],
  teacher: [
    { to: '/my-books', label: 'Available Books', icon: BookOpen },
    { to: '/my-requests', label: 'My Requests', icon: Send },
    { to: '/my-history', label: 'Borrow History', icon: History },
  ],
  superadmin: [
    { to: '/admin/applications', label: 'Applications', icon: ClipboardList },
    { to: '/admin/schools', label: 'Schools', icon: Grid3X3 },
    { to: '/admin/system', label: 'System', icon: BarChart3 },
  ]
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  if (!user) return null;
  const items = navItems[user.role] || [];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col fixed top-0 bottom-0 left-0 z-40">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
            <BookOpenCheck className="text-white" size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900">LMS Platform</h1>
            <p className="text-[11px] text-gray-500 capitalize">{user.role === 'superadmin' ? 'Super Admin' : user.school?.name?.slice(0, 20) + '...' || 'School'}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
              isActive ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`
          }>
            {({ isActive }) => (
              <>
                <item.icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
                <span className="flex-1">{item.label}</span>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300" />
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-gray-100 space-y-0.5">
        <NavLink to="/profile" className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            isActive ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`
        }>
          {({ isActive }) => (
            <>
              <User size={18} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
              <span className="flex-1">Profile</span>
            </>
          )}
        </NavLink>
        <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-200 w-full">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
