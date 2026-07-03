import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Admin } from '../../api/endpoints';

export default function AdminPatients() {
  const [list, setList] = useState([]);
  const load = () => Admin.patients().then(setList).catch(()=>{});
  useEffect(() => { load(); }, []);
  const disable = async (id) => { await Admin.disable(id); toast.success('User disabled'); load(); };
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Patients</h1>
      <div className="card !p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-900/60 text-xs uppercase tracking-wide">
            <tr><th className="text-left p-4">Name</th><th className="text-left p-4">Email</th><th className="text-left p-4">Phone</th><th className="text-left p-4">Status</th><th className="p-4"></th></tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {list.map(u => (
              <tr key={u.id}>
                <td className="p-4 font-semibold">{u.fullName}</td>
                <td className="p-4 text-ink-900/70">{u.email}</td>
                <td className="p-4 text-ink-900/70">{u.phone || '—'}</td>
                <td className="p-4">{u.enabled ? <span className="badge-green">Active</span> : <span className="badge-rose">Disabled</span>}</td>
                <td className="p-4 text-right">{u.enabled && <button onClick={()=>disable(u.id)} className="btn text-xs text-coral-600 hover:bg-coral-500/10">Disable</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
