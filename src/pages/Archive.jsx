import { useEffect, useState } from 'react';
import { Archive as ArchiveIcon, RotateCcw, Trash2, Search, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import api from '../api/axios';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 15;

export default function Archive() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const params = { archived: 'true' };
      if (search) params.search = search;
      const res = await api.get('/books', { params });
      setBooks(res.data);
    } catch {
      toast.error('Failed to load archived books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search]);
  useEffect(() => { setPage(1); }, [search]);

  const totalPages = Math.ceil(books.length / PAGE_SIZE);
  const paginated = books.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleRestore = async (id) => {
    try {
      await api.put(`/books/${id}/restore`);
      toast.success('Book restored to available');
      load();
    } catch {
      toast.error('Failed to restore book');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this book permanently from the database?')) return;
    try {
      await api.delete(`/books/${id}`);
      toast.success('Book permanently deleted');
      load();
    } catch {
      toast.error('Failed to delete book');
    }
  };

  const downloadExcel = () => {
    if (books.length === 0) {
      toast.error('No archived books to download');
      return;
    }
    const data = books.map((b) => ({
      Title: b.title,
      Author: b.author || '-',
      Category: b.category || 'Uncategorized',
      ISBN: b.isbn || '-',
      ArchivedAt: b.archivedAt ? new Date(b.archivedAt).toLocaleDateString() : '-'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Archived Books');
    XLSX.writeFile(wb, `archived_books_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success('Archived books downloaded');
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><ArchiveIcon size={24} className="text-amber-500" /> Archived Books</h1>
        <p className="text-gray-500 text-sm mt-1">Restore archived books or permanently delete them from the database</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
            placeholder="Search archived books..." />
        </div>
        <button onClick={downloadExcel} disabled={books.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition shadow-md font-medium text-sm disabled:opacity-50">
          <Download size={16} /> Download All
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-amber-50 to-orange-50">
                <th className="text-left p-4 font-semibold text-amber-700">Title</th>
                <th className="text-left p-4 font-semibold text-amber-700">Author</th>
                <th className="text-left p-4 font-semibold text-amber-700">Category</th>
                <th className="text-left p-4 font-semibold text-amber-700">ISBN</th>
                <th className="text-left p-4 font-semibold text-amber-700">Archived At</th>
                <th className="text-center p-4 font-semibold text-amber-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((book, idx) => (
                <tr key={book._id} className={`border-b border-gray-50 hover:bg-amber-50/30 transition ${idx % 2 ? 'bg-amber-50/20' : 'bg-white'}`}>
                  <td className="p-4 font-medium text-gray-900">{book.title}</td>
                  <td className="p-4 text-gray-500">{book.author || '-'}</td>
                  <td className="p-4"><span className="px-2.5 py-1 bg-amber-100 rounded-full text-xs text-amber-700">{book.category || 'Uncategorized'}</span></td>
                  <td className="p-4 text-gray-400 font-mono text-xs">{book.isbn || '-'}</td>
                  <td className="p-4 text-gray-500">{book.archivedAt ? new Date(book.archivedAt).toLocaleDateString() : '-'}</td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleRestore(book._id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition" title="Restore to available">
                        <RotateCcw size={15} />
                      </button>
                      <button onClick={() => handleDelete(book._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete permanently">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {books.length === 0 && !loading && (
                <tr><td colSpan={6} className="p-12 text-center text-gray-400">
                  <ArchiveIcon size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No archived books</p>
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
