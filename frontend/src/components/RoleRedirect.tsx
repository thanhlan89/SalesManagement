import { Navigate } from 'react-router-dom';
import { getHomePath, getSession } from '../lib/auth';

function RoleRedirect() {
  const session = getSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getHomePath(session.role)} replace />;
}

export default RoleRedirect;
