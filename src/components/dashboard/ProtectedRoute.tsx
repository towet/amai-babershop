import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth/auth-context';
import { UserRole } from '@/lib/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/dashboard/login" state={{ from: location.pathname }} replace />;
  }

  // If roles are specified and user doesn't have a permitted role
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect manager to manager dashboard and barber to barber dashboard
    if (user.role === 'manager') {
      return <Navigate to="/dashboard/manager" replace />;
    } else {
      return <Navigate to="/dashboard/barber" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
