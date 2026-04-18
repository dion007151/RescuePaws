"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { collection, getDocs, orderBy, query, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { Report } from "@/lib/types";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { PawPrint, LogOut, Filter, Info, Search, Heart, ShieldCheck, Loader2, MapPin, Stethoscope, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { EMERGENCY_CONTACTS } from "@/lib/emergency_data";

// Dynamically import heavy modals to speed up initial load
const ReportForm = dynamic(() => import("@/components/ReportForm"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/5 backdrop-blur-sm"><Loader2 className="animate-spin text-[hsl(15,80%,65%)]" size={40} /></div>
});
const ReportDetail = dynamic(() => import("@/components/ReportDetail"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/5 backdrop-blur-sm"><Loader2 className="animate-spin text-[hsl(15,80%,65%)]" size={40} /></div>
});

// Dynamically import map to avoid SSR issues
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[hsl(45,30%,98%)] text-[hsl(155,15%,50%)]">
      <div className="text-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl mb-4"
        >
          🗺️
        </motion.div>
        <p className="font-bold tracking-tight">Loading Rescue Map...</p>
      </div>
    </div>
  ),
});

const ANIMAL_EMOJI: Record<string, string> = { dog: "🐶", cat: "🐱", other: "🐾" };
const CONDITION_COLOR: Record<string, string> = {
  injured: "bg-red-50 text-red-600 border-red-100",
  hungry: "bg-orange-50 text-orange-600 border-orange-100",
  sick: "bg-purple-50 text-purple-600 border-purple-100",
};

const TEAM_EMOJI: Record<string, string> = {
  guardians: "🛡️",
  patrol: "🗺️",
  frontline: "⚡",
};

import { Skeleton, ReportCardSkeleton } from "@/components/Skeleton";

export default function MapPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [clickedLocation, setClickedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loadingReports, setLoadingReports] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "rescued" | "my">("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "stray" | "lost">("all");
  const [showEmergency, setShowEmergency] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    setLoadingReports(true);
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    
    // Real-time listener for "Real Function" experience
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() ?? new Date(),
        })) as Report[];
        setReports(data);
        setLoadingReports(false);
      },
      (error) => {
        console.error("Real-time listener error:", error);
        setLoadingReports(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const filteredReports = reports.filter((r) => {
    // 1. Status/Owner Filter
    if (filter === "my" && r.userId !== user?.uid) return false;
    if (filter !== "all" && filter !== "my" && r.status !== filter) return false;
    
    // 2. Category Filter
    const reportCategory = r.category || "stray";
    if (categoryFilter !== "all" && reportCategory !== categoryFilter) return false;
    
    return true;
  });

  // Pre-authentication check is handled inside useEffect, so we only block if total status is unknown
  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(45,30%,98%)] flex flex-col pt-20 px-6 gap-6">
          <Skeleton className="h-12 w-48 rounded-2xl" />
          <div className="flex gap-4 h-[600px]">
             <div className="flex-1 rounded-[3rem] overflow-hidden">
                <Skeleton className="w-full h-full" />
             </div>
             <div className="w-[380px] space-y-4 font-black">
                <ReportCardSkeleton />
                <ReportCardSkeleton />
                <ReportCardSkeleton />
             </div>
          </div>
      </div>
    );
  }

  // Once authenticated (even if profile still loading), show the skeleton/shell layout
  if (!user) return null;

  return (
    <div className="flex flex-col bg-[hsl(45,30%,98%)] overflow-hidden bg-paw-pattern" style={{ height: "100dvh" }}>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden gap-0">
        {/* Map Area — fills all available space */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 relative min-h-0 overflow-hidden rounded-none lg:rounded-[2rem] border-0 lg:border-4 border-white shadow-none lg:shadow-2xl"
        >
          <MapComponent
            reports={filteredReports}
            organizations={showEmergency ? EMERGENCY_CONTACTS : []}
            focusLocation={selectedReport ? [selectedReport.latitude, selectedReport.longitude] : null}
            onMapClick={(lat, lng) => {
              setClickedLocation({ lat, lng });
              setSelectedReport(null);
            }}
            onMarkerClick={(report) => {
              setSelectedReport(report);
              setClickedLocation(null);
            }}
            onOrgClick={(org) => {
              // Show quick detail or just toast
              console.log("Selected Org:", org.name);
            }}
          />

          {/* Map Hint Overlay — Universal and more prominent */}
          <div className="absolute top-4 left-4 right-4 sm:right-auto z-[400] pointer-events-none">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="glass px-4 py-3 rounded-[1.8rem] shadow-2xl border-white/60 flex items-center gap-3 w-fit mx-auto sm:mx-0"
            >
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-[hsl(15,80%,65%)]/20 rounded-xl animate-ping" />
                <div className="relative w-10 h-10 rounded-2xl bg-[hsl(15,80%,65%)] flex items-center justify-center shadow-lg shadow-[hsl(15,80%,65%)]/20">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Info size={18} className="text-white" />
                  </motion.div>
                </div>
              </div>
              <div className="flex flex-col pr-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(15,80%,65%)] mb-0.5">How to help</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-black text-[hsl(160,10%,20%)] tracking-tight">
                    Tap anywhere on map to report
                  </p>
                  <motion.span 
                    animate={{ opacity: [0, 1, 0], x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-lg"
                  >
                    📍
                  </motion.span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Mini stats — top right */}
          <motion.div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="glass rounded-[1.5rem] p-2.5 sm:p-4 shadow-2xl border-white/60 text-center min-w-[64px] sm:min-w-[80px] relative overflow-hidden group"
            >
              <p className="text-lg sm:text-2xl font-black text-[hsl(160,10%,20%)] leading-none">
                {reports.filter((r) => r.status === "pending").length}
              </p>
              <p className="text-[8px] sm:text-[9px] text-[hsl(15,80%,65%)] font-black uppercase tracking-widest mt-1 opacity-80">Pending</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="glass rounded-[1.5rem] p-2.5 sm:p-4 shadow-2xl border-white/60 text-center min-w-[64px] sm:min-w-[80px] relative overflow-hidden group"
            >
              <p className="text-lg sm:text-2xl font-black text-[hsl(160,10%,20%)] leading-none">
                {reports.filter((r) => r.status === "rescued").length}
              </p>
              <p className="text-[8px] sm:text-[9px] text-emerald-600 font-black uppercase tracking-widest mt-1 opacity-80">Rescued</p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Reports Side Panel — horizontal scrollable strip on mobile, sidebar on desktop */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full lg:w-[360px] xl:w-[400px] bg-white/70 backdrop-blur-xl rounded-t-[2rem] lg:rounded-[2.5rem] border-t border-white/60 lg:border shadow-xl flex flex-col overflow-hidden h-[44vh] sm:h-[38vh] lg:h-full lg:min-h-0 flex-shrink-0"
        >
          {/* Panel Header */}
          <div className="p-4 sm:p-6 pb-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-xl sm:text-2xl font-black text-[hsl(160,10%,20%)]">Reports</h2>
              <div className="w-8 h-8 rounded-xl bg-[hsl(155,15%,90%)] flex items-center justify-center">
                <Search size={14} className="text-[hsl(155,15%,50%)]" />
              </div>
            </div>
            
            {/* Filter tabs — compact on mobile */}
            <div className="space-y-3">
              <div className="flex p-1 bg-[hsl(155,15%,95%)] rounded-[1rem] gap-0.5">
                {(["all", "my", "pending", "rescued"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`flex-1 py-1.5 sm:py-2 rounded-[0.7rem] text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
                      filter === f
                        ? "bg-white text-[hsl(160,10%,20%)] shadow-sm"
                        : "text-[hsl(155,15%,50%)] hover:text-[hsl(160,10%,20%)]"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Category Filter — NEW */}
              <div className="flex p-1 bg-[hsl(155,15%,95%)] rounded-[1rem] gap-0.5">
                {(["all", "stray", "lost"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`flex-1 py-1.5 sm:py-2 rounded-[0.7rem] text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
                      categoryFilter === cat
                        ? "bg-[hsl(15,80%,65%)] text-white shadow-sm"
                        : "text-[hsl(155,15%,50%)] hover:text-[hsl(160,10%,20%)]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Emergency Toggle — NEW */}
              <button
                onClick={() => setShowEmergency(!showEmergency)}
                className={`w-full py-3 rounded-2xl flex items-center justify-center gap-2 border-2 transition-all ${
                  showEmergency 
                    ? "bg-pink-50 border-pink-200 text-pink-600" 
                    : "bg-white border-[hsl(155,15%,95%)] text-[hsl(155,15%,50%)]"
                }`}
              >
                <Stethoscope size={14} className={showEmergency ? "animate-pulse" : ""} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {showEmergency ? "Emergency Overlay: ON" : "Show Emergency Vets"}
                </span>
              </button>
            </div>
          </div>

          {/* Reports List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 bg-paw-pattern">
            {loadingReports ? (
              <div className="space-y-4">
                <ReportCardSkeleton />
                <ReportCardSkeleton />
                <ReportCardSkeleton />
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-10">
                <motion.div 
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl border-4 border-white"
                >
                  <span className="text-5xl">🐶</span>
                </motion.div>
                <p className="text-[hsl(160,10%,20%)] font-black text-lg">All Paws are safe!</p>
                <p className="text-sm text-[hsl(155,15%,50%)] mt-2 font-medium max-w-[200px]">No rescue reports found here. You're doing a great job!</p>
              </div>
            ) : (
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={{
                    visible: { transition: { staggerChildren: 0.1 } }
                }}
                className="space-y-4"
              >
                {filteredReports.map((report) => (
                  <motion.button
                    variants={{
                        hidden: { opacity: 0, x: -10 },
                        visible: { opacity: 1, x: 0 }
                    }}
                    onClick={() => setSelectedReport(report)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full text-left p-5 bg-white/80 hover:bg-white rounded-[2rem] border border-white shadow-sm hover:shadow-xl group relative transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-start gap-5">
                      <div className="w-16 h-16 bg-[hsl(155,15%,95%)] rounded-[1.5rem] flex items-center justify-center text-4xl group-hover:scale-110 transition-all shadow-inner relative overflow-hidden">
                        {ANIMAL_EMOJI[report.animalType]}
                        <div className="absolute bottom-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <ShieldCheck size={12} className="text-[hsl(15,80%,65%)]" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-[hsl(160,10%,20%)] capitalize text-sm">
                            {report.animalType}
                          </span>
                          {report.teamId && (
                            <span className="text-xs" title="Squad Member">
                               {TEAM_EMOJI[report.teamId]}
                            </span>
                          )}
                          <span
                            className={`text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border ${CONDITION_COLOR[report.condition]}`}
                          >
                            {report.condition}
                          </span>
                        </div>
                        <p className="text-[10px] text-[hsl(15,80%,65%)] font-black italic mb-1 line-clamp-1 flex items-center gap-1">
                           <MapPin size={10} />
                           {report.address || "Finding location..."}
                        </p>
                        <p className="text-xs text-[hsl(155,15%,50%)] font-medium line-clamp-1 mb-2">{report.description}</p>
                        
                        <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${report.status === 'rescued' ? 'bg-emerald-500' : 'bg-[hsl(15,80%,65%)] animate-pulse'}`} />
                           <span className={`text-[10px] font-black uppercase tracking-tighter ${report.status === 'rescued' ? 'text-emerald-600' : 'text-[hsl(15,80%,65%)]'}`}>
                                {report.status === 'rescued' ? 'Successfully Rescued' : 'Waiting for help'}
                           </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar Decor */}
                    <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-[hsl(15,80%,65%)]/10 to-transparent w-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>
          
          {/* Sidebar Footer */}
          <div className="p-6 bg-white/50 border-t border-[hsl(155,15%,92%)] flex flex-col items-center gap-3">
             <div className="dev-badge w-full justify-center scale-90">
                <ShieldCheck size={12} className="text-[hsl(15,80%,65%)] mr-1.5" />
                <span className="text-[9px] font-black uppercase tracking-[0.1em] text-[hsl(160,10%,20%)]">Dionimar Flores Solo Developer</span>
                <div className="ml-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
             </div>
             <div className="flex items-center gap-2 opacity-30">
                <PawPrint size={12} className="text-[hsl(155,15%,50%)]" />
                <span className="text-[8px] font-black uppercase tracking-widest text-[hsl(155,15%,50%)]">Verified Mission Platform</span>
             </div>
          </div>
        </motion.div>
      </div>

      {/* Modals with AnimatePresence */}
      <AnimatePresence>
        {clickedLocation && (
          <ReportForm
            lat={clickedLocation.lat}
            lng={clickedLocation.lng}
            onClose={() => setClickedLocation(null)}
            onSuccess={() => {
              setClickedLocation(null);
            }}
          />
        )}

        {selectedReport && (
          <ReportDetail
            report={selectedReport}
            onClose={() => setSelectedReport(null)}
            onUpdate={() => {
              setSelectedReport(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
