import { useState } from 'react';
import { BookOpen, Users, BarChart3, Shield, CheckCircle, ArrowRight, Menu, X, ExternalLink, Send, Search, Book, Grid3X3, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function Landing() {
  const [showForm, setShowForm] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [form, setForm] = useState({ schoolName: '', schoolType: 'tvet', district: '', sector: '', phone: '', email: '', adminName: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/applications', form);
      toast.success('Application submitted successfully!');
      setShowForm(false);
      setForm({ schoolName: '', schoolType: 'tvet', district: '', sector: '', phone: '', email: '', adminName: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const features = [
    { icon: Book, title: 'Book Management', desc: 'Easily add, edit, search and organize your entire book catalog. Track quantity and availability in real-time.', color: 'from-blue-500 to-cyan-500' },
    { icon: Users, title: 'Student & Teacher Management', desc: 'Register students with 12-digit NESA codes and teachers with 16-digit National IDs. Role-based access for everyone.', color: 'from-emerald-500 to-teal-500' },
    { icon: BarChart3, title: 'Reports & Analytics', desc: 'Generate detailed daily reports on borrowed and returned books. Monitor library activity at a glance.', color: 'from-purple-500 to-pink-500' },
    { icon: CheckCircle, title: 'Borrow & Return Tracking', desc: 'Track every book transaction. Automatic availability updates when books are checked in or out.', color: 'from-orange-500 to-amber-500' },
    { icon: Shield, title: 'Secure Authentication', desc: 'Multi-role system with automatic role detection. Students, teachers, and admins each get appropriate access.', color: 'from-red-500 to-rose-500' },
    { icon: Send, title: 'Request System', desc: 'Students can request books digitally. Librarians approve or reject with a single click.', color: 'from-indigo-500 to-violet-500' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <BookOpen className="text-white" size={18} />
            </div>
            <span className="text-xl font-bold text-gray-900">LMS Platform</span>
          </div>
          <button className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="hidden lg:flex items-center gap-3">
            <a href="#features" className="px-4 py-2 text-gray-600 hover:text-blue-600 transition rounded-lg hover:bg-gray-50">Features</a>
            <a href="#contact" className="px-4 py-2 text-gray-600 hover:text-blue-600 transition rounded-lg hover:bg-gray-50">Contact</a>
            <button onClick={() => navigate('/login')} className="px-5 py-2 text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition font-medium">Sign In</button>
            <button onClick={() => setShowForm(true)} className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-md font-medium">Apply Your School</button>
          </div>
        </div>
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white p-4 space-y-2">
            <a href="#features" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#contact" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>Contact</a>
            <button onClick={() => { setMenuOpen(false); navigate('/login'); }} className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg">Sign In</button>
            <button onClick={() => { setMenuOpen(false); setShowForm(true); }} className="block w-full text-left px-4 py-2 bg-blue-600 text-white rounded-lg">Apply Your School</button>
          </div>
        )}
      </nav>

      <section className="bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur rounded-full text-sm text-blue-200 mb-6 border border-white/10">
              <BookOpen size={14} /> School Library Management System
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Manage Your School Library<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">The Smart Way</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl leading-relaxed">
              A complete SaaS platform built for Rwandan schools. Manage books, students, teachers, borrowing, and reporting — all in one place. Supports both TVET and General Education schools.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-white text-blue-700 rounded-xl font-semibold hover:bg-blue-50 transition shadow-xl flex items-center gap-2">
                Get Started <ArrowRight />
              </button>
              <button onClick={() => navigate('/login')}
                className="px-6 py-3 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/10 transition">
                Sign In
              </button>
            </div>
            <div className="mt-12 flex flex-wrap gap-8 text-sm text-gray-400">
              <span className="flex items-center gap-2"><CheckCircle className="text-green-400" /> Multi-school SaaS</span>
              <span className="flex items-center gap-2"><CheckCircle className="text-green-400" /> Role-based access</span>
              <span className="flex items-center gap-2"><CheckCircle className="text-green-400" /> NESA code validation</span>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Everything Your Library Needs</h2>
            <p className="mt-3 text-gray-500 text-lg">Powerful features designed for Rwandan schools</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {features.map((f, i) => (
              <div key={i} className="group bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300">
                <div className={`w-12 h-12 bg-gradient-to-br ${f.color} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                  <f.icon className="text-white" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mt-4">{f.title}</h3>
                <p className="text-gray-500 text-sm mt-2 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Apply Your School</h2>
                <p className="text-sm text-gray-500 mt-1">Get your school on the LMS platform</p>
              </div>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                <input required value={form.schoolName} onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School Type</label>
                <select value={form.schoolType} onChange={(e) => setForm({ ...form, schoolType: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition">
                  <option value="tvet">TVET School</option>
                  <option value="general_education">General Education School</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  <input required value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
                  <input required value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Name</label>
                <input required value={form.adminName} onChange={(e) => setForm({ ...form, adminName: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition shadow-md disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      )}

      <footer id="contact" className="bg-gray-900 text-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="text-white" size={16} />
                </div>
                <span className="text-lg font-bold">LMS Platform</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">A complete school library management solution built for Rwandan schools. SaaS-based, secure, and easy to use.Developed by Moses Irumva Hirwa</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <a href="#features" className="block hover:text-white transition">Features</a>
                <button onClick={() => setShowForm(true)} className="block hover:text-white transition">Apply Your School</button>
                <a href="/login" className="block hover:text-white transition">Sign In</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Developed By</h4>
              <div className="text-sm text-gray-400 space-y-2">
                <p className="text-white font-medium">Moses Irumva Hirwa</p>
                <a href="mailto:irumvahirwmoses001@gmail.com" className="block hover:text-white transition flex items-center gap-1.5">
                  <Mail size={14} /> irumvahirwmoses001@gmail.com
                </a>
                <a href="https://github.com/irumvahirwa-eng" target="_blank" className="block hover:text-white transition flex items-center gap-1.5">
                  <ExternalLink size={14} /> GitHub: irumvahirwa-eng
                </a>
                <p className="flex items-center gap-1.5">Phone: 0727477160</p>
                <a href="https://instagram.com/i.r.u.m.v.a.m.o.s.e.s" target="_blank" className="block hover:text-white transition flex items-center gap-1.5">
                  <ExternalLink size={14} /> Instagram
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} LMS Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
