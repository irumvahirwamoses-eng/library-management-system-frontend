import { useEffect, useState } from 'react';
import { Plus, Search, Edit3, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Pagination from '../components/Pagination';
import ExportButtons from '../components/ExportButtons';
import { exportExcel, printTable } from '../utils/export';
import { useAuth } from '../context/AuthContext';

const PAGE_SIZE = 15;

const EXCEL_COLUMNS = ['NESA Code', 'Name', 'Class', 'Phone', 'Level'];

export default function Students() {
  const { user } = useAuth();
  const isTVET = user?.school?.type === 'tvet';
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nesaCode: '', studentName: '', class: '', phonenumber: '', level: '' });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');

  const load = async () => {
    const res = await api.get('/students');
    setStudents(res.data);
  };

  useEffect(() => { load(); }, []);

  const classes = [...new Set(students.map((s) => s.class).filter(Boolean))];
  const levels = [...new Set(students.map((s) => s.level).filter(Boolean))];

  const filtered = students.filter((s) => {
    if (search) {
      const q = search.toLowerCase();
      const match = (s.studentName || '').toLowerCase().includes(q) || (s.nesaCode || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    if (classFilter && s.class !== classFilter) return false;
    if (levelFilter && s.level !== levelFilter) return false;
    if (phoneFilter && !(s.phonenumber || '').toLowerCase().includes(phoneFilter.toLowerCase())) return false;
    return true;
  });

  useEffect(() => { setPage(1); }, [search, classFilter, levelFilter, phoneFilter]);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editStudent) {
        await api.put(`/students/${editStudent._id}`, form);
        toast.success('Student updated successfully');
      } else {
        await api.post('/students', form);
        toast.success('Student added successfully');
      }
      setShowModal(false);
      setEditStudent(null);
      setForm({ nesaCode: '', studentName: '', class: '', phonenumber: '', level: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (s) => {
    setEditStudent(s);
    setForm({ nesaCode: s.nesaCode, studentName: s.studentName, class: s.class || '', phonenumber: s.phonenumber || '', level: s.level || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student deleted');
      load();
    } catch (err) {
      toast.error('Failed to delete student');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500 text-sm mt-1">Manage registered students</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButtons
            disabled={filtered.length === 0}
            onExcel={() => exportExcel(
              filtered.map((s) => ({ 'NESA Code': s.nesaCode, Name: s.studentName, Class: s.class || '', Phone: s.phonenumber || '', Level: s.level ? s.level.charAt(0).toUpperCase() + s.level.slice(1) : '' })),
              'Students', 'students')}
            onPrint={() => printTable('Students List', EXCEL_COLUMNS,
              filtered.map((s) => ({ 'NESA Code': s.nesaCode, Name: s.studentName, Class: s.class || '', Phone: s.phonenumber || '', Level: s.level ? s.level.charAt(0).toUpperCase() + s.level.slice(1) : '' })),
              user?.school?.name)}
          />
          <button onClick={() => { setEditStudent(null); setForm({ nesaCode: '', studentName: '', class: '', phonenumber: '', level: '' }); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-md font-medium text-sm">
            <Plus size={16} /> Add Student
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
            placeholder="Search name or NESA code..." />
        </div>
        <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white">
          <option value="">All Classes</option>
          {classes.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {isTVET && (
          <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white">
            <option value="">All Levels</option>
            {levels.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        )}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
          <input value={phoneFilter} onChange={(e) => setPhoneFilter(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
            placeholder="Filter by phone..." />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <th className="text-left p-4 font-semibold text-blue-700">NESA Code</th>
                <th className="text-left p-4 font-semibold text-blue-700">Name</th>
                <th className="text-left p-4 font-semibold text-blue-700">Class</th>
                <th className="text-left p-4 font-semibold text-blue-700">Phone</th>
                {isTVET && <th className="text-left p-4 font-semibold text-blue-700">Level</th>}
                <th className="text-center p-4 font-semibold text-blue-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((s, idx) => (
                <tr key={s._id} className={`border-b border-gray-50 hover:bg-blue-50/30 transition ${idx % 2 ? 'bg-blue-50/20' : 'bg-white'}`}>
                  <td className="p-4 font-mono text-xs text-gray-500">{s.nesaCode}</td>
                  <td className="p-4 font-medium text-gray-900">{s.studentName}</td>
                  <td className="p-4 text-gray-500">{s.class || '-'}</td>
                  <td className="p-4 text-gray-500">{s.phonenumber || '-'}</td>
                  {isTVET && (
                    <td className="p-4">
                      {s.level ? <span className="px-2.5 py-1 bg-blue-50 rounded-full text-xs text-blue-600 capitalize">{s.level}</span> : '-'}
                    </td>
                  )}
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleEdit(s)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit"><Edit3 size={15} /></button>
                      <button onClick={() => handleDelete(s._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-12 text-center text-gray-400">
                  <Users size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No students found</p>
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">{editStudent ? 'Edit Student' : 'Add Student'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">NESA Code (12 digits)</label>
                <input required pattern="\d{12}" title="Must be exactly 12 digits" value={form.nesaCode}
                  onChange={(e) => setForm({ ...form, nesaCode: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition font-mono" placeholder="e.g. 110405000000" />
              </div>
              <input required placeholder="Full Name" value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
              <input placeholder="Class" value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
              <input placeholder="Phone" value={form.phonenumber} onChange={(e) => setForm({ ...form, phonenumber: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
              {isTVET && (
                <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition">
                  <option value="">Select Level</option>
                  <option value="level3">Level 3</option>
                  <option value="level4">Level 4</option>
                  <option value="level5">Level 5</option>
                </select>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-md disabled:opacity-50">
                  {loading ? 'Saving...' : (editStudent ? 'Update' : 'Create')}
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
