"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { PawPrint, Mail, Lock, ArrowRight, Loader2, ShieldCheck } from "lucide-react";

import { BackgroundDecoration } from "@/components/BackgroundDecoration";
import { TermsModal } from "@/components/TermsModal";
import { LoadingDog } from "@/components/LoadingDog";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    
    // Basic validations
    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      if (!auth) {
        throw new Error("Firebase is not configured. Please add your API keys to .env.local");
      }
      await signInWithEmailAndPassword(auth, email, password);

      // Persist email if rememberMe is checked
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      router.push("/map");
    } catch (err: unknown) {
      console.error("Login error:", err);
      const firebaseError = err as { code?: string; message?: string };
      if (firebaseError.code === "auth/user-not-found" || firebaseError.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (firebaseError.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else {
        setError(firebaseError.message || "Failed to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[hsl(45,30%,98%)] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <BackgroundDecoration />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Logo Section */}
        <div className="text-center mb-10">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: -5 }}
            className="inline-block relative"
          >
            <Link href="/" className="flex items-center justify-center w-20 h-20 bg-[hsl(15,80%,65%)] rounded-[2.5rem] mb-6 shadow-[0_20px_40px_-5px_rgba(239,139,97,0.3)]">
              <PawPrint className="text-white w-10 h-10" />
            </Link>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-xl shadow-lg flex items-center justify-center">
              <ShieldCheck className="text-[hsl(15,80%,65%)] w-5 h-5" />
            </div>
          </motion.div>
          <h1 className="font-display text-5xl font-black text-[hsl(160,10%,20%)] tracking-tight leading-none mb-3">
            Welcome Back
          </h1>
          <p className="text-[hsl(155,15%,45%)] font-bold uppercase tracking-[0.2em] text-[10px]">Continue your life-saving mission</p>
        </div>

        {/* Premium Login Card */}
        <div className="glass shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] rounded-[3rem] p-10 border border-white/60 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[hsl(15,80%,65%)]/5 to-transparent rounded-br-[100px] pointer-events-none" />
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-3xl mb-8 text-sm font-black flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-widest text-[hsl(155,15%,50%)] ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-[hsl(155,15%,50%)] group-focus-within:text-[hsl(160,10%,20%)] transition-colors" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 rounded-2xl border border-[hsl(155,15%,92%)] focus:outline-none focus:ring-4 focus:ring-[hsl(15,80%,65%)]/10 focus:border-[hsl(15,80%,65%)] text-[hsl(160,10%,20%)] bg-white/40 backdrop-blur-sm transition-all font-bold placeholder:text-[hsl(155,15%,85%)] placeholder:font-medium"
                  placeholder="name@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-widest text-[hsl(155,15%,50%)] ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[hsl(155,15%,50%)] group-focus-within:text-[hsl(160,10%,20%)] transition-colors" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 rounded-2xl border border-[hsl(155,15%,92%)] focus:outline-none focus:ring-4 focus:ring-[hsl(15,80%,65%)]/10 focus:border-[hsl(15,80%,65%)] text-[hsl(160,10%,20%)] bg-white/40 backdrop-blur-sm transition-all font-bold placeholder:text-[hsl(155,15%,85%)] placeholder:font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-1 bg-[hsl(155,15%,98%)] p-4 rounded-2xl border border-[hsl(155,15%,95%)]">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-6 h-6 rounded-lg border-[hsl(155,15%,90%)] text-[hsl(15,80%,65%)] focus:ring-[hsl(15,80%,65%)] cursor-pointer transition-all"
                />
                <span className="text-xs font-bold text-[hsl(155,15%,50%)] group-hover:text-[hsl(160,10%,20%)] transition-colors">
                  Stay Signed In
                </span>
              </label>
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="text-[10px] font-black uppercase tracking-wider text-[hsl(15,80%,65%)] hover:underline underline-offset-8 transition-all"
              >
                Terms of Service
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[hsl(15,80%,65%)] hover:bg-[hsl(15,75%,55%)] text-white font-black py-6 rounded-[2rem] transition-all shadow-[0_30px_60px_-15px_rgba(239,139,97,0.3)] hover:shadow-[0_40px_80px_-20px_rgba(239,139,97,0.4)] hover:-translate-y-1.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-4 text-xl group"
            >
              {loading ? (
                <LoadingDog size="small" />
              ) : (
                <>
                  Sign In <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-sm font-bold text-[hsl(155,15%,45%)]">
            New to the mission?{" "}
            <Link href="/register" className="text-[hsl(15,80%,65%)] underline underline-offset-4 hover:opacity-70 transition-opacity ml-1">
              Create Account
            </Link>
          </p>
        </div>

        <div className="text-center mt-12 space-y-4">
          <div className="dev-badge inline-flex mx-auto scale-110">
            <ShieldCheck size={14} className="text-[hsl(15,80%,65%)] mr-2" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(160,10%,20%)]">Secure Rescuer Access</span>
          </div>
          <p className="text-[hsl(155,15%,60%)] text-[9px] font-black uppercase tracking-[0.3em] font-display">
            Designed for Impact • Built for Rescue
          </p>
        </div>
      </motion.div>

      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
}
