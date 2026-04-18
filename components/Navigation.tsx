"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Map, Heart, PawPrint, LogOut, Settings, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  if (!user) return null;

  const navItems = [
    { icon: Map, label: "Map", href: "/map" },
    { icon: Heart, label: "Impact", href: "/impact" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  async function handleLogout() {
    await signOut(auth);
    router.push("/login");
  }

  return (
    <>
      {/* ── Mobile Top Header ── */}
      <header
        className="fixed top-0 left-0 right-0 z-[100] md:hidden px-4 pt-4"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)" }}
      >
        <div className="h-16 glass rounded-[1.8rem] flex items-center px-6 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.1)] border border-white/60">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 10 }}
              className="w-9 h-9 bg-[hsl(15,80%,65%)] rounded-[1rem] flex items-center justify-center shadow-lg flex-shrink-0"
            >
              <PawPrint className="text-white" size={18} />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-black text-[hsl(160,10%,20%)] tracking-tight leading-none">
                RescuePaws
              </span>
              <span className="text-[7px] font-black uppercase tracking-[0.2em] text-[hsl(15,80%,65%)]">Active Mission</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Desktop Sidebar ── */}
      <aside className="fixed left-8 top-8 bottom-8 w-24 lg:w-72 hidden md:flex flex-col z-[100]">
        <div className="flex-1 glass rounded-[3.5rem] flex flex-col p-5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] border border-white/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[hsl(15,80%,65%)]/5 to-transparent rounded-bl-[100px] pointer-events-none" />
          
          <div className="flex items-center gap-4 px-3 mb-12 pt-4 relative z-10">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: -5 }}
              className="w-14 h-14 bg-[hsl(15,80%,65%)] rounded-[1.8rem] flex items-center justify-center shadow-xl shadow-[hsl(15,80%,65%)]/20 flex-shrink-0"
            >
              <PawPrint className="text-white" size={28} />
            </motion.div>
            <div className="flex flex-col hidden lg:flex">
              <span className="font-display text-2xl font-black text-[hsl(160,10%,20%)] tracking-tight leading-none">
                RescuePaws
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[hsl(15,80%,65%)] mt-1">Satellite Grid</span>
            </div>
          </div>

          <nav className="flex-1 space-y-3 relative z-10">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-5 p-5 rounded-[2.2rem] transition-all relative group overflow-hidden ${
                    isActive
                      ? "text-white shadow-[0_20px_40px_-10px_rgba(239,139,97,0.4)]"
                      : "text-[hsl(155,15%,45%)] hover:bg-white/60 hover:text-[hsl(160,10%,20%)]"
                  }`}
                >
                  <item.icon
                    size={24}
                    className={isActive ? "text-white flex-shrink-0 relative z-10" : "group-hover:scale-110 transition-transform duration-300 flex-shrink-0"}
                  />
                  <span className="font-black text-[15px] hidden lg:block truncate relative z-10">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 bg-[hsl(15,80%,65%)] -z-0"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {!isActive && (
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors -z-10" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 p-4 rounded-3xl text-[hsl(155,15%,50%)] hover:bg-red-50 hover:text-red-500 transition-all group"
            >
              <LogOut size={22} className="group-hover:scale-110 transition-transform flex-shrink-0" />
              <span className="font-black text-sm hidden lg:block truncate">Sign Out</span>
            </button>

            <div className="hidden lg:block px-2 pb-2">
              <div className="flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity cursor-default">
                <ShieldCheck size={12} className="text-[hsl(15,80%,65%)] flex-shrink-0" />
                <span className="text-[9px] font-black uppercase tracking-[0.1em] text-[hsl(160,10%,20%)] truncate">
                  Dionimar Flores
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav — safe-area-aware ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-[100] md:hidden px-4 pb-6"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
      >
        <div className="h-20 glass rounded-[2.5rem] flex items-center justify-around px-2 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] border border-white/60">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1.5 py-3 px-4 rounded-[1.5rem] transition-all flex-1 relative ${
                  isActive
                    ? "text-[hsl(15,80%,65%)]"
                    : "text-[hsl(155,15%,45%)]"
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="mobile-nav-active-bg"
                    className="absolute inset-2 bg-[hsl(15,80%,65%)]/10 rounded-2xl -z-10"
                  />
                )}
                <item.icon size={22} className={isActive ? "stroke-[3px]" : ""} />
                <span className="text-[9px] font-black uppercase tracking-widest leading-none">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center gap-1.5 py-3 px-4 rounded-[1.5rem] text-[hsl(155,15%,45%)] hover:text-red-500 transition-all flex-1"
          >
            <LogOut size={22} />
            <span className="text-[9px] font-black uppercase tracking-widest leading-none">Exit</span>
          </button>
        </div>
      </nav>
    </>
  );
}
