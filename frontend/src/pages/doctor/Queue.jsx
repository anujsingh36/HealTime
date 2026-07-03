import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Appointments } from '../../api/endpoints';
import { StatusBadge } from '../../components/StatusBadge';

export default function DoctorQueue() {
  const [list, setList] = useState([]);
  const [details, setDetails] = useState({});

  const load = async () => {
    const q = await Appointments.doctorQueue();
    setList(q);
    const appts = await Appointments.doctorList();
    const map = {};
    appts.forEach(a => map[a.id] = a);
    setDetails(map);
  };
  useEffect(() => { load(); const t = setInterval(load, 20000); return () => clearInterval(t); }, []);

  const setStatus = async (id, status) => {
    await Appointments.setStatus(id, { status });
    toast.success(`Marked ${status.toLowerCase().replace('_',' ')}`);
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Live queue</h1>
      <div className="card !p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-900/60 text-xs uppercase tracking-wide">
            <tr><th className="text-left p-4">#</th><th className="text-left p-4">Patient</th><th className="text-left p-4">Status</th><th className="text-left p-4">ETA</th><th className="p-4"></th></tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {list.map(q => {
              const d = details[q.appointmentId];
              return (
                <tr key={q.appointmentId}>
                  <td className="p-4 font-bold text-brand-700">#{q.position}</td>
                  <td className="p-4">{d?.patientName || '—'}</td>
                  <td className="p-4"><StatusBadge status={q.status}/></td>
                  <td className="p-4">~{q.estimatedWaitMin}m</td>
                  <td className="p-4 text-right space-x-2">
                    <button className="btn-ghost text-xs" onClick={()=>setStatus(q.appointmentId,'IN_PROGRESS')}>Call next</button>
                    <button className="btn-primary text-xs" onClick={()=>setStatus(q.appointmentId,'COMPLETED')}>Complete</button>
                    <button className="btn text-xs text-coral-600 hover:bg-coral-500/10" onClick={()=>setStatus(q.appointmentId,'NO_SHOW')}>No-show</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
