import { useEffect, useState } from 'react';
import { FileText, BarChart3, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import api from '../api/axios';
import Pagination from '../components/Pagination';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

const PAGE_SIZE = 15;

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ totalBorrowed: 0, totalReturned: 0, note: '' });
  const [page, setPage] = useState(1);

  const load = async () => {
    try {
      const [rep, st] = await Promise.all([api.get('/reports'), api.get('/reports/stats')]);
      setReports(rep.data);
      setStats(st.data);
    } catch (err) {
      toast.error('Failed to load reports');
    }
  };

  useEffect(() => { load(); }, []);

  const totalPages = Math.ceil(reports.length / PAGE_SIZE);
  const paginated = reports.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/reports', form);
      toast.success('Report generated successfully');
      setShowModal(false);
      setForm({ totalBorrowed: 0, totalReturned: 0, note: '' });
      load();
    } catch (err) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = () => {
    const data = reports.map((r, i) => ({
      '#': i + 1,
      Date: new Date(r.createdAt).toLocaleDateString(),
      Borrowed: r.totalBorrowed,
      Returned: r.totalReturned,
      Note: r.note || '-',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reports');
    XLSX.writeFile(wb, `library_reports_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success('Excel file downloaded');
  };

  const doughnutData = stats ? {
    labels: ['Borrowed', 'Returned'],
    datasets: [{
      data: [stats.borrowed, stats.returned],
      backgroundColor: ['#f59e0b', '#10b981'],
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

  const lineData = reports.length > 0 ? {
    labels: [...reports].reverse().map((r) => new Date(r.createdAt).toLocaleDateString()),
    datasets: [
      { label: 'Borrowed', data: [...reports].reverse().map((r) => r.totalBorrowed), borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', tension: 0.3, fill: true },
      { label: 'Returned', data: [...reports].reverse().map((r) => r.totalReturned), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', tension: 0.3, fill: true },
    ]
  } : null;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Library activity reports and statistics</p>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadExcel} disabled={reports.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition shadow-sm font-medium text-sm disabled:opacity-50">
            <Download size={16} /> Export Excel
          </button>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-md font-medium text-sm">
            <FileText size={16} /> Generate Report
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Books', value: stats.totalBooks, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Borrowed', value: stats.borrowed, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Returned', value: stats.returned, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Students', value: stats.totalStudents, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} rounded-2xl p-5 text-center border border-white/50`}>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Borrow vs Return</h3>
          {doughnutData && <div className="max-w-xs mx-auto"><Doughnut data={doughnutData} options={{ cutout: '70%', plugins: { legend: { position: 'bottom' } } }} /></div>}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Resource Distribution</h3>
          {barData && <Bar data={barData} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />}
        </div>
      </div>

      {lineData && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Borrow/Return Trend</h3>
          <Line data={lineData} options={{ plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true } } }} />
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left p-4 font-semibold text-gray-600">Date</th>
                <th className="text-center p-4 font-semibold text-gray-600">Borrowed</th>
                <th className="text-center p-4 font-semibold text-gray-600">Returned</th>
                <th className="text-left p-4 font-semibold text-gray-600">Note</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((r) => (
                <tr key={r._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                  <td className="p-4 text-gray-700">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-center font-medium text-gray-900">{r.totalBorrowed}</td>
                  <td className="p-4 text-center font-medium text-gray-900">{r.totalReturned}</td>
                  <td className="p-4 text-gray-500">{r.note || '-'}</td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr><td colSpan={4} className="p-12 text-center text-gray-400">
                  <BarChart3 size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No reports generated yet</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Generate Report</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Total Borrowed</label>
                  <input type="number" value={form.totalBorrowed} onChange={(e) => setForm({ ...form, totalBorrowed: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Total Returned</label>
                  <input type="number" value={form.totalReturned} onChange={(e) => setForm({ ...form, totalReturned: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" rows={3}></textarea>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-md disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save Report'}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition font-medium">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
