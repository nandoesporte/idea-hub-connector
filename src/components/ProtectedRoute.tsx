
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';
import { Skeleton } from './ui/skeleton';

interface ProtectedRouteProps {
  redirectPath?: string;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ redirectPath = '/login', requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Skeleton className="h-12 w-12 rounded-full mb-4" />
        <Skeleton className="h-4 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  // If no user, redirect to login
  if (!user) {
    toast.error('Você precisa estar logado para acessar esta página');
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }

  // Check for admin role if required
  if (requireAdmin && user.user_metadata?.role !== 'admin') {
    toast.error('Acesso restrito a administradores');
    return <Navigate to="/dashboard" replace />;
  }

  // If we got here, it means the user is authenticated and has the right permissions
  return <Outlet />;
};

export default ProtectedRoute;
