import { useEffect, useState } from 'react';
import { Check, X, Search, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 15;

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const load = async () => {
    try {
      const res = await api.get('/requests');
      setRequests(res.data);
    } catch (err) {
      toast.error('Failed to load requests');
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = requests.filter((r) => {
    if (search) {
      const q = search.toLowerCase();
      const match = (r.student?.studentName || '').toLowerCase().includes(q) || (r.book?.title || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    if (statusFilter && r.status !== statusFilter) return false;
    if (dateFilter) {
      const dateStr = new Date(r.createdAt).toLocaleDateString();
      if (!dateStr.toLowerCase().includes(dateFilter.toLowerCase())) return false;
    }
    return true;
  });

  useEffect(() => { setPage(1); }, [search, statusFilter, dateFilter]);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAction = async (id, action) => {
    try {
      await api.put(`/requests/${id}/${action}`);
      toast.success(`Request ${action}ed successfully`);
      load();
    } catch (err) {
      toast.error(`Failed to ${action} request`);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Book Requests</h1>
        <p className="text-gray-500 text-sm mt-1">Approve or reject student book requests</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
            placeholder="Search student or book..." />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
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
                <th className="text-left p-4 font-semibold text-blue-700">Student</th>
                <th className="text-left p-4 font-semibold text-blue-700">Book</th>
                <th className="text-left p-4 font-semibold text-blue-700">Date</th>
                <th className="text-center p-4 font-semibold text-blue-700">Status</th>
                <th className="text-center p-4 font-semibold text-blue-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((r, idx) => (
                <tr key={r._id} className={`border-b border-gray-50 hover:bg-blue-50/30 transition ${idx % 2 ? 'bg-blue-50/20' : 'bg-white'}`}>
                  <td className="p-4 font-medium text-gray-900">{r.student?.studentName || 'N/A'}</td>
                  <td className="p-4 text-gray-500">{r.book?.title || 'N/A'}</td>
                  <td className="p-4 text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      r.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                      r.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                    }`}>{r.status}</span>
                  </td>
                  <td className="p-4 text-center">
                    {r.status === 'pending' ? (
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleAction(r._id, 'approve')}
                          className="p-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition" title="Approve">
                          <Check size={16} />
                        </button>
                        <button onClick={() => handleAction(r._id, 'reject')}
                          className="p-2 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition" title="Reject">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="p-12 text-center text-gray-400">
                  <Send size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No requests found</p>
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
