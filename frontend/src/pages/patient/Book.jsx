import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Appointments, Doctors } from '../../api/endpoints';

export default function Book() {
  const { doctorId } = useParams();
  const nav = useNavigate();
  const [doc, setDoc] = useState(null);
  const [when, setWhen] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { Doctors.get(doctorId).then(setDoc); }, [doctorId]);

  const book = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const a = await Appointments.book({ doctorId, scheduledAt: new Date(when).toISOString(), reason });
      toast.success(`Booked. You're #${a.queuePosition} in queue.`);
      nav(`/patient/queue/${a.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-extrabold">Book an appointment</h1>
      {doc && <p className="text-ink-900/60 mt-1">with Dr. {doc.fullName} · {doc.specialization}</p>}
      <form onSubmit={book} className="card mt-6 space-y-4">
        <div>
          <label className="label">When</label>
          <input type="datetime-local" className="input" value={when} onChange={e=>setWhen(e.target.value)} required/>
        </div>
        <div>
          <label className="label">Reason for visit</label>
          <textarea className="input" rows={4} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Briefly describe your symptoms"/>
        </div>
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Booking…' : 'Confirm appointment'}</button>
      </form>
    </div>
  );
}
