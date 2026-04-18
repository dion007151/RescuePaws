"use client";

import { useEffect, useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { compressToBase64 } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, MapPin, Loader2, Dog, Cat, PawPrint, Heart, Send, CheckCircle2, Sparkles, ShieldCheck } from "lucide-react";
import Image from "next/image";
import confetti from "canvas-confetti";

interface ReportFormProps {
  lat: number;
  lng: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReportForm({ lat, lng, onClose, onSuccess }: ReportFormProps) {
  const { user, profile } = useAuth();
  const [animalType, setAnimalType] = useState<"dog" | "cat" | "other">("dog");
  const [condition, setCondition] = useState<"injured" | "hungry" | "sick">("hungry");
  const [category, setCategory] = useState<"stray" | "lost">("stray");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState<string>("Locating legit address...");
  const [isGeocoding, setIsGeocoding] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "processing" | "recording" | "success">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!imagePreview || isAnalyzing) return;
    
    // Simulate AI detecting keywords in description
    const desc = description.toLowerCase();
    let intel = "AI Scan: Optimal visibility. Condition verified.";
    
    if (desc.includes("bleeding") || desc.includes("blood") || desc.includes("wound")) {
       intel = "AI Scan: Potential trauma detected. High priority.";
    } else if (desc.includes("limp") || desc.includes("bone") || desc.includes("leg")) {
       intel = "AI Scan: Mobility issues detected. Vet assistance recommended.";
    } else if (desc.includes("skin") || desc.includes("itch") || desc.includes("hair")) {
       intel = "AI Scan: Dermatological condition detected.";
    } else if (desc.includes("thin") || desc.includes("ribs") || desc.includes("starving")) {
       intel = "AI Scan: Severe malnutrition detected.";
    }

    setAiAnalysis(intel);
  }, [description, imagePreview, isAnalyzing]);

  useEffect(() => {
    async function reverseGeocode() {
      setIsGeocoding(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
          headers: {
            'User-Agent': 'RescuePaws (rescuepaws@example.com)'
          }
        });
        const data = await res.json();
        const legitName = data.display_name || "Unknown Territory";
        // Clean up the address - take first few parts for clarity
        const parts = legitName.split(', ');
        const shortName = parts.slice(0, 3).join(', ');
        setAddress(shortName || legitName);
      } catch (err) {
        console.error("Geocoding failed:", err);
        setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      } finally {
        setIsGeocoding(false);
      }
    }
    reverseGeocode();
  }, [lat, lng]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        // Trigger Mock AI Analysis
        setIsAnalyzing(true);
        setTimeout(() => {
          setIsAnalyzing(false);
          setAiAnalysis("AI Scan: Optimal visibility. Condition verified.");
        }, 2500);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      setError("User profile not found. Please log in again.");
      return;
    }
    if (!description.trim()) {
      setError("Please add a little description.");
      return;
    }
    setSubmitting(true);
    setStatus("processing");
    setError("");

    try {
      let imageUrl = "";
      if (imageFile) {
        try {
          imageUrl = await compressToBase64(imageFile);
        } catch (compressErr) {
          console.error("Compression failed:", compressErr);
          throw new Error("Failed to process photo. Try a smaller image.");
        }
      }

      setStatus("recording");
      await addDoc(collection(db, "reports"), {
        userId: user.uid,
        reporterName: profile?.fullName || "Anonymous Rescuer",
        reporterPhone: profile?.phoneNumber || "",
        animalType,
        condition,
        category,
        description: description.trim(),
        imageUrl,
        latitude: lat,
        longitude: lng,
        teamId: profile?.teamId || null,
        address: address, // Store the legit address
        status: "pending",
        createdAt: Timestamp.now(),
      });

      setStatus("success");
      
      // Professional Celebration!
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ef8b61', '#10b981', '#ffffff'],
        zIndex: 2000
      });

      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (err: any) {
      console.error("Submission error:", err);
      setStatus("idle");
      setSubmitting(false);
      setError(err.message || "Failed to submit report. Please check your connection.");
    } finally {
      if (status !== "success") {
        setSubmitting(false);
      }
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.95 }}
        className="bg-white/90 backdrop-blur-2xl rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl w-full sm:max-w-xl overflow-hidden flex flex-col relative z-20 border border-white"
        style={{ maxHeight: '92dvh' }}
      >
        {/* Header Section */}
        <div className="p-5 sm:p-8 pb-3 sm:pb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
             <div className="w-11 h-11 sm:w-14 sm:h-14 bg-[hsl(15,80%,65%)] rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[hsl(15,80%,65%)]/30 verified-ring flex-shrink-0">
                <PawPrint size={22} className="sm:hidden" />
                <PawPrint size={28} className="hidden sm:block" />
             </div>
             <div>
                <h2 className="font-display text-2xl sm:text-3xl font-black text-[hsl(160,10%,20%)] leading-tight">Secure Rescue</h2>
                <div className="flex items-center gap-2 mt-0.5">
                   <div className={`w-1.5 h-1.5 rounded-full ${isGeocoding ? 'bg-[hsl(15,80%,65%)] animate-pulse' : 'bg-emerald-500'}`} />
                   <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[hsl(155,15%,50%)]">
                      {isGeocoding ? "Locating..." : "Coords Locked"}
                   </p>
                </div>
             </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/50 hover:bg-white flex items-center justify-center text-[hsl(155,15%,50%)] transition shadow-sm border border-white/60 flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Location Capsule */}
        <div className="px-5 sm:px-8 mb-3 sm:mb-4">
           <div className="glass px-4 py-2.5 rounded-2xl border-white/60 flex items-center gap-3 shadow-sm bg-white/40">
              <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center text-orange-500 flex-shrink-0">
                 <MapPin size={15} />
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-orange-500">Location Target</p>
                 <p className="text-xs font-bold text-[hsl(160,10%,20%)] truncate italic">
                    {isGeocoding ? "Scanning map..." : address}
                 </p>
              </div>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-8 pt-1 sm:pt-2 space-y-5 sm:space-y-8 overflow-y-auto custom-scrollbar">
          {/* Report Category Selector - NEW */}
          <div className="space-y-4">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(155,15%,50%)] ml-1">
              Mission Category
            </label>
            <div className="flex p-1.5 bg-[hsl(155,15%,95%)] rounded-[1.5rem] gap-2">
              {(["stray", "lost"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex-1 py-3.5 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                    category === cat
                      ? "bg-white text-[hsl(160,10%,20%)] shadow-sm"
                      : "text-[hsl(155,15%,50%)] hover:text-[hsl(160,10%,20%)]"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {cat === "stray" ? <PawPrint size={14} /> : <ShieldCheck size={14} />}
                    {cat === "stray" ? "Stray Animal" : "Lost Pet"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-[1.5rem] text-sm font-bold flex items-center gap-3 shadow-sm"
            >
              <div className="w-2 h-2 rounded-full bg-red-600" />
              {error}
            </motion.div>
          )}

          {/* Species Selection — 3 equal cols on all sizes */}
          <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(155,15%,50%)] ml-1">
              Identify Species
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {(["dog", "cat", "other"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAnimalType(type)}
                  className={`group relative py-4 sm:py-6 rounded-[1.5rem] sm:rounded-[2rem] border-2 font-black text-[10px] sm:text-[11px] uppercase tracking-widest transition-all overflow-hidden ${
                    animalType === type
                      ? "border-[hsl(15,80%,65%)] bg-white text-[hsl(15,80%,65%)] shadow-xl translate-y-[-3px]"
                      : "border-white bg-white/40 text-[hsl(155,15%,50%)] hover:bg-white/60"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2 sm:gap-3 relative z-10">
                    <span className="text-2xl sm:text-3xl">
                      {type === "dog" ? <Dog size={26} /> : type === "cat" ? <Cat size={26} /> : <PawPrint size={26} />}
                    </span>
                    <span>{type}</span>
                  </div>
                  {animalType === type && (
                    <motion.div
                      layoutId="species-active"
                      className="absolute inset-0 bg-[hsl(15,80%,65%)]/5 pointer-events-none"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Condition Assessment */}
          <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(155,15%,50%)] ml-1">
              Condition
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {(["injured", "hungry", "sick"] as const).map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => setCondition(cond)}
                  className={`py-3 sm:py-4 rounded-[1.2rem] sm:rounded-[1.5rem] border-2 font-black text-[9px] sm:text-[10px] uppercase tracking-widest transition-all ${
                    condition === cond
                      ? "border-[hsl(15,80%,65%)] bg-white text-[hsl(15,80%,65%)] shadow-lg translate-y-[-2px]"
                      : "border-white bg-white/40 text-[hsl(155,15%,50%)] hover:bg-white/60"
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          {/* Description + Photo — stacked on mobile, side-by-side on sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
             {/* Description Panel */}
             <div className="space-y-4">
               <label className="block text-xs font-black uppercase tracking-[0.2em] text-[hsl(155,15%,50%)] ml-1">
                 Mission Details
               </label>
               <textarea
                 value={description}
                 onChange={(e) => setDescription(e.target.value)}
                 rows={5}
                 className="w-full px-6 py-5 rounded-[2rem] border border-white focus:outline-none focus:ring-4 focus:ring-[hsl(15,80%,65%)]/10 focus:border-[hsl(15,80%,65%)] text-[hsl(160,10%,20%)] bg-white/40 backdrop-blur-sm transition-all resize-none text-sm font-medium shadow-inner"
                 placeholder="What is the situation? (e.g., Small puppy under the bridge, looks weak...)"
                 required
                 disabled={submitting}
               />
             </div>

             {/* Photo Intel */}
              <div className="space-y-4 relative">
                <label className="block text-xs font-black uppercase tracking-[0.2em] text-[hsl(155,15%,50%)] ml-1">
                  Visual Intelligence
                </label>
                
                <AnimatePresence>
                  {isAnalyzing && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-x-0 top-10 bottom-0 z-10 glass backdrop-blur-md rounded-[2rem] flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-[hsl(15,80%,65%)]"
                    >
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="mb-4 text-[hsl(15,80%,65%)]"
                      >
                        <Sparkles size={32} />
                      </motion.div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(160,10%,20%)] animate-pulse">Running Neural Scan...</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {aiAnalysis && !imagePreview && (
                   <p className="text-[9px] font-black text-emerald-600 absolute right-1 top-0 uppercase">{aiAnalysis}</p>
                )}
               {imagePreview ? (
                 <div className="relative group h-[148px]">
                   <Image
                     src={imagePreview}
                     alt="Preview"
                     fill
                     className="object-cover rounded-[2rem] shadow-xl border-4 border-white"
                   />
                   <button
                     type="button"
                     onClick={() => { setImageFile(null); setImagePreview(null); }}
                     className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white rounded-full w-10 h-10 flex items-center justify-center transition opacity-0 group-hover:opacity-100 hover:bg-red-500 shadow-xl"
                   >
                     <X size={20} />
                   </button>
                 </div>
               ) : (
                 <label className="block border-2 border-dashed border-white rounded-[2rem] h-[148px] text-center cursor-pointer hover:border-[hsl(15,80%,65%)] bg-white/40 hover:bg-white transition-all group shadow-inner">
                   <div className="h-full flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[hsl(155,15%,50%)] group-hover:bg-[hsl(15,80%,65%)] group-hover:text-white transition-all shadow-sm">
                        <Camera size={24} />
                      </div>
                      <span className="text-[10px] text-[hsl(155,15%,50%)] font-black uppercase tracking-widest group-hover:text-[hsl(15,80%,65%)] transition-colors">Deploy Camera</span>
                   </div>
                   <input
                     type="file"
                     accept="image/*"
                     onChange={handleImageChange}
                     className="hidden"
                     disabled={submitting}
                   />
                 </label>
               )}
             </div>
          </div>

          {/* Submission Layer */}
          <div className="pt-4 border-t border-white/60">
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-500 text-white p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-4 shadow-2xl"
                >
                  <motion.div
                    initial={{ rotate: -20, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                  >
                    <CheckCircle2 size={56} />
                  </motion.div>
                  <div>
                    <p className="font-display text-2xl font-black italic">Mission Confirmed!</p>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mt-1">Satellite updated. Help is on the way.</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="form-actions" exit={{ opacity: 0, y: 20 }}>
                  {status === "processing" || status === "recording" ? (
                    <div className="bg-white/60 backdrop-blur-md rounded-[2rem] p-8 border border-white shadow-xl space-y-5">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <Loader2 className="animate-spin text-[hsl(15,80%,65%)]" size={20} />
                             <span className="text-xs font-black uppercase tracking-widest text-[hsl(160,10%,20%)]">
                                {status === "processing" ? "Encrypting Visuals..." : "Writing to Data Grid..."}
                             </span>
                          </div>
                          <span className="text-[10px] font-black text-[hsl(15,80%,65%)]">{status === "processing" ? "65%" : "95%"}</span>
                       </div>
                       <div className="h-2 bg-white rounded-full overflow-hidden shadow-inner">
                          <motion.div
                            initial={{ width: "30%" }}
                            animate={{ width: status === "recording" ? "100%" : "70%" }}
                            className="h-full bg-gradient-to-r from-[hsl(15,80%,65%)] to-[hsl(15,80%,75%)]"
                          />
                       </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-6">
                       <button
                         type="submit"
                         disabled={submitting}
                         className="w-full bg-[hsl(160,10%,20%)] hover:bg-[hsl(160,10%,30%)] text-white font-black py-6 rounded-[2.5rem] transition-all shadow-2xl shadow-black/20 hover:shadow-black/40 hover:-translate-y-1.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-4 text-xl group"
                       >
                         <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                         Broadcast Report
                       </button>
                    </div>
                  )
                  }
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
