import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Admin } from '../../api/endpoints';
import { Empty } from '../../components/Empty';

export default function AdminVerify() {
  const [list, setList] = useState([]);
  const load = () => Admin.doctors().then(r => setList(r.filter(d => !d.verified))).catch(()=>{});
  useEffect(() => { load(); }, []);
  const verify = async (id) => { await Admin.verify(id); toast.success('Doctor verified'); load(); };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Pending verifications</h1>
      <div className="card">
        {list.length === 0
          ? <Empty title="Nothing pending" hint="All doctor licenses have been reviewed."/>
          : <ul className="divide-y divide-ink-100">
              {list.map(d => (
                <li key={d.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Dr. {d.fullName}</div>
                    <div className="text-xs text-ink-900/60">{d.specialization} · License {d.licenseNumber}</div>
                  </div>
                  <button onClick={()=>verify(d.id)} className="btn-primary text-xs">Approve</button>
                </li>
              ))}
            </ul>}
      </div>
    </div>
  );
}