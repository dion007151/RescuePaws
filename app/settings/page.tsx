"use client";

import { motion } from "framer-motion";
import { User, Bell, Lock, Shield, CircleHelp, LogOut } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export default function SettingsPage() {
  const { user } = useAuth();

  const sections = [
    { icon: User, label: "Account Settings", desc: "Manage your profile and email" },
    { icon: Bell, label: "Notifications", desc: "Control your rescue alerts" },
    { icon: Lock, label: "Privacy & Security", desc: "Password and data settings" },
    { icon: Shield, label: "Permissions", desc: "Camera and GPS access" },
    { icon: CircleHelp, label: "Support", desc: "Get help with RescuePaws" },
  ];

  async function handleLogout() {
    await signOut(auth);
  }

  return (
    <div className="min-h-screen bg-[hsl(45,30%,98%)] p-8 lg:p-12 bg-paw-pattern">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <header className="mb-12">
          <h1 className="font-display text-5xl font-black text-[hsl(160,10%,20%)] mb-4">Settings</h1>
          <p className="text-xl text-[hsl(155,15%,50%)] font-medium">Customize your experience for maximum impact.</p>
        </header>

        <div className="bg-white/60 backdrop-blur-xl rounded-[3rem] p-4 border border-white/60 shadow-xl shadow-black/5 divide-y divide-[hsl(155,15%,90%)]">
          {sections.map((section, i) => (
            <motion.button
              key={section.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="w-full flex items-center gap-6 p-6 hover:bg-white/80 transition-all first:rounded-t-[2.5rem] last:rounded-b-[2.5rem] text-left group"
            >
              <div className="w-12 h-12 bg-[hsl(155,15%,95%)] rounded-2xl flex items-center justify-center text-[hsl(155,15%,50%)] group-hover:bg-[hsl(15,80%,65%)] group-hover:text-white transition-all">
                <section.icon size={24} />
              </div>
              <div>
                <p className="font-black text-[hsl(160,10%,20%)] text-lg">{section.label}</p>
                <p className="text-sm text-[hsl(155,15%,50%)] font-medium">{section.desc}</p>
              </div>
            </motion.button>
          ))}
          
          <motion.button
            onClick={handleLogout}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: sections.length * 0.1 }}
            className="w-full flex items-center gap-6 p-6 hover:bg-red-50 transition-all rounded-b-[2.5rem] text-left border-t border-[hsl(155,15%,90%)] group"
          >
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
              <LogOut size={24} />
            </div>
            <div>
              <p className="font-black text-red-500 text-lg">Sign Out</p>
              <p className="text-sm text-red-400 font-medium">Logged in as {user?.email}</p>
            </div>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
