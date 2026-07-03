import { useEffect, useState } from 'react';
import { Admin } from '../../api/endpoints';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, Stethoscope, CalendarDays, CheckCircle2, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const [s, setS] = useState(null);
  useEffect(() => { Admin.stats().then(setS).catch(()=>{}); }, []);
  const data = s ? [
    { name: 'Patients', value: s.totalPatients },
    { name: 'Doctors',  value: s.totalDoctors },
    { name: 'Total Appts',  value: s.totalAppointments },
    { name: 'Today',  value: s.appointmentsToday },
    { name: 'Pending', value: s.pendingAppointments },
    { name: 'Done', value: s.completedAppointments }
  ] : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Admin dashboard</h1>
      <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Stat icon={Users} label="Patients" value={s?.totalPatients ?? '—'}/>
        <Stat icon={Stethoscope} label="Doctors" value={s?.totalDoctors ?? '—'}/>
        <Stat icon={CalendarDays} label="Appointments" value={s?.totalAppointments ?? '—'}/>
        <Stat icon={Clock} label="Pending" value={s?.pendingAppointments ?? '—'}/>
        <Stat icon={CheckCircle2} label="Completed" value={s?.completedAppointments ?? '—'}/>
      </div>
      <div className="card">
        <h2 className="font-semibold mb-4">System at a glance</h2>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid stroke="#e9eef1" vertical={false}/>
              <XAxis dataKey="name" stroke="#6b7a80" fontSize={12}/>
              <YAxis stroke="#6b7a80" fontSize={12}/>
              <Tooltip cursor={{ fill: 'rgba(20,184,148,.06)' }} contentStyle={{ borderRadius: 12, border: '1px solid #e9eef1' }}/>
              <Bar dataKey="value" fill="#14b894" radius={[8,8,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
function Stat({ icon: Icon, label, value }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="text-sm text-ink-900/60">{label}</div>
        <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 grid place-items-center"><Icon className="w-4 h-4"/></div>
      </div>
      <div className="text-3xl font-extrabold mt-2">{value}</div>
    </div>
  );
}
