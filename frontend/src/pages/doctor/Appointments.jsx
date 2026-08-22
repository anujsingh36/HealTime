import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Appointments, Records } from '../../api/endpoints';
import { fmtDate } from '../../lib/utils';
import { StatusBadge } from '../../components/StatusBadge';
import { Empty } from '../../components/Empty';

function PatientRecordsModal({ patientId, patientName, onClose }) {
  const [records, setRecords] = useState(null);
  useEffect(() => {
    Records.forPatient(patientId).then(setRecords).catch(() => setRecords([]));
  }, [patientId]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{patientName}'s medical records</h2>
          <button onClick={onClose} className="text-ink-900/50 hover:text-ink-900">✕</button>
        </div>
        {records === null ? (
          <div className="text-sm text-ink-900/60">Loading…</div>
        ) : records.length === 0 ? (
          <Empty title="No records shared by this patient yet" />
        ) : (
          <div className="space-y-3">
            {records.map(r => (
              <button key={r.id} onClick={() => Records.openFile(r.id)}
                className="block w-full text-left rounded-xl border border-ink-100 p-3 hover:border-brand-300 transition-colors">
                <div className="font-semibold text-sm">{r.title}</div>
                <div className="text-xs text-ink-900/50 mt-0.5">
                  {r.recordType || 'Record'} · {fmtDate(r.createdAt)}
                </div>
                {r.notes && <div className="text-xs text-ink-900/60 mt-1">{r.notes}</div>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DoctorAppointments() {
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null); // { patientId, patientName }
  const [updating, setUpdating] = useState(null); // appointment id currently being updated
  const load = () => Appointments.doctorList().then(setList).catch(()=>{});
  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    setUpdating(id);
    try {
      await Appointments.setStatus(id, { status });
      toast.success(`Marked as ${status.toLowerCase().replace('_',' ')}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update status');
    } finally {
      setUpdating(null);
    }
  };

  const Actions = ({ a }) => {
    const busy = updating === a.id;
    if (a.status === 'PENDING' || a.status === 'CONFIRMED') {
      return (
        <div className="flex gap-2">
          <button disabled={busy} onClick={() => setStatus(a.id, 'IN_PROGRESS')} className="text-xs font-medium text-brand-700 hover:underline disabled:opacity-50">Start</button>
          <button disabled={busy} onClick={() => setStatus(a.id, 'NO_SHOW')} className="text-xs font-medium text-ink-900/50 hover:underline disabled:opacity-50">No-show</button>
          <button disabled={busy} onClick={() => setStatus(a.id, 'CANCELLED')} className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50">Cancel</button>
        </div>
      );
    }
    if (a.status === 'IN_PROGRESS') {
      return (
        <button disabled={busy} onClick={() => setStatus(a.id, 'COMPLETED')} className="text-xs font-medium text-brand-700 hover:underline disabled:opacity-50">
          Complete
        </button>
      );
    }
    return null; // COMPLETED / CANCELLED / NO_SHOW — nothing further to do
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">All appointments</h1>
      <div className="card !p-0 overflow-hidden">
        {list.length === 0
          ? <Empty title="No appointments yet"/>
          : <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-900/60 text-xs uppercase tracking-wide">
                <tr><th className="text-left p-4">Patient</th><th className="text-left p-4">When</th><th className="text-left p-4">Reason</th><th className="text-left p-4">Status</th><th className="text-left p-4">Update</th><th className="text-left p-4">Records</th></tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {list.map(a => (
                  <tr key={a.id}>
                    <td className="p-4 font-semibold">{a.patientName}</td>
                    <td className="p-4">{fmtDate(a.scheduledAt)}</td>
                    <td className="p-4 text-ink-900/70">{a.reason || '—'}</td>
                    <td className="p-4"><StatusBadge status={a.status}/></td>
                    <td className="p-4"><Actions a={a}/></td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelected({ patientId: a.patientId, patientName: a.patientName })}
                        className="text-xs font-medium text-brand-700 hover:underline">
                        View records
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>}
      </div>
      {selected && (
        <PatientRecordsModal
          patientId={selected.patientId}
          patientName={selected.patientName}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}