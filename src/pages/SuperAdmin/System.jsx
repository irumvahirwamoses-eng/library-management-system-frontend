import { useEffect, useState } from 'react';
import { Settings, School, Building2, Users, GraduationCap, BookOpen, ArrowLeftRight, Activity, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import api from '../../api/axios';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

export default function System() {
  const [stats, setStats] = useState(null);

  const load = async () => {
    try {
      const res = await api.get('/system/stats');
      setStats(res.data);
    } catch {
      toast.error('Failed to load system stats');
    }
  };

  useEffect(() => { load(); }, []);

  const cards = stats ? [
    { label: 'Schools', value: stats.schools, icon: <School size={22} className="text-blue-600" /> },
    { label: 'Active Schools', value: stats.activeSchools, icon: <Building2 size={22} className="text-emerald-600" /> },
    { label: 'Disabled Schools', value: stats.disabledSchools, icon: <Building2 size={22} className="text-red-500" /> },
    { label: 'Librarians', value: stats.libraries, icon: <Users size={22} className="text-indigo-600" /> },
    { label: 'Students', value: stats.students, icon: <GraduationCap size={22} className="text-blue-600" /> },
    { label: 'Teachers', value: stats.teachers, icon: <Users size={22} className="text-purple-600" /> },
    { label: 'Books', value: stats.books, icon: <BookOpen size={22} className="text-amber-600" /> },
    { label: 'Borrowed', value: stats.borrowed, icon: <ArrowLeftRight size={22} className="text-orange-600" /> },
    { label: 'Activity Logs', value: stats.logs, icon: <Activity size={22} className="text-rose-500" /> },
  ] : [];

  const downloadExcel = () => {
    if (!stats) return;
    const data = [
      { Metric: 'Total Schools', Value: stats.schools },
      { Metric: 'Active Schools', Value: stats.activeSchools },
      { Metric: 'Disabled Schools', Value: stats.disabledSchools },
      { Metric: 'Librarians', Value: stats.libraries },
      { Metric: 'Students', Value: stats.students },
      { Metric: 'Teachers', Value: stats.teachers },
      { Metric: 'Books', Value: stats.books },
      { Metric: 'Borrowed Books', Value: stats.borrowed },
      { Metric: 'Returned Books', Value: stats.returned },
      { Metric: 'Activity Logs', Value: stats.logs },
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'System Stats');
    XLSX.writeFile(wb, `system_stats_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success('System report downloaded');
  };

  const doughnutData = stats ? {
    labels: ['Active Schools', 'Disabled Schools', 'Pending'],
    datasets: [{
      data: [stats.activeSchools, stats.disabledSchools, Math.max(0, stats.schools - stats.activeSchools - stats.disabledSchools)],
      backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
      borderWidth: 0,
    }]
  } : null;

  const barData = stats ? {
    labels: ['Students', 'Teachers', 'Books', 'Borrowed', 'Returned'],
    datasets: [{
      label: 'Count',
      data: [stats.students, stats.teachers, stats.books, stats.borrowed, stats.returned],
      backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'],
      borderRadius: 8,
    }]
  } : null;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Settings size={24} className="text-blue-500" /> System Management</h1>
        <button onClick={downloadExcel} disabled={!stats}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-md font-medium text-sm disabled:opacity-50">
          <Download size={16} /> Download Report
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {!stats && Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
            <div className="h-4 w-24 bg-gray-100 rounded mb-3" />
            <div className="h-8 w-12 bg-gray-100 rounded" />
          </div>
        ))}
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{c.label}</span>
              {c.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">School Status Overview</h3>
          {doughnutData && <div className="max-w-xs mx-auto"><Doughnut data={doughnutData} options={{ cutout: '70%', plugins: { legend: { position: 'bottom' } } }} /></div>}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Platform Resource Distribution</h3>
          {barData && <Bar data={barData} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />}
        </div>
      </div>
    </div>
  );
}
