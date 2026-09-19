import { useEffect, useMemo, useState } from 'react';
import { Search, X, Minus, Trash2, ChevronDown, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function BorrowForm({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ book: '', student: '', teacher: '' });
  const [teachers, setTeachers] = useState([]);
  const [borrowType, setBorrowType] = useState('student');
  const [nesaCode, setNesaCode] = useState('');
  const [borrowStudent, setBorrowStudent] = useState(null);
  const [studentLoading, setStudentLoading] = useState(false);
  const [bookQuery, setBookQuery] = useState('');
  const [bookResults, setBookResults] = useState([]);
  const [bookSearching, setBookSearching] = useState(false);
  const [showBookResults, setShowBookResults] = useState(false);
  const [cart, setCart] = useState([]);
  const [teacherQuery, setTeacherQuery] = useState('');
  const [showTeacherResults, setShowTeacherResults] = useState(false);

  useEffect(() => {
    api.get('/teachers')
      .then((res) => setTeachers(res.data))
      .catch(() => { /* ignore */ });
  }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!bookQuery.trim()) { setBookResults([]); setBookSearching(false); return; }
      setBookSearching(true);
      try {
        const res = await api.get('/books', { params: { search: bookQuery } });
        setBookResults(res.data.slice(0, 10));
      } catch { setBookResults([]); }
      finally { setBookSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [bookQuery]);

  const filteredTeachers = useMemo(() => {
    const q = teacherQuery.trim().toLowerCase();
    if (!q) return [];
    return teachers.filter((t) =>
      (t.teacherName || '').toLowerCase().includes(q) ||
      (t.identityNumber || '').toLowerCase().includes(q)
    ).slice(0, 8);
  }, [teacherQuery, teachers]);

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

  const reset = () => {
    setForm({ book: '', student: '', teacher: '' });
    setNesaCode('');
    setBorrowStudent(null);
    setBookQuery('');
    setBookResults([]);
    setCart([]);
    setTeacherQuery('');
    setShowTeacherResults(false);
    setShowBookResults(false);
  };

  const addToCart = (b) => {
    if (b.available < 1) { toast.error(`No copies of "${b.title}" available`); return; }
    setCart((prev) => {
      const existing = prev.find((c) => c.bookId === b._id);
      if (existing) {
        if (existing.quantity >= b.available) { toast.error(`Only ${b.available} copy/copies of "${b.title}" available`); return prev; }
        return prev.map((c) => c.bookId === b._id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { bookId: b._id, title: b.title, author: b.author || '', available: b.available, quantity: 1 }];
    });
  };

  const setQty = (bookId, raw) => {
    const val = parseInt(raw, 10);
    setCart((prev) => prev.map((c) => {
      if (c.bookId !== bookId) return c;
      if (isNaN(val) || val < 1) return { ...c, quantity: 1 };
      return { ...c, quantity: Math.min(val, c.available) };
    }));
  };

  const removeFromCart = (bookId) => setCart((prev) => prev.filter((c) => c.bookId !== bookId));

  const cartTotal = cart.reduce((s, c) => s + c.quantity, 0);

  const selectTeacher = (t) => {
    setForm({ ...form, teacher: t._id });
    setTeacherQuery(t.teacherName);
    setShowTeacherResults(false);
  };

  const handleBorrow = async (e) => {
    e.preventDefault();
    if (cart.length === 0) { toast.error('Add at least one book to borrow'); return; }
    const overLimit = cart.find((c) => c.quantity > c.available);
    if (overLimit) { toast.error(`Only ${overLimit.available} copy/copies of "${overLimit.title}" available`); return; }
    setLoading(true);
    try {
      const payload = { items: cart.map((c) => ({ bookId: c.bookId, quantity: c.quantity })) };
      if (borrowType === 'student') {
        if (!borrowStudent) { toast.error('Look up student with NESA code'); setLoading(false); return; }
        payload.student = borrowStudent._id;
      } else {
        if (!form.teacher) { toast.error('Select a teacher'); setLoading(false); return; }
        payload.teacher = form.teacher;
      }
      const res = await api.post('/borrowed/bulk', payload);
      toast.success(`${res.data.count} book(s) borrowed successfully`);
      reset();
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to borrow book(s)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">New Borrow</h2>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
      </div>
      <form onSubmit={handleBorrow} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Borrow Type</label>
          <select value={borrowType} onChange={(e) => { setBorrowType(e.target.value); setNesaCode(''); setBorrowStudent(null); setForm({ ...form, teacher: '' }); setTeacherQuery(''); }}
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
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-3 text-gray-400" size={15} />
              <input value={teacherQuery}
                onChange={(e) => { setTeacherQuery(e.target.value); setShowTeacherResults(true); setForm({ ...form, teacher: '' }); }}
                onFocus={() => setShowTeacherResults(true)}
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Search teacher by name or national ID..." />
            </div>
            {showTeacherResults && teacherQuery && (
              <div className="absolute z-20 mt-1 w-full bg-white rounded-xl border border-gray-200 shadow-lg max-h-56 overflow-y-auto">
                {filteredTeachers.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-gray-400">No teacher found</p>
                ) : filteredTeachers.map((t) => (
                  <button type="button" key={t._id} onClick={() => selectTeacher(t)}
                    className="flex items-center justify-between w-full px-4 py-2.5 text-left hover:bg-blue-50 transition">
                    <span className="text-sm text-gray-800">{t.teacherName}</span>
                    <span className="text-xs text-gray-400 font-mono">{t.subject || ''}</span>
                  </button>
                ))}
              </div>
            )}
            {form.teacher && <p className="mt-2 text-xs text-emerald-600">✓ Teacher selected</p>}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search Books</label>
          <div className="relative">
            <Search className="absolute left-3.5 top-3 text-gray-400" size={15} />
            <input value={bookQuery}
              onChange={(e) => { setBookQuery(e.target.value); setShowBookResults(true); }}
              onFocus={() => setShowBookResults(true)}
              className="w-full border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Type title, author or ISBN to search and auto-fill..." />
            {bookSearching && <Loader2 size={15} className="absolute right-3.5 top-3 text-gray-400 animate-spin" />}
          </div>
          {showBookResults && bookQuery && (
            <div className="mt-1 w-full bg-white rounded-xl border border-gray-200 shadow-lg max-h-64 overflow-y-auto">
              {bookSearching ? (
                <p className="px-4 py-3 text-sm text-gray-400">Searching...</p>
              ) : bookResults.length === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-400">No books match your search</p>
              ) : bookResults.map((b) => (
                <button type="button" key={b._id} onClick={() => addToCart(b)}
                  disabled={b.available < 1}
                  className="flex items-center justify-between w-full px-4 py-2.5 text-left hover:bg-blue-50 transition disabled:opacity-50 disabled:hover:bg-transparent">
                  <span className="text-sm text-gray-800">
                    {b.title}
                    {b.author && <span className="text-gray-400"> — {b.author}</span>}
                  </span>
                  <span className={`text-xs font-medium ${b.available > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {b.available > 0 ? `${b.available} available` : 'Out of stock'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">Books to borrow</p>
              <p className="text-sm font-medium text-blue-600">{cartTotal} copy/copies</p>
            </div>
            <div className="max-h-56 overflow-y-auto">
              {cart.map((c) => (
                <div key={c.bookId} className="flex items-center gap-3 px-4 py-2.5 border-t border-gray-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{c.title}</p>
                    <p className="text-xs text-gray-400">{c.available} available</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button type="button" onClick={() => setQty(c.bookId, c.quantity - 1)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition"><Minus size={13} /></button>
                    <input value={c.quantity} min={1} max={c.available}
                      onChange={(e) => setQty(c.bookId, e.target.value)}
                      className="w-12 text-center border border-gray-200 rounded-lg py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      inputMode="numeric" />
                    <button type="button" onClick={() => setQty(c.bookId, c.quantity + 1)} disabled={c.quantity >= c.available}
                      className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition disabled:opacity-30"><ChevronDown size={13} className="rotate-180" /></button>
                  </div>
                  <button type="button" onClick={() => removeFromCart(c.bookId)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading || cart.length === 0}
            className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-md disabled:opacity-50">
            {loading ? 'Processing...' : `Borrow ${cartTotal > 0 ? cartTotal : ''} Book(s)`}
          </button>
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition font-medium">Cancel</button>
        </div>
      </form>
    </div>
  );
}