import { useEffect, useState } from 'react';
import { History, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import api from '../api/axios';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 15;

export default function MyHistory() {
  const [records, setRecords] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const load = async () => {
    try {
      const res = await api.get('/borrowed/my-history');
      setRecords(res.data);
    } catch {
      toast.error('Failed to load history');
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = statusFilter ? records.filter((r) => r.status === statusFilter) : records;
  useEffect(() => { setPage(1); }, [statusFilter]);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const downloadExcel = () => {
    const data = records.map((r, i) => ({
      '#': i + 1,
      Book: r.book?.title || 'N/A',
      Author: r.book?.author || '-',
      ISBN: r.book?.isbn || '-',
      'Borrow Date': r.borrowDate ? new Date(r.borrowDate).toLocaleDateString() : '-',
      'Return Date': r.returnDate ? new Date(r.returnDate).toLocaleDateString() : '-',
      Status: r.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Borrow History');
    XLSX.writeFile(wb, `my_borrow_history_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success('History downloaded as Excel');
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><History size={24} className="text-blue-500" /> My Borrow History</h1>
          <p className="text-gray-500 text-sm mt-1">All books you have borrowed and returned</p>
        </div>
        <button onClick={downloadExcel} disabled={records.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-md font-medium text-sm disabled:opacity-50">
          <Download size={16} /> Download Report
        </button>
      </div>

      <div className="max-w-xs mb-5">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white">
          <option value="">All Statuses</option>
          <option value="borrowed">Currently Borrowed</option>
          <option value="returned">Returned</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <th className="text-left p-4 font-semibold text-blue-700">Book</th>
                <th className="text-left p-4 font-semibold text-blue-700">Author</th>
                <th className="text-left p-4 font-semibold text-blue-700">Borrow Date</th>
                <th className="text-left p-4 font-semibold text-blue-700">Return Date</th>
                <th className="text-center p-4 font-semibold text-blue-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((r, idx) => (
                <tr key={r._id} className={`border-b border-gray-50 hover:bg-blue-50/30 transition ${idx % 2 ? 'bg-blue-50/20' : 'bg-white'}`}>
                  <td className="p-4 font-medium text-gray-900">{r.book?.title || 'N/A'}</td>
                  <td className="p-4 text-gray-500">{r.book?.author || '-'}</td>
                  <td className="p-4 text-gray-500">{r.borrowDate ? new Date(r.borrowDate).toLocaleDateString() : '-'}</td>
                  <td className="p-4 text-gray-500">{r.returnDate ? new Date(r.returnDate).toLocaleDateString() : '-'}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${r.status === 'borrowed' ? 'bg-orange-50 text-orange-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={5} className="p-12 text-center text-gray-400">
                  <History size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No borrow history found</p>
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
