import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Appointments } from '../../api/endpoints';
import { StatusBadge } from '../../components/StatusBadge';

export default function Queue() {
  const { id } = useParams();
  const [q, setQ] = useState(null);
  useEffect(() => {
    const load = () => Appointments.queue(id).then(setQ).catch(()=>{});
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [id]);

  if (!q) return <div>Loading…</div>;

  return (
    <div className="max-w-xl mx-auto text-center">
      <h1 className="text-2xl font-extrabold">Live queue</h1>
      <p className="text-ink-900/60 mt-1">Refreshes automatically every 15 seconds.</p>

      <motion.div initial={{scale:.9,opacity:0}} animate={{scale:1,opacity:1}} className="card mt-8 p-10">
        <div className="text-sm uppercase tracking-wide text-ink-900/60">Your position</div>
        <div className="text-7xl font-extrabold text-brand-700 mt-2">#{q.position ?? '—'}</div>
        <div className="mt-4"><StatusBadge status={q.status}/></div>
        <div className="grid grid-cols-2 gap-3 mt-8">
          <div className="rounded-xl bg-ink-50 p-4">
            <div className="text-2xl font-bold">{q.estimatedWaitMin ?? '—'}m</div>
            <div className="text-xs text-ink-900/60">Estimated wait</div>
          </div>
          <div className="rounded-xl bg-brand-50 p-4">
            <div className="text-2xl font-bold text-brand-700">{q.status === 'IN_PROGRESS' ? 'Now' : 'Soon'}</div>
            <div className="text-xs text-ink-900/60">Status</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
