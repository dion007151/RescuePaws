"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, PawPrint, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already running as installed PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS (Safari doesn't fire beforeinstallprompt)
    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Check if the user has dismissed the banner before
    const dismissed = localStorage.getItem("pwa-banner-dismissed");
    if (dismissed) return;

    // Generic fallback for other browsers (Firefox, Opera, etc.)
    setTimeout(() => {
      setShowBanner((prev) => {
        // Only trigger if not already showing from native event or iOS
        if (prev) return prev;
        return true;
      });
    }, 6000); // Wait a bit longer for other browsers

    // Android/Chrome: listen for the native install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
      setInstallPrompt(null);
    }
  }

  function handleDismiss() {
    setShowBanner(false);
    localStorage.setItem("pwa-banner-dismissed", "1");
  }

  if (isInstalled) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-[80px] sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-[9999]"
        >
          <div className="bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white p-5 relative overflow-hidden">
            {/* Coral accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[hsl(15,80%,65%)] to-[hsl(15,80%,75%)] rounded-t-[2rem]" />

            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[hsl(155,15%,93%)] flex items-center justify-center text-[hsl(155,15%,50%)] hover:bg-[hsl(155,15%,88%)] transition-all"
            >
              <X size={14} />
            </button>

            <div className="flex items-start gap-4">
              {/* App icon */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(15,80%,65%)] to-[hsl(15,80%,55%)] flex items-center justify-center shadow-lg shadow-[hsl(15,80%,65%)]/30 flex-shrink-0">
                <PawPrint size={26} className="text-white" />
              </div>

              <div className="flex-1 min-w-0 pr-6">
                <p className="font-black text-[hsl(160,10%,20%)] text-sm leading-tight">
                  Install RescuePaws
                </p>
                <p className="text-[10px] text-[hsl(155,15%,50%)] font-medium mt-0.5 leading-relaxed">
                  {isIOS
                    ? 'Tap Share → "Add to Home Screen" to install 🐾'
                    : installPrompt 
                      ? "Add to your home screen for the full experience — free! 🐾"
                      : "Open your browser menu and tap 'Install' or 'Add to Home Screen' 🐾"}
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {isIOS ? (
                /* iOS: show instructions */
                <div className="flex-1 bg-[hsl(45,40%,97%)] rounded-xl p-3 border border-[hsl(45,30%,90%)]">
                  <p className="text-[10px] font-black text-[hsl(160,10%,20%)] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Smartphone size={10} />
                    Setup on iPhone
                  </p>
                  <ol className="text-[10px] text-[hsl(155,15%,40%)] font-medium space-y-1 list-decimal list-inside leading-relaxed">
                    <li>Tap the <span className="font-black text-[hsl(15,80%,65%)]">Share</span> button in Safari</li>
                    <li>Tap <span className="font-black text-[hsl(15,80%,65%)]">"Add to Home Screen"</span></li>
                  </ol>
                </div>
              ) : installPrompt ? (
                /* Android/Chrome: trigger native prompt */
                <button
                  onClick={handleInstall}
                  className="flex-1 bg-[hsl(15,80%,65%)] hover:bg-[hsl(15,80%,60%)] text-white font-black text-sm py-3 rounded-xl transition-all shadow-lg shadow-[hsl(15,80%,65%)]/25 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Install Now
                </button>
              ) : (
                /* Fallback for Firefox/Opera/etc */
                <div className="flex-1 bg-orange-50 rounded-xl p-3 border border-orange-100 italic">
                  <p className="text-[9px] text-orange-600 font-bold leading-tight uppercase tracking-wider">
                    Quick Setup: Open your browser menu (⋮ or ≡) and look for "Install" or "Add to Home Screen".
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
