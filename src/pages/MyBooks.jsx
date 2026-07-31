import { useEffect, useState } from 'react';
import { Search, Send, Archive, BookOpen, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 15;

export default function MyBooks() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [availability, setAvailability] = useState('all');
  const [page, setPage] = useState(1);
  const [requestBook, setRequestBook] = useState(null);
  const [requesting, setRequesting] = useState(false);

  const load = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (availability === 'available') params.availability = 'available';
      const res = await api.get('/books', { params });
      setBooks(res.data);
    } catch {
      toast.error('Failed to load books');
    }
  };

  useEffect(() => { load(); }, [search, categoryFilter, availability]);
  useEffect(() => { setPage(1); }, [search, categoryFilter, availability]);

  const categories = [...new Set(books.map((b) => b.category).filter(Boolean))];
  const totalPages = Math.ceil(books.length / PAGE_SIZE);
  const paginated = books.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleRequest = async () => {
    if (!requestBook) return;
    setRequesting(true);
    try {
      await api.post('/requests', { book: requestBook._id });
      toast.success('Book request submitted! You will be notified when it arrives.');
      setRequestBook(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit request');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Available Books</h1>
        <p className="text-gray-500 text-sm mt-1">Browse the library catalog and request books</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, author..."
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white" />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={availability} onChange={(e) => setAvailability(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white">
          <option value="all">All Books</option>
          <option value="available">Available Now</option>
          <option value="unavailable">Unavailable</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <th className="text-left p-4 font-semibold text-blue-700">Title</th>
                <th className="text-left p-4 font-semibold text-blue-700">Author</th>
                <th className="text-left p-4 font-semibold text-blue-700">Category</th>
                <th className="text-center p-4 font-semibold text-blue-700">Availability</th>
                <th className="text-center p-4 font-semibold text-blue-700">Request</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((b, idx) => (
                <tr key={b._id} className={`border-b border-gray-50 hover:bg-blue-50/30 transition ${b.archived ? 'bg-amber-50/40' : idx % 2 ? 'bg-blue-50/20' : 'bg-white'}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{b.title}</span>
                      {b.archived && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                          <Archive size={11} /> Archived
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-gray-500">{b.author || '-'}</td>
                  <td className="p-4"><span className="px-2.5 py-1 bg-blue-50 rounded-full text-xs text-blue-600">{b.category || 'Uncategorized'}</span></td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${b.available > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                      {b.available > 0 ? `${b.available} Available` : 'Out of stock'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => setRequestBook(b)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-xs font-medium shadow-sm">
                      <Send size={13} /> Request
                    </button>
                  </td>
                </tr>
              ))}
              {books.length === 0 && (
                <tr><td colSpan={5} className="p-12 text-center text-gray-400">
                  <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No books found</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {requestBook && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setRequestBook(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Request Book</h2>
              <button onClick={() => setRequestBook(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 mb-4">
              <p className="font-medium text-blue-800">{requestBook.title}</p>
              <p className="text-blue-600 text-xs mt-0.5">{requestBook.author || 'Unknown author'}</p>
            </div>
            <p className="text-sm text-gray-600 mb-4">Submit a request and the librarian will notify you when the book arrives.</p>
            <button onClick={handleRequest} disabled={requesting}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-md disabled:opacity-50 text-sm">
              {requesting ? 'Submitting...' : 'Confirm Request'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
