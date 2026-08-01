import { useEffect, useState } from 'react';
import { Plus, Search, Edit3, Trash2, Book, X, UserCheck, Archive } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Pagination from '../components/Pagination';
import ExportButtons from '../components/ExportButtons';
import { exportExcel, printTable } from '../utils/export';
import { useAuth } from '../context/AuthContext';

const PAGE_SIZE = 15;

const EXCEL_COLUMNS = ['Title', 'Author', 'Category', 'Location', 'ISBN', 'Quantity', 'Available'];

export default function Books() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', author: '', category: '', isbn: '', quantity: 1, available: 1, location: '' });
  const [page, setPage] = useState(1);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [borrowBook, setBorrowBook] = useState(null);
  const [nesaCode, setNesaCode] = useState('');
  const [borrowStudent, setBorrowStudent] = useState(null);
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [studentLoading, setStudentLoading] = useState(false);

  const loadBooks = async () => {
    const params = {};
    if (search) params.search = search;
    if (categoryFilter) params.category = categoryFilter;
    if (locationFilter) params.location = locationFilter;
    if (availabilityFilter) params.availability = availabilityFilter;
    const res = await api.get('/books', { params });
    setBooks(res.data);
  };

  const loadLocations = async () => {
    try {
      const res = await api.get('/books/locations');
      setLocations(res.data);
    } catch { /* ignore */ }
  };

  const loadCategories = async () => {
    try {
      const res = await api.get('/reports/categories');
      setCategoryStats(res.data);
    } catch { /* ignore */ }
  };

  useEffect(() => { loadBooks(); }, [search, categoryFilter, locationFilter, availabilityFilter]);
  useEffect(() => { loadLocations(); }, []);
  useEffect(() => { loadCategories(); }, []);
  useEffect(() => { setPage(1); }, [search, categoryFilter, locationFilter, availabilityFilter]);

  const categories = [...new Set(books.map((b) => b.category).filter(Boolean))];
  const totalPages = Math.ceil(books.length / PAGE_SIZE);
  const paginatedBooks = books.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const quantity = parseInt(form.quantity) || 0;
    const available = parseInt(form.available) || 0;
    if (quantity < 1) { toast.error('Quantity must be at least 1'); return; }
    if (available > quantity) { toast.error('Available copies cannot be greater than quantity'); return; }
    setLoading(true);
    try {
      if (editBook) {
        await api.put(`/books/${editBook._id}`, form);
        toast.success('Book updated successfully');
      } else {
        await api.post('/books', form);
        toast.success('Book added successfully');
      }
      setShowModal(false);
      setEditBook(null);
      setForm({ title: '', author: '', category: '', isbn: '', quantity: 1, available: 1, location: '' });
      loadBooks();
      loadLocations();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (book) => {
    setEditBook(book);
    setForm({ title: book.title, author: book.author || '', category: book.category || '', isbn: book.isbn || '', quantity: book.quantity, available: book.available, location: book.location || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    try {
      await api.delete(`/books/${id}`);
      toast.success('Book deleted');
      loadBooks();
    } catch (err) {
      toast.error('Failed to delete book');
    }
  };

  const handleArchive = async (id) => {
    if (!confirm('Archive this book?')) return;
    try {
      await api.put(`/books/${id}/archive`);
      toast.success('Book archived');
      loadBooks();
    } catch {
      toast.error('Failed to archive book');
    }
  };

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

  const handleBorrowSubmit = async () => {
    if (!borrowStudent) { toast.error('Look up a student first'); return; }
    setBorrowLoading(true);
    try {
      await api.post('/borrowed', { book: borrowBook._id, student: borrowStudent._id });
      toast.success(`"${borrowBook.title}" borrowed by ${borrowStudent.studentName}`);
      setShowBorrowModal(false);
      setBorrowBook(null);
      setNesaCode('');
      setBorrowStudent(null);
      loadBooks();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to borrow book');
    } finally {
      setBorrowLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Books</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your school book catalog</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButtons
            disabled={books.length === 0}
            onExcel={() => exportExcel(
              books.map((b) => ({ Title: b.title, Author: b.author || '', Category: b.category || '', Location: b.location || '', ISBN: b.isbn || '', Quantity: b.quantity, Available: b.available })),
              'Books', 'books')}
            onPrint={() => printTable('Books List', EXCEL_COLUMNS,
              books.map((b) => ({ Title: b.title, Author: b.author || '', Category: b.category || '', Location: b.location || '', ISBN: b.isbn || '', Quantity: b.quantity, Available: b.available })),
              user?.school?.name)}
          />
          <button onClick={() => { setEditBook(null); setForm({ title: '', author: '', category: '', isbn: '', quantity: 1, available: 1, location: '' }); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-md font-medium text-sm">
            <Plus size={16} /> Add Book
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
            placeholder="Search by title, author..." />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white">
          <option value="">All Locations</option>
          {locations.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white">
          <option value="">All Availability</option>
          <option value="available">Available</option>
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
                <th className="text-left p-4 font-semibold text-blue-700">Location</th>
                <th className="text-left p-4 font-semibold text-blue-700">ISBN</th>
                <th className="text-center p-4 font-semibold text-blue-700">Qty</th>
                <th className="text-center p-4 font-semibold text-blue-700">Avail</th>
                <th className="text-center p-4 font-semibold text-blue-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBooks.map((book, idx) => (
                <tr key={book._id} className={`border-b border-gray-50 hover:bg-blue-50/30 transition ${idx % 2 ? 'bg-blue-50/20' : 'bg-white'}`}>
                  <td className="p-4 font-medium text-gray-900">{book.title}</td>
                  <td className="p-4 text-gray-500">{book.author || '-'}</td>
                  <td className="p-4"><span className="px-2.5 py-1 bg-blue-50 rounded-full text-xs text-blue-600">{book.category || 'Uncategorized'}</span></td>
                  <td className="p-4"><span className="px-2.5 py-1 bg-indigo-50 rounded-full text-xs text-indigo-600">{book.location || '-'}</span></td>
                  <td className="p-4 text-gray-400 font-mono text-xs">{book.isbn || '-'}</td>
                  <td className="p-4 text-center">{book.quantity}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${book.available > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                      {book.available}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {book.available > 0 && (
                        <button onClick={() => { setBorrowBook(book); setNesaCode(''); setBorrowStudent(null); setShowBorrowModal(true); }}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition" title="Borrow">
                          <UserCheck size={15} />
                        </button>
                      )}
                      <button onClick={() => handleEdit(book)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit"><Edit3 size={15} /></button>
                      <button onClick={() => handleArchive(book._id)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition" title="Archive"><Archive size={15} /></button>
                      <button onClick={() => handleDelete(book._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {books.length === 0 && (
                <tr><td colSpan={8} className="p-12 text-center text-gray-400">
                  <Book size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No books found</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm mb-6">
        <div className="flex items-center justify-between p-5 pb-0">
          <div>
            <h2 className="font-semibold text-gray-900">Library Categories</h2>
            <p className="text-gray-500 text-sm mt-0.5">{categoryStats.length} categories available in the library</p>
          </div>
          <ExportButtons
            disabled={categoryStats.length === 0}
            onExcel={() => exportExcel(categoryStats.map((c) => ({ Category: c.category, Titles: c.titles, Copies: c.copies })), 'Categories', 'categories')}
            onPrint={() => printTable('Library Categories', ['Category', 'Titles', 'Copies'],
              categoryStats.map((c) => ({ Category: c.category, Titles: c.titles, Copies: c.copies })),
              user?.school?.name)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-emerald-50 to-teal-50">
                <th className="text-left p-4 font-semibold text-emerald-700">Category</th>
                <th className="text-center p-4 font-semibold text-emerald-700">Book Titles</th>
                <th className="text-center p-4 font-semibold text-emerald-700">Total Copies</th>
              </tr>
            </thead>
            <tbody>
              {categoryStats.map((c, idx) => (
                <tr key={c.category} className={`border-b border-gray-50 hover:bg-emerald-50/30 transition ${idx % 2 ? 'bg-emerald-50/20' : 'bg-white'}`}>
                  <td className="p-4 font-medium text-gray-900 capitalize">{c.category}</td>
                  <td className="p-4 text-center text-gray-700">{c.titles}</td>
                  <td className="p-4 text-center text-gray-700">{c.copies}</td>
                </tr>
              ))}
              {categoryStats.length === 0 && (
                <tr><td colSpan={3} className="p-8 text-center text-gray-400">No categories found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">{editBook ? 'Edit Book' : 'Add New Book'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required placeholder="Book Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
              <input placeholder="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                <input placeholder="ISBN" value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
                <select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white">
                  <option value="">Select existing location</option>
                  {locations.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
                <input placeholder="Or type a new location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition mt-2"
                  list="location-options" />
                <datalist id="location-options">
                  {locations.map((l) => <option key={l} value={l} />)}
                </datalist>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
                  <input type="number" min="1" value={form.quantity} onChange={(e) => {
                    const q = parseInt(e.target.value) || 0;
                    setForm((f) => ({ ...f, quantity: q, available: f.available > q ? q : f.available }));
                  }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Available</label>
                  <input type="number" min="0" max={form.quantity} value={form.available} onChange={(e) => setForm({ ...form, available: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-md disabled:opacity-50">
                  {loading ? 'Saving...' : (editBook ? 'Update Book' : 'Add Book')}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition font-medium">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBorrowModal && borrowBook && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowBorrowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Borrow Book</h2>
              <button onClick={() => setShowBorrowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg transition"><X size={18} /></button>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 mb-4 text-sm">
              <p className="font-medium text-blue-800">{borrowBook.title}</p>
              <p className="text-blue-600 text-xs mt-0.5">Available: {borrowBook.available} copies</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student NESA Code</label>
                <div className="flex gap-2">
                  <input value={nesaCode} onChange={(e) => setNesaCode(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition font-mono"
                    placeholder="12-digit NESA code" maxLength={12} />
                  <button onClick={handleLookupStudent} disabled={studentLoading}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md disabled:opacity-50 text-sm font-medium">
                    {studentLoading ? '...' : 'Lookup'}
                  </button>
                </div>
              </div>
              {borrowStudent && (
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                  <p className="font-medium text-emerald-800">{borrowStudent.studentName}</p>
                  <p className="text-emerald-600 text-xs">Class: {borrowStudent.class || 'N/A'} | Level: {borrowStudent.level || 'N/A'}</p>
                </div>
              )}
              <button onClick={handleBorrowSubmit} disabled={!borrowStudent || borrowLoading}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-md disabled:opacity-50 text-sm">
                {borrowLoading ? 'Processing...' : 'Confirm Borrow'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
