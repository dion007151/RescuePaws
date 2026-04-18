"use client";

import { doc, updateDoc, deleteDoc, increment, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Report } from "@/lib/types";
import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, MapPin, Heart, CheckCircle2, ShieldCheck, Clock, Loader2, Sparkles, Phone, MessageSquare, User, Trash2, AlertTriangle, Camera } from "lucide-react";
import confetti from "canvas-confetti";
import ChatPortal from "./ChatPortal";

interface ReportDetailProps {
  report: Report;
  onClose: () => void;
  onUpdate: () => void;
}

const ANIMAL_EMOJI: Record<string, string> = { dog: "🐶", cat: "🐱", other: "🐾" };
const CONDITION_LABEL: Record<string, string> = { injured: "Needs Care", hungry: "Hungry", sick: "Unwell" };

export default function ReportDetail({ report, onClose, onUpdate }: ReportDetailProps) {
  const { user, profile } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showStoryForm, setShowStoryForm] = useState(false);
  const [storyText, setStoryText] = useState("");
  const [afterImageUrl, setAfterImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [rescuing, setRescuing] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function deleteReport() {
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "reports", report.id));
      onUpdate();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to delete report.");
    } finally {
      setDeleting(false);
    }
  }

  async function markRescued() {
    setRescuing(true);
    setError(null);
    try {
      // 1. Update report status
      await updateDoc(doc(db, "reports", report.id), { status: "rescued" });
      
      // 2. Increment user's rescue count for achievements
      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          rescueCount: increment(1)
        });
      }
      
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

  async function broadcastStory() {
    if (!storyText.trim()) {
      setError("Please describe the mission success story.");
      return;
    }
    setBroadcasting(true);
    try {
      await addDoc(collection(db, "success_stories"), {
        reportId: report.id,
        beforeImageUrl: report.imageUrl || "",
        afterImageUrl: afterImageUrl || report.imageUrl || "", // Fallback if no after photo
        story: storyText.trim(),
        rescuerName: profile?.fullName || "Anonymous Hero",
        rescuerId: user?.uid,
        createdAt: serverTimestamp()
      });
      setShowStoryForm(false);
      onUpdate();
      
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 },
        colors: ["#10b981", "#34d399", "#ffffff"]
      });
    } catch (err) {
      console.error(err);
      setError("Failed to broadcast the story. Network error.");
    } finally {
      setBroadcasting(false);
    }
  }

  // Handle mock image upload for "After" photo
  const handleAfterImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // Mock upload for demonstration
      const reader = new FileReader();
      reader.onloadend = () => {
        setAfterImageUrl(reader.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

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
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[hsl(45,30%,98%)] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl w-full sm:max-w-lg overflow-hidden flex flex-col relative z-20 border border-white"
        style={{ maxHeight: '92dvh' }}
      >
        {/* Main Image — shorter on mobile */}
        <div className="relative h-48 sm:h-64 md:h-80 w-full overflow-hidden group flex-shrink-0">
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
            
            <div className="flex gap-2 pointer-events-auto">
              {(user?.email === 'dionimarflores9@gmail.com' || profile?.isAdmin) && (
                <button
                  onClick={() => setShowConfirmDelete(true)}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center text-red-500 transition shadow-lg hover:bg-red-50"
                  title="Purge Mission"
                >
                  <Trash2 size={18} />
                </button>
              )}
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full glass flex items-center justify-center text-[hsl(160,10%,20%)] transition shadow-lg hover:bg-white"
              >
                <X size={20} />
              </button>
            </div>
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

        <div className="p-5 sm:p-8 space-y-4 sm:space-y-6 overflow-y-auto custom-scrollbar">
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
                      
                      <button 
                        onClick={() => setShowChat(true)}
                        className="w-10 h-10 bg-[hsl(160,10%,20%)] rounded-xl flex items-center justify-center text-white hover:bg-[hsl(15,80%,65%)] transition-all shadow-sm group"
                        title="Mission Chat"
                      >
                         <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                      </button>
                   </div>
                )}
             </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[hsl(155,15%,95%)] shadow-sm">
            <div className="flex items-center gap-2 text-[hsl(155,15%,50%)] mb-2">
              <MapPin size={14} className="text-orange-400" />
              <p className="text-[10px] font-black uppercase tracking-widest">Legit Location</p>
            </div>
            <p className="font-black text-[hsl(160,10%,20%)] italic mb-2">
              {report.address || "Fetching address..."}
            </p>
            <p className="font-mono text-[9px] text-[hsl(155,15%,50%)] font-bold">
              GPS: {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
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
            <div className="space-y-4">
              <div className="w-full bg-emerald-50 border-2 border-emerald-100 text-emerald-600 font-black py-6 rounded-[2rem] text-center flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-1">
                   <Heart className="fill-emerald-500" size={24} />
                </div>
                <p className="text-xl">Heroic Mission Complete!</p>
                <p className="text-xs uppercase tracking-widest opacity-70">This paw is now safe ❤️</p>
              </div>

              {!showStoryForm ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowStoryForm(true)}
                  className="w-full bg-[hsl(160,10%,20%)] text-white font-black py-5 rounded-[2rem] shadow-xl flex items-center justify-center gap-3"
                >
                   <Sparkles size={20} className="text-[hsl(15,80%,65%)]" />
                   Share Success Story
                </motion.button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-[2.5rem] border border-[hsl(155,15%,95%)] p-6 shadow-xl space-y-6"
                >
                   <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(160,10%,20%)]">Broadcast Mission Story</p>
                      <button onClick={() => setShowStoryForm(false)} className="text-[hsl(155,15%,50%)] hover:text-red-500 transition-colors">
                         <X size={16} />
                      </button>
                   </div>

                   <div className="space-y-4">
                      {/* After Photo Upload */}
                      <div className="relative group">
                         <div className={`h-40 rounded-[2rem] border-2 border-dashed border-[hsl(155,15%,90%)] flex flex-col items-center justify-center overflow-hidden relative ${afterImageUrl ? 'border-emerald-200' : 'hover:border-[hsl(160,10%,20%)]'}`}>
                            {afterImageUrl ? (
                               <img src={afterImageUrl} className="w-full h-full object-cover" alt="After" />
                            ) : (
                               <>
                                  <Camera className="text-[hsl(155,15%,80%)] mb-2" size={32} />
                                  <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(155,15%,60%)]">Upload "After" Photo</p>
                               </>
                            )}
                            <input 
                               type="file" 
                               accept="image/*" 
                               onChange={handleAfterImageChange}
                               className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                         </div>
                         {isUploading && (
                           <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-[2rem]">
                              <Loader2 className="animate-spin text-emerald-500" />
                           </div>
                         )}
                      </div>

                      <div className="space-y-2">
                         <p className="text-[9px] font-black uppercase tracking-widest text-[hsl(155,15%,50%)] ml-2 leading-none mb-1">Mission Highlights</p>
                         <textarea 
                           value={storyText}
                           onChange={(e) => setStoryText(e.target.value)}
                           placeholder="Describe the rescue and how the animal is doing now..."
                           className="w-full bg-[hsl(155,15%,97%)] rounded-3xl p-5 text-sm font-medium border-0 focus:ring-2 focus:ring-[hsl(160,10%,20%)]/10 min-h-[120px] resize-none"
                         />
                      </div>

                      <button
                        onClick={broadcastStory}
                        disabled={broadcasting || isUploading}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 disabled:opacity-50 transition-all"
                      >
                         {broadcasting ? <Loader2 className="animate-spin" /> : <Sparkles size={16} />}
                         {broadcasting ? "Broadcasting..." : "Share with Community"}
                      </button>
                   </div>
                </motion.div>
              )}
            </div>
          )}
          
          <div className="flex flex-col gap-3 py-4">
             {/* Admin/Owner Actions */}
             {(user?.email === 'dionimarflores9@gmail.com' || profile?.isAdmin) && (
                <div className="border-t border-[hsl(155,15%,90%)] pt-6 mt-2">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(155,15%,50%)] mb-4 text-center">Operational Controls</p>
                   
                   <button
                     onClick={() => setShowConfirmDelete(true)}
                     className="w-full py-4 rounded-[1.5rem] border-2 border-red-100 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                   >
                      <Trash2 size={14} />
                      Purge Mission Data
                   </button>
                </div>
             )}

             <div className="flex items-center justify-center gap-2 pt-2 opacity-30 mt-auto">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">RescuePaws Protection</span>
             </div>
          </div>
        </div>

        {/* High-Impact Delete Confirmation Overlay */}
        <AnimatePresence>
          {showConfirmDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[2000] glass backdrop-blur-xl flex items-center justify-center p-8 text-center"
            >
              <button 
                onClick={() => setShowConfirmDelete(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/50 flex items-center justify-center text-[hsl(160,10%,20%)] hover:bg-white transition-all shadow-lg"
              >
                <X size={20} />
              </button>

              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-[3rem] p-8 shadow-2xl border border-red-100 max-w-sm w-full"
              >
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="font-display text-2xl font-black text-red-600 mb-2 italic">Purge Mission?</h3>
                <p className="text-xs font-bold text-[hsl(155,15%,50%)] mb-8 leading-relaxed">
                  This action will permanently remove this mission from the global grid. All logs and metadata will be permanently lost.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={deleteReport}
                    disabled={deleting}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-2xl text-sm uppercase tracking-widest transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                    {deleting ? "Purging Grid..." : "Confirm Purge"}
                  </button>
                  <button
                    onClick={() => setShowConfirmDelete(false)}
                    disabled={deleting}
                    className="w-full bg-white text-[hsl(155,15%,50%)] font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest border border-[hsl(155,15%,90%)] hover:bg-slate-50 transition-all font-black"
                  >
                    Abort Mission
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tactical Chat Portal Overlay */}
        <AnimatePresence>
          {showChat && (
            <ChatPortal 
              report={report} 
              onClose={() => setShowChat(false)} 
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
