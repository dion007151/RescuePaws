"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import {
  PawPrint, MapPin, CheckCircle2, Camera, Heart,
  ChevronRight, Star, Zap, Map
} from "lucide-react";

const steps = [
  {
    icon: Map,
    emoji: "🗺️",
    step: "1",
    title: "Open the Map",
    desc: "Go to the Map tab. You'll see your neighborhood. All reported strays appear as little pins on the map.",
    tip: "Tap the crosshair button to zoom to your current location!",
    color: "hsl(200,80%,60%)",
    bg: "hsl(200,80%,97%)",
  },
  {
    icon: MapPin,
    emoji: "📍",
    step: "2",
    title: "Tap to Report",
    desc: "See a stray animal? Tap that spot on the map. A form will pop up asking for details.",
    tip: "Be as specific as possible — mention landmarks nearby.",
    color: "hsl(15,80%,65%)",
    bg: "hsl(15,80%,97%)",
  },
  {
    icon: Camera,
    emoji: "📷",
    step: "3",
    title: "Add a Photo",
    desc: "Upload a photo of the animal. Photos help rescuers identify and find the animal much faster.",
    tip: "Don't worry if the photo is blurry — any image helps!",
    color: "hsl(280,70%,65%)",
    bg: "hsl(280,70%,97%)",
  },
  {
    icon: CheckCircle2,
    emoji: "✅",
    step: "4",
    title: "Mark as Rescued",
    desc: "Once an animal is helped, open its report on the map and tap 'Mark as Rescued' to let the community know.",
    tip: "This keeps the map accurate for everyone!",
    color: "hsl(145,65%,42%)",
    bg: "hsl(145,65%,97%)",
  },
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !db) { setLoading(false); return; }
    async function fetchStats() {
      try {
        // Fetch Personal Stats
        const personalQ = query(collection(db, "reports"), where("userId", "==", user!.uid));
        const personalSnap = await getDocs(personalQ);
        let personalRescued = 0;
        personalSnap.forEach(d => { if (d.data().status === "rescued") personalRescued++; });
        setStats({ total: personalSnap.size, rescued: personalRescued, pending: personalSnap.size - personalRescued });

        // Fetch Global Community Stats (The "Legit Connection")
        const globalSnap = await getDocs(collection(db, "reports"));
        let globalRescued = 0;
        globalSnap.forEach(d => { if (d.data().status === "rescued") globalRescued++; });
        setGlobalStats({ total: globalSnap.size, rescued: globalRescued });

      } catch (err) {
        console.error("Stats fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [user]);

  const displayName = user?.email?.split("@")[0] ?? "Rescuer";
  const isNewUser = stats.total === 0 && !loading;

  return (
    <div className="min-h-screen bg-[hsl(45,30%,98%)] p-6 lg:p-12 bg-paw-pattern">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Welcome Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-5xl font-black text-[hsl(160,10%,20%)] mb-1">
            {isNewUser ? "Welcome! 🐾" : "Your Impact"}
          </h1>
          <p className="text-[hsl(155,15%,50%)] font-medium text-lg">
            {isNewUser
              ? `Hey ${displayName}, let's save your first animal together.`
              : `Amazing work, ${displayName}! Keep it up.`}
          </p>
        </motion.div>

        {/* Stats Cards — only show if user has reports */}
        {!isNewUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-4"
          >
            {[
              { icon: PawPrint, label: "Reports", value: stats.total, color: "text-[hsl(15,80%,65%)]", bg: "bg-[hsl(15,80%,97%)]" },
              { icon: CheckCircle2, label: "Rescued", value: stats.rescued, color: "text-emerald-500", bg: "bg-emerald-50" },
              { icon: Heart, label: "Pending", value: stats.pending, color: "text-orange-500", bg: "bg-orange-50" },
            ].map((s) => (
              <div key={s.label} className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-5 border border-white/60 shadow-lg shadow-black/5 text-center">
                <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                  <s.icon className={s.color} size={20} />
                </div>
                {loading ? (
                  <div className="h-8 w-10 bg-[hsl(155,15%,92%)] rounded-lg mx-auto mb-1 animate-pulse" />
                ) : (
                  <p className="text-3xl font-black text-[hsl(160,10%,20%)]">{s.value}</p>
                )}
                <p className="text-[10px] font-black text-[hsl(155,15%,50%)] uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Community Results (The Legit Connection) */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white flex flex-col gap-4 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-1 px-1">
              <ShieldCheck className="text-emerald-500" size={16} />
              <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(155,15%,40%)]">Verified Community Impact</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/80 rounded-[2rem] p-5 shadow-sm text-center">
                 <p className="text-2xl font-black text-[hsl(160,10%,20%)]">{globalStats.total}</p>
                 <p className="text-[9px] font-black text-[hsl(155,15%,50%)] uppercase tracking-widest">Total Reports</p>
              </div>
              <div className="bg-emerald-50 rounded-[2rem] p-5 shadow-sm text-center">
                 <p className="text-2xl font-black text-emerald-600">{globalStats.rescued}</p>
                 <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Global Rescues</p>
              </div>
            </div>
            <p className="text-center text-[10px] text-[hsl(155,15%,60%)] font-black uppercase tracking-tighter">
               Connected locally in our rescue network
            </p>
          </motion.div>
        )}

        {/* Achievement Banner */}
        {!isNewUser && stats.rescued > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-[hsl(160,10%,20%)] to-[hsl(160,15%,30%)] rounded-[2.5rem] p-6 text-white flex items-center gap-5 relative overflow-hidden shadow-2xl shadow-black/10"
          >
            <div className="w-16 h-16 bg-[hsl(15,80%,65%)] rounded-2xl flex items-center justify-center shadow-lg shadow-[hsl(15,80%,65%)]/30 flex-shrink-0">
              <Star className="text-white" size={28} />
            </div>
            <div>
              <p className="font-display text-xl font-black">Rescue Hero! 🎉</p>
              <p className="text-white/70 text-sm font-medium">You've helped {stats.rescued} animal{stats.rescued !== 1 ? "s" : ""} find safety.</p>
            </div>
            <PawPrint className="absolute -right-6 -bottom-6 w-28 h-28 text-white/5 rotate-12" />
          </motion.div>
        )}

        {/* First Report CTA — for new users */}
        {isNewUser && (
          <motion.button
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            onClick={() => router.push("/map")}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full bg-[hsl(15,80%,65%)] text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-[hsl(15,80%,65%)]/30 flex items-center justify-center gap-3 text-lg hover:-translate-y-0.5 transition-all"
          >
            <Zap size={20} />
            Make Your First Report
            <ChevronRight size={20} />
          </motion.button>
        )}

        {/* How It Works */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[hsl(155,15%,50%)] mb-4 ml-1">
            {isNewUser ? "How It Works" : "Quick Guide"}
          </p>
          <div className="space-y-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.08 }}
                className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-lg shadow-black/5 p-5 flex items-start gap-5"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
                  style={{ background: step.bg }}
                >
                  {step.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{ color: step.color, background: step.bg }}
                    >
                      Step {step.step}
                    </span>
                  </div>
                  <p className="font-black text-[hsl(160,10%,20%)] text-base">{step.title}</p>
                  <p className="text-sm text-[hsl(155,15%,50%)] font-medium mt-0.5">{step.desc}</p>
                  <div className="flex items-start gap-1.5 mt-2">
                    <span className="text-xs mt-0.5">💡</span>
                    <p className="text-xs text-[hsl(155,15%,55%)] font-bold italic">{step.tip}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA — for returning users */}
        {!isNewUser && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <button
              onClick={() => router.push("/map")}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full bg-[hsl(160,10%,20%)] hover:bg-[hsl(160,10%,30%)] text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-black/10 flex items-center justify-center gap-3 text-lg transition-all"
            >
              <MapPin size={20} />
              Back to Map
            </button>

            {/* Solo Developer Personal Credit */}
            <div className="pt-8 pb-12 flex flex-col items-center gap-2 text-center">
               <div className="w-10 h-1 px-4 bg-[hsl(155,15%,90%)] rounded-full mb-2" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[hsl(155,15%,60%)]">Built with Passion by</p>
               <p className="text-xl font-display font-black text-[hsl(160,10%,20%)]">Dionimar Flores</p>
               <p className="text-[9px] font-black uppercase tracking-[0.1em] text-[hsl(15,80%,65%)]">Solo Developer • Safe Paws Mission</p>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
