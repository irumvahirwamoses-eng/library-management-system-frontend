import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, CheckCircle, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Pagination from '../components/Pagination';
import ExportButtons from '../components/ExportButtons';
import BorrowForm from '../components/BorrowForm';
import { exportExcel, printTable } from '../utils/export';
import { useAuth } from '../context/AuthContext';

const PAGE_SIZE = 15;

const EXCEL_COLUMNS = ['Book', 'Borrowed By', 'Type', 'Borrow Date', 'Due Date', 'Return Date', 'Status'];

const borrowerKey = (r) => {
  if (r.student?._id) return `s:${r.student._id}`;
  if (r.teacher?._id) return `t:${r.teacher._id}`;
  return `none:${r._id}`;
};

export default function Borrowed() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = async () => {
    try {
      const res = await api.get('/borrowed');
      setRecords(res.data);
    } catch (err) {
      toast.error('Failed to load data');
    }
  };

  useEffect(() => { load(); }, []);

  const activeCountByBorrower = useMemo(() => {
    const m = new Map();
    for (const r of records) {
      if (r.status === 'borrowed') {
        const k = borrowerKey(r);
        m.set(k, (m.get(k) || 0) + 1);
      }
    }
    return m;
  }, [records]);

  const filtered = records.filter((r) => {
    if (search) {
      const q = search.toLowerCase();
      const match = (r.book?.title || '').toLowerCase().includes(q) || (r.student?.studentName || r.teacher?.teacherName || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    if (typeFilter) {
      const type = r.student ? 'student' : 'teacher';
      if (type !== typeFilter) return false;
    }
    if (statusFilter && r.status !== statusFilter) return false;
    return true;
  });

  useEffect(() => { setPage(1); }, [search, typeFilter, statusFilter]);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const seenBorrowers = new Set();

  const handleReturn = async (id) => {
    try {
      await api.put(`/borrowed/${id}/return`);
      toast.success('Book returned successfully');
      load();
    } catch (err) {
      toast.error('Failed to return book');
    }
  };

  const handleReturnAll = async (r) => {
    const payload = r.student?._id ? { student: r.student._id } : r.teacher?._id ? { teacher: r.teacher._id } : null;
    if (!payload) {
      toast.error('Borrower record is missing for these books');
      return;
    }
    const name = r.student?.studentName || r.teacher?.teacherName || 'this borrower';
    const count = activeCountByBorrower.get(borrowerKey(r)) || 0;
    if (!confirm(`Return all ${count} borrowed book(s) for ${name}?`)) return;
    try {
      const res = await api.put('/borrowed/return-all', payload);
      toast.success(`${res.data.updated} book(s) returned`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to return books');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Borrow / Return</h1>
          <p className="text-gray-500 text-sm mt-1">Track book borrowing and returns</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButtons
            disabled={filtered.length === 0}
            onExcel={() => exportExcel(
              filtered.map((r) => ({
                Book: r.book?.title || 'N/A',
                'Borrowed By': r.student?.studentName || r.teacher?.teacherName || 'N/A',
                Type: r.student ? 'Student' : 'Teacher',
                'Borrow Date': r.borrowDate ? new Date(r.borrowDate).toLocaleDateString() : '-',
                'Due Date': r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '-',
                'Return Date': r.returnDate ? new Date(r.returnDate).toLocaleDateString() : '-',
                Status: r.status === 'borrowed' ? 'Borrowed' : 'Returned'
              })),
              'Borrowings', 'borrowings')}
            onPrint={() => printTable('Borrow / Return Records', EXCEL_COLUMNS,
              filtered.map((r) => ({
                Book: r.book?.title || 'N/A',
                'Borrowed By': r.student?.studentName || r.teacher?.teacherName || 'N/A',
                Type: r.student ? 'Student' : 'Teacher',
                'Borrow Date': r.borrowDate ? new Date(r.borrowDate).toLocaleDateString() : '-',
                'Due Date': r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '-',
                'Return Date': r.returnDate ? new Date(r.returnDate).toLocaleDateString() : '-',
                Status: r.status === 'borrowed' ? 'Borrowed' : 'Returned'
              })),
              user?.school?.name)}
          />
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-md font-medium text-sm">
            <Plus size={16} /> New Borrow
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
            placeholder="Search book or person..." />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white">
          <option value="">All Types</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white">
          <option value="">All Statuses</option>
          <option value="borrowed">Borrowed</option>
          <option value="returned">Returned</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <th className="text-left p-4 font-semibold text-blue-700">Book</th>
                <th className="text-left p-4 font-semibold text-blue-700">Borrowed By</th>
                <th className="text-left p-4 font-semibold text-blue-700">Type</th>
                <th className="text-left p-4 font-semibold text-blue-700">Borrow Date</th>
                <th className="text-left p-4 font-semibold text-blue-700">Due Date</th>
                <th className="text-left p-4 font-semibold text-blue-700">Return Date</th>
                <th className="text-center p-4 font-semibold text-blue-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((r, idx) => {
                const k = borrowerKey(r);
                const firstOfBorrower = !seenBorrowers.has(k);
                seenBorrowers.add(k);
                const activeCount = activeCountByBorrower.get(k) || 0;
                return (
                  <tr key={r._id} className={`border-b border-gray-50 hover:bg-blue-50/30 transition ${idx % 2 ? 'bg-blue-50/20' : 'bg-white'}`}>
                    <td className="p-4 font-medium text-gray-900">{r.book?.title || 'N/A'}</td>
                    <td className="p-4 text-gray-700">
                      {r.student?.studentName || r.teacher?.teacherName || 'N/A'}
                      {firstOfBorrower && activeCount > 1 && (
                        <button onClick={() => handleReturnAll(r)}
                          className="ml-2 inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition text-xs font-medium">
                          <CheckCircle size={12} /> Return All ({activeCount})
                        </button>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs ${r.student ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                        {r.student ? 'Student' : 'Teacher'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">{r.borrowDate ? new Date(r.borrowDate).toLocaleDateString() : '-'}</td>
                    <td className={`p-4 ${r.status === 'borrowed' && r.dueDate && new Date(r.dueDate) < new Date(new Date().setHours(0,0,0,0)) ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                      {r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '-'}
                      {r.status === 'borrowed' && r.dueDate && new Date(r.dueDate) < new Date(new Date().setHours(0,0,0,0)) && (
                        <span className="ml-2 px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-xs font-medium">Overdue</span>
                      )}
                    </td>
                    <td className="p-4 text-gray-500">{r.returnDate ? new Date(r.returnDate).toLocaleDateString() : '-'}</td>
                    <td className="p-4 text-center">
                      {r.status === 'borrowed' ? (
                        <button onClick={() => handleReturn(r._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition text-xs font-medium">
                          <CheckCircle size={14} /> Return
                        </button>
                      ) : (
                        <span className="inline-flex px-3 py-1.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-medium">Returned</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-12 text-center text-gray-400">
                  <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No borrowing records found</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <BorrowForm onSuccess={() => { setShowModal(false); load(); }} onClose={() => setShowModal(false)} />
        </div>
      )}
    </div>
  );
}