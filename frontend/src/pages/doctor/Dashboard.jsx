import { useEffect, useState } from 'react';
import { Appointments } from '../../api/endpoints';
import { fmtDate } from '../../lib/utils';
import { StatusBadge } from '../../components/StatusBadge';
import { CalendarDays, Clock, CheckCircle2 } from 'lucide-react';

export default function DoctorDashboard() {
  const [list, setList] = useState([]);
  useEffect(() => { Appointments.doctorList().then(setList).catch(()=>{}); }, []);
  const today = new Date().toDateString();
  const todays = list.filter(a => new Date(a.scheduledAt).toDateString() === today);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Stat icon={CalendarDays} label="Today" value={todays.length}/>
        <Stat icon={Clock} label="In queue" value={todays.filter(a=>['CONFIRMED','PENDING','IN_PROGRESS'].includes(a.status)).length}/>
        <Stat icon={CheckCircle2} label="Completed today" value={todays.filter(a=>a.status==='COMPLETED').length}/>
      </div>
      <div className="card">
        <h2 className="font-semibold text-lg mb-4">Today's schedule</h2>
        {todays.length === 0 && <p className="text-sm text-ink-900/60">Nothing on the books today.</p>}
        <ul className="divide-y divide-ink-100">
          {todays.map(a => (
            <li key={a.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-semibold">{a.patientName}</div>
                <div className="text-xs text-ink-900/60">{fmtDate(a.scheduledAt)} · {a.reason || 'General consultation'}</div>
              </div>
              <StatusBadge status={a.status}/>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
function Stat({ icon: Icon, label, value }) {
  return (
    <div className="card flex items-center justify-between">
      <div>
        <div className="text-sm text-ink-900/60">{label}</div>
        <div className="text-3xl font-extrabold">{value}</div>
      </div>
      <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 grid place-items-center"><Icon className="w-5 h-5"/></div>
    </div>
  );
}
