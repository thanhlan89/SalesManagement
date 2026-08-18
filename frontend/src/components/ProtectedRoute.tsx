import { Navigate, Outlet } from 'react-router-dom';
import { getHomePath, getSession, type UserRole } from '../lib/auth';

type ProtectedRouteProps = {
  allowedRoles?: UserRole[];
};

function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const session = getSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return <Navigate to={getHomePath(session.role)} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
