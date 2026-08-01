import { useEffect, useState } from 'react';
import { Plus, Search, Edit3, Trash2, Grid3X3 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Pagination from '../components/Pagination';
import ExportButtons from '../components/ExportButtons';
import { exportExcel, printTable } from '../utils/export';
import { useAuth } from '../context/AuthContext';

const PAGE_SIZE = 15;

const EXCEL_COLUMNS = ['Name', 'Subject', 'National ID', 'Phone'];

export default function Teachers() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ teacherName: '', subject: '', identityNumber: '', phone: '' });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');

  const load = async () => {
    const res = await api.get('/teachers');
    setTeachers(res.data);
  };

  useEffect(() => { load(); }, []);

  const subjects = [...new Set(teachers.map((t) => t.subject).filter(Boolean))];

  const filtered = teachers.filter((t) => {
    if (search) {
      const q = search.toLowerCase();
      const match = (t.teacherName || '').toLowerCase().includes(q) || (t.subject || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    if (subjectFilter && t.subject !== subjectFilter) return false;
    if (phoneFilter && !(t.phone || '').toLowerCase().includes(phoneFilter.toLowerCase())) return false;
    return true;
  });

  useEffect(() => { setPage(1); }, [search, subjectFilter, phoneFilter]);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editTeacher) {
        await api.put(`/teachers/${editTeacher._id}`, form);
        toast.success('Teacher updated successfully');
      } else {
        await api.post('/teachers', form);
        toast.success('Teacher added successfully');
      }
      setShowModal(false);
      setEditTeacher(null);
      setForm({ teacherName: '', subject: '', identityNumber: '', phone: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (t) => {
    setEditTeacher(t);
    setForm({ teacherName: t.teacherName, subject: t.subject, identityNumber: t.identityNumber, phone: t.phone || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this teacher?')) return;
    try {
      await api.delete(`/teachers/${id}`);
      toast.success('Teacher deleted');
      load();
    } catch (err) {
      toast.error('Failed to delete teacher');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
          <p className="text-gray-500 text-sm mt-1">Manage registered teachers</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButtons
            disabled={filtered.length === 0}
            onExcel={() => exportExcel(
              filtered.map((t) => ({ Name: t.teacherName, Subject: t.subject, 'National ID': t.identityNumber, Phone: t.phone || '' })),
              'Teachers', 'teachers')}
            onPrint={() => printTable('Teachers List', EXCEL_COLUMNS,
              filtered.map((t) => ({ Name: t.teacherName, Subject: t.subject, 'National ID': t.identityNumber, Phone: t.phone || '' })),
              user?.school?.name)}
          />
          <button onClick={() => { setEditTeacher(null); setForm({ teacherName: '', subject: '', identityNumber: '', phone: '' }); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-md font-medium text-sm">
            <Plus size={16} /> Add Teacher
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
            placeholder="Search name or subject..." />
        </div>
        <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white">
          <option value="">All Subjects</option>
          {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
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
                <th className="text-left p-4 font-semibold text-blue-700">Name</th>
                <th className="text-left p-4 font-semibold text-blue-700">Subject</th>
                <th className="text-left p-4 font-semibold text-blue-700">National ID</th>
                <th className="text-left p-4 font-semibold text-blue-700">Phone</th>
                <th className="text-center p-4 font-semibold text-blue-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((t, idx) => (
                <tr key={t._id} className={`border-b border-gray-50 hover:bg-blue-50/30 transition ${idx % 2 ? 'bg-blue-50/20' : 'bg-white'}`}>
                  <td className="p-4 font-medium text-gray-900">{t.teacherName}</td>
                  <td className="p-4"><span className="px-2.5 py-1 bg-blue-50 rounded-full text-xs text-blue-600">{t.subject}</span></td>
                  <td className="p-4 font-mono text-xs text-gray-400">{t.identityNumber}</td>
                  <td className="p-4 text-gray-500">{t.phone || '-'}</td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleEdit(t)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit"><Edit3 size={15} /></button>
                      <button onClick={() => handleDelete(t._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="p-12 text-center text-gray-400">
                  <Grid3X3 size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No teachers found</p>
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">{editTeacher ? 'Edit Teacher' : 'Add Teacher'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required placeholder="Full Name" value={form.teacherName} onChange={(e) => setForm({ ...form, teacherName: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
              <input required placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">National ID (16 digits)</label>
                <input required pattern="\d{16}" title="Must be exactly 16 digits" value={form.identityNumber}
                  onChange={(e) => setForm({ ...form, identityNumber: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition font-mono" placeholder="e.g. 1234567891234567" />
              </div>
              <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-md disabled:opacity-50">
                  {loading ? 'Saving...' : (editTeacher ? 'Update' : 'Create')}
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
