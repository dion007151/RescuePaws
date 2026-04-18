"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, MoreVertical, PawPrint, ArrowUpRight } from "lucide-react";

export default function InAppBrowserWarning() {
  const [isInApp, setIsInApp] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    
    // Comprehensive detection for FB, Messenger, FB Lite, Instagram, and other common in-app browsers
    const isFacebook = /FBAN|FBAV/i.test(ua);
    const isMessenger = /Messenger/i.test(ua);
    const isInstagram = /Instagram/i.test(ua);
    const isFBLite = /FBLC|FB_IAB/i.test(ua);
    
    // Also check for generic WebViews which often have similar restrictions
    const isWebView = /wv|Webview/i.test(ua) && !/Chrome/i.test(ua);

    if (isFacebook || isMessenger || isInstagram || isFBLite || isWebView) {
      // Small delay to ensure the user sees the initial load first
      const timer = setTimeout(() => setIsInApp(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isInApp) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] bg-[hsl(15,30%,98%)]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
      >
        {/* Animated pointer to the menu button (usually top right in FB/Messenger) */}
        <motion.div
          animate={{ x: [0, 10, 0], y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="absolute top-6 right-6 text-[hsl(15,80%,65%)] hidden sm:block"
        >
          <div className="flex flex-col items-end gap-2">
            <ArrowUpRight size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest bg-[hsl(15,80%,65%)] text-white px-3 py-1 rounded-full shadow-lg">
              Tap the menu here
            </p>
          </div>
        </motion.div>

        <div className="max-w-xs w-full">
          {/* App Brand */}
          <div className="w-20 h-20 bg-gradient-to-br from-[hsl(15,80%,65%)] to-[hsl(15,80%,55%)] rounded-[2rem] flex items-center justify-center shadow-2xl shadow-[hsl(15,80%,65%)]/30 mx-auto mb-8 relative">
             <PawPrint size={40} className="text-white" />
             <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                <ExternalLink size={16} className="text-[hsl(15,80%,65%)]" />
             </div>
          </div>

          <h2 className="text-2xl font-black text-[hsl(160,10%,20%)] mb-4 leading-tight">
            Restricted Browser Detected
          </h2>
          
          <p className="text-sm text-[hsl(155,15%,40%)] font-medium mb-10 leading-relaxed">
            Messenger and Facebook Lite block app downloads. To install **RescuePaws**, you need to open this in your full browser.
          </p>

          <div className="bg-white rounded-3xl p-6 shadow-xl border border-white space-y-6 text-left relative overflow-hidden">
            {/* Steps */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[hsl(15,80%,65%)] font-black text-xs flex-shrink-0">
                1
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-black text-[hsl(160,10%,25%)] uppercase tracking-wider mb-1">Step One</p>
                <p className="text-sm text-[hsl(155,15%,45%)] font-medium">
                  Tap the <span className="inline-flex items-center translate-y-1"><MoreVertical size={16} className="text-black" /></span> or <span className="font-bold">three dots (⋮)</span> at the top right.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[hsl(15,80%,65%)] font-black text-xs flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-black text-[hsl(160,10%,25%)] uppercase tracking-wider mb-1">Step Two</p>
                <p className="text-sm text-[hsl(155,15%,45%)] font-medium">
                  Select <span className="font-black text-[hsl(15,80%,65%)] text-base">"Open in Browser"</span> or <span className="font-black text-[hsl(15,80%,65%)] text-base">"Open in Chrome"</span>.
                </p>
              </div>
            </div>

            {/* Hint bar */}
            <div className="pt-4 border-t border-orange-50 mt-2">
               <p className="text-[10px] text-[hsl(15,80%,65%)] font-black text-center uppercase tracking-[0.2em]">
                 Every Paw Matters 🐾
               </p>
            </div>
          </div>

          <button 
            onClick={() => setIsInApp(false)}
            className="mt-8 text-[11px] font-black text-[hsl(155,15%,60%)] uppercase tracking-[0.2em] hover:text-[hsl(15,80%,65%)] transition-colors"
          >
            Stay in Restricted Mode
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
