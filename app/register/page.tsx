"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { PawPrint, Mail, Lock, UserPlus, ArrowRight, Loader2, ShieldCheck, User, Phone } from "lucide-react";

import { BackgroundDecoration } from "@/components/BackgroundDecoration";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    
    // Basic validations
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!phoneNumber.trim()) {
      setError("Please enter your phone number.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    
    setLoading(true);
    try {
      if (!auth || !db) {
        throw new Error("Firebase is not fully configured. Please check your settings.");
      }
      
      // 1. Create User in Firebase Auth
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Save detailed profile to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email,
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        createdAt: serverTimestamp(),
      });
      
      router.push("/map");
    } catch (err: unknown) {
      console.error("Registration error:", err);
      const firebaseError = err as { code?: string; message?: string };
      if (firebaseError.code === "auth/email-already-in-use") {
        setError("This email is already registered. Try logging in.");
      } else if (firebaseError.code === "auth/operation-not-allowed") {
        setError("Email/Password accounts are not enabled in Firebase Console.");
      } else if (firebaseError.code === "auth/weak-password") {
        setError("The password is too weak. Please use at least 6 characters.");
      } else {
        setError(firebaseError.message || "Failed to create account. Please try again.");
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
          <Link href="/" className="inline-flex items-center justify-center w-16 h-16 bg-[hsl(155,15%,50%)] rounded-[2rem] mb-4 shadow-lg hover:rotate-6 transition-transform">
            <PawPrint className="text-white w-8 h-8" />
          </Link>
          <h1 className="font-display text-4xl font-black text-[hsl(160,10%,20%)] tracking-tight">
            Join RescuePaws
          </h1>
          <p className="text-[hsl(155,15%,50%)] mt-2 font-medium">Start making a difference today</p>
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

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[hsl(160,10%,20%)] mb-2 ml-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(155,15%,50%)]" size={18} />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[hsl(155,15%,90%)] focus:outline-none focus:ring-4 focus:ring-[hsl(155,15%,50%)]/10 focus:border-[hsl(155,15%,50%)] text-[hsl(160,10%,20%)] bg-white/50 transition-all font-medium"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[hsl(160,10%,20%)] mb-2 ml-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(155,15%,50%)]" size={18} />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[hsl(155,15%,90%)] focus:outline-none focus:ring-4 focus:ring-[hsl(155,15%,50%)]/10 focus:border-[hsl(155,15%,50%)] text-[hsl(160,10%,20%)] bg-white/50 transition-all font-medium"
                  placeholder="+1234567890"
                  required
                />
              </div>
            </div>

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
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[hsl(155,15%,90%)] focus:outline-none focus:ring-4 focus:ring-[hsl(155,15%,50%)]/10 focus:border-[hsl(155,15%,50%)] text-[hsl(160,10%,20%)] bg-white/50 transition-all font-medium"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-bold text-[hsl(160,10%.20%)] mb-2 ml-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(155,15%,50%)]" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[hsl(155,15%,90%)] focus:outline-none focus:ring-4 focus:ring-[hsl(155,15%,50%)]/10 focus:border-[hsl(155,15%,50%)] text-[hsl(160,10%,20%)] bg-white/50 transition-all font-medium text-xs sm:text-base"
                    placeholder="6+ chars"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[hsl(160,10%,20%)] mb-2 ml-1">
                  Confirm
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(155,15%,50%)]" size={18} />
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[hsl(155,15%,90%)] focus:outline-none focus:ring-4 focus:ring-[hsl(155,15%,50%)]/10 focus:border-[hsl(155,15%,50%)] text-[hsl(160,10%,20%)] bg-white/50 transition-all font-medium text-xs sm:text-base"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[hsl(155,15%,50%)] hover:bg-[hsl(155,15%,40%)] text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-[hsl(155,15%,50%)]/20 hover:shadow-[hsl(155,15%,50%)]/40 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Create Account <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-[hsl(155,15%,95%)] text-center">
            <p className="text-[hsl(155,15%,50%)] text-sm font-medium">
              Already have an account?{" "}
              <Link href="/login" className="text-[hsl(155,15%,50%)] font-black hover:underline underline-offset-4 transition">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-[hsl(155,15%,85%)] text-xs mt-8 font-black uppercase tracking-widest">
          Join the community of animal heroes
        </p>
      </motion.div>
    </div>
  );
}
