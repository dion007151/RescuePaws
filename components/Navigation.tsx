"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Map, Heart, PawPrint, User, LogOut, Settings, ShieldCheck } from "lucide-react";
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
      {/* Mobile Top Header - Always visible after login */}
      <header className="fixed top-6 left-6 right-6 h-16 md:hidden z-[100] glass rounded-3xl flex items-center justify-between px-6 shadow-xl border-white/40">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-[hsl(15,80%,65%)] rounded-xl flex items-center justify-center shadow-sm">
              <PawPrint className="text-white" size={16} />
           </div>
           <span className="font-display text-lg font-black text-[hsl(160,10%,20%)] italic">RP</span>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="fixed left-6 top-6 bottom-6 w-20 lg:w-64 hidden md:flex flex-col z-[100]">
        <div className="flex-1 glass rounded-[2.5rem] flex flex-col p-4 shadow-2xl border-white/40">
          <div className="flex items-center gap-3 px-2 mb-10 pt-2">
            <div className="w-12 h-12 bg-[hsl(15,80%,65%)] rounded-2xl flex items-center justify-center shadow-lg shadow-[hsl(15,80%,65%)]/20">
              <PawPrint className="text-white" size={24} />
            </div>
            <span className="font-display text-xl font-black text-[hsl(160,10%,20%)] hidden lg:block">RescuePaws</span>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-4 p-4 rounded-3xl transition-all relative group ${
                    isActive 
                      ? "bg-[hsl(15,80%,65%)] text-white shadow-lg shadow-[hsl(15,80%,65%)]/20" 
                      : "text-[hsl(155,15%,50%)] hover:bg-white/50 hover:text-[hsl(160,10%,20%)]"
                  }`}
                >
                  <item.icon size={24} className={isActive ? "text-white" : "group-hover:scale-110 transition-transform"} />
                  <span className="font-black text-sm hidden lg:block">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 bg-[hsl(15,80%,65%)] rounded-3xl -z-10"
                    />
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
               <LogOut size={24} className="group-hover:scale-110 transition-transform" />
               <span className="font-black text-sm hidden lg:block">Sign Out</span>
             </button>

             <div className="hidden lg:block px-2 pb-2">
               <div className="flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity cursor-default">
                  <ShieldCheck size={12} className="text-[hsl(15,80%,65%)]" />
                  <span className="text-[9px] font-black uppercase tracking-[0.1em] text-[hsl(160,10%,20%)]">Dionimar Flores</span>
               </div>
             </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-6 left-6 right-6 h-20 md:hidden z-[100] glass rounded-[2.5rem] flex items-center justify-around px-6 shadow-2xl border-white/40">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                isActive ? "text-[hsl(15,80%,65%)]" : "text-[hsl(155,15%,50%)]"
              }`}
            >
              <item.icon size={24} className={isActive ? "scale-110" : ""} />
              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center gap-1 text-[hsl(155,15%,50%)] hover:text-red-500 transition-all"
        >
          <LogOut size={24} />
          <span className="text-[10px] font-black uppercase tracking-widest">Exit</span>
        </button>
      </nav>
    </>
  );
}
