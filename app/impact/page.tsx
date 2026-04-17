"use client";

import { motion } from "framer-motion";
import { Heart, Trophy, Users, Star, PawPrint } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function ImpactPage() {
  const { user } = useAuth();

  const stats = [
    { icon: Heart, label: "Lives Touched", value: "1,284", color: "text-red-500" },
    { icon: Trophy, label: "Rescue Missions", value: "42", color: "text-orange-500" },
    { icon: Users, label: "Community Members", value: "892", color: "text-blue-500" },
    { icon: Star, label: "Hero Points", value: "2,450", color: "text-yellow-500" },
  ];

  return (
    <div className="min-h-screen bg-[hsl(45,30%,98%)] p-8 lg:p-12 bg-paw-pattern">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto"
      >
        <header className="mb-12">
          <h1 className="font-display text-5xl font-black text-[hsl(160,10%,20%)] mb-4">Your Impact</h1>
          <p className="text-xl text-[hsl(155,15%,50%)] font-medium">Tracking the lives you've helped save since 2024.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/60 shadow-xl shadow-black/5"
            >
              <stat.icon className={`${stat.color} mb-4`} size={32} />
              <p className="text-4xl font-black text-[hsl(160,10%,20%)] mb-1">{stat.value}</p>
              <p className="text-xs font-black text-[hsl(155,15%,50%)] uppercase tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-[hsl(160,10%,20%)] rounded-[3rem] p-12 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-4">Elite Rescuer Status</h2>
            <p className="text-white/70 mb-8 max-w-md">You're in the top 5% of rescuers in your region. Keep up the amazing work, {user?.email?.split('@')[0]}!</p>
            <button className="bg-[hsl(15,80%,65%)] text-white font-black px-8 py-4 rounded-2xl shadow-lg shadow-[hsl(15,80%,65%)]/40 hover:scale-105 transition-transform">
              Claim Achievement
            </button>
          </div>
          <PawPrint className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 rotate-12" />
        </div>
      </motion.div>
    </div>
  );
}
