"use client";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Report } from "@/lib/types";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, MapPin, Heart, CheckCircle2, ShieldCheck, Clock, Loader2, Sparkles, Phone, MessageSquare, User } from "lucide-react";
import confetti from "canvas-confetti";

interface ReportDetailProps {
  report: Report;
  onClose: () => void;
  onUpdate: () => void;
}

const ANIMAL_EMOJI: Record<string, string> = { dog: "🐶", cat: "🐱", other: "🐾" };
const CONDITION_LABEL: Record<string, string> = { injured: "Needs Care", hungry: "Hungry", sick: "Unwell" };

export default function ReportDetail({ report, onClose, onUpdate }: ReportDetailProps) {
  const [rescuing, setRescuing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function markRescued() {
    setRescuing(true);
    setError(null);
    try {
      await updateDoc(doc(db, "reports", report.id), { status: "rescued" });
      
      // Celebrate!
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#f8947b", "#10b981", "#ffffff"],
      });

      onUpdate();
    } catch (err) {
      console.error(err);
      setError("Unable to update status. Please check your connection.");
    } finally {
      setRescuing(false);
    }
  }

  const createdAt =
    report.createdAt instanceof Date
      ? report.createdAt
      : (report.createdAt as unknown as { toDate: () => Date }).toDate();

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-[hsl(45,30%,98%)] rounded-[3rem] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col relative z-20 border border-white"
      >
        {/* Main Image with Overlay Header */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden group">
          {report.imageUrl ? (
            <img
              src={report.imageUrl}
              alt="Animal"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-[hsl(155,15%,90%)] flex items-center justify-center text-8xl grayscale opacity-50">
              {ANIMAL_EMOJI[report.animalType]}
            </div>
          )}
          
          {/* Glass Header Info */}
          <div className="absolute top-0 left-0 w-full p-6 flex items-start justify-between pointer-events-none">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="glass px-4 py-2 rounded-2xl flex items-center gap-2 pointer-events-auto"
            >
              <div className="w-8 h-8 rounded-xl bg-[hsl(15,80%,65%)] flex items-center justify-center text-white text-lg">
                {ANIMAL_EMOJI[report.animalType]}
              </div>
              <h2 className="font-display text-lg font-black text-[hsl(160,10%,20%)] capitalize">
                {report.animalType}
              </h2>
            </motion.div>
            
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full glass flex items-center justify-center text-[hsl(160,10%,20%)] transition shadow-lg pointer-events-auto hover:bg-white"
            >
              <X size={20} />
            </button>
          </div>

          <div className="absolute bottom-4 left-6">
             <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg ${
                    report.status === "rescued"
                        ? "bg-emerald-500 text-white"
                        : "bg-white text-[hsl(160,10%,20%)]"
                }`}
             >
                {report.status === "rescued" ? <Sparkles size={12} fill="currentColor" /> : <Clock size={12} />}
                {report.status === "rescued" ? "Successfully Rescued" : "Pending Mission"}
             </motion.div>
          </div>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-[1.5rem] text-sm font-bold flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  {error}
                </div>
                <button onClick={() => setError(null)} className="hover:opacity-70 transition">
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grid Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-[hsl(155,15%,95%)] shadow-sm">
              <div className="flex items-center gap-2 text-[hsl(155,15%,50%)] mb-2">
                <Heart size={14} className="text-[hsl(15,80%,65%)]" />
                <p className="text-[10px] font-black uppercase tracking-widest">Health Condition</p>
              </div>
              <p className="font-black text-[hsl(160,10%,20%)] capitalize">
                {CONDITION_LABEL[report.condition]}
              </p>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-[hsl(155,15%,95%)] shadow-sm">
              <div className="flex items-center gap-2 text-[hsl(155,15%,50%)] mb-2">
                <Calendar size={14} className="text-blue-400" />
                <p className="text-[10px] font-black uppercase tracking-widest">Reported on</p>
              </div>
              <p className="font-black text-[hsl(160,10%,20%)]">
                {createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[hsl(155,15%,95%)] shadow-sm">
             <div className="flex items-start justify-between">
                <div className="flex-1">
                   <div className="flex items-center gap-2 text-[hsl(155,15%,50%)] mb-2">
                      <User size={14} className="text-emerald-500" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Reported by</p>
                   </div>
                   <p className="font-black text-[hsl(160,10%,20%)]">
                      {report.reporterName || "Safe Paws Hero"}
                   </p>
                </div>
                {report.reporterPhone && (
                   <div className="flex gap-2">
                      <a 
                        href={`tel:${report.reporterPhone}`}
                        className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                        title="Call Reporter"
                      >
                         <Phone size={18} />
                      </a>
                      <a 
                        href={`sms:${report.reporterPhone}`}
                        className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                        title="SMS Message"
                      >
                         <MessageSquare size={18} />
                      </a>
                   </div>
                )}
             </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[hsl(155,15%,95%)] shadow-sm">
            <div className="flex items-center gap-2 text-[hsl(155,15%,50%)] mb-2">
              <MapPin size={14} className="text-orange-400" />
              <p className="text-[10px] font-black uppercase tracking-widest">Precise Location</p>
            </div>
            <p className="font-mono text-sm text-[hsl(160,10%,20%)] font-bold">
              {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-[hsl(155,15%,50%)] mb-3 ml-1">
              <Clock size={14} />
              <p className="text-[10px] font-black uppercase tracking-widest">Situation Description</p>
            </div>
            <div className="bg-[hsl(155,15%,95%)] p-6 rounded-[2rem] relative">
               <p className="text-[hsl(160,10%,20%)] text-sm font-medium leading-relaxed italic">
                 "{report.description}"
               </p>
               <div className="absolute -top-2 -left-2 w-6 h-6 bg-[hsl(155,15%,50%)] rounded-full flex items-center justify-center text-white font-black">"</div>
            </div>
          </div>

          {/* Mark Rescued Button */}
          {report.status === "pending" && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={markRescued}
              disabled={rescuing}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-5 rounded-[2rem] transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-60 flex items-center justify-center gap-3 text-lg"
            >
              {rescuing ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <CheckCircle2 size={24} />
                  Mark as Rescued!
                </>
              )}
            </motion.button>
          )}

          {report.status === "rescued" && (
            <div className="w-full bg-emerald-50 border-2 border-emerald-100 text-emerald-600 font-black py-6 rounded-[2rem] text-center flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-1">
                 <Heart className="fill-emerald-500" size={24} />
              </div>
              <p className="text-xl">Heroic Mission Complete!</p>
              <p className="text-xs uppercase tracking-widest opacity-70">This paw is now safe ❤️</p>
            </div>
          )}
          
          <div className="flex items-center justify-center gap-2 py-2 opacity-30">
             <ShieldCheck size={14} />
             <span className="text-[10px] font-black uppercase tracking-widest">RescuePaws Protection</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
