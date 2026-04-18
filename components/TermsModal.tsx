"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, ScrollText, CheckCircle2 } from "lucide-react";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-all"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-2xl max-h-[85vh] bg-white rounded-[2.5rem] shadow-2xl z-[101] overflow-hidden flex flex-col border border-white/50"
          >
            {/* Header */}
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[hsl(155,15%,98%)] to-white">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[hsl(155,15%,50%)]/10 rounded-2xl">
                  <ScrollText className="text-[hsl(155,15%,50%)]" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[hsl(160,10%,20%)] tracking-tight">Terms & Conditions</h2>
                  <p className="text-sm font-medium text-[hsl(155,15%,50%)]">Last updated: April 2024</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-3 text-[hsl(155,15%,50%)]">
                  <Shield size={18} />
                  <h3 className="font-bold uppercase tracking-wider text-xs">Community Safety</h3>
                </div>
                <p className="text-[hsl(160,10%,30%)] leading-relaxed font-medium">
                  RescuePaws is a platform dedicated to the safety and rescue of stray animals. By joining, you agree to provide truthful and accurate information when reporting animal locations. Any form of harassment, misinformation, or misuse of the platform will result in immediate account termination.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3 text-[hsl(155,15%,50%)]">
                  <CheckCircle2 size={18} />
                  <h3 className="font-bold uppercase tracking-wider text-xs">User Accountability</h3>
                </div>
                <ul className="space-y-3">
                  {[
                    "You are responsible for the content you post, including images and descriptions.",
                    "Reports must be based on real-time observations to ensure rescuer efficiency.",
                    "Privacy of other users must be respected; do not share personal data found on the platform.",
                    "Always prioritize your safety and the animal's safety when capturing photos."
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm text-[hsl(160,10%,35%)] font-medium">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[hsl(155,15%,50%)] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3 text-[hsl(155,15%,50%)]">
                  <ScrollText size={18} />
                  <h3 className="font-bold uppercase tracking-wider text-xs">Privacy & Data</h3>
                </div>
                <p className="text-[hsl(160,10%,35%)] text-sm leading-relaxed font-medium">
                  We collect your location data solely for the purpose of mapping rescues. Your phone number is only shared with verified rescuers when you initiate a contact or explicitly mark a report as "urgent." For more details, please see our Privacy Policy.
                </p>
              </section>
              
              <div className="p-6 bg-[hsl(155,15%,98%)] rounded-3xl border border-[hsl(155,15%,95%)]">
                <p className="text-xs text-[hsl(155,15%,50%)] italic text-center leading-relaxed">
                  "By clicking 'I Agree' during registration, you confirm that you have read and accepted these terms. Collectively, we can make the world a better place for our furry friends."
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-gray-100 bg-white">
              <button
                onClick={onClose}
                className="w-full bg-[hsl(155,15%,50%)] hover:bg-[hsl(155,15%,40%)] text-white font-black py-4 rounded-2xl shadow-xl shadow-[hsl(155,15%,50%)]/20 transition-all active:scale-[0.98]"
              >
                Got it, let's go!
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
