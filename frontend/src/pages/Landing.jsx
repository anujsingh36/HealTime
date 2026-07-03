import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Specs } from '../api/endpoints';
import { Heart, Sparkles, Baby, Brain, Bone, Stethoscope, Clock, ShieldCheck, BellRing, Search } from 'lucide-react';

const ICONS = { heart: Heart, sparkles: Sparkles, baby: Baby, brain: Brain, bone: Bone, stethoscope: Stethoscope };

export default function Landing() {
  const [specs, setSpecs] = useState([]);
  useEffect(() => { Specs.list().then(setSpecs).catch(() => setSpecs([
    {name:'Cardiology',slug:'cardiology',icon:'heart'},
    {name:'Dermatology',slug:'dermatology',icon:'sparkles'},
    {name:'Pediatrics',slug:'pediatrics',icon:'baby'},
    {name:'Neurology',slug:'neurology',icon:'brain'},
    {name:'Orthopedics',slug:'orthopedics',icon:'bone'},
    {name:'General',slug:'general-medicine',icon:'stethoscope'}
  ])); }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-50 via-white to-ink-50"/>
        <div className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full bg-brand-200/40 blur-3xl -z-10"/>
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.5}}>
            <span className="badge-green mb-5"><span className="w-1.5 h-1.5 rounded-full bg-brand-600"/> Live queue · real-time ETA</span>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight">
              Book a doctor.<br/>
              <span className="text-brand-700">Skip the line.</span>
            </h1>
            <p className="mt-5 text-lg text-ink-900/70 max-w-lg">
              HealTime brings appointments, live queue tracking and medical records into one calm, clinical experience patients and doctors actually enjoy.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/doctors" className="btn-primary"><Search className="w-4 h-4"/> Find a doctor</Link>
              <Link to="/auth?mode=register" className="btn-ghost">Create account</Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-ink-900/60">
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-brand-600"/> Verified doctors</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-brand-600"/> Real-time ETA</div>
              <div className="flex items-center gap-2"><BellRing className="w-4 h-4 text-brand-600"/> Smart reminders</div>
            </div>
          </motion.div>

          <motion.div initial={{opacity:0,scale:.96}} animate={{opacity:1,scale:1}} transition={{duration:.6,delay:.1}} className="relative">
            <div className="card !p-5 rotate-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-ink-900/60">Next up</div>
                  <div className="font-semibold">Dr. Maya Rao · Cardiology</div>
                </div>
                <span className="badge-green">Confirmed</span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-brand-50 p-3">
                  <div className="text-2xl font-bold text-brand-700">#3</div>
                  <div className="text-[11px] uppercase tracking-wide text-ink-900/60">In queue</div>
                </div>
                <div className="rounded-xl bg-ink-50 p-3">
                  <div className="text-2xl font-bold">22m</div>
                  <div className="text-[11px] uppercase tracking-wide text-ink-900/60">ETA</div>
                </div>
                <div className="rounded-xl bg-coral-500/10 p-3">
                  <div className="text-2xl font-bold text-coral-600">10:00</div>
                  <div className="text-[11px] uppercase tracking-wide text-ink-900/60">Slot</div>
                </div>
              </div>
            </div>
            <div className="card !p-4 -mt-4 ml-12 rotate-[-2deg]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-100 grid place-items-center text-brand-700"><BellRing className="w-4 h-4"/></div>
                <div>
                  <div className="text-sm font-semibold">You're next!</div>
                  <div className="text-xs text-ink-900/60">Dr. Rao will see you in ~5 min</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-extrabold">A calmer way to manage care</h2>
          <p className="mt-3 text-ink-900/70">Three roles, one experience. Built for patients, doctors and clinic admins.</p>
        </div>
        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {[
            { icon: Search, t:'Discover & book', d:'Search by specialization, location or symptoms. Pick a verified doctor and book in 30 seconds.' },
            { icon: Clock,  t:'Live queue tracking', d:'Know your position and ETA in real time. No more guessing in waiting rooms.' },
            { icon: ShieldCheck, t:'Secure records', d:'Upload reports once; share with any doctor on HealTime. Role-based access throughout.' }
          ].map((f,i)=>(
            <div key={i} className="card">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 grid place-items-center mb-4"><f.icon className="w-5 h-5"/></div>
              <h3 className="font-semibold text-lg">{f.t}</h3>
              <p className="text-sm text-ink-900/65 mt-1.5">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Specs */}
      <section id="specs" className="bg-white border-y border-ink-100">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold">Specializations</h2>
              <p className="text-ink-900/70 mt-2">Care from primary to specialty — all in one place.</p>
            </div>
            <Link to="/doctors" className="hidden md:inline-flex btn-ghost">Browse all</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {specs.map(s => {
              const Icon = ICONS[s.icon] || Stethoscope;
              return (
                <Link key={s.slug} to={`/doctors?spec=${s.slug}`} className="card hover:-translate-y-0.5 hover:border-brand-200 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 grid place-items-center mb-3"><Icon className="w-5 h-5"/></div>
                  <div className="font-semibold">{s.name}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="rounded-3xl bg-gradient-to-r from-brand-700 to-brand-500 p-10 md:p-14 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,white,transparent_40%)]"/>
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold">Care, on your schedule.</h2>
              <p className="mt-3 text-white/85 max-w-md">Join HealTime as a patient, doctor or clinic. Start in under a minute.</p>
            </div>
            <div className="flex md:justify-end gap-3 flex-wrap">
              <Link to="/auth?mode=register&role=PATIENT" className="btn bg-white text-brand-700 hover:bg-brand-50">I'm a patient</Link>
              <Link to="/auth?mode=register&role=DOCTOR" className="btn bg-coral-500 text-white hover:bg-coral-600">I'm a doctor</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
