import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Doctors, Specs } from '../api/endpoints';
import { Search, MapPin, Star, ShieldCheck } from 'lucide-react';
import { initials } from '../lib/utils';
import { Empty } from '../components/Empty';

export default function DoctorSearch() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [spec, setSpec] = useState(params.get('spec') || '');
  const [specs, setSpecs] = useState([]);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { Specs.list().then(setSpecs).catch(()=>{}); }, []);

  useEffect(() => {
    setLoading(true);
    Doctors.search({ q: q || undefined, spec: spec || undefined, size: 24 })
      .then(p => setList(p.content || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [q, spec]);

  const submit = (e) => { e.preventDefault(); setParams({ ...(q?{q}:{}), ...(spec?{spec}:{}) }); };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-extrabold">Find a doctor</h1>
      <p className="text-ink-900/60 mt-1">Search by name, location or specialization.</p>

      <form onSubmit={submit} className="card mt-6 flex flex-col md:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 px-3 rounded-xl border border-ink-200 focus-within:border-brand-500 focus-within:shadow-ring">
          <Search className="w-4 h-4 text-ink-900/50"/>
          <input className="flex-1 py-2.5 outline-none bg-transparent text-sm" placeholder="Doctor name, clinic or city" value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
        <select className="input md:max-w-xs" value={spec} onChange={e=>setSpec(e.target.value)}>
          <option value="">All specializations</option>
          {specs.map(s => <option key={s.slug} value={s.slug}>{s.name}</option>)}
        </select>
        <button className="btn-primary">Search</button>
      </form>

      <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && Array.from({length:6}).map((_,i)=>(<div key={i} className="card animate-pulse h-44"/>))}
        {!loading && list.length === 0 && <div className="col-span-full"><Empty title="No doctors found" hint="Try a different specialization or location."/></div>}
        {list.map(d => (
          <Link key={d.id} to={`/doctors/${d.id}`} className="card hover:-translate-y-0.5 hover:border-brand-200 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center font-semibold">{initials(d.fullName)}</div>
              <div className="min-w-0">
                <div className="font-semibold truncate flex items-center gap-1.5">Dr. {d.fullName} {d.verified && <ShieldCheck className="w-4 h-4 text-brand-600"/>}</div>
                <div className="text-xs text-ink-900/60 truncate">{d.specialization} · {d.yearsExperience || 0} yrs</div>
              </div>
            </div>
            <p className="text-sm text-ink-900/65 mt-3 line-clamp-2">{d.bio || 'Board-certified specialist on HealTime.'}</p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-ink-900/70"><MapPin className="w-4 h-4"/> {d.location || 'Online'}</span>
              <span className="flex items-center gap-1 font-semibold"><Star className="w-4 h-4 text-amber-500 fill-amber-500"/> {Number(d.rating || 0).toFixed(1)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
