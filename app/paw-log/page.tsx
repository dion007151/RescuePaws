"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SuccessStory } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Calendar, Heart, Shield, Users, Camera, MessageSquare, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";

export default function PawLogPage() {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "success_stories"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as SuccessStory[];
      setStories(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(45,30%,98%)] p-6 lg:p-12 relative overflow-x-hidden">
      <div className="fixed inset-0 bg-paw-pattern opacity-[0.03] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* Header */}
        <header className="text-center space-y-4 max-w-2xl mx-auto">
           <motion.div 
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             className="w-16 h-16 bg-emerald-100 rounded-[2rem] flex items-center justify-center text-emerald-600 mx-auto shadow-xl"
           >
              <Sparkles size={32} />
           </motion.div>
           <motion.h1 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="font-display text-5xl lg:text-7xl font-black text-[hsl(160,10%,20%)] tracking-tighter italic"
           >
             The Paw <span className="text-emerald-500 not-italic">Log.</span>
           </motion.h1>
           <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="text-xs font-black uppercase tracking-[0.4em] text-[hsl(155,15%,50%)]"
           >
             Celebrating every life secured on the grid
           </motion.p>
        </header>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3].map(i => (
              <div key={i} className="glass h-[500px] rounded-[4rem] animate-pulse" />
            ))}
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-20 glass rounded-[4rem] border-white/60">
             <Camera size={64} className="mx-auto text-[hsl(155,15%,90%)] mb-6" />
             <p className="text-xl font-black text-[hsl(160,10%,20%)] mb-2">The Log is waiting for your story.</p>
             <p className="text-sm font-medium text-[hsl(155,15%,50%)]">Rescue an animal and broadcast the success!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
             <AnimatePresence>
               {stories.map((story, i) => (
                 <motion.div
                   key={story.id}
                   initial={{ opacity: 0, y: 30 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: i * 0.1 }}
                   className="glass rounded-[3.5rem] overflow-hidden border-white/60 shadow-xl flex flex-col hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group"
                 >
                    {/* Before/After Visual comparison */}
                    <div className="relative h-64 overflow-hidden flex bg-[hsl(155,15%,90%)]">
                       <div className="flex-1 overflow-hidden relative border-r-2 border-white/40">
                          <img src={story.beforeImageUrl} alt="Before" className="w-full h-full object-cover grayscale brightness-75 transition-all duration-700 group-hover:grayscale-0 group-hover:brightness-100" />
                          <div className="absolute top-4 left-4 glass px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-red-500 border-red-200">Before</div>
                       </div>
                       <div className="flex-1 overflow-hidden relative">
                          <img src={story.afterImageUrl} alt="After" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                          <div className="absolute top-4 left-4 glass px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-emerald-500 border-emerald-200">After</div>
                       </div>
                       <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    </div>

                    <div className="p-8 space-y-6 flex-1 flex flex-col">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                                <Heart size={14} fill="currentColor" />
                             </div>
                             <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Mission Success</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[hsl(155,15%,60%)]">
                             <Calendar size={12} />
                             <span className="text-[9px] font-black uppercase tracking-widest leading-none mt-0.5">
                                {story.createdAt.toLocaleDateString()}
                             </span>
                          </div>
                       </div>

                       <div className="flex-1">
                          <h3 className="font-display text-2xl font-black text-[hsl(160,10%,20%)] leading-tight mb-4">
                             {story.story.split('.')[0]}.
                          </h3>
                          <div className="bg-[hsl(155,15%,95%)] p-5 rounded-[2rem] relative italic text-xs font-medium text-[hsl(160,10%,20%)] leading-relaxed">
                             "{story.story}"
                             <div className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px] font-black not-italic shadow-lg border-2 border-white flex-shrink-0">"</div>
                          </div>
                       </div>

                       <div className="pt-6 border-t border-[hsl(155,15%,90%)] flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-[hsl(160,10%,20%)] flex items-center justify-center text-white shadow-lg">
                                <Users size={18} />
                             </div>
                             <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(155,15%,50%)]">Rescued By</p>
                                <p className="text-xs font-black text-[hsl(160,10%,20%)]">{story.rescuerName}</p>
                             </div>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-white border border-[hsl(155,15%,90%)] flex items-center justify-center text-[hsl(155,15%,40%)] group-hover:bg-emerald-500 group-hover:text-white transition-all cursor-pointer shadow-sm group-hover:shadow-emerald-200">
                             <ArrowRight size={18} />
                          </div>
                       </div>
                    </div>
                 </motion.div>
               ))}
             </AnimatePresence>
          </div>
        )}

        {/* Global Stats Footer */}
        {stories.length > 0 && (
           <footer className="pt-10 pb-32 text-center">
              <div className="inline-flex items-center gap-4 px-8 py-4 rounded-[2rem] glass border-white/60 shadow-xl">
                 <Sparkles className="text-emerald-500" size={20} />
                 <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(160,10%,20%)]">
                    Total Success Stories: <span className="text-emerald-600 tabular-nums">{stories.length}</span>
                 </p>
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
           </footer>
        )}

      </div>
    </div>
  );
}
