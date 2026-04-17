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
import { PawPrint, LogOut, Filter, Info, Search, Heart, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";

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

import { Skeleton, ReportCardSkeleton } from "@/components/Skeleton";

export default function MapPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [clickedLocation, setClickedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loadingReports, setLoadingReports] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "rescued" | "my">("all");

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
    if (filter === "my") return r.userId === user?.uid;
    if (filter === "all") return true;
    return r.status === filter;
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
    <div className="h-screen flex flex-col bg-[hsl(45,30%,98%)] overflow-hidden bg-paw-pattern">

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden gap-0">
        {/* Map Area */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white"
        >
          <MapComponent
            reports={filteredReports}
            onMapClick={(lat, lng) => {
              setClickedLocation({ lat, lng });
              setSelectedReport(null);
            }}
            onMarkerClick={(report) => {
              setSelectedReport(report);
              setClickedLocation(null);
            }}
          />

          {/* Map Overlays (Premium Modern Design) */}
          <div className="absolute top-4 left-4 z-[400] pointer-events-none">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white/80 backdrop-blur-md rounded-2xl px-4 py-2.5 shadow-xl border border-white/50 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-[hsl(155,15%,50%)]/10 flex items-center justify-center">
                <Info size={16} className="text-[hsl(155,15%,50%)]" />
              </div>
              <p className="text-xs font-bold text-[hsl(160,10%,20%)]">
                Click map to report an animal
              </p>
            </motion.div>
          </div>

          <motion.div className="absolute top-4 right-4 z-[400] flex flex-col gap-3">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-white/50 text-center min-w-[80px]"
            >
              <div className="flex items-center justify-center mb-1">
                <Loader2 className="animate-pulse text-[hsl(15,80%,65%)]" size={14} />
              </div>
              <p className="text-xl font-black text-[hsl(160,10%,20%)] leading-none">
                {reports.filter((r) => r.status === "pending").length}
              </p>
              <p className="text-[9px] text-[hsl(155,15%,50%)] font-black uppercase tracking-wider mt-1">Pending</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-white/50 text-center min-w-[80px]"
            >
              <div className="flex items-center justify-center mb-1 text-emerald-500">
                <Heart size={14} fill="currentColor" />
              </div>
              <p className="text-xl font-black text-[hsl(160,10%,20%)] leading-none">
                {reports.filter((r) => r.status === "rescued").length}
              </p>
              <p className="text-[9px] text-[hsl(155,15%,50%)] font-black uppercase tracking-wider mt-1 text-emerald-600">Rescued</p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Reports Side Panel */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-[380px] bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-xl flex flex-col overflow-hidden h-[400px] lg:h-full lg:min-h-0"
        >
          {/* Panel Header */}
          <div className="p-6 pb-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl font-black text-[hsl(160,10%,20%)]">Recent Reports</h2>
              <div className="w-8 h-8 rounded-xl bg-[hsl(155,15%,90%)] flex items-center justify-center">
                <Search size={16} className="text-[hsl(155,15%,50%)]" />
              </div>
            </div>
            
            <div className="flex p-1 bg-[hsl(155,15%,95%)] rounded-[1.2rem] gap-1">
              {(["all", "my", "pending", "rescued"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 py-2 rounded-[0.8rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === f
                      ? "bg-white text-[hsl(160,10%,20%)] shadow-sm"
                      : "text-[hsl(155,15%,50%)] hover:text-[hsl(160,10%,20%)]"
                  }`}
                >
                  {f}
                </button>
              ))}
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
                    className="w-full text-left p-4 bg-white hover:bg-[hsl(45,30%,98%)] rounded-3xl border border-[hsl(155,15%,95%)] transition-all shadow-sm hover:shadow-md group relative overflow-hidden"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-[hsl(155,15%,95%)] rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                        {ANIMAL_EMOJI[report.animalType]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-[hsl(160,10%,20%)] capitalize text-sm">
                            {report.animalType}
                          </span>
                          <span
                            className={`text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border ${CONDITION_COLOR[report.condition]}`}
                          >
                            {report.condition}
                          </span>
                        </div>
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
          <div className="p-6 bg-[hsl(155,15%,98%)] border-t border-[hsl(155,15%,90%)] flex items-center justify-between">
             <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span className="text-[10px] font-black text-[hsl(160,10%,20%)] uppercase tracking-widest">Official Rescue System</span>
             </div>
             <PawPrint size={16} className="text-[hsl(155,15%,90%)]" />
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
