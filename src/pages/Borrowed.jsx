import { useEffect, useState } from 'react';
import { Plus, Search, CheckCircle, BookOpen, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 15;

export default function Borrowed() {
  const [records, setRecords] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ book: '', student: '', teacher: '' });
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [borrowType, setBorrowType] = useState('student');
  const [page, setPage] = useState(1);
  const [nesaCode, setNesaCode] = useState('');
  const [borrowStudent, setBorrowStudent] = useState(null);
  const [studentLoading, setStudentLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = async () => {
    try {
      const [rec, bk, stu, tea] = await Promise.all([
        api.get('/borrowed'), api.get('/books'), api.get('/students'), api.get('/teachers')
      ]);
      setRecords(rec.data);
      setBooks(bk.data.filter(b => b.available > 0));
      setStudents(stu.data);
      setTeachers(tea.data);
    } catch (err) {
      toast.error('Failed to load data');
    }
  };

  useEffect(() => { load(); }, []);

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

  const handleLookupStudent = async () => {
    if (!nesaCode || nesaCode.length !== 12) { toast.error('Enter a valid 12-digit NESA code'); return; }
    setStudentLoading(true);
    setBorrowStudent(null);
    try {
      const res = await api.get(`/students?search=${nesaCode}`);
      const found = res.data.find((s) => s.nesaCode === nesaCode);
      if (found) { setBorrowStudent(found); toast.success('Student found'); }
      else toast.error('No student found with this NESA code');
    } catch { toast.error('Failed to lookup student'); }
    finally { setStudentLoading(false); }
  };

  const handleBorrow = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { book: form.book };
      if (borrowType === 'student') {
        if (!borrowStudent) { toast.error('Look up student with NESA code'); setLoading(false); return; }
        payload.student = borrowStudent._id;
      } else {
        payload.teacher = form.teacher;
      }
      await api.post('/borrowed', payload);
      toast.success('Book borrowed successfully');
      setShowModal(false);
      setForm({ book: '', student: '', teacher: '' });
      setNesaCode('');
      setBorrowStudent(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to borrow book');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (id) => {
    try {
      await api.put(`/borrowed/${id}/return`);
      toast.success('Book returned successfully');
      load();
    } catch (err) {
      toast.error('Failed to return book');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Borrow / Return</h1>
          <p className="text-gray-500 text-sm mt-1">Track book borrowing and returns</p>
        </div>
        <button onClick={() => { setShowModal(true); setNesaCode(''); setBorrowStudent(null); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-md font-medium text-sm">
          <Plus size={16} /> New Borrow
        </button>
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
                <th className="text-left p-4 font-semibold text-blue-700">Return Date</th>
                <th className="text-center p-4 font-semibold text-blue-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((r, idx) => (
                <tr key={r._id} className={`border-b border-gray-50 hover:bg-blue-50/30 transition ${idx % 2 ? 'bg-blue-50/20' : 'bg-white'}`}>
                  <td className="p-4 font-medium text-gray-900">{r.book?.title || 'N/A'}</td>
                  <td className="p-4 text-gray-700">{r.student?.studentName || r.teacher?.teacherName || 'N/A'}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs ${r.student ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                      {r.student ? 'Student' : 'Teacher'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">{r.borrowDate ? new Date(r.borrowDate).toLocaleDateString() : '-'}</td>
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
              ))}
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">New Borrow</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleBorrow} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Book</label>
                <select required value={form.book} onChange={(e) => setForm({ ...form, book: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition">
                  <option value="">Select a book</option>
                  {books.map((b) => <option key={b._id} value={b._id}>{b.title} (Available: {b.available})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Borrow Type</label>
                <select value={borrowType} onChange={(e) => { setBorrowType(e.target.value); setNesaCode(''); setBorrowStudent(null); }}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition">
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>
              {borrowType === 'student' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student NESA Code</label>
                  <div className="flex gap-2">
                    <input value={nesaCode} onChange={(e) => setNesaCode(e.target.value.replace(/\D/g, '').slice(0, 12))}
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition font-mono"
                      placeholder="12-digit NESA code" maxLength={12} />
                    <button type="button" onClick={handleLookupStudent} disabled={studentLoading}
                      className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md disabled:opacity-50 text-sm font-medium">
                      {studentLoading ? '...' : 'Lookup'}
                    </button>
                  </div>
                  {borrowStudent && (
                    <div className="mt-2 bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                      <p className="font-medium text-emerald-800">{borrowStudent.studentName}</p>
                      <p className="text-emerald-600 text-xs">Class: {borrowStudent.class || 'N/A'} | Level: {borrowStudent.level || 'N/A'}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                  <select required value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition">
                    <option value="">Select teacher</option>
                    {teachers.map((t) => (<option key={t._id} value={t._id}>{t.teacherName}</option>))}
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-md disabled:opacity-50">
                  {loading ? 'Processing...' : 'Borrow Book'}
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
