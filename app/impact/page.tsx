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
  ChevronRight, Star, Zap, Map, ShieldCheck, Trophy, Users
} from "lucide-react";

interface LeaderboardUser {
  id: string;
  fullName: string;
  rescueCount: number;
}


const steps = [
  {
    icon: Map,
    emoji: "🗺️",
    step: "1",
    title: "Explore the Map",
    desc: "Navigate your neighborhood to locate active reports or safety zones.",
    tip: "Use the GPS button to instantly find animals near you.",
    color: "hsl(200,80%,60%)",
    bg: "hsl(200,80%,97%)",
  },
  {
    icon: MapPin,
    emoji: "📍",
    step: "2",
    title: "Pin a Report",
    desc: "Spotted a stray? Drop a pin precisely where they are to alert the network.",
    tip: "Details like landmarks help rescuers navigate faster.",
    color: "hsl(15,80%,65%)",
    bg: "hsl(15,80%,97%)",
  },
  {
    icon: Camera,
    emoji: "📷",
    step: "3",
    title: "Visual Evidence",
    desc: "Upload a photo. Visual confirmation increases rescue speed by up to 80%.",
    tip: "One clear photo is better than many blurry ones!",
    color: "hsl(280,70%,65%)",
    bg: "hsl(280,70%,97%)",
  },
  {
    icon: CheckCircle2,
    emoji: "✅",
    step: "4",
    title: "Mission Complete",
    desc: "Once an animal is safe, update their status to 'Rescued' to close the report.",
    tip: "This celebrates the success and clears the map.",
    color: "hsl(145,65%,42%)",
    bg: "hsl(145,65%,97%)",
  },
];

const achievements = [
  { id: "citizen", title: "Citizen Rescuer", icon: "🛡️", desc: "Joined the mission", req: (s: Stats) => true },
  { id: "eagle", title: "Eagle Eye", icon: "👁️", desc: "Submitted first report", req: (s: Stats) => s.total >= 1 },
  { id: "guardian", title: "Street Guardian", icon: "🏰", desc: "5+ animal reports", req: (s: Stats) => s.total >= 5 },
  { id: "lifesaver", title: "Life Saver", icon: "🎈", desc: "First confirmed rescue", req: (s: Stats) => s.rescued >= 1 },
  { id: "master", title: "Rescue Master", icon: "👑", desc: "5+ animals rescued", req: (s: Stats) => s.rescued >= 5 },
  { id: "pillar", title: "Community Pillar", icon: "🏛️", desc: "20+ total reports", req: (s: Stats) => s.total >= 20 },
];

interface Stats {
  total: number;
  rescued: number;
  pending: number;
}

export default function ImpactPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ total: 0, rescued: 0, pending: 0 });
  const [globalStats, setGlobalStats] = useState({ total: 0, rescued: 0 });
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !db) { setLoading(false); return; }
    async function fetchStats() {
      try {
        // 1. Personal Stats
        const personalQ = query(collection(db, "reports"), where("userId", "==", user!.uid));
        const personalSnap = await getDocs(personalQ);
        let personalRescued = 0;
        personalSnap.forEach(d => { if (d.data().status === "rescued") personalRescued++; });
        setStats({ total: personalSnap.size, rescued: personalRescued, pending: personalSnap.size - personalRescued });

        // 2. Optimized Global Stats (Only for today's context)
        const globalSnap = await getDocs(collection(db, "reports"));
        let globalRescued = 0;
        globalSnap.forEach(d => { if (d.data().status === "rescued") globalRescued++; });
        setGlobalStats({ total: globalSnap.size, rescued: globalRescued });

        // 3. Community Leaderboard
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
              rescueCount: data.rescueCount
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
  const points = (stats.total * 10) + (stats.rescued * 50);
  const nextLevel = Math.floor(points / 100) + 1;
  const progressToNext = points % 100;

  return (
    <div className="min-h-screen bg-[hsl(45,30%,98%)] p-6 lg:p-12 bg-paw-pattern overflow-x-hidden">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Hero Header */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-2 mb-2">
               <ShieldCheck size={18} className="text-[hsl(15,80%,65%)]" />
               <span className="text-xs font-black uppercase tracking-[0.2em] text-[hsl(15,80%,65%)]">Operational Status: Elite</span>
            </div>
            <h1 className="font-display text-5xl lg:text-7xl font-black text-[hsl(160,10%,20%)] premium-glow leading-[1.1]">
              Impact<span className="text-[hsl(15,80%,65%)]">.</span>
            </h1>
            <p className="text-[hsl(155,15%,50%)] font-medium text-lg mt-2 max-w-md">
              Heroic efforts of <span className="font-black text-[hsl(160,10%,20%)] capitalize">{displayName}</span> in the global rescue mission.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-6 rounded-[2.5rem] min-w-[240px] border-white/60 shadow-2xl relative overflow-hidden group"
          >
             <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(160,10%,20%)]">Rank: Lvl {nextLevel}</p>
                <div className="w-8 h-8 rounded-xl bg-[hsl(15,80%,65%)]/10 flex items-center justify-center text-[hsl(15,80%,65%)]">
                   <Star size={16} fill="currentColor" />
                </div>
             </div>
             <div className="h-2 bg-white/50 rounded-full overflow-hidden mb-2">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNext}%` }}
                  className="h-full bg-[hsl(15,80%,65%)] rounded-full shadow-[0_0_10px_rgba(248,148,123,0.5)]"
                />
             </div>
             <p className="text-[10px] text-[hsl(155,15%,50%)] font-black uppercase tracking-widest text-right">
                {100 - progressToNext} XP to Level {nextLevel + 1}
             </p>
          </motion.div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Reports Made", value: stats.total, icon: MapPin, color: "text-[hsl(15,80%,65%)]", bg: "bg-[hsl(15,80%,65%)]/5" },
            { label: "Rescues Won", value: stats.rescued, icon: Heart, color: "text-emerald-500", bg: "bg-emerald-500/5" },
            { label: "XP Earned", value: points, icon: Zap, color: "text-amber-500", bg: "bg-amber-500/5" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              whileHover={{ y: -5 }}
              className="glass p-8 rounded-[2.5rem] border-white/60 shadow-xl group relative overflow-hidden"
            >
               <div className={`w-14 h-14 ${s.bg} rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <s.icon className={s.color} size={28} />
               </div>
               <p className="text-4xl font-black text-[hsl(160,10%,20%)] mb-1">{s.value}</p>
               <p className="text-xs font-black text-[hsl(155,15%,50%)] uppercase tracking-[0.2em]">{s.label}</p>
               <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${s.color} opacity-[0.03] rotate-12`}>
                  <s.icon size={96} />
               </div>
            </motion.div>
          ))}
        </div>

        {/* Community Leaderboard */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-[hsl(160,10%,20%)] rounded-[3rem] p-8 lg:p-12 text-white relative overflow-hidden shadow-2xl"
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-2xl font-black italic">Community Heroes<span className="text-[hsl(15,80%,65%)]">.</span></h3>
                  <p className="text-white/40 text-xs font-black uppercase tracking-widest mt-1">Global Rescue Leaderboard</p>
               </div>
               <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-[hsl(15,80%,65%)] shadow-inner">
                  <Trophy size={24} />
               </div>
            </div>

            <div className="space-y-4">
              {leaderboard.length > 0 ? (
                leaderboard.map((item, i) => {
                  const isCurrentUser = item.id === user?.uid;
                  return (
                    <div 
                      key={item.id} 
                      className={`flex items-center gap-6 p-5 rounded-[2rem] transition-all group relative ${
                        isCurrentUser 
                          ? "bg-white/15 border-2 border-[hsl(15,80%,65%)] shadow-[0_0_20px_rgba(248,148,123,0.3)]" 
                          : "bg-white/5 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                       {isCurrentUser && (
                         <div className="absolute -top-3 left-6 px-3 py-1 bg-[hsl(15,80%,65%)] text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg">
                           You Are Here
                         </div>
                       )}
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                         isCurrentUser ? "bg-[hsl(15,80%,65%)] text-white" : "bg-white/10"
                       }`}>
                          #{i + 1}
                       </div>
                       <div className="flex-1">
                          <p className={`font-black text-lg capitalize transition-colors ${
                            isCurrentUser ? "text-white" : "group-hover:text-[hsl(15,80%,65%)]"
                          }`}>{item.fullName}</p>
                          <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Active Rescuer</p>
                       </div>
                       <div className="text-right">
                          <p className={`text-2xl font-black ${isCurrentUser ? "text-white" : "text-[hsl(15,80%,65%)]"}`}>{item.rescueCount}</p>
                          <p className="text-[9px] text-white/40 font-black uppercase tracking-widest">Rescues</p>
                       </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center border-2 border-dashed border-white/10 rounded-[2rem]">
                   <Users size={48} className="mx-auto text-white/10 mb-4" />
                   <p className="text-white/40 font-black uppercase tracking-widest">The grid is cold... Be the first hero!</p>
                </div>
              )}
            </div>
          </div>
          <PawPrint className="absolute -right-20 -top-20 w-64 h-64 text-white/5 -rotate-12" />
        </motion.section>

        {/* Achievement Gallery */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/40 backdrop-blur-xl rounded-[3rem] p-8 border border-white shadow-sm"
        >
          <div className="flex items-center justify-between mb-8 px-2">
            <div>
              <h2 className="text-2xl font-black text-[hsl(160,10%,20%)]">Achievements</h2>
              <p className="text-sm text-[hsl(155,15%,50%)] font-medium">Badges earned through the mission.</p>
            </div>
            <div className="dev-badge scale-90">
               <ShieldCheck size={12} className="text-[hsl(15,80%,65%)] mr-2" />
               <span className="text-[9px] font-black uppercase tracking-[0.1em]">Verified Collector</span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((ach) => {
              const isUnlocked = ach.req(stats);
              return (
                <motion.div
                  key={ach.id}
                  whileHover={isUnlocked ? { scale: 1.05, rotate: 1 } : {}}
                  className={`p-6 rounded-[2rem] border transition-all relative overflow-hidden ${
                    isUnlocked 
                      ? "bg-white border-[hsl(155,15%,90%)] shadow-md text-[hsl(160,10%,20%)]" 
                      : "bg-[hsl(155,15%,95%)] border-transparent opacity-40 grayscale"
                  }`}
                >
                   <div className="text-4xl mb-4">{ach.icon}</div>
                   <p className="font-black text-sm uppercase tracking-wider leading-none mb-1">{ach.title}</p>
                   <p className="text-[10px] font-bold text-[hsl(155,15%,50%)]">{ach.desc}</p>
                   {isUnlocked && (
                     <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <CheckCircle2 size={10} className="text-white" />
                     </div>
                   )}
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Global Impact Header */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.5 }}
             className="bg-[hsl(160,10%,20%)] rounded-[3rem] p-8 text-white relative overflow-hidden"
           >
              <div className="flex items-center gap-2 mb-6">
                <PawPrint size={16} className="text-[hsl(15,80%,65%)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Global Network Impact</span>
              </div>
              <h2 className="text-4xl font-black mb-2 italic leading-tight">Connected Locally.<br/>Saving Globally.</h2>
              <p className="text-white/60 text-sm font-medium mb-8">Every report connects to our verified rescue system in Antique and beyond.</p>
              
              <div className="grid grid-cols-2 gap-4 relative z-10">
                 <div className="bg-white/10 rounded-[1.5rem] p-5 backdrop-blur-md hover:bg-white/15 transition-all">
                    <p className="text-2xl font-black tabular-nums">{globalStats.total}</p>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-1">Total Network Reports</p>
                 </div>
                 <div className="bg-[hsl(15,80%,65%)] rounded-[1.5rem] p-5 shadow-xl shadow-[hsl(15,80%,65%)]/20 animate-pulse-slow">
                    <p className="text-2xl font-black tabular-nums">{globalStats.rescued}</p>
                    <p className="text-[9px] font-black text-white/60 uppercase tracking-widest mt-1">Lives Saved Today</p>
                 </div>
              </div>
              
              <PawPrint className="absolute -right-12 -bottom-12 w-48 h-48 text-white/5 -rotate-12" />
           </motion.div>

           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.6 }}
             className="space-y-4"
           >
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[hsl(155,15%,50%)] mb-4 ml-1">The Rescue Protocol</p>
              <div className="space-y-3">
                 {steps.map((step, i) => (
                   <div key={step.step} className="flex items-center gap-5 p-4 rounded-[1.8rem] bg-white/50 border border-white hover:bg-white transition-all shadow-sm">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: step.bg }}>
                         {step.emoji}
                      </div>
                      <div className="flex-1">
                         <p className="font-black text-sm text-[hsl(160,10%,20%)]">{step.title}</p>
                         <p className="text-[11px] text-[hsl(155,15%,50%)] font-medium leading-tight">{step.desc}</p>
                      </div>
                      <ChevronRight size={16} className="text-[hsl(155,15%,85%)]" />
                   </div>
                 ))}
              </div>
           </motion.div>
        </section>

        {/* Footer Branding */}
        <footer className="pt-16 pb-24 flex flex-col items-center gap-2 opacity-30 hover:opacity-100 transition-opacity cursor-default">
           <div className="flex items-center gap-2">
              <ShieldCheck size={12} className="text-[hsl(15,80%,65%)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(160,10%,20%)]">Dionimar Flores Solo Developer</span>
           </div>
           <div className="flex items-center gap-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-[hsl(155,15%,60%)]">V.2.5.0 Production Premium Hub</p>
              <Link href="/settings" className="text-[9px] font-black uppercase tracking-widest text-[hsl(15,80%,65%)] hover:underline decoration-2 underline-offset-4">
                 [ Support Development ]
              </Link>
           </div>
        </footer>

      </div>
    </div>
  );
}
