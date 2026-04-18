"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, MapPin, ShieldCheck, ArrowRight, PawPrint } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { BackgroundDecoration } from "@/components/BackgroundDecoration";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(45,30%,98%)] flex flex-col items-center justify-center p-6 text-center space-y-8">
        <div className="relative">
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-32 h-32 rounded-[2.5rem] bg-[hsl(15,80%,65%)]/10 blur-2xl absolute inset-0"
          />
          <motion.div
            animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-[hsl(15,80%,65%)]"
          >
            <PawPrint className="text-[hsl(15,80%,65%)] w-16 h-16" />
          </motion.div>
        </div>
        <div className="space-y-4">
          <motion.div 
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-10 w-64 bg-[hsl(160,10%,20%)]/10 rounded-full mx-auto" 
          />
          <motion.div 
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            className="h-4 w-48 bg-[hsl(155,15%,50%)]/10 rounded-full mx-auto" 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(45,30%,98%)] text-[hsl(160,10%,20%)] selection:bg-[hsl(15,80%,65%)] selection:text-white bg-paw-pattern relative overflow-hidden">
      <BackgroundDecoration />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex items-center justify-between glass mx-auto mt-4 max-w-7xl rounded-full left-0 right-0 gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[hsl(15,80%,65%)] rounded-xl flex items-center justify-center shadow-sm">
            <PawPrint className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-2xl font-black tracking-tight leading-none">RescuePaws</span>
            <div className="dev-badge mt-1 scale-75 origin-left">
              <ShieldCheck size={10} className="text-[hsl(15,80%,65%)] mr-1" />
              <span className="text-[8px] font-black uppercase tracking-[0.1em] text-[hsl(160,10%,20%)]">Dionimar Flores Solo Developer</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Link
              href="/map"
              className="bg-[hsl(155,15%,50%)] hover:bg-[hsl(155,15%,40%)] text-white font-bold px-6 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              Open Map <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link href="/login" className="font-bold text-sm hover:text-[hsl(15,80%,65%)] transition">
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-[hsl(15,80%,65%)] hover:bg-[hsl(15,75%,55%)] text-white font-bold px-6 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg"
              >
                Join Now
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto relative z-10">

        <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15 }
              }
            }}
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white shadow-sm text-[hsl(155,20%,30%)] text-xs font-bold uppercase tracking-wider mb-8"
            >
              <Heart size={14} className="fill-[hsl(15,80%,65%)] text-[hsl(15,80%,65%)]" /> Community-Driven Rescue 
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" />
            </motion.div>
            
            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 30, scale: 0.95 },
                visible: { opacity: 1, y: 0, scale: 1 }
              }}
              className="font-display text-7xl lg:text-[100px] font-black leading-[0.85] text-[hsl(160,10%,20%)] mb-10 tracking-tighter"
            >
              Every <br/>
              <span className="text-[hsl(15,80%,65%)] relative inline-block">
                Paw
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="absolute bottom-4 left-0 h-4 bg-[hsl(15,80%,65%)]/10 -z-10"
                />
              </span> <br/>
              Matters.
            </motion.h1>
            
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              className="text-xl lg:text-2xl text-[hsl(155,15%,45%)] font-medium leading-relaxed mb-12 max-w-lg"
            >
              The state-of-the-art navigation system for stray animal rescue. Reporting, tracking, and saving lives—all in one place.
            </motion.p>
 
            <Link
              href={user ? "/map" : "/register"}
              className="bg-[hsl(160,10%,20%)] text-white font-black px-12 py-6 rounded-3xl transition-all shadow-[0_20px_40px_-5px_rgba(0,0,0,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] hover:-translate-y-1.5 flex items-center justify-center gap-4 text-xl group w-fit"
            >
              {user ? "Back to Rescue Map" : "Start Rescuing Today"} 
              <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-12 flex items-center gap-6"
            >
              <div className="flex -space-x-3">
                {['pinay-1.png', 'pinoy-1.png', 'pinay-2.png', 'pinoy-2.png'].map((img, i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[hsl(45,30%,98%)] bg-[hsl(155,15%,90%)] relative overflow-hidden">
                    <Image src={`/avatars/${img}`} alt={`Rescuer ${i + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-semibold text-[hsl(155,15%,50%)]">
                Joined by <span className="text-[hsl(160,10%,20%)]">500+</span> rescuers
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="relative"
          >
            <div className="aspect-[4/5] bg-[hsl(155,15%,90%)] rounded-[3rem] overflow-hidden shadow-2xl relative border-8 border-white">
               <Image 
                 src="https://api.mapbox.com/styles/v1/mapbox/light-v10/static/120.9842,14.5995,12,0/800x1000?access_token=pk.eyJ1IjoiZGlvbmlzaW9qciIsImEiOiJjbGo3amQzdmowM2RnM2RwN3M3eGpxZzdzIn0.A6v_x_O_X_A"
                 alt="Rescue Map Preview"
                 fill
                 priority
                 className="object-cover opacity-60"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-[hsl(155,15%,90%)] via-transparent to-transparent" />
               
               <motion.div
                 animate={{ y: [0, -10, 0] }}
                 transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                 className="absolute top-1/4 -left-6 bg-white p-4 rounded-3xl shadow-xl flex items-center gap-3"
               >
                 <div className="w-10 h-10 bg-[hsl(15,80%,65%)] rounded-xl flex items-center justify-center">
                    <span className="text-xl">🐶</span>
                 </div>
                 <div>
                    <p className="font-bold text-sm">Injured Dog</p>
                    <p className="text-[10px] uppercase font-black tracking-wider text-[hsl(15,80%,65%)]">Pending Help</p>
                 </div>
               </motion.div>

               <motion.div
                 animate={{ y: [0, 10, 0] }}
                 transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                 className="absolute bottom-1/4 -right-4 bg-white p-4 rounded-3xl shadow-xl flex items-center gap-3"
               >
                 <div className="w-10 h-10 bg-[hsl(155,15%,50%)] rounded-xl flex items-center justify-center">
                    <span className="text-xl">🐱</span>
                 </div>
                 <div>
                    <p className="font-bold text-sm">Healthy Cat</p>
                    <p className="text-[10px] uppercase font-black tracking-wider text-emerald-500 font-bold">Rescued!</p>
                 </div>
               </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl font-black mb-4">How it works</h2>
          <p className="text-[hsl(155,15%,50%)] font-medium">Simple steps to make a huge difference.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: <MapPin size={32} />, title: "Spot & Report", desc: "See an animal in need? Pin it on our live interactive map instantly." },
            { icon: <ShieldCheck size={32} />, title: "Verified Safety", desc: "Our community verifies reports to ensure help reaches where it is needed most." },
            { icon: <Heart size={32} />, title: "Rescue & Track", desc: "Local rescuers are notified. Track the animal's journey to safety." },
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="bg-white p-10 rounded-[2.5rem] border border-[hsl(155,15%,90%)] shadow-sm hover:shadow-xl transition-all"
            >
              <div className="w-16 h-16 bg-[hsl(155,15%,90%)] text-[hsl(155,20%,30%)] rounded-2xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="font-display text-2xl font-black mb-3">{feature.title}</h3>
              <p className="text-[hsl(155,15%,50%)] font-medium leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="py-16 border-t border-[hsl(155,15%,92%)] bg-white/30 backdrop-blur-sm relative overflow-hidden">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-6 relative z-10 font-bold">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-[hsl(15,80%,65%)] rounded-xl flex items-center justify-center">
                <PawPrint className="text-white" size={16} />
             </div>
             <span className="font-display text-xl font-black">RescuePaws</span>
          </div>
          
          <div className="dev-badge">
             <ShieldCheck size={14} className="text-[hsl(15,80%,65%)] mr-2" />
             <span className="text-[10px] font-black uppercase tracking-[0.1em]">Dionimar Flores Solo Developer</span>
             <div className="ml-2 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          </div>

          <p className="text-[10px] text-[hsl(155,15%,60%)] uppercase tracking-[0.3em] font-black text-center">
            Handcrafted with ❤️ & Purpose <br/>
            <span className="mt-2 block opacity-50 font-black">© 2026 Production Environment</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
