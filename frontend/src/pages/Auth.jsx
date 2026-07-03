import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Auth as AuthApi } from '../api/endpoints';
import { useAuth } from '../store/auth';
import { Logo } from '../components/Logo';

export default function Auth() {
  const [params] = useSearchParams();
  const mode = params.get('mode') === 'register' ? 'register' : 'login';
  const nav = useNavigate();
  const setSession = useAuth(s => s.setSession);

  const [form, setForm] = useState({
    email: '', password: '', fullName: '', phone: '',
    role: params.get('role') || 'PATIENT'
  });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = mode === 'register' ? await AuthApi.register(form) : await AuthApi.login(form);
      setSession(data.token, data.user);
      const r = data.user.roles?.[0]?.toLowerCase() || 'patient';
      const redirect = params.get('redirect');
      toast.success(mode === 'register' ? 'Welcome to HealTime!' : 'Welcome back');
      nav(redirect || `/${r}/dashboard`, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] grid md:grid-cols-2 max-w-7xl mx-auto">
      <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-brand-700 to-brand-500 text-white rounded-3xl m-6">
        <Logo size={36}/>
        <div>
          <h2 className="font-display text-4xl font-extrabold leading-tight">Care that respects your time.</h2>
          <p className="mt-3 text-white/85 max-w-md">Live queue tracking, smart reminders and a clinical experience that finally feels modern.</p>
        </div>
        <div className="text-sm text-white/70">© HealTime</div>
      </div>
      <div className="flex items-center justify-center p-8">
        <form onSubmit={submit} className="w-full max-w-md card">
          <h1 className="text-2xl font-extrabold">{mode === 'register' ? 'Create your account' : 'Welcome back'}</h1>
          <p className="text-sm text-ink-900/60 mt-1">
            {mode === 'register' ? 'Start using HealTime in under a minute.' : 'Log in to manage appointments and records.'}
          </p>
          {mode === 'register' && (
            <>
              <div className="mt-5"><label className="label">Full name</label><input className="input" value={form.fullName} onChange={set('fullName')} required/></div>
              <div className="mt-3"><label className="label">Phone</label><input className="input" value={form.phone} onChange={set('phone')} /></div>
              <div className="mt-3">
                <label className="label">I am a</label>
                <div className="grid grid-cols-2 gap-2">
                  {['PATIENT','DOCTOR'].map(r => (
                    <button type="button" key={r} onClick={() => setForm(f=>({...f,role:r}))}
                      className={`px-3 py-2.5 rounded-xl border text-sm font-medium ${form.role===r ? 'border-brand-500 bg-brand-50 text-brand-700':'border-ink-200 text-ink-900/70'}`}>
                      {r === 'PATIENT' ? 'Patient' : 'Doctor'}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          <div className="mt-3"><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={set('email')} required/></div>
          <div className="mt-3"><label className="label">Password</label><input type="password" className="input" value={form.password} onChange={set('password')} required minLength={8}/></div>
          <button className="btn-primary w-full mt-6" disabled={loading}>{loading ? 'Please wait…' : (mode === 'register' ? 'Create account' : 'Log in')}</button>
          <p className="text-sm text-ink-900/60 text-center mt-4">
            {mode === 'register'
              ? <>Already on HealTime? <Link to="/auth" className="text-brand-700 font-semibold">Log in</Link></>
              : <>New here? <Link to="/auth?mode=register" className="text-brand-700 font-semibold">Create an account</Link></>}
          </p>
        </form>
      </div>
    </div>
  );
}
