import { useState } from 'react';
import toast from 'react-hot-toast';
import { Doctors } from '../../api/endpoints';

const DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];

export default function DoctorAvailability() {
  const [slots, setSlots] = useState(
    DAYS.map(d => ({ dayOfWeek: d, startTime: '09:00', endTime: '17:00', slotDurationMin: 15, enabled: d !== 'SUNDAY' }))
  );

  const update = (i, k, v) => setSlots(s => s.map((x,idx) => idx===i ? { ...x, [k]: v } : x));

  const save = async () => {
    const payload = { slots: slots.filter(s => s.enabled).map(({enabled, ...rest}) => rest) };
    await Doctors.setAvailability(payload);
    toast.success('Availability saved');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Weekly availability</h1>
      <div className="card space-y-3">
        {slots.map((s,i) => (
          <div key={s.dayOfWeek} className="grid grid-cols-12 gap-3 items-center">
            <label className="col-span-3 flex items-center gap-2 font-medium">
              <input type="checkbox" checked={s.enabled} onChange={e=>update(i,'enabled',e.target.checked)}/> {s.dayOfWeek}
            </label>
            <input type="time" className="input col-span-3" value={s.startTime} onChange={e=>update(i,'startTime',e.target.value)} disabled={!s.enabled}/>
            <input type="time" className="input col-span-3" value={s.endTime} onChange={e=>update(i,'endTime',e.target.value)} disabled={!s.enabled}/>
            <div className="col-span-3 flex items-center gap-2">
              <input type="number" min={5} step={5} className="input" value={s.slotDurationMin} onChange={e=>update(i,'slotDurationMin',Number(e.target.value))} disabled={!s.enabled}/>
              <span className="text-xs text-ink-900/60">min/slot</span>
            </div>
          </div>
        ))}
        <button onClick={save} className="btn-primary mt-3">Save schedule</button>
      </div>
    </div>
  );
}
