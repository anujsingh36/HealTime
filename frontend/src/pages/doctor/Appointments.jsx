import { useEffect, useState } from 'react';
import { Appointments } from '../../api/endpoints';
import { fmtDate } from '../../lib/utils';
import { StatusBadge } from '../../components/StatusBadge';
import { Empty } from '../../components/Empty';

export default function DoctorAppointments() {
  const [list, setList] = useState([]);
  useEffect(() => { Appointments.doctorList().then(setList).catch(()=>{}); }, []);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">All appointments</h1>
      <div className="card !p-0 overflow-hidden">
        {list.length === 0
          ? <Empty title="No appointments yet"/>
          : <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-900/60 text-xs uppercase tracking-wide">
                <tr><th className="text-left p-4">Patient</th><th className="text-left p-4">When</th><th className="text-left p-4">Reason</th><th className="text-left p-4">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {list.map(a => (
                  <tr key={a.id}>
                    <td className="p-4 font-semibold">{a.patientName}</td>
                    <td className="p-4">{fmtDate(a.scheduledAt)}</td>
                    <td className="p-4 text-ink-900/70">{a.reason || '—'}</td>
                    <td className="p-4"><StatusBadge status={a.status}/></td>
                  </tr>
                ))}
              </tbody>
            </table>}
      </div>
    </div>
  );
}
