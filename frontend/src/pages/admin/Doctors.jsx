import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Admin } from '../../api/endpoints';
import { ShieldCheck } from 'lucide-react';

export default function AdminDoctors() {
  const [list, setList] = useState([]);
  const load = () => Admin.doctors().then(setList).catch(()=>{});
  useEffect(() => { load(); }, []);
  const verify = async (id) => { await Admin.verify(id); toast.success('Doctor verified'); load(); };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">All doctors</h1>
      <div className="card !p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-900/60 text-xs uppercase tracking-wide">
            <tr><th className="text-left p-4">Name</th><th className="text-left p-4">License</th><th className="text-left p-4">Specialization</th><th className="text-left p-4">Verified</th><th className="p-4"></th></tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {list.map(d => (
              <tr key={d.id}>
                <td className="p-4 font-semibold">Dr. {d.fullName}</td>
                <td className="p-4 text-ink-900/70">{d.licenseNumber}</td>
                <td className="p-4">{d.specialization}</td>
                <td className="p-4">{d.verified ? <span className="badge-green"><ShieldCheck className="w-3 h-3"/> Verified</span> : <span className="badge-amber">Pending</span>}</td>
                <td className="p-4 text-right">{!d.verified && <button onClick={()=>verify(d.id)} className="btn-primary text-xs">Verify</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}