import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Doctors, Specs } from '../../api/endpoints';

export default function DoctorProfile() {
  const [f, setF] = useState({ bio:'', consultationFee:'', clinicName:'', location:'', yearsExperience:'', licenseNumber:'', specializationId:'' });
  const [specs, setSpecs] = useState([]);
  useEffect(() => { Specs.list().then(setSpecs).catch(()=>{}); }, []);
  const set = (k) => e => setF(s => ({ ...s, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    await Doctors.updateMe({
      ...f,
      consultationFee: f.consultationFee || null,
      yearsExperience: f.yearsExperience ? Number(f.yearsExperience) : null,
      specializationId: f.specializationId || null
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
          <div><label className="label">Location</label><input className="input" value={f.location} onChange={set('location')}/></div>
        </div>
        <div><label className="label">Bio</label><textarea className="input" rows={4} value={f.bio} onChange={set('bio')}/></div>
        <button className="btn-primary">Save profile</button>
      </form>
    </div>
  );
}
