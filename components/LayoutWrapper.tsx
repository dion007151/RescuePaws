"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { LoadingDog } from "./LoadingDog";
import { useAuth } from "@/lib/AuthContext";
import Navigation from "./Navigation";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  
  // Fix the iOS "100vh" bug
  useEffect(() => {
    function setVh() {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    }
    setVh();
    window.addEventListener("resize", setVh);
    window.addEventListener("orientationchange", setVh);
    return () => {
      window.removeEventListener("resize", setVh);
      window.removeEventListener("orientationchange", setVh);
    };
  }, []);

  // Pages that should NOT have the sidebar/padding
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isLandingPage = pathname === "/";
  
  // Show Loading Animation for initial Auth check
  if (loading && !isLandingPage) {
    return (
      <div className="min-h-screen bg-[hsl(45,30%,98%)] flex items-center justify-center p-6">
        <LoadingDog />
      </div>
    );
  }

  // Only show navigation and apply padding if user is logged in AND not on landing/auth
  const showNav = user && !isAuthPage && !isLandingPage;

  return (
    <div className="min-h-[100dvh] relative">
      {showNav && <Navigation />}
      <div
        className={
          showNav
            ? "md:pl-36 lg:pl-80 pt-[104px] pb-[120px] md:pt-8 md:pb-8 transition-all duration-700 ease-[0.23,1,0.32,1]"
            : ""
        }
      >
        {children}
      </div>
    </div>
  );
}
