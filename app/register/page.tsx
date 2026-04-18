"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { PawPrint, Mail, Lock, UserPlus, ArrowRight, Loader2, ShieldCheck, User, Phone } from "lucide-react";
import { TermsModal } from "@/components/TermsModal";
import { BackgroundDecoration } from "@/components/BackgroundDecoration";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const router = useRouter();

  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length === 0) return 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = calculatePasswordStrength(password);
  const strengthLabels = ["Very Weak", "Weak", "Medium", "Strong", "Very Strong"];
  const strengthColors = [
    "bg-gray-200",
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
  ];

  const performRegistration = async () => {
    setShowTerms(false);
    setLoading(true);
    setError("");

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
  };

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    
    // Detailed validations
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    // Phone number validation (at least 10 digits)
    const phoneDigits = phoneNumber.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      setError("Please enter a valid phone number (at least 10 digits).");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    
    if (strength < 2) {
      setError("Please choose a stronger password.");
      return;
    }

    // INTERCEPTION: Instead of creating account, show terms for final confirmation
    setShowTerms(true);
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
              <div className="space-y-2">
                <label className="block text-sm font-bold text-[hsl(160,10%,20%)] mb-2 ml-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(155,15%,50%)]" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[hsl(155,15%,90%)] focus:outline-none focus:ring-4 focus:ring-[hsl(155,15%,50%)]/10 focus:border-[hsl(155,15%,50%)] text-[hsl(160,10%,20%)] bg-white/50 transition-all font-medium text-xs sm:text-base"
                    placeholder="Min 8 chars"
                    required
                  />
                </div>
                
                {password.length > 0 && (
                  <div className="px-1 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(155,15%,50%)]">
                        Strength: <span className={strength >= 3 ? "text-green-600" : strength >= 2 ? "text-yellow-600" : "text-red-600"}>{strengthLabels[strength]}</span>
                      </span>
                    </div>
                    <div className="flex gap-1 h-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-all duration-500 ${
                            i <= strength ? strengthColors[strength] : "bg-gray-100"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
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

            <div className="bg-gradient-to-r from-[hsl(155,15%,98%)] to-white p-4 rounded-2xl border border-[hsl(155,15%,95%)] relative overflow-hidden group/terms">
              <div className="flex items-start gap-3 relative z-10">
                <label className="text-xs font-medium text-[hsl(155,15%,50%)] cursor-pointer select-none leading-relaxed">
                  By clicking Create Account, you acknowledge that you have read and agree to our <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-[hsl(155,15%,50%)] font-bold hover:underline"
                  >Terms and Conditions</button> and our Community Guidelines.
                </label>
              </div>
              <div className="absolute inset-0 bg-[hsl(155,15%,50%)]/0 transition-colors group-hover/terms:bg-[hsl(155,15%,50%)]/[0.02]" />
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

      <TermsModal 
        isOpen={showTerms} 
        onClose={() => setShowTerms(false)} 
        showConfirmButton={true}
        onConfirm={performRegistration}
      />
    </div>
  );
}
