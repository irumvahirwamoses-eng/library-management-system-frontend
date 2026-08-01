import { useEffect, useState } from 'react';
import { Plus, Search, Trash2, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Pagination from '../components/Pagination';
import ExportButtons from '../components/ExportButtons';
import { exportExcel, printTable } from '../utils/export';
import { useAuth } from '../context/AuthContext';

const PAGE_SIZE = 15;

const EXCEL_COLUMNS = ['Book', 'Table', 'Allocated Date'];

export default function Allocations() {
  const { user } = useAuth();
  const [allocations, setAllocations] = useState([]);
  const [books, setBooks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ book: '', tableName: '' });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [tableFilter, setTableFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const load = async () => {
    try {
      const [allocRes, bookRes] = await Promise.all([api.get('/allocations'), api.get('/books')]);
      setAllocations(allocRes.data);
      setBooks(bookRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    }
  };

  useEffect(() => { load(); }, []);

  const tables = [...new Set(allocations.map((a) => a.tableName).filter(Boolean))];

  const filtered = allocations.filter((a) => {
    if (search) {
      const q = search.toLowerCase();
      if (!(a.book?.title || '').toLowerCase().includes(q)) return false;
    }
    if (tableFilter && a.tableName !== tableFilter) return false;
    if (dateFilter) {
      const dateStr = new Date(a.createdAt).toLocaleDateString();
      if (!dateStr.toLowerCase().includes(dateFilter.toLowerCase())) return false;
    }
    return true;
  });

  useEffect(() => { setPage(1); }, [search, tableFilter, dateFilter]);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/allocations', form);
      toast.success('Allocation created successfully');
      setShowModal(false);
      setForm({ book: '', tableName: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create allocation');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this allocation?')) return;
    try {
      await api.delete(`/allocations/${id}`);
      toast.success('Allocation deleted');
      load();
    } catch (err) {
      toast.error('Failed to delete allocation');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Book Allocations</h1>
          <p className="text-gray-500 text-sm mt-1">Assign books to classroom tables</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButtons
            disabled={filtered.length === 0}
            onExcel={() => exportExcel(
              filtered.map((a) => ({ Book: a.book?.title || 'N/A', Table: a.tableName, 'Allocated Date': a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '-' })),
              'Allocations', 'allocations')}
            onPrint={() => printTable('Book Allocations', EXCEL_COLUMNS,
              filtered.map((a) => ({ Book: a.book?.title || 'N/A', Table: a.tableName, 'Allocated Date': a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '-' })),
              user?.school?.name)}
          />
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-md font-medium text-sm">
            <Plus size={16} /> Add Allocation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
            placeholder="Search by book title..." />
        </div>
        <select value={tableFilter} onChange={(e) => setTableFilter(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white">
          <option value="">All Tables</option>
          {tables.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
          <input value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
            placeholder="Filter by date..." />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <th className="text-left p-4 font-semibold text-blue-700">Book</th>
                <th className="text-left p-4 font-semibold text-blue-700">Table</th>
                <th className="text-center p-4 font-semibold text-blue-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((a, idx) => (
                <tr key={a._id} className={`border-b border-gray-50 hover:bg-blue-50/30 transition ${idx % 2 ? 'bg-blue-50/20' : 'bg-white'}`}>
                  <td className="p-4 font-medium text-gray-900">{a.book?.title || 'N/A'}</td>
                  <td className="p-4"><span className="px-2.5 py-1 bg-indigo-50 rounded-full text-xs text-indigo-600">{a.tableName}</span></td>
                  <td className="p-4 text-center">
                    <button onClick={() => handleDelete(a._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={3} className="p-12 text-center text-gray-400">
                  <BarChart3 size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No allocations found</p>
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Allocation</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Book</label>
                <select required value={form.book} onChange={(e) => setForm({ ...form, book: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition">
                  <option value="">Select book</option>
                  {books.map((b) => <option key={b._id} value={b._id}>{b.title} - {b.isbn}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Table Name</label>
                <input required value={form.tableName} onChange={(e) => setForm({ ...form, tableName: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="e.g. TABLE 1 SWD" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-md disabled:opacity-50">
                  {loading ? 'Creating...' : 'Create Allocation'}
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
