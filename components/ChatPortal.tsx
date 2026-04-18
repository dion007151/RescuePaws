"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/lib/AuthContext";
import { ChatMessage, Report } from "@/lib/types";
import { Send, X, MessageSquare, Shield, Clock, User, Ghost, Loader2, Sparkles, AlertTriangle } from "lucide-react";

interface ChatPortalProps {
  report: Report;
  onClose: () => void;
}

export default function ChatPortal({ report, onClose }: ChatPortalProps) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!report.id) return;

    const q = query(
      collection(db, "messages"),
      where("reportId", "==", report.id),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as ChatMessage[];
      setMessages(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [report.id]);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    const text = newMessage.trim();
    setNewMessage("");

    try {
      await addDoc(collection(db, "messages"), {
        reportId: report.id,
        senderId: user.uid,
        senderName: profile?.fullName || "Field Agent",
        text: text,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      // Return the text so user doesn't lose it on failure
      setNewMessage(text);
    }
  }

  const ANIMAL_EMOJI: Record<string, string> = { dog: "🐶", cat: "🐱", other: "🐾" };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white lg:bg-white/80 lg:backdrop-blur-2xl shadow-[-20px_0_60px_rgba(0,0,0,0.1)] z-[1100] border-l border-white/60 flex flex-col"
    >
      {/* Tactical Header */}
      <div className="p-6 border-b border-[hsl(155,15%,90%)] bg-[hsl(160,10%,20%)] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[hsl(15,80%,65%)]/10 rounded-bl-[100px] pointer-events-none" />
        
        <div className="flex items-center justify-between mb-4 relative z-10">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg shadow-inner">
                 {ANIMAL_EMOJI[report.animalType]}
              </div>
              <div>
                 <h2 className="text-sm font-black uppercase tracking-widest text-[hsl(15,80%,65%)]">Mission Comms</h2>
                 <p className="text-xs font-medium opacity-60">ID: #{report.id.slice(0,8)}</p>
              </div>
           </div>
           <button 
             onClick={onClose}
             className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 transition-all"
           >
              <X size={20} />
           </button>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 relative z-10">
           <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
             {report.imageUrl ? (
               <img src={report.imageUrl} className="w-full h-full object-cover" alt="Animal" />
             ) : (
               <div className="w-full h-full bg-white/10 flex items-center justify-center text-sm grayscale opacity-50">
                  {ANIMAL_EMOJI[report.animalType]}
               </div>
             )}
           </div>
           <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Active Subject</p>
              <p className="text-xs font-bold truncate capitalize">{report.animalType} ({report.condition})</p>
           </div>
        </div>
      </div>

      {/* Message Thread */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar bg-[hsl(45,30%,98%)]"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-[hsl(155,15%,80%)]">
             <Loader2 className="animate-spin" />
             <p className="text-[10px] font-black uppercase tracking-widest">Encrypting Channel...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-10">
             <div className="w-16 h-16 rounded-[2rem] bg-white flex items-center justify-center text-[hsl(155,15%,85%)] shadow-sm">
                <MessageSquare size={32} />
             </div>
             <p className="text-sm font-black text-[hsl(160,10%,20%)]">No Tactical Data Yet.</p>
             <p className="text-xs font-medium text-[hsl(155,15%,50%)] leading-relaxed">
               Start coordinating the extraction or share critical updates about the subject.
             </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.senderId === user?.uid;
            const showName = i === 0 || messages[i-1].senderId !== msg.senderId;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                {showName && (
                  <p className="text-[9px] font-black uppercase tracking-widest text-[hsl(155,15%,50%)] mb-2 px-1">
                    {msg.senderName} {isMe && "(You)"}
                  </p>
                )}
                <div className={`max-w-[85%] px-5 py-4 rounded-[1.8rem] shadow-sm relative group ${
                  isMe 
                    ? 'bg-[hsl(160,10%,20%)] text-white rounded-tr-none' 
                    : 'bg-white text-[hsl(160,10%,20%)] rounded-tl-none border border-[hsl(155,15%,95%)]'
                }`}>
                   <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                   <div className={`absolute bottom-1 ${isMe ? 'right-full mr-2' : 'left-full ml-2'} opacity-0 group-hover:opacity-40 transition-opacity whitespace-nowrap`}>
                      <p className="text-[7px] font-black uppercase tracking-widest text-[hsl(160,10%,20%)]">
                         {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                   </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-[hsl(155,15%,90%)]">
        <form onSubmit={handleSendMessage} className="relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type tactical update..."
            className="w-full bg-[hsl(155,15%,97%)] rounded-[2rem] pl-6 pr-14 py-5 text-sm font-medium border-0 focus:ring-2 focus:ring-[hsl(160,10%,20%)]/5 transition-all"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="absolute right-2 top-2 bottom-2 w-12 rounded-2xl bg-[hsl(160,10%,20%)] text-white flex items-center justify-center shadow-lg shadow-black/10 hover:bg-[hsl(15,80%,65%)] transition-all disabled:opacity-20 disabled:hover:bg-[hsl(160,10%,20%)]"
          >
            <Send size={18} />
          </button>
        </form>
        <div className="mt-4 flex items-center justify-center gap-2 opacity-20 pointer-events-none">
           <Shield size={10} />
           <span className="text-[8px] font-black uppercase tracking-widest leading-none">Encrypted Channel</span>
        </div>
      </div>
    </motion.div>
  );
}
