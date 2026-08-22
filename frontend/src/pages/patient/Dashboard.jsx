import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Appointments } from '../../api/endpoints';
import { fmtDate } from '../../lib/utils';
import { StatusBadge } from '../../components/StatusBadge';
import { CalendarDays, Search, FileText, Clock } from 'lucide-react';

export default function PatientDashboard() {
  const [list, setList] = useState([]);
  useEffect(() => {
    const load = () => Appointments.mine().then(setList).catch(()=>{});
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);
  const upcoming = list.filter(a => ['PENDING','CONFIRMED','IN_PROGRESS'].includes(a.status)).slice(0,3);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Stat icon={CalendarDays} label="Upcoming" value={upcoming.length} hint="appointments"/>
        <Stat icon={Clock} label="Live queues" value={upcoming.filter(a=>a.queuePosition).length} hint="active right now"/>
        <Stat icon={FileText} label="Records" value="—" hint="manage in Records tab"/>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Upcoming appointments</h2>
          <Link to="/doctors" className="btn-ghost text-xs"><Search className="w-3.5 h-3.5"/> Book new</Link>
        </div>
        {upcoming.length === 0 && <p className="text-sm text-ink-900/60">No upcoming appointments. <Link to="/doctors" className="text-brand-700 font-semibold">Find a doctor →</Link></p>}
        <ul className="divide-y divide-ink-100">
          {upcoming.map(a => (
            <li key={a.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-semibold">Dr. {a.doctorName}</div>
                <div className="text-xs text-ink-900/60">{a.specialization} · {fmtDate(a.scheduledAt)}</div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={a.status}/>
                <Link to={`/patient/queue/${a.id}`} className="btn-ghost text-xs">Queue</Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
function Stat({ icon: Icon, label, value, hint }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="text-sm text-ink-900/60">{label}</div>
        <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 grid place-items-center"><Icon className="w-4 h-4"/></div>
      </div>
      <div className="text-3xl font-extrabold mt-2">{value}</div>
      <div className="text-xs text-ink-900/60 mt-0.5">{hint}</div>
    </div>
  );
}