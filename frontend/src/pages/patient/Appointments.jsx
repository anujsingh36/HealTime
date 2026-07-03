import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Appointments } from '../../api/endpoints';
import { fmtDate } from '../../lib/utils';
import { StatusBadge } from '../../components/StatusBadge';
import { Empty } from '../../components/Empty';

export default function PatientAppointments() {
  const [list, setList] = useState([]);
  const load = () => Appointments.mine().then(setList).catch(()=>{});
  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    await Appointments.cancel(id);
    toast.success('Appointment cancelled');
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Your appointments</h1>
      <div className="card !p-0 overflow-hidden">
        {list.length === 0
          ? <Empty title="No appointments yet" hint="Find a doctor and book your first visit."/>
          : <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-900/60 text-xs uppercase tracking-wide">
                <tr><th className="text-left p-4">Doctor</th><th className="text-left p-4">When</th><th className="text-left p-4">Status</th><th className="text-left p-4">Queue</th><th className="p-4"></th></tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {list.map(a => (
                  <tr key={a.id}>
                    <td className="p-4"><div className="font-semibold">Dr. {a.doctorName}</div><div className="text-xs text-ink-900/60">{a.specialization}</div></td>
                    <td className="p-4">{fmtDate(a.scheduledAt)}</td>
                    <td className="p-4"><StatusBadge status={a.status}/></td>
                    <td className="p-4">{a.queuePosition ? `#${a.queuePosition} · ~${a.estimatedWaitMin}m` : '—'}</td>
                    <td className="p-4 text-right">
                      <Link to={`/patient/queue/${a.id}`} className="btn-ghost text-xs mr-2">Track</Link>
                      {['PENDING','CONFIRMED'].includes(a.status) && <button onClick={()=>cancel(a.id)} className="btn text-xs text-coral-600 hover:bg-coral-500/10">Cancel</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>}
      </div>
    </div>
  );
}
