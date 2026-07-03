import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Records } from '../../api/endpoints';
import { fmtDate } from '../../lib/utils';
import { Empty } from '../../components/Empty';
import { FileText, Upload } from 'lucide-react';

export default function PatientRecords() {
  const [list, setList] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const load = () => Records.mine().then(setList).catch(()=>{});
  useEffect(() => { load(); }, []);

  const upload = async (e) => {
    e.preventDefault();
    if (!file || !title) return;
    const form = new FormData();
    form.append('file', file);
    form.append('title', title);
    if (type) form.append('recordType', type);
    await Records.upload(form);
    toast.success('Record uploaded');
    setFile(null); setTitle(''); setType(''); load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Medical records</h1>

      <form onSubmit={upload} className="card grid md:grid-cols-4 gap-3 items-end">
        <div className="md:col-span-2"><label className="label">Title</label><input className="input" value={title} onChange={e=>setTitle(e.target.value)} required/></div>
        <div><label className="label">Type</label><input className="input" placeholder="e.g. Blood test" value={type} onChange={e=>setType(e.target.value)}/></div>
        <div><label className="label">File</label><input type="file" onChange={e=>setFile(e.target.files?.[0])} required className="text-sm"/></div>
        <button className="btn-primary md:col-span-4"><Upload className="w-4 h-4"/> Upload</button>
      </form>

      <div className="card !p-0 overflow-hidden">
        {list.length === 0
          ? <Empty icon={FileText} title="No records yet" hint="Upload reports to share with doctors during visits."/>
          : <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-900/60 text-xs uppercase tracking-wide">
                <tr><th className="text-left p-4">Title</th><th className="text-left p-4">Type</th><th className="text-left p-4">Uploaded</th><th className="p-4"></th></tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {list.map(r => (
                  <tr key={r.id}>
                    <td className="p-4 font-semibold">{r.title}</td>
                    <td className="p-4 text-ink-900/70">{r.recordType || '—'}</td>
                    <td className="p-4 text-ink-900/70">{fmtDate(r.createdAt)}</td>
                    <td className="p-4 text-right"><a href={r.fileUrl} target="_blank" rel="noreferrer" className="btn-ghost text-xs">View</a></td>
                  </tr>
                ))}
              </tbody>
            </table>}
      </div>
    </div>
  );
}
