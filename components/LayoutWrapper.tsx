"use client";

import { usePathname } from "next/navigation";
import Navigation from "./Navigation";
import { useAuth } from "@/lib/AuthContext";
import { useEffect } from "react";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Fix the iOS "100vh" bug: set a CSS variable to the real visible viewport height
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
  
  // Only show navigation and apply padding if user is logged in AND not on landing/auth
  const showNav = user && !isAuthPage && !isLandingPage;

  return (
    <div className="min-h-[100dvh]">
      {showNav && <Navigation />}
      {/* 
        Mobile: top nav is 88px (top-6=24px gap + h-16=64px), bottom nav is ~104px (bottom-6=24px + h-20=80px).
        We add pt-[88px] (top bar) + pb-[104px] (bottom bar) on mobile only.
        On md+ (desktop sidebar): pl-32 handles the narrow sidebar, lg:pl-80 for the wide one.
      */}
      <div
        className={
          showNav
            ? "md:pl-32 lg:pl-80 pt-[88px] pb-[108px] md:pt-4 md:pb-4 transition-all duration-500"
            : ""
        }
      >
        {children}
      </div>
    </div>
  );
}
