import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 15;

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const load = async () => {
    try {
      const res = await api.get('/requests');
      setRequests(res.data);
    } catch {
      toast.error('Failed to load requests');
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = statusFilter ? requests.filter((r) => r.status === statusFilter) : requests;
  useEffect(() => { setPage(1); }, [statusFilter]);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const statusBadge = {
    pending: 'bg-amber-50 text-amber-700',
    approved: 'bg-emerald-50 text-emerald-700',
    rejected: 'bg-red-50 text-red-700',
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
        <p className="text-gray-500 text-sm mt-1">Track your book requests</p>
      </div>

      <div className="max-w-xs mb-5">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <th className="text-left p-4 font-semibold text-blue-700">Book</th>
                <th className="text-left p-4 font-semibold text-blue-700">Author</th>
                <th className="text-left p-4 font-semibold text-blue-700">Requested</th>
                <th className="text-center p-4 font-semibold text-blue-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((r, idx) => (
                <tr key={r._id} className={`border-b border-gray-50 hover:bg-blue-50/30 transition ${idx % 2 ? 'bg-blue-50/20' : 'bg-white'}`}>
                  <td className="p-4 font-medium text-gray-900">{r.book?.title || 'N/A'}</td>
                  <td className="p-4 text-gray-500">{r.book?.author || '-'}</td>
                  <td className="p-4 text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusBadge[r.status] || 'bg-gray-100 text-gray-600'}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={4} className="p-12 text-center text-gray-400">
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
