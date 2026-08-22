import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { NotificationBell } from '../components/NotificationBell';
import { TurnAlertWatcher } from '../components/TurnAlertWatcher';
import { useAuth } from '../store/auth';
import { initials } from '../lib/utils';
import {
  CalendarDays, Search, FileText, User, LayoutDashboard, Users, Stethoscope,
  ClipboardList, Clock, BarChart3, ShieldCheck, LogOut
} from 'lucide-react';

const NAV = {
  PATIENT: [
    { to: '/patient/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/doctors', label: 'Find a doctor', icon: Search },
    { to: '/patient/appointments', label: 'Appointments', icon: CalendarDays },
    { to: '/patient/records', label: 'Medical records', icon: FileText },
    { to: '/patient/profile', label: 'Profile', icon: User }
  ],
  DOCTOR: [
    { to: '/doctor/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/doctor/queue', label: 'Live queue', icon: Clock },
    { to: '/doctor/appointments', label: 'Appointments', icon: CalendarDays },
    { to: '/doctor/availability', label: 'Availability', icon: ClipboardList },
    { to: '/doctor/profile', label: 'Profile', icon: User }
  ],
  ADMIN: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
    { to: '/admin/doctors', label: 'Doctors', icon: Stethoscope },
    { to: '/admin/patients', label: 'Patients', icon: Users },
    { to: '/admin/verify', label: 'Verifications', icon: ShieldCheck }
  ]
};

export default function AppLayout() {
  const { user, role, logout } = useAuth();
  const nav = useNavigate();
  const links = NAV[role()] || [];

  return (
    <div className="min-h-screen flex bg-ink-50">
      {role() === 'PATIENT' && <TurnAlertWatcher />}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-ink-100 px-4 py-5 sticky top-0 h-screen">
        <div className="px-2 mb-6"><Logo /></div>
        <nav className="flex-1 space-y-1">
          {links.map(l => (
            <NavLink key={l.to} to={l.to}
              className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-900/75 hover:bg-ink-50'}`}>
              <l.icon className="w-4.5 h-4.5"/> {l.label}
            </NavLink>
          ))}
        </nav>
        <button onClick={() => { logout(); nav('/'); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink-900/75 hover:bg-ink-50">
          <LogOut className="w-4 h-4"/> Sign out
        </button>
      </aside>
      <div className="flex-1 min-w-0">
        <header className="bg-white/70 backdrop-blur border-b border-ink-100 sticky top-0 z-10">
          <div className="px-6 py-3.5 flex items-center justify-between">
            <span className="text-sm text-ink-900/60 hidden md:inline">Welcome back, <strong className="text-ink-950">{user?.fullName}</strong></span>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center font-semibold text-sm">
                {initials(user?.fullName)}
              </div>
            </div>
          </div>
        </header>
        <main className="p-6"><Outlet /></main>
      </div>
    </div>
  );
}