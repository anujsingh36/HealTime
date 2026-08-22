import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Appointments } from '../../api/endpoints';
import { StatusBadge } from '../../components/StatusBadge';

export default function Queue() {
  const { id } = useParams();
  const [q, setQ] = useState(null);
  const [sharingLocation, setSharingLocation] = useState(false);

  useEffect(() => {
    const load = () => Appointments.queue(id).then(setQ).catch(()=>{});
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [id]);

  const sendLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Location sharing is not supported on this device/browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        Appointments.updateLocation(id, pos.coords.latitude, pos.coords.longitude).catch(() => {});
      },
      () => { /* permission denied or unavailable — silently skip this cycle */ },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [id]);

  const startSharing = () => {
    setSharingLocation(true);
    sendLocation();
    toast.success("Sharing your location — we'll tell you when it's time to leave.");
  };

  useEffect(() => {
    if (!sharingLocation) return;
    const t = setInterval(sendLocation, 3 * 60 * 1000); // every 3 minutes
    return () => clearInterval(t);
  }, [sharingLocation, sendLocation]);

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

        {!sharingLocation ? (
          <button onClick={startSharing} className="btn-primary mt-8 w-full">
            Share my location — get a "time to leave" alert
          </button>
        ) : (
          <div className="mt-8 text-sm text-brand-700 font-medium">
            📍 Sharing your location — we'll notify you when it's time to head out.
          </div>
        )}
      </motion.div>
    </div>
  );
}