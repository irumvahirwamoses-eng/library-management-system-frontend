import { useEffect, useState } from 'react';
import { Book, Users, Grid3X3, BookOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import api from '../api/axios';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/reports/stats').then((res) => setStats(res.data)).catch(() => {});
  }, []);

  const cards = stats ? [
    { label: 'Total Books', value: stats.totalBooks, icon: Book, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', text: 'text-blue-600' },
    { label: 'Students', value: stats.totalStudents, icon: Users, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { label: 'Teachers', value: stats.totalTeachers, icon: Grid3X3, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50', text: 'text-purple-600' },
    { label: 'Borrowed', value: stats.borrowed, icon: BookOpen, color: 'from-orange-500 to-amber-500', bg: 'bg-orange-50', text: 'text-orange-600' },
  ] : [];

  const doughnutData = stats ? {
    labels: ['Borrowed', 'Returned', 'Available'],
    datasets: [{
      data: [stats.borrowed, stats.returned, stats.totalBooks - stats.borrowed],
      backgroundColor: ['#f59e0b', '#10b981', '#3b82f6'],
      borderWidth: 0,
    }]
  } : null;

  const barData = stats ? {
    labels: ['Books', 'Students', 'Teachers'],
    datasets: [{
      label: 'Count',
      data: [stats.totalBooks, stats.totalStudents, stats.totalTeachers],
      backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6'],
      borderRadius: 8,
    }]
  } : null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your school library</p>
      </div>
      {stats ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {cards.map((card, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center`}>
                    <card.icon className={card.text} size={22} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-500 mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Library Overview</h3>
              {doughnutData && <div className="max-w-xs mx-auto"><Doughnut data={doughnutData} options={{ cutout: '70%', plugins: { legend: { position: 'bottom' } } }} /></div>}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Resource Distribution</h3>
              {barData && <Bar data={barData} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { href: '/books', label: 'Manage Books', color: 'from-blue-500 to-cyan-500', icon: Book },
                { href: '/students', label: 'Manage Students', color: 'from-emerald-500 to-teal-500', icon: Users },
                { href: '/teachers', label: 'Manage Teachers', color: 'from-purple-500 to-pink-500', icon: Grid3X3 },
                { href: '/borrowed', label: 'Borrow / Return', color: 'from-orange-500 to-amber-500', icon: BookOpen },
              ].map((item, i) => (
                <Link key={i} to={item.href}
                  className={`bg-gradient-to-br ${item.color} p-4 rounded-xl text-white hover:shadow-lg transition-all duration-300 hover:scale-[1.02]`}>
                  <item.icon size={22} className="mb-2 opacity-80" />
                  <p className="text-sm font-medium">{item.label}</p>
                </Link>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
}
