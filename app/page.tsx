"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, MapPin, ShieldCheck, ArrowRight, PawPrint } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { LoadingDog } from "@/components/LoadingDog";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(45,30%,98%)] flex flex-col items-center justify-center p-6 text-center">
        <LoadingDog />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(45,30%,98%)] text-[hsl(160,10%,20%)] selection:bg-[hsl(15,80%,65%)] selection:text-white relative overflow-x-hidden">
      <BackgroundDecoration />
      
      {/* Premium Floating Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 pt-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between glass px-8 py-4 rounded-[2rem] border border-white/60 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)]">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-[hsl(15,80%,65%)] rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
              <PawPrint className="text-white w-7 h-7" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-2xl font-black tracking-tight leading-none group-hover:text-[hsl(15,80%,65%)] transition-colors">RescuePaws</span>
              <div className="dev-badge mt-1 scale-75 origin-left">
                <ShieldCheck size={10} className="text-[hsl(15,80%,65%)] mr-1" />
                <span className="text-[8px] font-black uppercase tracking-[0.1em] text-[hsl(160,10%,20%)]">Verified Production App</span>
              </div>
            </div>
          </Link>
          
          <div className="flex items-center gap-6">
            {user ? (
              <Link
                href="/map"
                className="bg-[hsl(160,10%,20%)] hover:bg-[hsl(155,15%,40%)] text-white font-black px-8 py-3.5 rounded-2xl transition-all shadow-xl hover:shadow-black/20 hover:-translate-y-1 flex items-center gap-3 text-sm"
              >
                Launch Map <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link href="/login" className="font-black text-sm text-[hsl(155,15%,45%)] hover:text-[hsl(160,10%,20%)] transition-colors hidden sm:block">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-[hsl(15,80%,65%)] hover:bg-[hsl(15,75%,55%)] text-white font-black px-8 py-3.5 rounded-2xl transition-all shadow-[0_20px_40px_-10px_rgba(239,139,97,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(239,139,97,0.4)] hover:-translate-y-1 text-sm"
                >
                  Join Mission
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section - Bespoke Layout */}
      <section className="pt-48 pb-20 px-6 max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
            }}
          >
            <motion.div
              variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
              className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-[hsl(15,80%,65%)]/20 shadow-xl text-[hsl(15,80%,65%)] text-[10px] font-black uppercase tracking-[0.2em] mb-10"
            >
              <Heart size={14} className="fill-[hsl(15,80%,65%)] animate-pulse" /> 
              Protecting Every Paw in the PH
              <div className="w-1.5 h-1.5 rounded-full bg-[hsl(15,80%,65%)] animate-ping" />
            </motion.div>
            
            <motion.h1
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
              className="font-display text-8xl lg:text-[120px] font-black leading-[0.8] text-[hsl(160,10%,20%)] mb-10 tracking-tighter"
            >
              Saving <br/>
              <span className="text-[hsl(15,80%,65%)] relative inline-block">
                Lives
                <svg className="absolute -bottom-4 left-0 w-full h-6 text-[hsl(15,80%,65%)]/20" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M0,10 Q50,20 100,10" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                </svg>
              </span> <br/>
              Locally.
            </motion.h1>
            
            <motion.p
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="text-xl lg:text-2xl text-[hsl(155,15%,40%)] font-bold italic leading-tight mb-14 max-w-lg"
            >
              The most intuitive real-time map for Philippines&apos; stray animals. Report, track, and coordinate rescues—instantly.
            </motion.p>
 
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <Link
                href={user ? "/map" : "/register"}
                className="bg-[hsl(160,10%,20%)] hover:bg-[hsl(155,15%,35%)] text-white font-black px-12 py-7 rounded-[2.5rem] transition-all shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] hover:-translate-y-2 flex items-center justify-center gap-5 text-2xl group w-fit"
              >
                {user ? "Back to Rescue Map" : "Start Your Mission"} 
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-[hsl(160,10%,20%)] transition-all">
                  <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>

            <motion.div
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
              className="mt-16 flex items-center gap-8"
            >
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-2xl border-4 border-[hsl(45,30%,98%)] bg-white shadow-lg relative overflow-hidden ring-1 ring-black/5 hover:scale-110 hover:z-10 transition-transform">
                    <div className="w-full h-full bg-[hsl(155,15%,92%)] flex items-center justify-center italic text-[hsl(155,15%,60%)] font-black text-xs">U{i}</div>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-base font-black text-[hsl(160,10%,20%)] flex items-center gap-2">
                  Join 1,200+ <Heart size={16} className="text-[hsl(15,80%,65%)] fill-[hsl(15,80%,65%)]" />
                </p>
                <p className="text-[9px] font-black uppercase tracking-widest text-[hsl(155,15%,50%)]">Philippine Rescuer Network</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Premium Map Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10 p-4 bg-white/40 backdrop-blur-xl rounded-[4.5rem] border border-white/60 shadow-[0_60px_120px_-30px_rgba(0,0,0,0.15)] ring-1 ring-white/80">
              <div className="aspect-[4/5] bg-[hsl(155,15%,95%)] rounded-[3.5rem] overflow-hidden relative">
                 <Image 
                   src="/assets/map-preview-v2.png"
                   alt="Rescue Map Portal"
                   fill
                   className="object-cover transition-transform duration-[3000ms] hover:scale-105"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent flex flex-col justify-end p-12">
                   <div className="glass p-6 rounded-[2.5rem] border-white/60 flex items-center gap-6 shadow-2xl animate-bounce-slow">
                      <div className="w-16 h-16 bg-[hsl(15,80%,65%)] rounded-2xl flex items-center justify-center shadow-xl">
                        <Dog size={32} className="text-white" />
                      </div>
                      <div>
                        <p className="font-black text-xl text-[hsl(160,10%,20%)] italic">New Report Nearby!</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(15,80%,65%)] animate-pulse mt-1">Satellite Verified Location</p>
                      </div>
                   </div>
                 </div>
              </div>
            </div>
            {/* Background elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[hsl(15,80%,65%)]/10 rounded-full blur-[60px] -z-10" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[hsl(155,15%,50%)]/10 rounded-full blur-[60px] -z-10" />
          </motion.div>
        </div>
      </section>

      {/* Global Mission Progress Row */}
      <section className="px-6 max-w-7xl mx-auto -mt-10 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[hsl(160,10%,20%)] rounded-[3rem] p-8 lg:p-12 text-white relative overflow-hidden shadow-2xl border border-white/5"
        >
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-md">
              <div className="flex items-center gap-2 text-[hsl(15,80%,65%)] font-black uppercase tracking-[0.4em] text-[10px] mb-4">
                <Target size={14} /> National Rescue Mission
              </div>
              <h2 className="font-display text-4xl font-black italic mb-4">5,000 Paws Saved.</h2>
              <p className="text-white/40 text-sm font-bold leading-relaxed">Join the movement to rescue and secure 5,000 stray animals across the Philippines by 2026.</p>
            </div>
            
            <div className="flex-1 w-full max-w-xl space-y-4">
              <div className="flex justify-between items-end mb-2">
                 <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black italic">1,245</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Rescued Today</span>
                 </div>
                 <p className="text-[10px] font-black text-[hsl(15,80%,65%)] uppercase tracking-[0.3em] animate-pulse">24.9% Completed</p>
              </div>
              <div className="h-4 bg-white/10 rounded-full p-1 shadow-inner">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: "24.9%" }}
                   className="h-full bg-gradient-to-r from-emerald-500 to-[hsl(15,80%,65%)] rounded-full relative overflow-hidden"
                 >
                    <motion.div 
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    />
                 </motion.div>
              </div>
            </div>
          </div>
          <PawPrint className="absolute -right-20 -top-10 w-64 h-64 text-white/[0.03] -rotate-12 pointer-events-none" />
        </motion.div>
      </section>

      {/* Modern Features Grid */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-[hsl(15,80%,65%)] font-black uppercase tracking-[0.3em] text-[10px] mb-6">
              <Sparkles size={14} /> Our Core Intelligence
            </div>
            <h2 className="font-display text-6xl font-black leading-tight tracking-tighter">Tools to Save <br/> Every Animal.</h2>
          </div>
          <p className="max-w-xs text-[hsl(155,15%,45%)] font-bold text-sm leading-relaxed mb-2 opacity-80 italic">
            Built from the ground up for speed, accuracy, and reliability in critical rescue situations.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-10">
          {[
            { icon: <MapPin size={36} />, title: "Precision Mapping", desc: "Instantly report strays with pinpoint GPS accuracy. Every animal matters, every location is a mission." },
            { icon: <ShieldCheck size={36} />, title: "Trusted Platform", desc: "Verified community reports ensure coordination is fast, safe, and focused on the animals' wellbeing." },
            { icon: <Heart size={36} />, title: "Rescue Coordination", desc: "Track rescued animals from danger to recovery. Connecting local heroes with the mission at hand." },
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -15 }}
              className="group p-12 rounded-[3.5rem] bg-white hover:bg-[hsl(160,10%,20%)] transition-all duration-500 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)]"
            >
              <div className="w-20 h-20 bg-[hsl(15,80%,65%)]/10 text-[hsl(15,80%,65%)] rounded-[2rem] flex items-center justify-center mb-10 group-hover:bg-white/10 group-hover:text-white transition-all duration-500">
                {feature.icon}
              </div>
              <h3 className="font-display text-3xl font-black mb-6 group-hover:text-white transition-colors">{feature.title}</h3>
              <p className="text-[hsl(155,15%,45%)] font-bold leading-relaxed mb-2 group-hover:text-white/60 transition-colors italic">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer System */}
      <footer className="py-24 border-t border-white shadow-[0_-20px_60px_rgba(0,0,0,0.02)] bg-white/40 backdrop-blur-xl relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 relative z-10">
          <div className="space-y-10">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 bg-[hsl(160,10%,20%)] rounded-[2rem] flex items-center justify-center shadow-xl">
                  <PawPrint className="text-white w-8 h-8" />
               </div>
               <div className="flex flex-col">
                  <span className="font-display text-3xl font-black tracking-tighter">RescuePaws</span>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[hsl(15,80%,65%)]">Saving Lives 24/7</p>
               </div>
            </div>
            <p className="text-[hsl(155,15%,40%)] font-bold max-w-sm text-lg leading-tight italic">
              Empowering the rescue community across the Philippines through state-of-the-art coordination tools.
            </p>
          </div>

          <div className="flex flex-col md:items-end justify-center gap-10">
             <div className="dev-badge px-6 py-3 scale-110">
                <ShieldCheck size={16} className="text-[hsl(15,80%,65%)] mr-3" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[hsl(160,10%,20%)]">Dionimar Flores Solo Developer</span>
                <div className="ml-4 w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
             </div>
             
             <div className="text-left md:text-right">
                <p className="text-xs font-black uppercase tracking-[0.5em] text-[hsl(155,15%,60%)] mb-2">Developed with ❤️ and Pride</p>
                <p className="text-[10px] font-black text-[hsl(155,15%,70%)] opacity-60 uppercase tracking-widest italic">
                  © 2026 Rescuing Everywhere • ACC SAC UA • Antique PH
                </p>
             </div>
          </div>
        </div>
        
        {/* Subtle decorative text background */}
        <div className="absolute -bottom-20 -left-10 text-[200px] font-black text-black/[0.02] tracking-tighter pointer-events-none select-none">
          RESCUE
        </div>
      </footer>
    </div>
  );
}
