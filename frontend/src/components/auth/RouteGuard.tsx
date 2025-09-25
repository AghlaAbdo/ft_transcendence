// components/RouteGuard.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const publicRoutes = ["/login", "/signup"];

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    const isPublicRoute = publicRoutes.includes(pathname);
    
    // If user is not authenticated and trying to access protected route
    if (!user && !isPublicRoute) {
      // The redirect will happen in the useAuth hook
      return;
    }

    // If user is authenticated and trying to access public auth routes
    if (user && isPublicRoute) {
      window.location.href = '/home'; // Use window.location to avoid hook conflicts
    }
  }, [user, isLoading, pathname]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Show children only if:
  // - User is authenticated AND accessing protected route
  // - OR accessing public route (login/signup) without authentication
  const shouldShowContent = (user && !publicRoutes.includes(pathname)) || 
                           (!user && publicRoutes.includes(pathname));

  return shouldShowContent ? <>{children}</> : null;
}