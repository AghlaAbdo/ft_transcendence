import type { Metadata } from "next";
import '../globals.css'
import Link from "next/link";
import Image from "next/image";
import { Toaster } from "sonner";

import React, { Children } from 'react'
import { PublicRouteGuard } from "@/components/auth/RouteGuard";

const AuthLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <PublicRouteGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white mx-auto px-10">
        {children}
        <Toaster richColors position="top-right" />
      </div>
    </PublicRouteGuard>
  )
}

export default AuthLayout