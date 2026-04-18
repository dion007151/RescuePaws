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
import { LoadingDog } from "@/components/LoadingDog";

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

    if (!acceptedTerms) {
      setError("Please check the Terms and Conditions to create your account.");
      return;
    }
    
    // Proceed directly to registration
    await performRegistration();
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
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="inline-block relative"
          >
            <Link href="/" className="flex items-center justify-center w-20 h-20 bg-[hsl(155,15%,45%)] rounded-[2.5rem] mb-6 shadow-[0_20px_40px_-5px_rgba(0,0,0,0.2)]">
              <PawPrint className="text-white w-10 h-10" />
            </Link>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-xl shadow-lg flex items-center justify-center">
              <ShieldCheck className="text-[hsl(155,15%,45%)] w-5 h-5" />
            </div>
          </motion.div>
          <h1 className="font-display text-5xl font-black text-[hsl(160,10%,20%)] tracking-tight leading-none mb-3">
            Join the Mission
          </h1>
          <p className="text-[hsl(155,15%,45%)] font-bold uppercase tracking-[0.2em] text-[10px]">Empowering Rescuers across the Philippines</p>
        </div>

        {/* Premium Registration Card */}
        <div className="glass shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] rounded-[3rem] p-10 border border-white/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[hsl(155,15%,45%)]/5 to-transparent rounded-bl-[100px] pointer-events-none" />
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

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest text-[hsl(155,15%,50%)] ml-1">
                  Full Name
                </label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-[hsl(155,15%,50%)] group-focus-within:text-[hsl(160,10%,20%)] transition-colors" size={20} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 rounded-2xl border border-[hsl(155,15%,92%)] focus:outline-none focus:ring-4 focus:ring-[hsl(155,15%,45%)]/10 focus:border-[hsl(155,15%,45%)] text-[hsl(160,10%,20%)] bg-white/40 backdrop-blur-sm transition-all font-bold placeholder:text-[hsl(155,15%,85%)] placeholder:font-medium"
                    placeholder="Enter your name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest text-[hsl(155,15%,50%)] ml-1">
                  PH Mobile Number
                </label>
                <div className="relative group">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-[hsl(155,15%,50%)] group-focus-within:text-[hsl(160,10%,20%)] transition-colors" size={20} />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 rounded-2xl border border-[hsl(155,15%,92%)] focus:outline-none focus:ring-4 focus:ring-[hsl(155,15%,45%)]/10 focus:border-[hsl(155,15%,45%)] text-[hsl(160,10%,20%)] bg-white/40 backdrop-blur-sm transition-all font-bold placeholder:text-[hsl(155,15%,85%)] placeholder:font-medium"
                    placeholder="0912 345 6789"
                    required
                  />
                </div>
              </div>
            </div>

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
                  className="w-full pl-14 pr-6 py-5 rounded-2xl border border-[hsl(155,15%,92%)] focus:outline-none focus:ring-4 focus:ring-[hsl(155,15%,45%)]/10 focus:border-[hsl(155,15%,45%)] text-[hsl(160,10%,20%)] bg-white/40 backdrop-blur-sm transition-all font-bold placeholder:text-[hsl(155,15%,85%)] placeholder:font-medium"
                  placeholder="name@email.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    className="w-full pl-14 pr-6 py-5 rounded-2xl border border-[hsl(155,15%,92%)] focus:outline-none focus:ring-4 focus:ring-[hsl(155,15%,45%)]/10 focus:border-[hsl(155,15%,45%)] text-[hsl(160,10%,20%)] bg-white/40 backdrop-blur-sm transition-all font-bold placeholder:text-[hsl(155,15%,85%)] placeholder:font-medium"
                    placeholder="Create Password"
                    required
                  />
                </div>
                
                {password.length > 0 && (
                  <div className="px-1 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black uppercase tracking-[0.1em] text-[hsl(155,15%,50%)]">
                        Password Strength: <span className={strength >= 3 ? "text-emerald-600" : strength >= 2 ? "text-orange-600" : "text-red-500"}>{strengthLabels[strength]}</span>
                      </span>
                    </div>
                    <div className="flex gap-1.5 h-1.5 bg-[hsl(155,15%,95%)] rounded-full overflow-hidden p-[1px]">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-all duration-700 ease-out ${
                            i <= strength ? strengthColors[strength] : "bg-transparent"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest text-[hsl(155,15%,50%)] ml-1">
                  Verify
                </label>
                <div className="relative group">
                  <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-[hsl(155,15%,50%)] group-focus-within:text-[hsl(160,10%,20%)] transition-colors" size={20} />
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 rounded-2xl border border-[hsl(155,15%,92%)] focus:outline-none focus:ring-4 focus:ring-[hsl(155,15%,45%)]/10 focus:border-[hsl(155,15%,45%)] text-[hsl(160,10%,20%)] bg-white/40 backdrop-blur-sm transition-all font-bold placeholder:text-[hsl(155,15%,85%)] placeholder:font-medium"
                    placeholder="Repeat Password"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="p-1 pt-2">
              <div className="flex items-start gap-4 p-5 rounded-3xl bg-[hsl(155,15%,98%)] border border-[hsl(155,15%,95%)] group/terms hover:bg-white transition-all cursor-pointer">
                <div className="pt-0.5">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-6 h-6 rounded-lg border-[hsl(155,15%,90%)] text-[hsl(155,15%,45%)] focus:ring-[hsl(155,15%,45%)] cursor-pointer"
                  />
                </div>
                <label htmlFor="terms" className="text-[11px] font-bold text-[hsl(155,15%,45%)] leading-relaxed cursor-pointer select-none">
                  I agree to the <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setShowTerms(true); }}
                    className="text-[hsl(160,10%,20%)] underline underline-offset-4 hover:text-[hsl(155,15%,45%)] transition-colors"
                  >RescuePaws Terms & Conditions</button>. By signing up, I join a community dedicated to saving animal lives.
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[hsl(160,10%,20%)] hover:bg-[hsl(155,15%,40%)] text-white font-black py-6 rounded-[2rem] transition-all shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] hover:-translate-y-1.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-4 text-xl group"
            >
              {loading ? (
                <LoadingDog size="small" />
              ) : (
                <>
                  Create Account <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-sm font-bold text-[hsl(155,15%,45%)]">
            Already a member?{" "}
            <Link href="/login" className="text-[hsl(160,10%,20%)] underline underline-offset-4 hover:opacity-70 transition-opacity ml-1">
              Sign In
            </Link>
          </p>
        </div>

        <div className="text-center mt-12 space-y-4">
          <div className="dev-badge inline-flex mx-auto scale-110">
            <ShieldCheck size={14} className="text-[hsl(15,80%,65%)] mr-2" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(160,10%,20%)]">Verified Rescuer Portal</span>
          </div>
          <p className="text-[hsl(155,15%,60%)] text-[9px] font-black uppercase tracking-[0.3em] font-display">
            Designed for Impact • Built for Rescue
          </p>
        </div>
      </motion.div>

      <TermsModal 
        isOpen={showTerms} 
        onClose={() => setShowTerms(false)} 
      />
    </div>
  );
}
