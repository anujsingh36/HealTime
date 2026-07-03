import { useAuth } from '../../store/auth';
import { initials } from '../../lib/utils';

export default function PatientProfile() {
  const user = useAuth(s => s.user);
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-extrabold">Profile</h1>
      <div className="card mt-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center text-xl font-bold">{initials(user?.fullName)}</div>
        <div>
          <div className="font-semibold text-lg">{user?.fullName}</div>
          <div className="text-sm text-ink-900/60">{user?.email}</div>
          <div className="text-xs text-ink-900/50 mt-1">Roles: {user?.roles?.join(', ')}</div>
        </div>
      </div>
    </div>
  );
}
