"use client";

import AuthSuccess from '@/app/(auth)/success/page';
import HomePage from '@/app/(protected)/home/page';
import { useAuth } from '@/hooks/useAuth';

interface RouteGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ 
  children, 
  fallback = null 
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <>{fallback}</> || <div>Loading...</div>;
  }

  if (!user) {
    return <>{fallback}</> || <div>Redirecting to login...</div>;
  }

  return <>{children}</>;
};

export const PublicRouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is authenticated, redirect to dashboard
  if (user) {
    return <AuthSuccess/>
  }

  return <>{children}</>;
};