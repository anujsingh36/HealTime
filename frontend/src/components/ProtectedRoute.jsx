import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/auth';

export function ProtectedRoute({ roles, children }) {
  const { token, role } = useAuth();
  const loc = useLocation();
  if (!token) return <Navigate to={`/auth?redirect=${encodeURIComponent(loc.pathname)}`} replace />;
  if (roles && !roles.includes(role())) return <Navigate to="/" replace />;
  return children;
}
