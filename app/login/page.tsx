"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { PawPrint, Mail, Lock, ArrowRight, Loader2, ShieldCheck } from "lucide-react";

import { BackgroundDecoration } from "@/components/BackgroundDecoration";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
    <div className="min-h-screen bg-[hsl(45,30%,98%)] flex flex-col items-center justify-center p-4 relative overflow-hidden bg-paw-pattern">
      <BackgroundDecoration />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center w-16 h-16 bg-[hsl(15,80%,65%)] rounded-[2rem] mb-4 shadow-lg hover:rotate-6 transition-transform">
            <PawPrint className="text-white w-8 h-8" />
          </Link>
          <h1 className="font-display text-4xl font-black text-[hsl(160,10%,20%)] tracking-tight">
            Welcome Back
          </h1>
          <p className="text-[hsl(155,15%,50%)] mt-2 font-medium">Continue your rescue mission</p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-8 border border-white/50">
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl mb-6 text-sm font-bold flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-[hsl(160,10%,20%)] mb-2 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(155,15%,50%)]" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[hsl(155,15%,90%)] focus:outline-none focus:ring-4 focus:ring-[hsl(15,80%,65%)]/10 focus:border-[hsl(15,80%,65%)] text-[hsl(160,10%,20%)] bg-white/50 transition-all font-medium"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[hsl(160,10%,20%)] mb-2 ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(155,15%,50%)]" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[hsl(155,15%,90%)] focus:outline-none focus:ring-4 focus:ring-[hsl(15,80%,65%)]/10 focus:border-[hsl(15,80%,65%)] text-[hsl(160,10%,20%)] bg-white/50 transition-all font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[hsl(15,80%,65%)] hover:bg-[hsl(15,75%,55%)] text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-[hsl(15,80%,65%)]/20 hover:shadow-[hsl(15,80%,65%)]/40 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Sign In <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-[hsl(155,15%,95%)] text-center">
            <p className="text-[hsl(155,15%,50%)] text-sm font-medium">
              New to RescuePaws?{" "}
              <Link href="/register" className="text-[hsl(15,80%,65%)] font-black hover:underline underline-offset-4 transition">
                Create Account
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-12 flex flex-col items-center gap-3">
           <div className="dev-badge scale-90">
             <ShieldCheck size={12} className="text-[hsl(15,80%,65%)] mr-1.5" />
             <span className="text-[9px] font-black uppercase tracking-[0.1em] text-[hsl(160,10%,20%)]">Dionimar Flores Solo Developer</span>
           </div>
           <p className="text-[hsl(155,15%,90%)] text-[9px] font-black uppercase tracking-widest italic opacity-50">
             Every paw matters • Together we save lives
           </p>
        </div>
      </motion.div>
    </div>
  );
}
