import { useState } from 'react';
import {
  BookOpen, Users, BarChart3, Shield, CheckCircle, ArrowRight, Menu, X,
  ExternalLink, Send, Search, Book, Mail, Bell, Clock, FileSpreadsheet,
  Layers, Sparkles, GraduationCap, UserCog, Library, ClipboardList, Zap,
  Globe, Phone, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Reveal from '../components/Reveal';

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
    { icon: Book, title: 'Book Management', desc: 'Add, edit, search and organize your whole catalog. Real-time stock and availability for every title and copy.', color: 'from-blue-500 to-cyan-500' },
    { icon: Users, title: 'Student & Teacher Management', desc: 'Register students by 12-digit NESA codes and teachers by 16-digit National IDs. Auto role detection for everyone.', color: 'from-emerald-500 to-teal-500' },
    { icon: ClipboardList, title: 'Borrow, Return & Due Dates', desc: 'Track every transaction with flexible return dates, bulk borrowing, Return-All, and automatic availability updates.', color: 'from-orange-500 to-amber-500' },
    { icon: Bell, title: 'Email & Reminders', desc: 'Automatic receipts on borrow and return, plus daily due-date and overdue email reminders so nothing gets forgotten.', color: 'from-pink-500 to-rose-500' },
    { icon: BarChart3, title: 'Reports & Analytics', desc: 'Daily reports, filtered exports to Excel, and printable tables on borrows, returns and library activity at a glance.', color: 'from-purple-500 to-indigo-500' },
    { icon: Send, title: 'Digital Requests', desc: 'Students and teachers request books online. Librarians approve or reject with one click — everything is logged.', color: 'from-cyan-500 to-blue-500' },
  ];

  const tools = [
    { icon: Zap, label: 'Bulk Borrow & Return All' },
    { icon: FileSpreadsheet, label: 'Excel Import & Export' },
    { icon: Bell, label: 'In-App Notifications' },
    { icon: Clock, label: 'Activity Log & Audit Trail' },
    { icon: Layers, label: 'Book Archive' },
    { icon: Shield, label: 'Role-Based Access' },
    { icon: GraduationCap, label: 'NESA / National-ID Lookup' },
    { icon: Library, label: 'Multi-School Platform' },
  ];

  const steps = [
    { n: '01', title: 'Apply Your School', desc: 'Submit your school details in one minute. Our team activates your library workspace.' },
    { n: '02', title: 'Set Up Your Library', desc: 'Import books and register students and teachers. Everything is organized by school.' },
    { n: '03', title: 'Borrow, Return & Get Alerts', desc: 'Issue books with return dates and let the system send borrow, return and reminder emails automatically.' },
  ];

  const roles = [
    {
      icon: UserCog, title: 'Super Admin', accent: 'from-red-500 to-rose-500',
      points: ['Manage all schools', 'Approve school applications', 'Year, level & system settings'],
    },
    {
      icon: Library, title: 'Librarian / Admin', accent: 'from-blue-500 to-cyan-500',
      points: ['Books, students & teachers', 'Borrow/return with due dates', 'Requests, reports & activity'],
    },
    {
      icon: GraduationCap, title: 'Teacher', accent: 'from-emerald-500 to-teal-500',
      points: ['Browse the catalog', 'Request and borrow books', 'Track my books & history'],
    },
    {
      icon: BookOpen, title: 'Student', accent: 'from-purple-500 to-indigo-500',
      points: ['Search books by NESA code', 'Request books digitally', 'Get due-date reminders'],
    },
  ];

  const stats = [
    { label: 'Schools Onboarded', value: '2+' },
    { label: 'Books Catalogued', value: '634' },
    { label: 'Students Registered', value: '348' },
    { label: 'Teachers Active', value: '60' },
  ];

  const mockBorrows = [
    { title: 'Physics for Rwanda S4', person: 'Uwase A. · S4', status: 'Return', color: 'from-emerald-500 to-teal-500' },
    { title: 'Kiswahili Kitabu 2', person: 'Irumva H. · Teacher', status: 'Return', color: 'from-blue-500 to-cyan-500' },
    { title: 'Entrepreneurship S5', person: 'Mugisha J. · S5', status: 'Overdue', color: 'from-rose-500 to-pink-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* ===== NAVBAR ===== */}
      <nav className="bg-slate-950/70 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition">
              <BookOpen className="text-white" size={18} />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-white">LMS</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Platform</span>
            </span>
          </a>
          <button className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="hidden lg:flex items-center gap-1">
            <a href="#features" className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/5 transition rounded-lg text-sm font-medium">Features</a>
            <a href="#how" className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/5 transition rounded-lg text-sm font-medium">How It Works</a>
            <a href="#roles" className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/5 transition rounded-lg text-sm font-medium">For Everyone</a>
            <a href="#contact" className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/5 transition rounded-lg text-sm font-medium">Contact</a>
            <div className="w-px h-6 bg-white/10 mx-3" />
            <button onClick={() => navigate('/login')} className="px-5 py-2 text-blue-300 border border-blue-400/30 rounded-xl hover:bg-blue-500/10 transition font-medium text-sm">Sign In</button>
            <button onClick={() => setShowForm(true)} className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition font-medium text-sm">Apply Your School</button>
          </div>
        </div>
        {menuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-slate-900/95 p-4 space-y-2">
            <a href="#features" className="block px-4 py-2 text-slate-300 hover:bg-white/5 rounded-lg" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#how" className="block px-4 py-2 text-slate-300 hover:bg-white/5 rounded-lg" onClick={() => setMenuOpen(false)}>How It Works</a>
            <a href="#roles" className="block px-4 py-2 text-slate-300 hover:bg-white/5 rounded-lg" onClick={() => setMenuOpen(false)}>For Everyone</a>
            <a href="#contact" className="block px-4 py-2 text-slate-300 hover:bg-white/5 rounded-lg" onClick={() => setMenuOpen(false)}>Contact</a>
            <button onClick={() => { setMenuOpen(false); navigate('/login'); }} className="block w-full text-left px-4 py-2 text-blue-300 hover:bg-blue-500/10 rounded-lg">Sign In</button>
            <button onClick={() => { setMenuOpen(false); setShowForm(true); }} className="block w-full text-left px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">Apply Your School</button>
          </div>
        )}
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute -top-32 -left-32 w-[30rem] h-[30rem] bg-blue-600/30 blur-[120px] rounded-full animate-blob" />
        <div className="absolute -top-20 right-0 w-[26rem] h-[26rem] bg-indigo-600/30 blur-[120px] rounded-full animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 w-[24rem] h-[24rem] bg-cyan-500/20 blur-[120px] rounded-full animate-blob animation-delay-4000" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/0 via-slate-950/40 to-slate-950" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur rounded-full text-sm text-cyan-200 border border-white/10">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-ping-slow" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                </span>
                School Library Management System
              </div>

              <h1 className="animate-fade-up mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]" style={{ animationDelay: '120ms' }}>
                Manage Your School
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 animate-gradient-x">Library The Smart Way</span>
              </h1>

              <p className="animate-fade-up mt-6 text-lg text-slate-300 max-w-xl leading-relaxed" style={{ animationDelay: '240ms' }}>
                A complete platform for Rwandan schools — books, students, teachers, borrowing with due dates, and automatic email notifications. Built for TVET and General Education schools.
              </p>

              <div className="animate-fade-up mt-8 flex flex-wrap gap-4" style={{ animationDelay: '360ms' }}>
                <button onClick={() => setShowForm(true)}
                  className="group px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-semibold shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 hover:scale-[1.02] transition flex items-center gap-2">
                  Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
                </button>
                <button onClick={() => navigate('/login')}
                  className="px-7 py-3.5 border border-white/15 text-white rounded-xl font-semibold hover:bg-white/10 transition">
                  Sign In
                </button>
              </div>

              <div className="animate-fade-up mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-400" style={{ animationDelay: '480ms' }}>
                <span className="flex items-center gap-2"><CheckCircle className="text-emerald-400" size={16} /> Multi-school SaaS</span>
                <span className="flex items-center gap-2"><CheckCircle className="text-emerald-400" size={16} /> Email + reminder alerts</span>
                <span className="flex items-center gap-2"><CheckCircle className="text-emerald-400" size={16} /> NESA code validation</span>
              </div>
            </div>

            {/* App preview mockup */}
            <div className="relative hidden lg:block animate-fade-up" style={{ animationDelay: '300ms' }}>
              <div className="animate-float rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl shadow-blue-900/40">
                <div className="flex items-center gap-1.5 pb-4 border-b border-white/10">
                  <span className="w-3 h-3 rounded-full bg-rose-400" />
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-3 text-xs text-slate-400">library-dashboard</span>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-4">
                  {[
                    { label: 'Books', value: '634', color: 'from-blue-500 to-cyan-500' },
                    { label: 'Borrowed', value: '59', color: 'from-emerald-500 to-teal-500' },
                    { label: 'Users', value: '408', color: 'from-purple-500 to-indigo-500' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-2xl bg-white/5 border border-white/10 p-3 text-center">
                      <p className={`text-xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-2.5">
                  {mockBorrows.map((b) => (
                    <div key={b.title} className="flex items-center justify-between rounded-2xl bg-white/5 border border-white/10 p-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br ${b.color} flex items-center justify-center`}>
                          <Book size={15} className="text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{b.title}</p>
                          <p className="text-xs text-slate-400">{b.person}</p>
                        </div>
                      </div>
                      <button className="shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/10 text-white hover:bg-white/20 transition">{b.status}</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute -top-6 -right-6 animate-float-delay rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur p-3.5 shadow-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                    <Bell size={15} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white">Return due today</p>
                    <p className="text-[11px] text-slate-400">2 book(s) · reminder sent</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-5 -left-8 animate-float-slow rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur p-3.5 shadow-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <Mail size={15} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white">Receipt delivered</p>
                    <p className="text-[11px] text-slate-400">Borrow confirmation ✓</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="relative bg-white text-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 100}>
                <div className="text-center">
                  <p className="text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 animate-gradient-x">
                    {s.value}
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-500">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="bg-slate-950 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-400/20 rounded-full text-sm text-blue-300 font-medium">
              <Sparkles size={14} /> Powerful features
            </span>
            <h2 className="mt-5 text-3xl lg:text-5xl font-extrabold tracking-tight">
              Everything Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Library Needs</span>
            </h2>
            <p className="mt-4 text-lg text-slate-400">One platform for cataloguing, borrowing, learners and reporting.</p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 100}>
                <div className="card-glow group rounded-3xl border border-white/10 bg-white/5 p-7 h-full hover:border-blue-400/40 relative overflow-hidden">
                  <div className={`absolute -top-16 -right-16 w-40 h-40 rounded-full bg-gradient-to-br ${f.color} opacity-10 blur-2xl group-hover:opacity-25 transition`} />
                  <div className={`relative w-12 h-12 bg-gradient-to-br ${f.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <f.icon className="text-white" size={22} />
                  </div>
                  <h3 className="relative text-lg font-semibold text-white mt-5">{f.title}</h3>
                  <p className="relative text-slate-400 text-sm mt-2 leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Tool pills */}
          <Reveal className="mt-12 text-center">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">...and a toolbox of extras</p>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
            {tools.map((t, i) => (
              <Reveal key={t.label} delay={(i % 4) * 80}>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 hover:border-cyan-400/40 hover:bg-white/10 transition">
                  <t.icon size={18} className="text-cyan-300 shrink-0" />
                  <span className="text-sm text-slate-200 font-medium">{t.label}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" className="relative bg-slate-900 py-20 lg:py-28 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[34rem] h-[20rem] bg-indigo-600/20 blur-[120px] rounded-full" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-400/20 rounded-full text-sm text-indigo-300 font-medium">
              <Zap size={14} /> How it works
            </span>
            <h2 className="mt-5 text-3xl lg:text-5xl font-extrabold tracking-tight">
              Up and running in <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-300">three steps</span>
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8 mt-14 relative">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 140}>
                <div className="relative">
                  <div className={`text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br ${i === 0 ? 'from-blue-400 to-cyan-300' : i === 1 ? 'from-indigo-400 to-purple-300' : 'from-emerald-400 to-teal-300'}`}>
                    {s.n}
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-white">{s.title}</h3>
                  <p className="mt-2 text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ROLES ===== */}
      <section id="roles" className="bg-slate-950 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-400/20 rounded-full text-sm text-emerald-300 font-medium">
              <Users size={14} /> Built for every role
            </span>
            <h2 className="mt-5 text-3xl lg:text-5xl font-extrabold tracking-tight">
              One system, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">four perspectives</span>
            </h2>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
            {roles.map((r, i) => (
              <Reveal key={r.title} delay={(i % 4) * 100}>
                <div className="card-glow group rounded-3xl border border-white/10 bg-white/5 p-6 h-full hover:border-emerald-400/40">
                  <div className={`w-12 h-12 bg-gradient-to-br ${r.accent} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <r.icon className="text-white" size={22} />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{r.title}</h3>
                  <ul className="mt-3 space-y-2">
                    {r.points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm text-slate-400">
                        <CheckCircle size={15} className="text-emerald-400 mt-0.5 shrink-0" /> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-slate-900 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 px-8 py-14 lg:px-16 lg:py-20 text-center shadow-2xl shadow-indigo-900/40">
              <div className="absolute -top-20 -left-20 w-72 h-72 bg-cyan-400/30 blur-[100px] rounded-full animate-blob" />
              <div className="absolute -bottom-24 -right-16 w-80 h-80 bg-pink-500/30 blur-[100px] rounded-full animate-blob animation-delay-4000" />
              <div className="absolute inset-0 bg-grid" />
              <div className="relative">
                <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight">Ready to modernize your school library?</h2>
                <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
                  Join schools already managing thousands of books, students and teachers on LMS Platform.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <button onClick={() => setShowForm(true)}
                    className="px-7 py-3.5 bg-white text-indigo-700 rounded-xl font-semibold hover:bg-blue-50 hover:scale-[1.02] transition shadow-xl flex items-center gap-2">
                    Apply Your School <ArrowRight size={18} />
                  </button>
                  <button onClick={() => navigate('/login')}
                    className="px-7 py-3.5 border border-white/30 text-white rounded-xl font-semibold hover:bg-white/10 transition">
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== APPLICATION MODAL ===== */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
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

      {/* ===== FOOTER ===== */}
      <footer id="contact" className="bg-black text-white py-14 lg:py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="text-white" size={16} />
                </div>
                <span className="text-lg font-bold">
                  <span className="text-white">LMS</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Platform</span>
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                A complete school library management solution built for Rwandan schools. SaaS-based, secure, and easy to use. Developed by Moses Irumva Hirwa.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white flex items-center gap-2"><Globe size={16} className="text-blue-400" /> Quick Links</h4>
              <div className="space-y-2.5 text-sm text-slate-400">
                <a href="#features" className="block hover:text-white transition flex items-center gap-1.5"><ChevronRight size={13} /> Features</a>
                <button onClick={() => setShowForm(true)} className="block hover:text-white transition flex items-center gap-1.5"><ChevronRight size={13} /> Apply Your School</button>
                <button onClick={() => navigate('/login')} className="block hover:text-white transition flex items-center gap-1.5"><ChevronRight size={13} /> Sign In</button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white flex items-center gap-2"><UserCog size={16} className="text-cyan-400" /> Developed By</h4>
              <div className="text-sm text-slate-400 space-y-2.5">
                <p className="text-white font-medium">Moses Irumva Hirwa</p>
                <a href="mailto:irumvahirwmoses001@gmail.com" className="block hover:text-white transition flex items-center gap-1.5">
                  <Mail size={14} /> irumvahirwmoses001@gmail.com
                </a>
                <a href="https://github.com/irumvahirwa-eng" target="_blank" rel="noreferrer" className="block hover:text-white transition flex items-center gap-1.5">
                  <ExternalLink size={14} /> GitHub: irumvahirwa-eng
                </a>
                <p className="flex items-center gap-1.5"><Phone size={14} /> 0727477160</p>
                <a href="https://instagram.com/i.r.u.m.v.a.m.o.s.e.s" target="_blank" rel="noreferrer" className="block hover:text-white transition flex items-center gap-1.5">
                  <ExternalLink size={14} /> Instagram
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-10 pt-6 text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} LMS Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}