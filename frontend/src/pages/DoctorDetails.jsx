import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Doctors } from '../api/endpoints';
import { initials } from '../lib/utils';
import { CalendarDays, MapPin, ShieldCheck, Star } from 'lucide-react';

export default function DoctorDetails() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [avail, setAvail] = useState([]);
  useEffect(() => {
    Doctors.get(id).then(setDoc);
    Doctors.availability(id).then(setAvail).catch(()=>{});
  }, [id]);

  if (!doc) return <div className="max-w-5xl mx-auto px-6 py-10">Loading…</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 card">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center text-2xl font-bold">{initials(doc.fullName)}</div>
          <div>
            <h1 className="text-2xl font-extrabold flex items-center gap-2">Dr. {doc.fullName} {doc.verified && <ShieldCheck className="w-5 h-5 text-brand-600"/>}</h1>
            <div className="text-ink-900/60">{doc.specialization} · {doc.yearsExperience || 0} years</div>
            <div className="flex items-center gap-4 mt-1 text-sm text-ink-900/70">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {doc.location || '—'}</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-500 fill-amber-500"/> {Number(doc.rating||0).toFixed(1)}</span>
            </div>
          </div>
        </div>
        <div className="mt-5"><h3 className="font-semibold">About</h3><p className="text-sm text-ink-900/70 mt-1">{doc.bio || 'No biography yet.'}</p></div>
        <div className="mt-5"><h3 className="font-semibold">Clinic</h3><p className="text-sm text-ink-900/70 mt-1">{doc.clinicName || '—'}</p></div>
      </div>
      <div className="card">
        <div className="text-sm text-ink-900/60">Consultation fee</div>
        <div className="text-3xl font-extrabold">${Number(doc.consultationFee || 0).toFixed(0)}</div>
        <Link to={`/patient/book/${doc.id}`} className="btn-primary w-full mt-5"><CalendarDays className="w-4 h-4"/> Book appointment</Link>
        <div className="mt-6">
          <h4 className="font-semibold text-sm">Weekly availability</h4>
          <ul className="mt-2 space-y-1 text-sm">
            {avail.length === 0 && <li className="text-ink-900/50">No schedule published yet.</li>}
            {avail.map((a,i) => (
              <li key={i} className="flex justify-between text-ink-900/75">
                <span>{a.dayOfWeek}</span>
                <span>{a.startTime} – {a.endTime}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
