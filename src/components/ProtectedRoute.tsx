
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';

interface ProtectedRouteProps {
  redirectPath?: string;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ redirectPath = '/login', requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no user, redirect to login
  if (!user) {
    return <Navigate to={redirectPath} replace />;
  }

  // Check for admin role if required
  if (requireAdmin && user.user_metadata.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
