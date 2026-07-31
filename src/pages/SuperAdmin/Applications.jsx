import { useEffect, useState } from 'react';
import { Check, X, ExternalLink } from 'lucide-react';
import api from '../../api/axios';

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [rejectId, setRejectId] = useState(null);
  const [reason, setReason] = useState('');

  const load = async () => {
    const res = await api.get('/applications');
    setApplications(res.data);
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id) => {
    await api.put(`/applications/${id}/approve`);
    load();
  };

  const handleReject = async (id) => {
    await api.put(`/applications/${id}/reject`, { reason });
    setRejectId(null);
    setReason('');
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">School Applications</h1>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3">School Name</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">District</th>
              <th className="text-left p-3">Contact</th>
              <th className="text-left p-3">Admin</th>
              <th className="text-center p-3">Status</th>
              <th className="text-center p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app._id} className="border-t hover:bg-slate-50">
                <td className="p-3 font-medium">{app.schoolName}</td>
                <td className="p-3 text-slate-500">{app.schoolType}</td>
                <td className="p-3 text-slate-500">{app.district}</td>
                <td className="p-3 text-slate-500">{app.email}<br/>{app.phone}</td>
                <td className="p-3 text-slate-500">{app.adminName}</td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    app.status === 'approved' ? 'bg-green-100 text-green-700' :
                    app.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>{app.status}</span>
                </td>
                <td className="p-3 text-center">
                  {app.status === 'pending' && (
                    <>
                      <button onClick={() => handleApprove(app._id)} className="text-green-600 hover:text-green-800 mr-2" title="Approve"><Check size={18} /></button>
                      <button onClick={() => setRejectId(app._id)} className="text-red-600 hover:text-red-800" title="Reject"><X size={18} /></button>
                    </>
                  )}
                  {app.status === 'rejected' && app.rejectionReason && (
                    <span className="text-xs text-slate-400">{app.rejectionReason}</span>
                  )}
                </td>
              </tr>
            ))}
            {applications.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-slate-400">No applications found</td></tr>}
          </tbody>
        </table>
      </div>

      {rejectId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Reject Application</h2>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="w-full border rounded-lg px-3 py-2 mb-3" rows={3} placeholder="Reason for rejection..." />
            <div className="flex gap-2">
              <button onClick={() => handleReject(rejectId)} className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Confirm Reject</button>
              <button onClick={() => { setRejectId(null); setReason(''); }} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
