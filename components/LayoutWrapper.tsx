"use client";

import { usePathname } from "next/navigation";
import Navigation from "./Navigation";
import { useAuth } from "@/lib/AuthContext";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Pages that should NOT have the sidebar/padding
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isLandingPage = pathname === "/";
  
  // Only show navigation and apply padding if user is logged in AND not on landing/auth
  const showNav = user && !isAuthPage && !isLandingPage;

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className={showNav ? "md:pl-32 lg:pl-80 transition-all duration-500" : ""}>
        {children}
      </div>
    </div>
  );
}
