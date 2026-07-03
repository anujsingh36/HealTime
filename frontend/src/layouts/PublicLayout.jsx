import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { useAuth } from '../store/auth';

export default function PublicLayout() {
  const { user, role, logout } = useAuth();
  const nav = useNavigate();
  const dash = role() ? `/${role().toLowerCase()}/dashboard` : '/auth';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-ink-100">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link to="/"><Logo /></Link>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-ink-900/80">
            <Link to="/doctors" className="hover:text-brand-700">Find a doctor</Link>
            <a href="#features" className="hover:text-brand-700">How it works</a>
            <a href="#specs" className="hover:text-brand-700">Specializations</a>
          </nav>
          <div className="flex items-center gap-2">
            {user
              ? <>
                  <Link to={dash} className="btn-ghost">Dashboard</Link>
                  <button className="btn-primary" onClick={() => { logout(); nav('/'); }}>Sign out</button>
                </>
              : <>
                  <Link to="/auth" className="btn-ghost">Log in</Link>
                  <Link to="/auth?mode=register" className="btn-primary">Get started</Link>
                </>}
          </div>
        </div>
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="border-t border-ink-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-ink-900/60">
          <Logo size={26} />
          <span>© {new Date().getFullYear()} HealTime. Care, on time.</span>
        </div>
      </footer>
    </div>
  );
}
