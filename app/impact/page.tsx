"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PawPrint, MapPin, CheckCircle2, Camera, Heart,
  ChevronRight, Star, Zap, Map, ShieldCheck, Trophy, Users, Sparkles, Target, Shield
} from "lucide-react";

interface LeaderboardUser {
  id: string;
  fullName: string;
  rescueCount: number;
  teamId?: string;
}

const TEAM_INFO: Record<string, { name: string; icon: any; color: string; emoji: string }> = {
  guardians: { name: "Antique Guardians", icon: Shield, color: "text-blue-500", emoji: "🛡️" },
  patrol: { name: "Pioneer Patrol", icon: Map, color: "text-orange-500", emoji: "🗺️" },
  frontline: { name: "Frontline Medical", icon: Zap, color: "text-purple-500", emoji: "⚡" },
};


const steps = [
  {
    icon: Map,
    emoji: "🗺️",
    title: "Explore Strategy",
    desc: "Navigate territories to locate priority reports or verify safety zones.",
    color: "hsl(15, 80%, 65%)",
  },
  {
    icon: MapPin,
    emoji: "📍",
    title: "Tactical Report",
    desc: "Deploy a highly-accurate pin to alert the local rescue grid.",
    color: "hsl(15, 80%, 65%)",
  },
  {
    icon: Camera,
    emoji: "📷",
    title: "Visual Intel",
    desc: "Upload forensic-grade visual evidence for faster rescue coordination.",
    color: "hsl(15, 80%, 65%)",
  },
  {
    icon: CheckCircle2,
    emoji: "✅",
    title: "Extraction Success",
    desc: "Confirm animal safety to close the grid and celebrate the win.",
    color: "hsl(15, 80%, 65%)",
  },
];

const achievements = [
  { id: "citizen", title: "Active Frontliner", icon: "🛡️", desc: "First responder on the grid", req: (s: Stats) => true },
  { id: "eagle", title: "Eagle Eye", icon: "👁️", desc: "Submitted first intel report", req: (s: Stats) => s.total >= 1 },
  { id: "guardian", title: "Street Guardian", icon: "🏰", desc: "Secured 5 sectors", req: (s: Stats) => s.total >= 5 },
  { id: "lifesaver", title: "PH Hero", icon: "🎈", desc: "First confirmed life-save", req: (s: Stats) => s.rescued >= 1 },
  { id: "master", title: "Rescue Elite", icon: "👑", desc: "Rescued 5+ animals", req: (s: Stats) => s.rescued >= 5 },
  { id: "pillar", title: "Legendary Mentor", icon: "🏛️", desc: "20+ mission reports", req: (s: Stats) => s.total >= 20 },
];

interface Stats {
  total: number;
  rescued: number;
  pending: number;
}

export default function ImpactPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ total: 0, rescued: 0, pending: 0 });
  const [globalStats, setGlobalStats] = useState({ total: 0, rescued: 0 });
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !db) { setLoading(false); return; }
    async function fetchStats() {
      try {
        const personalQ = query(collection(db, "reports"), where("userId", "==", user!.uid));
        const personalSnap = await getDocs(personalQ);
        let personalRescued = 0;
        personalSnap.forEach(d => { if (d.data().status === "rescued") personalRescued++; });
        setStats({ total: personalSnap.size, rescued: personalRescued, pending: personalSnap.size - personalRescued });

        const globalSnap = await getDocs(collection(db, "reports"));
        let globalRescued = 0;
        globalSnap.forEach(d => { if (d.data().status === "rescued") globalRescued++; });
        setGlobalStats({ total: globalSnap.size, rescued: globalRescued });

        const usersQ = query(
          collection(db, "users"), 
          orderBy("rescueCount", "desc"), 
          limit(5)
        );
        const usersSnap = await getDocs(usersQ);
        const topUsers: LeaderboardUser[] = [];
        usersSnap.forEach(d => {
          const data = d.data();
          if (data.rescueCount > 0) {
            topUsers.push({
              id: d.id,
              fullName: data.fullName || "Field Agent",
              rescueCount: data.rescueCount,
              teamId: data.teamId
            });
          }
        });
        setLeaderboard(topUsers);
      } catch (err) {
        console.error("Stats fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [user]);

  const displayName = user?.email?.split("@")[0] ?? "Rescuer";
  const points = (stats.total * 25) + (stats.rescued * 100);
  const nextLevel = Math.floor(points / 250) + 1;
  const progressToNext = (points % 250) / 2.5;

  // Global Community Goal (Target 5000)
  const communityGoal = 5000;
  const communityProgress = Math.min((globalStats.rescued / communityGoal) * 100, 100);

  return (
    <div className="min-h-screen bg-[hsl(45,30%,98%)] p-6 lg:p-12 relative overflow-x-hidden">
      <div className="fixed inset-0 bg-paw-pattern opacity-[0.03] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto space-y-12 relative z-10 font-bold">
        
        {/* Header - Elite Status Branding */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
               <div className="px-4 py-1.5 rounded-full bg-[hsl(15,80%,65%)] shadow-lg shadow-[hsl(15,80%,65%)]/20 text-white text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-2">
                  <Star size={12} fill="white" /> Elite Rescuer Rank
               </div>
               <div className="px-4 py-1.5 rounded-full bg-white border border-[hsl(155,15%,90%)] text-[hsl(160,10%,20%)] text-[10px] font-black uppercase tracking-[0.25em]">
                  Mission ID: #{user?.uid.slice(0,6)}
               </div>
               
               {profile?.teamId && TEAM_INFO[profile.teamId] && (
                 <Link href="/teams" className="px-4 py-1.5 rounded-full bg-white border-2 border-[hsl(160,10%,20%)]/10 text-[hsl(160,10%,20%)] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-[hsl(160,10%,20%)] hover:text-white transition-all group">
                    <span className="group-hover:scale-125 transition-transform">{TEAM_INFO[profile.teamId].emoji}</span>
                    {TEAM_INFO[profile.teamId].name}
                 </Link>
               )}
            </div>
            <h1 className="font-display text-7xl lg:text-9xl font-black text-[hsl(160,10%,20%)] leading-[0.8] tracking-tighter">
              The Mission <br/>
              <span className="text-[hsl(15,80%,65%)]">Impact.</span>
            </h1>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-10 rounded-[3.5rem] min-w-[320px] border-white/60 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] relative overflow-hidden group"
          >
             <div className="flex items-center justify-between mb-6">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[hsl(15,80%,65%)]">Current Rank</p>
                   <h3 className="font-display text-4xl font-black text-[hsl(160,10%,20%)]">Level {nextLevel}</h3>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-[hsl(15,80%,65%)] flex items-center justify-center text-white shadow-xl rotate-3 group-hover:rotate-12 transition-transform">
                   <Target size={28} strokeWidth={2.5} />
                </div>
             </div>
             <div className="space-y-3">
                <div className="h-3 bg-[hsl(155,15%,90%)] rounded-full overflow-hidden shadow-inner">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${progressToNext}%` }}
                     className="h-full bg-gradient-to-r from-[hsl(15,80%,65%)] to-[hsl(15,75%,55%)] rounded-full"
                   />
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[hsl(155,15%,50%)]">
                   <span>{progressToNext.toFixed(0)}% to Lvl {nextLevel + 1}</span>
                   <span className="text-[hsl(15,80%,65%)]">{points} Total XP</span>
                </div>
             </div>
          </motion.div>
        </header>

        {/* Global Community Mission Card */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[hsl(160,10%,20%)] rounded-[4rem] p-10 lg:p-14 text-white relative overflow-hidden shadow-[0_60px_120px_-30px_rgba(0,0,0,0.25)] border-white/5"
        >
          <div className="relative z-10 max-w-3xl">
             <div className="flex items-center gap-3 mb-8">
                <Sparkles className="text-[hsl(15,80%,65%)]" size={24} />
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/50">2026 Rescuer World Mission</span>
             </div>
             <h2 className="font-display text-5xl lg:text-7xl font-black italic leading-none mb-10">
                Together, We Save <br/>
                <span className="text-[hsl(15,80%,65%)] not-italic">5,000 Paws.</span>
             </h2>
             
             <div className="space-y-6">
                <div className="flex items-end justify-between">
                   <div className="flex items-baseline gap-4">
                      <span className="text-6xl font-black tabular-nums">{globalStats.rescued}</span>
                      <span className="text-xl font-black opacity-30 uppercase tracking-widest italic">Lives Secured</span>
                   </div>
                   <p className="text-sm font-black uppercase tracking-[0.3em] text-[hsl(15,80%,65%)] animate-pulse">Live Network Sync</p>
                </div>
                
                <div className="h-6 bg-white/10 rounded-full border border-white/10 p-1.5 shadow-inner">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${communityProgress}%` }}
                     className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-[hsl(15,80%,65%)] rounded-full shadow-[0_0_30px_rgba(16,185,129,0.3)] relative overflow-hidden"
                   >
                     <motion.div 
                       animate={{ x: ["-100%", "200%"] }}
                       transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                       className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                     />
                   </motion.div>
                </div>
                <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-[0.4em] text-white/40">
                   <span>Mission Progress: {communityProgress.toFixed(1)}%</span>
                   <span>Target: {communityGoal} Rescues</span>
                </div>
             </div>
          </div>
          <PawPrint className="absolute -right-20 -top-20 w-[600px] h-[600px] text-white/[0.03] -rotate-12 pointer-events-none" />
        </motion.section>

        {/* Hero Stats & Leaderboard Row */}
        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* Individual Stats */}
          <div className="lg:col-span-1 space-y-6">
             <p className="text-xs font-black uppercase tracking-[0.3em] text-[hsl(155,15%,50%)] ml-4">Individual Assets</p>
             {[
               { label: "Critical Stats", items: [
                 { label: "Reports Made", value: stats.total, icon: MapPin, color: "text-[hsl(15,80%,65%)]", bg: "bg-[hsl(15,80%,65%)]/10" },
                 { label: "Lives Saved", value: stats.rescued, icon: Heart, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                 { label: "Intelligence XP", value: points, icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
               ]}
             ].map((group) => (
                <div key={group.label} className="space-y-4">
                  {group.items.map((s) => (
                    <motion.div
                      key={s.label}
                      whileHover={{ x: 10 }}
                      className="glass p-8 rounded-[3rem] border-white/60 shadow-xl flex items-center gap-6"
                    >
                       <div className={`w-16 h-16 ${s.bg} rounded-[1.8rem] flex items-center justify-center ${s.color} shadow-inner`}>
                          <s.icon size={28} strokeWidth={2.5} />
                       </div>
                       <div>
                          <p className="text-3xl font-black text-[hsl(160,10%,20%)] leading-none mb-1">{s.value}</p>
                          <p className="text-[10px] font-black text-[hsl(155,15%,45%)] uppercase tracking-widest">{s.label}</p>
                       </div>
                    </motion.div>
                  ))}
                </div>
             ))}
          </div>

          {/* Leaders */}
          <div className="lg:col-span-2 space-y-6">
             <div className="flex items-center justify-between px-4">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-[hsl(155,15%,50%)]">PH Leaderboard</p>
                <div className="flex items-center gap-2 text-[hsl(15,80%,65%)]">
                   <Trophy size={14} /> <span className="text-[10px] font-black uppercase tracking-widest">Global Top 5</span>
                </div>
             </div>
             
             <div className="glass rounded-[4rem] p-8 lg:p-12 border-white/60 shadow-2xl relative overflow-hidden space-y-6">
                 {leaderboard.length > 0 ? (
                    leaderboard.map((item, i) => {
                      const isCurrentUser = item.id === user?.uid;
                      return (
                        <motion.div 
                          key={item.id} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className={`flex items-center gap-6 p-6 rounded-[2.5rem] transition-all relative overflow-hidden ${
                            isCurrentUser 
                              ? "bg-[hsl(160,10%,20%)] text-white shadow-2xl scale-105 z-10" 
                              : "bg-white/40 border border-white shadow-sm hover:translate-x-2"
                          }`}
                        >
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl ${
                             isCurrentUser ? "bg-[hsl(15,80%,65%)] text-white" : "bg-[hsl(155,15%,90%)] text-[hsl(155,15%,50%)]"
                           }`}>
                              {i + 1}
                           </div>
                           <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className={`font-black text-xl lg:text-2xl capitalize`}>{item.fullName}</p>
                                {item.teamId && TEAM_INFO[item.teamId] && (
                                  <span title={TEAM_INFO[item.teamId].name} className="text-lg grayscale-0 brightness-100 group-hover:scale-125 transition-transform">
                                    {TEAM_INFO[item.teamId].emoji}
                                  </span>
                                )}
                              </div>
                              <p className={`text-[10px] font-black uppercase tracking-widest ${isCurrentUser ? "text-white/40" : "text-[hsl(155,15%,50%)]"}`}>
                                {isCurrentUser ? "You Are Dominating" : "Active Field Agent"}
                              </p>
                           </div>
                           <div className="text-right">
                              <p className={`text-3xl font-black ${isCurrentUser ? "text-[hsl(15,80%,65%)]" : "text-[hsl(160,10%,20%)]"}`}>{item.rescueCount}</p>
                              <p className={`text-[9px] font-black uppercase tracking-widest opacity-40`}>Total Rescues</p>
                           </div>
                        </motion.div>
                      );
                    })
                 ) : (
                    <div className="p-20 text-center space-y-6">
                       <Users size={64} className="mx-auto text-[hsl(155,15%,85%)]" />
                       <p className="text-xl font-black italic text-[hsl(155,15%,50%)]">The grid is waiting for heroes like you...</p>
                    </div>
                 )}
             </div>
          </div>
        </div>

        {/* Achievement Gallery - Trophy Room Layout */}
        <section className="space-y-10 py-10">
          <div className="text-center space-y-2">
            <h2 className="font-display text-6xl font-black text-[hsl(160,10%,20%)] tracking-tighter italic">Your Trophy Room<span className="text-[hsl(15,80%,65%)]">.</span></h2>
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[hsl(15,80%,65%)]">Excellence in the Field Community</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
            {achievements.map((ach, i) => {
              const isUnlocked = ach.req(stats);
              return (
                <motion.div
                  key={ach.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * i }}
                  whileHover={isUnlocked ? { y: -15, scale: 1.02 } : {}}
                  className={`group p-10 rounded-[4rem] transition-all relative overflow-hidden text-center flex flex-col items-center justify-center border-2 ${
                    isUnlocked 
                      ? "bg-white border-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] cursor-help" 
                      : "bg-white/20 border-transparent grayscale brightness-90 opacity-40"
                  }`}
                >
                   <div className={`mb-8 w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-6xl shadow-2xl transition-all duration-500 ${isUnlocked ? "bg-white group-hover:bg-[hsl(15,80%,65%)] group-hover:text-white" : "bg-white/20"}`}>
                      {ach.icon}
                   </div>
                   <h3 className="font-display text-3xl font-black text-[hsl(160,10%,20%)] mb-3">{ach.title}</h3>
                   <div className="px-6 py-2 rounded-2xl bg-[hsl(155,15%,95%)] text-[10px] font-black uppercase tracking-widest text-[hsl(155,15%,50%)]">
                      {ach.desc}
                   </div>
                   {isUnlocked && (
                     <div className="absolute top-6 right-6">
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-500/30"
                        >
                           <CheckCircle2 size={20} />
                        </motion.div>
                     </div>
                   )}
                   {/* Decorative circle backdrop */}
                   <div className={`absolute -bottom-20 -right-20 w-48 h-48 rounded-full pointer-events-none transition-colors duration-1000 ${isUnlocked ? "bg-[hsl(15,80%,65%)]/5 group-hover:bg-[hsl(15,80%,65%)]/10" : "bg-transparent"}`} />
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Footer Branding */}
        <footer className="pt-20 pb-32 flex flex-col items-center gap-6 relative">
           <div className="w-16 h-16 bg-[hsl(160,10%,20%)] rounded-[2rem] flex items-center justify-center shadow-2xl mb-2">
              <PawPrint className="text-white w-8 h-8" />
           </div>
           <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-4">
                 <div className="h-[1px] w-12 bg-[hsl(155,15%,90%)]" />
                 <span className="text-[12px] font-black uppercase tracking-[0.4em] text-[hsl(160,10%,20%)]">Verified Production App</span>
                 <div className="h-[1px] w-12 bg-[hsl(155,15%,90%)]" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[hsl(155,15%,60%)]">
                Dionimar Flores Solo Developer 
                <span className="mx-4 opacity-30">|</span> 
                ACC SAC UA Antique PH
              </p>
           </div>
           
           <Link 
             href="/settings" 
             className="mt-8 group flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/40 hover:bg-white text-[10px] font-black uppercase tracking-widest text-[hsl(15,80%,65%)] transition-all shadow-sm border border-white hover:shadow-xl hover:-translate-y-1"
           >
             <ShieldCheck size={14} className="group-hover:rotate-12 transition-transform" /> 
             Operational Settings
           </Link>
        </footer>

      </div>
    </div>
  );
}
