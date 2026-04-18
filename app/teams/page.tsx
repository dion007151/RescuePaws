"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc, collection, getDocs, query, where } from "firebase/firestore";
import { Shield, Map as MapIcon, Zap, Users, CheckCircle2, Trophy, Loader2, Sparkles, Target } from "lucide-react";
import confetti from "canvas-confetti";

interface Team {
  id: "guardians" | "patrol" | "frontline";
  name: string;
  description: string;
  mission: string;
  icon: any;
  color: string;
  secondary: string;
  emoji: string;
}

const TEAMS: Team[] = [
  {
    id: "guardians",
    name: "Antique Guardians",
    description: "Urban Defense & Sector Monitoring",
    mission: "Protecting the heart of the city through rapid response and systematic street blocks.",
    icon: Shield,
    color: "hsl(215, 80%, 60%)",
    secondary: "bg-blue-50 text-blue-600",
    emoji: "🛡️"
  },
  {
    id: "patrol",
    name: "Pioneer Patrol",
    description: "Rural Outreach & Territory Mapping",
    mission: "Venturing into remote sectors to provide safety nets for disenfranchised strays.",
    icon: MapIcon,
    color: "hsl(15, 80%, 65%)",
    secondary: "bg-orange-50 text-orange-600",
    emoji: "🗺️"
  },
  {
    id: "frontline",
    name: "Frontline Medical",
    description: "Critical Care & Emergency Transport",
    mission: "Specialized in extraction and urgent stabilization of high-priority medical cases.",
    icon: Zap,
    color: "hsl(280, 70%, 60%)",
    secondary: "bg-purple-50 text-purple-600",
    emoji: "⚡"
  }
];

export default function TeamsPage() {
  const { user, profile } = useAuth();
  const [enlisting, setEnlisting] = useState<string | null>(null);
  const [teamStats, setTeamStats] = useState<Record<string, number>>({ guardians: 0, patrol: 0, frontline: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeamStats() {
      try {
        const q = query(collection(db, "users"), where("teamId", "!=", null));
        const snap = await getDocs(q);
        const stats: Record<string, number> = { guardians: 0, patrol: 0, frontline: 0 };
        snap.forEach(d => {
          const tid = d.data().teamId;
          const rescues = d.data().rescueCount || 0;
          if (tid && stats[tid] !== undefined) {
             stats[tid] += rescues;
          }
        });
        setTeamStats(stats);
      } catch (err) {
        console.error("Team stats error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTeamStats();
  }, []);

  async function handleEnlist(teamId: string) {
    if (!user) return;
    setEnlisting(teamId);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        teamId: teamId
      });
      
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: [TEAMS.find(t => t.id === teamId)?.color || "#f8947b", "#ffffff"]
      });

      // Refresh page to show updated status
      window.location.reload();
    } catch (err) {
      console.error("Enlistment error:", err);
      setEnlisting(null);
    }
  }

  const currentTeam = TEAMS.find(t => t.id === profile?.teamId);

  return (
    <div className="min-h-screen bg-[hsl(45,30%,98%)] p-6 lg:p-12 relative overflow-hidden">
      <div className="fixed inset-0 bg-paw-pattern opacity-[0.03] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
             <div className="flex items-center gap-3 mb-4">
                <div className="px-4 py-1.5 rounded-full bg-[hsl(160,10%,20%)] text-white text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-2">
                   <Target size={12} className="text-[hsl(15,80%,65%)]" /> Recruitment Office
                </div>
                <div className="px-4 py-1.5 rounded-full bg-white border border-[hsl(155,15%,90%)] text-[hsl(155,15%,50%)] text-[10px] font-black uppercase tracking-[0.2em]">
                   Grid Identification Required
                </div>
             </div>
             <h1 className="font-display text-7xl lg:text-9xl font-black text-[hsl(160,10%,20%)] leading-[0.8] tracking-tighter">
               Join Your <br/>
               <span className="text-[hsl(15,80%,65%)]">Squad.</span>
             </h1>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-10 rounded-[3.5rem] min-w-[320px] border-white/60 shadow-2xl relative overflow-hidden"
          >
             <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(155,15%,50%)] mb-2">Network Status</p>
             <h3 className="text-2xl font-black text-[hsl(160,10%,20%)] mb-4">Community Reach</h3>
             <div className="flex items-end gap-3">
                <span className="text-5xl font-black tabular-nums">{Object.values(teamStats).reduce((a,b) => a+b, 0)}</span>
                <span className="text-sm font-black text-emerald-600 mb-2 uppercase tracking-widest flex items-center gap-1">
                   <CheckCircle2 size={14} /> Total Extractions
                </span>
             </div>
          </motion.div>
        </header>

        {/* Squad Selection Cards */}
        <div className="grid lg:grid-cols-3 gap-8">
           {TEAMS.map((team, i) => {
             const isMember = profile?.teamId === team.id;
             return (
               <motion.div
                 key={team.id}
                 initial={{ opacity: 0, y: 30 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.1 }}
                 className={`glass p-10 rounded-[4rem] border-white/60 shadow-xl flex flex-col relative overflow-hidden group transition-all duration-500 ${isMember ? "ring-4 ring-[hsl(160,10%,20%)] ring-inset" : "hover:shadow-2xl hover:-translate-y-2"}`}
               >
                  {/* Background Decoration */}
                  <div 
                    className="absolute -top-10 -right-10 w-40 h-40 opacity-10 group-hover:opacity-20 transition-opacity rounded-full"
                    style={{ background: team.color }}
                  />

                  <div className="relative z-10 flex flex-col h-full">
                     <div className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center mb-8 shadow-xl transition-all group-hover:scale-110 group-hover:rotate-6`} style={{ background: team.color, color: 'white' }}>
                        <team.icon size={32} strokeWidth={2.5} />
                     </div>

                     <h3 className="font-display text-3xl font-black text-[hsl(160,10%,20%)] mb-2">{team.name}</h3>
                     <p className={`text-[10px] font-black uppercase tracking-widest mb-6 ${team.secondary}`}>{team.description}</p>
                     
                     <p className="text-sm text-[hsl(155,15%,45%)] font-medium leading-relaxed mb-10 flex-1">
                        "{team.mission}"
                     </p>

                     <div className="mt-auto space-y-6">
                        <div className="flex items-end justify-between">
                           <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(155,15%,50%)]">Team Impact</p>
                           <div className="flex items-center gap-1 font-black text-[hsl(160,10%,20%)]">
                              <Trophy size={14} className="text-amber-500" />
                              <span className="text-xl tabular-nums">{teamStats[team.id]}</span>
                           </div>
                        </div>

                        {isMember ? (
                          <div className="w-full py-5 rounded-[2rem] bg-[hsl(160,10%,20%)] text-white font-black text-center flex items-center justify-center gap-3">
                             <CheckCircle2 size={20} className="text-emerald-400" /> ENLISTED
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEnlist(team.id)}
                            disabled={enlisting !== null}
                            className="w-full py-5 rounded-[2rem] bg-white border-2 border-[hsl(155,15%,90%)] hover:border-[hsl(160,10%,20%)] text-[hsl(160,10%,20%)] font-black text-sm uppercase tracking-[0.2em] transition-all hover:bg-[hsl(160,10%,20%)] hover:text-white flex items-center justify-center gap-3 group/btn"
                          >
                             {enlisting === team.id ? (
                               <Loader2 className="animate-spin" size={18} />
                             ) : (
                               <>
                                 Enlist Now <Sparkles size={16} className="opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                               </>
                             )}
                          </button>
                        )}
                     </div>
                  </div>
               </motion.div>
             );
           })}
        </div>

        {/* Squad Comparison Chart Area (Future) */}
        <section className="bg-[hsl(160,10%,20%)] rounded-[4rem] p-10 lg:p-14 text-white relative overflow-hidden shadow-2xl">
           <div className="relative z-10 max-w-2xl">
              <h2 className="font-display text-5xl font-black italic mb-6">Unified Mission Grid.</h2>
              <p className="text-white/60 font-medium leading-relaxed mb-10">
                 Regardless of your squad, every rescue contributes to our global target of 5,000 saved paws. Squads are designed to organize tactical response and foster community mentorship. Join yours today to specialize your impact.
              </p>
              <div className="flex flex-wrap gap-4">
                 {TEAMS.map(t => (
                   <div key={t.id} className="px-6 py-3 rounded-2xl bg-white/10 border border-white/10 flex items-center gap-3 text-xs font-black uppercase tracking-widest">
                      <span>{t.emoji}</span> {t.name}
                   </div>
                 ))}
              </div>
           </div>
           <Users className="absolute -right-20 -bottom-20 w-[500px] h-[500px] text-white/[0.03] rotate-12 pointer-events-none" />
        </section>

      </div>
    </div>
  );
}
