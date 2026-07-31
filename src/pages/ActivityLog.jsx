import { useEffect, useState } from 'react';
import { Activity, Download, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import api from '../api/axios';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 15;
const actionColors = {
  CREATE: 'bg-emerald-50 text-emerald-700',
  UPDATE: 'bg-blue-50 text-blue-700',
  DELETE: 'bg-red-50 text-red-700',
  ARCHIVE: 'bg-amber-50 text-amber-700',
  RESTORE: 'bg-teal-50 text-teal-700',
  BORROW: 'bg-orange-50 text-orange-700',
  RETURN: 'bg-green-50 text-green-700',
  REQUEST: 'bg-indigo-50 text-indigo-700',
  APPROVE: 'bg-purple-50 text-purple-700',
  REJECT: 'bg-rose-50 text-rose-700',
};

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [page, setPage] = useState(1);

  const load = async () => {
    try {
      const res = await api.get('/activity');
      setLogs(res.data);
    } catch {
      toast.error('Failed to load activity log');
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = logs.filter((l) => {
    if (search) {
      const q = search.toLowerCase();
      const match = (l.user || '').toLowerCase().includes(q) || (l.details?.title || l.details?.name || '').toLowerCase().includes(q) || (l.entity || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    if (actionFilter && l.action !== actionFilter) return false;
    if (entityFilter && l.entity !== entityFilter) return false;
    return true;
  });

  useEffect(() => { setPage(1); }, [search, actionFilter, entityFilter]);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const downloadExcel = () => {
    const data = logs.map((l, i) => ({
      '#': i + 1,
      Date: new Date(l.createdAt).toLocaleString(),
      User: l.user || 'System',
      Role: l.userRole,
      Action: l.action,
      Entity: l.entity,
      Details: l.details?.title || l.details?.name || l.details?.book || l.details?.tableName || '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Activity Log');
    XLSX.writeFile(wb, `activity_log_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success('Activity log downloaded');
  };

  const actions = [...new Set(logs.map((l) => l.action))];
  const entities = [...new Set(logs.map((l) => l.entity))];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Activity size={24} className="text-blue-500" /> Activity Log</h1>
          <p className="text-gray-500 text-sm mt-1">All system changes tracked automatically</p>
        </div>
        <button onClick={downloadExcel} disabled={logs.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-md font-medium text-sm disabled:opacity-50">
          <Download size={16} /> Download Log (Excel)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search user, entity, details..."
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white" />
        </div>
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white">
          <option value="">All Actions</option>
          {actions.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white">
          <option value="">All Entities</option>
          {entities.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <th className="text-left p-4 font-semibold text-blue-700">Date</th>
                <th className="text-left p-4 font-semibold text-blue-700">User</th>
                <th className="text-left p-4 font-semibold text-blue-700">Role</th>
                <th className="text-left p-4 font-semibold text-blue-700">Action</th>
                <th className="text-left p-4 font-semibold text-blue-700">Entity</th>
                <th className="text-left p-4 font-semibold text-blue-700">Details</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((l, idx) => (
                <tr key={l._id} className={`border-b border-gray-50 hover:bg-blue-50/30 transition ${idx % 2 ? 'bg-blue-50/20' : 'bg-white'}`}>
                  <td className="p-4 text-gray-600">{new Date(l.createdAt).toLocaleString()}</td>
                  <td className="p-4 font-medium text-gray-900">{l.user || 'System'}</td>
                  <td className="p-4"><span className="px-2.5 py-1 bg-gray-100 rounded-full text-xs text-gray-600 capitalize">{l.userRole}</span></td>
                  <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${actionColors[l.action] || 'bg-gray-100 text-gray-600'}`}>{l.action}</span></td>
                  <td className="p-4 text-gray-700">{l.entity}</td>
                  <td className="p-4 text-gray-500">{l.details?.title || l.details?.name || l.details?.book || l.details?.tableName || '-'}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-12 text-center text-gray-400">
                  <Activity size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No activity logged yet</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
