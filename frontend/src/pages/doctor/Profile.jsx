import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Doctors, Specs } from '../../api/endpoints';

export default function DoctorProfile() {
  const [f, setF] = useState({
    bio:'', consultationFee:'', clinicName:'', location:'', yearsExperience:'', licenseNumber:'', specializationId:'',
    avgConsultationMin:'', clinicLat:'', clinicLng:''
  });
  const [specs, setSpecs] = useState([]);
  const [locating, setLocating] = useState(false);
  useEffect(() => { Specs.list().then(setSpecs).catch(()=>{}); }, []);
  const set = (k) => e => setF(s => ({ ...s, [k]: e.target.value }));

  const useCurrentLocation = () => {
    if (!navigator.geolocation) { toast.error('Location is not supported on this device/browser.'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setF(s => ({ ...s, clinicLat: pos.coords.latitude, clinicLng: pos.coords.longitude }));
        setLocating(false);
        toast.success('Clinic location captured.');
      },
      () => { setLocating(false); toast.error('Could not get your location.'); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const save = async (e) => {
    e.preventDefault();
    await Doctors.updateMe({
      ...f,
      consultationFee: f.consultationFee || null,
      yearsExperience: f.yearsExperience ? Number(f.yearsExperience) : null,
      specializationId: f.specializationId || null,
      avgConsultationMin: f.avgConsultationMin ? Number(f.avgConsultationMin) : null,
      clinicLat: f.clinicLat !== '' ? Number(f.clinicLat) : null,
      clinicLng: f.clinicLng !== '' ? Number(f.clinicLng) : null
    });
    toast.success('Profile updated');
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold">Doctor profile</h1>
      <form onSubmit={save} className="card mt-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          <div><label className="label">Specialization</label>
            <select className="input" value={f.specializationId} onChange={set('specializationId')}>
              <option value="">— keep current —</option>
              {specs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div><label className="label">License number</label><input className="input" value={f.licenseNumber} onChange={set('licenseNumber')}/></div>
          <div><label className="label">Years of experience</label><input className="input" type="number" value={f.yearsExperience} onChange={set('yearsExperience')}/></div>
          <div><label className="label">Consultation fee</label><input className="input" type="number" step="0.01" value={f.consultationFee} onChange={set('consultationFee')}/></div>
          <div><label className="label">Clinic name</label><input className="input" value={f.clinicName} onChange={set('clinicName')}/></div>
          <div><label className="label">Location (address)</label><input className="input" value={f.location} onChange={set('location')}/></div>
        </div>
        <div><label className="label">Bio</label><textarea className="input" rows={4} value={f.bio} onChange={set('bio')}/></div>

        <div className="border-t border-ink-100 pt-4">
          <div className="text-sm font-semibold text-ink-900/80 mb-1">Live queue settings</div>
          <p className="text-xs text-ink-900/50 mb-3">
            Used to give patients a realistic wait estimate and a "time to leave" alert. Once you've
            completed a few appointments, the average duration below is calculated automatically —
            this is just a starting fallback.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="label">Avg. consultation time (minutes)</label>
              <input className="input" type="number" min="1" placeholder="e.g. 15" value={f.avgConsultationMin} onChange={set('avgConsultationMin')}/>
            </div>
            <div>
              <label className="label">Clinic coordinates (for travel-time alerts)</label>
              <div className="flex gap-2">
                <input className="input" type="number" step="any" placeholder="Latitude" value={f.clinicLat} onChange={set('clinicLat')}/>
                <input className="input" type="number" step="any" placeholder="Longitude" value={f.clinicLng} onChange={set('clinicLng')}/>
              </div>
              <button type="button" onClick={useCurrentLocation} disabled={locating}
                className="text-xs text-brand-700 font-medium mt-1 hover:underline">
                {locating ? 'Locating…' : 'Use my current location'}
              </button>
            </div>
          </div>
        </div>

        <button className="btn-primary">Save profile</button>
      </form>
    </div>
  );
}