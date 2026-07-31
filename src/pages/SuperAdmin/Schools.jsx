import { useEffect, useState } from 'react';
import { Trash2, Edit3, Key, Power, PowerOff, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Pagination from '../../components/Pagination';

const PAGE_SIZE = 15;

export default function Schools() {
  const [schools, setSchools] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [editSchool, setEditSchool] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', type: '', district: '', sector: '', phone: '', email: '', adminName: '' });
  const [passwordSchool, setPasswordSchool] = useState(null);
  const [password, setPassword] = useState('');

  const load = async () => {
    try {
      const res = await api.get('/schools');
      setSchools(res.data);
    } catch {
      toast.error('Failed to load schools');
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = schools.filter((s) => {
    if (search) {
      const q = search.toLowerCase();
      if (!(s.name.toLowerCase().includes(q) || (s.email || '').toLowerCase().includes(q) || (s.district || '').toLowerCase().includes(q))) return false;
    }
    if (typeFilter && s.type !== typeFilter) return false;
    if (statusFilter && s.status !== statusFilter) return false;
    return true;
  });
  useEffect(() => { setPage(1); }, [search, typeFilter, statusFilter]);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (id) => {
    if (!confirm('Delete this school and all its data?')) return;
    try {
      await api.delete(`/schools/${id}`);
      toast.success('School deleted');
      load();
    } catch {
      toast.error('Failed to delete school');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/schools/${editSchool._id}`, editForm);
      toast.success('School updated');
      setShowEdit(false);
      setEditSchool(null);
      load();
    } catch {
      toast.error('Failed to update school');
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/schools/${passwordSchool._id}/password`, { password });
      toast.success('School admin password updated');
      setPasswordSchool(null);
      setPassword('');
    } catch {
      toast.error('Failed to set password');
    }
  };

  const toggleStatus = async (school) => {
    const newStatus = school.status === 'active' ? 'disabled' : 'active';
    try {
      await api.put(`/schools/${school._id}/status`, { status: newStatus });
      toast.success(`School ${newStatus === 'active' ? 'enabled' : 'disabled'}`);
      load();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const statusBadge = (s) => {
    if (s.status === 'active') return 'bg-emerald-50 text-emerald-700';
    if (s.status === 'disabled') return 'bg-red-50 text-red-700';
    if (s.status === 'pending') return 'bg-amber-50 text-amber-700';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Registered Schools</h1>
        <p className="text-gray-500 text-sm mt-1">Manage schools: edit, set passwords, enable or disable</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, district..."
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white">
          <option value="">All Types</option>
          <option value="tvet">TVET</option>
          <option value="general_education">General Education</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <th className="text-left p-4 font-semibold text-blue-700">School Name</th>
                <th className="text-left p-4 font-semibold text-blue-700">Type</th>
                <th className="text-left p-4 font-semibold text-blue-700">District</th>
                <th className="text-left p-4 font-semibold text-blue-700">Contact</th>
                <th className="text-left p-4 font-semibold text-blue-700">Status</th>
                <th className="text-center p-4 font-semibold text-blue-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((s, idx) => (
                <tr key={s._id} className={`border-b border-gray-50 hover:bg-blue-50/30 transition ${idx % 2 ? 'bg-blue-50/20' : 'bg-white'}`}>
                  <td className="p-4 font-medium text-gray-900">{s.name}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-blue-50 rounded-full text-xs text-blue-600">{s.type === 'tvet' ? 'TVET' : 'General Education'}</span>
                  </td>
                  <td className="p-4 text-gray-500">{s.district}</td>
                  <td className="p-4 text-gray-500">{s.email}<br /><span className="text-xs">{s.phone}</span></td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge(s)}`}>{s.status}</span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => { setEditSchool(s); setEditForm({ name: s.name, type: s.type, district: s.district, sector: s.sector, phone: s.phone, email: s.email, adminName: s.adminName }); setShowEdit(true); }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit"><Edit3 size={15} /></button>
                      <button onClick={() => setPasswordSchool(s)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Set password"><Key size={15} /></button>
                      <button onClick={() => toggleStatus(s)} className={`p-2 ${s.status === 'active' ? 'text-red-500 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'} rounded-lg transition`} title={s.status === 'active' ? 'Disable school' : 'Enable school'}>
                        {s.status === 'active' ? <Power size={15} /> : <PowerOff size={15} />}
                      </button>
                      <button onClick={() => handleDelete(s._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {schools.length === 0 && (
                <tr><td colSpan={6} className="p-12 text-center text-gray-400">No schools registered</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {showEdit && editSchool && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowEdit(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit School</h2>
              <button onClick={() => setShowEdit(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <input required placeholder="School Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
              <select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white">
                <option value="tvet">TVET</option>
                <option value="general_education">General Education</option>
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="District" value={editForm.district} onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                <input placeholder="Sector" value={editForm.sector} onChange={(e) => setEditForm({ ...editForm, sector: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
              </div>
              <input required placeholder="Email" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
              <input placeholder="Phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
              <input placeholder="Admin Name" value={editForm.adminName} onChange={(e) => setEditForm({ ...editForm, adminName: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-md">Save</button>
                <button type="button" onClick={() => setShowEdit(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition font-medium">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {passwordSchool && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPasswordSchool(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Set Admin Password</h2>
              <button onClick={() => setPasswordSchool(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <p className="text-sm text-gray-500 mb-3">Set new password for <span className="font-medium text-gray-700">{passwordSchool.name}</span> admin</p>
            <form onSubmit={handleSetPassword} className="space-y-3">
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New admin password"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
              <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-md">Set Password</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
