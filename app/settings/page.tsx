"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Bell, Lock, Shield, CircleHelp, LogOut,
  ChevronRight, X, Eye, EyeOff, CheckCircle2, AlertTriangle, PawPrint, Mail, ShieldCheck, Copy, Heart
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import {
  signOut,
  updatePassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";

type Modal = "password" | "delete" | "support" | "donate" | null;

export default function SettingsPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [openModal, setOpenModal] = useState<Modal>(null);
  const [notifications, setNotifications] = useState(true);

  // Password change state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState("");

  // Delete account state
  const [deletePw, setDeletePw] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Profile edit state
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.fullName || "");
  const [phone, setPhone] = useState(profile?.phoneNumber || "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  async function handleLogout() {
    await signOut(auth);
    router.push("/login");
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !db) return;
    setProfileLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        fullName,
        phoneNumber: phone
      });
      setIsEditing(false);
      router.refresh(); // Refresh to get latest profile
    } catch (err) {
      console.error("Profile update error:", err);
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    if (newPw.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }
    setPwLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user!.email!, currentPw);
      await reauthenticateWithCredential(user!, credential);
      await updatePassword(user!, newPw);
      setPwSuccess(true);
      setCurrentPw("");
      setNewPw("");
      setTimeout(() => { setPwSuccess(false); setOpenModal(null); }, 2000);
    } catch (err: any) {
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setPwError("Current password is incorrect.");
      } else {
        setPwError("Failed to update password. Please try again.");
      }
    } finally {
      setPwLoading(false);
    }
  }

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    setDeleteError("");
    setDeleteLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user!.email!, deletePw);
      await reauthenticateWithCredential(user!, credential);
      await deleteUser(user!);
    } catch (err: any) {
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setDeleteError("Password is incorrect.");
      } else {
        setDeleteError("Failed to delete account. Please try again.");
      }
      setDeleteLoading(false);
    }
  }

  async function toggleNotifications() {
    if (!user || !db) return;
    const newState = !notifications;
    
    // Request permission if enabling
    if (newState && "Notification" in window && Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;
    }

    setNotifications(newState);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        notificationsEnabled: newState
      });
    } catch (err) {
      console.error("Notif update error:", err);
    }
  }

  // Sync state from profile on load
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName);
      setPhone(profile.phoneNumber);
      setNotifications(!!profile.notificationsEnabled);
    }
  }, [profile]);

  const displayName = profile?.fullName || user?.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen bg-[hsl(45,30%,98%)] p-6 lg:p-12 bg-paw-pattern relative overflow-x-hidden">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex flex-col gap-2">
           <div className="flex items-center gap-2 mb-1">
              <Shield size={16} className="text-[hsl(15,80%,65%)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[hsl(15,80%,65%)]">Security & Preferences</span>
           </div>
           <h1 className="font-display text-5xl lg:text-6xl font-black text-[hsl(160,10%,20%)] premium-glow leading-none">
             Settings<span className="text-[hsl(15,80%,65%)]">.</span>
           </h1>
           <p className="text-[hsl(155,15%,50%)] font-medium text-lg max-w-sm">Personalize your rescue experience and secure your account.</p>
        </header>

        {/* Profile Card (Premium God-Card) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="god-card p-8 rounded-[3rem] border border-white shadow-2xl relative overflow-hidden group cursor-default"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[hsl(15,80%,65%)]/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
          
          <div className="flex items-start justify-between mb-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[hsl(15,80%,65%)] to-[hsl(15,80%,75%)] flex items-center justify-center shadow-2xl shadow-[hsl(15,80%,65%)]/30 relative">
                <PawPrint className="text-white" size={40} />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-xl border-4 border-white flex items-center justify-center text-white shadow-lg animate-pulse">
                  <ShieldCheck size={14} />
                </div>
              </div>
              
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600/80">Operational & Cloud Synced</span>
                </div>
                <p className="font-black text-[hsl(160,10%,20%)] text-3xl capitalize leading-none mb-1">{displayName}</p>
                <div className="flex items-center gap-2 text-[hsl(155,15%,50%)]">
                  <Mail size={12} className="opacity-50" />
                  <p className="text-xs font-bold truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 group"
              >
                <User size={20} className="text-[hsl(160,10%,20%)] group-hover:text-[hsl(15,80%,65%)] transition-colors" />
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSaveProfile}
                className="space-y-4 pt-4 border-t border-[hsl(155,15%,95%)]"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(155,15%,50%)] ml-2">Full Name</p>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      required
                      className="w-full px-5 py-3 rounded-2xl border-2 border-[hsl(155,15%,95%)] bg-white/50 focus:outline-none focus:border-[hsl(15,80%,65%)] text-sm font-bold transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(155,15%,50%)] ml-2">Contact Number</p>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      required
                      className="w-full px-5 py-3 rounded-2xl border-2 border-[hsl(155,15%,95%)] bg-white/50 focus:outline-none focus:border-[hsl(15,80%,65%)] text-sm font-bold transition-all"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="flex-1 bg-[hsl(160,10%,20%)] text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[hsl(160,10%,20%)]/20 disabled:opacity-50"
                  >
                    {profileLoading ? "Syncing..." : "Update Credentials"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 bg-white border border-[hsl(155,15%,90%)] text-[hsl(155,15%,50%)] rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    Abort
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 gap-4 pt-4 border-t border-[hsl(155,15%,95%)]"
              >
                <div className="p-4 bg-[hsl(155,15%,97%)] rounded-2xl">
                  <p className="text-[9px] font-black text-[hsl(155,15%,60%)] uppercase tracking-widest mb-1">Rank Status</p>
                  <p className="font-black text-[hsl(160,10%,20%)] text-sm">Verified Field Agent</p>
                </div>
                <div className="p-4 bg-[hsl(155,15%,97%)] rounded-2xl">
                  <p className="text-[9px] font-black text-[hsl(155,15%,60%)] uppercase tracking-widest mb-1">Missions Won</p>
                  <p className="font-black text-[hsl(15,80%,65%)] text-sm">{profile?.rescueCount || 0} Successful Extractions</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Section: Interaction */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
             <p className="text-xs font-black uppercase tracking-[0.2em] text-[hsl(155,15%,50%)] ml-2">App Experience</p>
             <div className="glass rounded-[2.5rem] p-2 border-white/60 shadow-xl overflow-hidden">
                <div className="flex items-center gap-5 p-5 bg-white/40 rounded-[2rem]">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[hsl(160,10%,20%)] shadow-sm">
                    <Bell size={22} />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-[hsl(160,10%,20%)] italic text-lg">Rescue Alerts</p>
                    <p className="text-xs text-[hsl(155,15%,50%)] font-black uppercase tracking-widest">Nearby animal notifications</p>
                  </div>
                  <button
                    onClick={toggleNotifications}
                    className={`relative w-16 h-8 rounded-full transition-all duration-500 shadow-inner ${notifications ? "bg-[hsl(15,80%,65%)]" : "bg-[hsl(155,15%,85%)]"}`}
                  >
                    <motion.div
                      animate={{ x: notifications ? 36 : 4 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
                    />
                  </button>
                </div>
             </div>
          </motion.div>

          {/* Section: Security */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
             <p className="text-xs font-black uppercase tracking-[0.2em] text-[hsl(155,15%,50%)] ml-2">Privacy & Access</p>
             <div className="glass rounded-[2.5rem] border-white/60 shadow-xl overflow-hidden divide-y divide-white/20">
                <button
                  onClick={() => { setOpenModal("password"); setPwError(""); setPwSuccess(false); }}
                  className="w-full flex items-center gap-5 p-6 hover:bg-white/40 transition-all text-left group"
                >
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[hsl(155,15%,50%)] group-hover:bg-[hsl(160,10%,20%)] group-hover:text-white transition-all shadow-sm">
                    <Lock size={22} />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-[hsl(160,10%,20%)] text-lg italic">Reset Security Key</p>
                    <p className="text-xs text-[hsl(155,15%,50%)] font-black uppercase tracking-widest">Update your dashboard password</p>
                  </div>
                  <ChevronRight size={20} className="text-[hsl(155,15%,80%)] group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => setOpenModal("support")}
                  className="w-full flex items-center gap-5 p-6 hover:bg-white/40 transition-all text-left group"
                >
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[hsl(155,15%,50%)] group-hover:bg-[hsl(160,10%,20%)] group-hover:text-white transition-all shadow-sm">
                    <Shield size={22} />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-[hsl(160,10%,20%)] text-lg italic">System Permissions</p>
                    <p className="text-xs text-[hsl(155,15%,50%)] font-black uppercase tracking-widest">Manage camera and GPS storage</p>
                  </div>
                  <ChevronRight size={20} className="text-[hsl(155,15%,80%)] group-hover:translate-x-1 transition-transform" />
                </button>
             </div>
          </motion.div>

          {/* Section: Mission Control */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
             <p className="text-xs font-black uppercase tracking-[0.2em] text-[hsl(155,15%,50%)] ml-2">Mission Control</p>
             <div className="glass rounded-[2.5rem] border-white/60 shadow-xl overflow-hidden divide-y divide-white/20">
                <button
                  onClick={() => setOpenModal("support")}
                  className="w-full flex items-center gap-5 p-6 hover:bg-white/40 transition-all text-left group"
                >
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[hsl(155,15%,50%)] group-hover:bg-[hsl(15,80%,65%)] group-hover:text-white transition-all shadow-sm">
                    <CircleHelp size={22} />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-[hsl(160,10%,20%)] text-lg italic">Rescue Field Guide</p>
                    <p className="text-xs text-[hsl(155,15%,50%)] font-black uppercase tracking-widest">Advanced usage and rescue tips</p>
                  </div>
                  <ChevronRight size={20} className="text-[hsl(155,15%,80%)] group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-5 p-6 hover:bg-red-50/50 transition-all text-left group"
                >
                  <div className="w-12 h-12 bg-red-100/50 rounded-2xl flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all shadow-sm">
                    <LogOut size={22} />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-red-500 text-lg italic">Abandon Mission</p>
                    <p className="text-xs text-red-400/70 font-black uppercase tracking-widest">Sign out of this operational session</p>
                  </div>
                  <div className="px-3 py-1 bg-red-50 rounded-lg text-[9px] font-black text-red-500 uppercase tracking-widest">Safety Key Required</div>
                </button>
             </div>

             <div className="mt-8">
                <button
                  onClick={() => setOpenModal("donate")}
                  className="w-full bg-white rounded-[2.5rem] p-8 border-2 border-dashed border-[hsl(15,80%,65%)] shadow-xl group hover:bg-[hsl(15,80%,65%)]/5 transition-all text-center"
                >
                   <div className="w-16 h-16 bg-[hsl(15,80%,65%)]/10 rounded-2xl flex items-center justify-center text-[hsl(15,80%,65%)] mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Heart size={32} fill="currentColor" />
                   </div>
                   <h3 className="font-black text-[hsl(160,10%,20%)] text-xl italic mb-1">Support Solo Developer<span className="text-[hsl(15,80%,65%)]">.</span></h3>
                   <p className="text-[hsl(155,15%,50%)] text-xs font-black uppercase tracking-widest">Help me improve RescuePaws future updates</p>
                </button>
             </div>
          </motion.div>
        </div>

        {/* Danger Zone */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="pt-8 bg-paw-pattern rounded-[3rem]">
          <button
            onClick={() => { setOpenModal("delete"); setDeleteError(""); setDeletePw(""); }}
            className="w-full text-center text-[10px] text-[hsl(155,15%,70%)] hover:text-red-500 transition-all font-black uppercase tracking-[0.4em] py-8"
          >
            Purge Operational Intelligence (Delete Account)
          </button>
        </motion.div>

        {/* Footer Branding */}
        <footer className="pt-16 pb-32 flex flex-col items-center gap-2 opacity-30 hover:opacity-100 transition-opacity cursor-default">
           <div className="flex items-center gap-2">
              <ShieldCheck size={12} className="text-[hsl(15,80%,65%)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(160,10%,20%)]">Dionimar Flores Solo Developer</span>
           </div>
           <p className="text-[9px] font-black uppercase tracking-widest text-[hsl(155,15%,60%)]">Ensuring Animal Welfare through Professional Software</p>
        </footer>

      </div>

      {/* ── Modals (Upgraded with God Design) ── */}
      <AnimatePresence>
        {openModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 lg:p-12 overflow-y-auto"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setOpenModal(null)} />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.9 }}
              className="bg-[hsl(45,30%,98%)] rounded-[3rem] shadow-[0_32px_128px_rgba(0,0,0,0.4)] w-full max-w-xl p-8 lg:p-12 relative z-10 border border-white/20"
            >
              <button 
                onClick={() => setOpenModal(null)} 
                className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center text-[hsl(155,15%,50%)] hover:bg-red-50 hover:text-red-500 transition-all active:scale-95 group"
              >
                <X size={20} className="group-hover:rotate-90 transition-transform" />
              </button>

              {/* Password Modal */}
              {openModal === "password" && (
                <>
                  <div className="w-16 h-16 bg-[hsl(15,80%,65%)] rounded-[1.5rem] flex items-center justify-center mb-6 shadow-2xl shadow-[hsl(15,80%,65%)]/20">
                    <Lock className="text-white" size={32} />
                  </div>
                  <h2 className="font-display text-4xl font-black text-[hsl(160,10%,20%)] mb-2 italic">Reset Key<span className="text-[hsl(15,80%,65%)]">.</span></h2>
                  <p className="text-[hsl(155,15%,50%)] mb-10 font-medium text-lg leading-relaxed">Secure your rescue mission by rotating your authentication credentials.</p>

                  {pwSuccess ? (
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-4 py-8 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                      <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl">
                         <CheckCircle2 size={32} />
                      </div>
                      <p className="font-black text-emerald-600 text-xl italic uppercase tracking-widest">Access Restored</p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleChangePassword} className="space-y-6">
                      {pwError && (
                        <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-[1.5rem] text-sm font-black uppercase tracking-widest flex items-center gap-3">
                          <AlertTriangle size={18} /> {pwError}
                        </div>
                      )}
                      <div className="space-y-2">
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(155,15%,50%)] ml-4">Current Operational Password</p>
                         <div className="relative">
                            <input
                              type={showCurrent ? "text" : "password"}
                              value={currentPw}
                              onChange={e => setCurrentPw(e.target.value)}
                              required
                              className="w-full px-8 py-5 rounded-[1.8rem] border-2 border-[hsl(155,15%,92%)] focus:outline-none focus:ring-8 focus:ring-[hsl(15,80%,65%)]/5 focus:border-[hsl(15,80%,65%)] bg-white text-[hsl(160,10%,20%)] font-black text-lg transition-all"
                            />
                            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-6 top-1/2 -translate-y-1/2 text-[hsl(155,15%,60%)]">
                              {showCurrent ? <EyeOff size={22} /> : <Eye size={22} />}
                            </button>
                         </div>
                      </div>
                      
                      <div className="space-y-2">
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(155,15%,50%)] ml-4">New Mission Security Key</p>
                         <div className="relative">
                            <input
                              type={showNew ? "text" : "password"}
                              value={newPw}
                              onChange={e => setNewPw(e.target.value)}
                              required
                              className="w-full px-8 py-5 rounded-[1.8rem] border-2 border-[hsl(155,15%,92%)] focus:outline-none focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 bg-white text-[hsl(160,10%,20%)] font-black text-lg transition-all"
                            />
                            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-6 top-1/2 -translate-y-1/2 text-[hsl(155,15%,60%)]">
                              {showNew ? <EyeOff size={22} /> : <Eye size={22} />}
                            </button>
                         </div>
                      </div>

                      <button
                        type="submit"
                        disabled={pwLoading}
                        className="w-full bg-[hsl(160,10%,20%)] hover:bg-[hsl(160,10%,30%)] text-white font-black py-6 rounded-[1.8rem] transition-all shadow-2xl disabled:opacity-50 flex items-center justify-center gap-3 text-lg uppercase tracking-[0.2em]"
                      >
                        {pwLoading ? <div className="w-6 h-6 border-4 border-white/40 border-t-white rounded-full animate-spin" /> : "Update Security Log"}
                      </button>
                    </form>
                  )}
                </>
              )}

              {/* Support Modal (Field Guide) */}
              {openModal === "support" && (
                <>
                  <div className="w-16 h-16 bg-[hsl(160,10%,20%)] rounded-[1.5rem] flex items-center justify-center mb-6 shadow-2xl">
                    <CircleHelp className="text-white" size={32} />
                  </div>
                  <h2 className="font-display text-4xl font-black text-[hsl(160,10%,20%)] mb-2 italic text-left">Intelligence Hub<span className="text-[hsl(15,80%,65%)]">.</span></h2>
                  <p className="text-[hsl(155,15%,50%)] mb-10 font-medium text-lg leading-relaxed">Advanced field operations for the dedicated pet rescuer.</p>
                  
                  <div className="space-y-4">
                    {[
                      { icon: "📍", title: "Global Positioning", desc: "Always enable high-accuracy GPS for precise local animal extraction coordinates.", color: "bg-blue-50" },
                      { icon: "📷", title: "Visual Recon", desc: "Our neural compression ensures your animal photos upload instantly on low signal.", color: "bg-purple-50" },
                      { icon: "Shield", title: "Verified Network", desc: "Every marked rescue contributes to global animal welfare statistics 2026.", color: "bg-emerald-50" },
                    ].map(tip => (
                      <div key={tip.title} className={`flex items-start gap-6 ${tip.color} rounded-[2rem] p-6 border border-white shadow-sm`}>
                        <span className="text-3xl mt-0.5">{tip.icon}</span>
                        <div>
                          <p className="font-black text-[hsl(160,10%,20%)] text-lg italic">{tip.title}</p>
                          <p className="text-xs text-[hsl(155,15%,50%)] font-bold mt-1 leading-relaxed">{tip.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Delete Modal */}
              {openModal === "delete" && (
                <>
                  <div className="w-16 h-16 bg-red-100 rounded-[1.5rem] flex items-center justify-center mb-6 border border-red-200">
                    <AlertTriangle className="text-red-500" size={32} />
                  </div>
                  <h2 className="font-display text-4xl font-black text-red-600 mb-2 italic">Purge Log<span className="text-red-300">.</span></h2>
                  <p className="text-red-400 font-black uppercase tracking-widest text-xs mb-10">Critical: This will permanently erase your heroic rescue history.</p>
                  
                  <form onSubmit={handleDeleteAccount} className="space-y-6">
                    {deleteError && (
                      <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-[1.5rem] text-sm font-black uppercase tracking-widest flex items-center gap-3">
                        <AlertTriangle size={18} /> {deleteError}
                      </div>
                    )}
                    <div className="space-y-2">
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(155,15%,50%)] ml-4">Verification Key Required</p>
                       <input
                        type="password"
                        placeholder="Confirm with your password"
                        value={deletePw}
                        onChange={e => setDeletePw(e.target.value)}
                        required
                        className="w-full px-8 py-5 rounded-[1.8rem] border-2 border-red-100 focus:outline-none focus:ring-8 focus:ring-red-500/5 focus:border-red-500 bg-white text-[hsl(160,10%,20%)] font-black text-lg transition-all"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={deleteLoading}
                      className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-6 rounded-[1.8rem] transition-all shadow-2xl shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-3 text-lg uppercase tracking-[0.2em]"
                    >
                      {deleteLoading ? <div className="w-6 h-6 border-4 border-white/40 border-t-white rounded-full animate-spin" /> : "Purge Operational History"}
                    </button>
                    
                    <p className="text-center text-[10px] text-[hsl(155,15%,50%)] font-black uppercase tracking-[0.3em] opacity-50">This action cannot be undone</p>
                  </form>
                </>
              )}
              {/* Donation Modal (Official GCash Hub) */}
              {openModal === "donate" && (
                <>
                  <div className="w-16 h-16 bg-[#0055D3] rounded-[1.5rem] flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/20">
                    <Heart className="text-white" size={32} fill="currentColor" />
                  </div>
                  <h2 className="font-display text-4xl font-black text-[#0055D3] mb-2 italic">Official Support Hub<span className="text-[hsl(15,80%,65%)]">.</span></h2>
                  <p className="text-[hsl(155,15%,50%)] mb-8 font-medium text-lg leading-relaxed">
                    Safely support the mission. 100% of your contribution fuels the Solo Developer roadmap.
                  </p>
                  
                  <div className="space-y-6">
                     <div className="bg-[#0055D3] rounded-[2.5rem] p-8 border border-white/20 shadow-2xl relative overflow-hidden group">
                        {/* Receipt Texture Effect */}
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white_0%,transparent_50%)]" />
                        
                        <div className="flex items-center justify-between mb-8 relative z-10">
                           <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                              <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Account Holder</p>
                              <p className="font-black text-white text-xl italic uppercase tracking-tight">DIONIMAR P. FLORES</p>
                           </div>
                           <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                              <div className="text-[#0055D3] font-black text-2xl italic leading-none">G<br/><span className="text-[10px] tracking-tighter">CASH</span></div>
                           </div>
                        </div>
                        
                        <div className="bg-white rounded-[2rem] p-8 shadow-inner relative z-10">
                           <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(155,15%,50%)] mb-2 text-center">Scan or Copy to Support</p>
                           
                           <div className="flex flex-col items-center gap-6">
                              <div className="w-full aspect-square max-w-[200px] bg-white rounded-[1.5rem] border-2 border-dashed border-[hsl(155,15%,90%)] flex items-center justify-center relative group-hover:border-[#0055D3] transition-all overflow-hidden p-2">
                                 <img 
                                   src="/images/gcash_qr.jpg" 
                                   alt="GCash QR Code"
                                   className="w-full h-full object-contain"
                                   onError={(e) => {
                                     const target = e.target as HTMLImageElement;
                                     target.style.display = 'none';
                                     const parent = target.parentElement;
                                     if (parent) {
                                       const msg = document.createElement('div');
                                       msg.className = "text-center p-6 flex flex-col items-center gap-3";
                                       msg.innerHTML = `
                                         <div class="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                                           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                         </div>
                                         <p class="text-[9px] text-blue-400 font-black uppercase tracking-widest">Awaiting QR Asset</p>
                                       `;
                                       parent.appendChild(msg);
                                     }
                                   }}
                                 />
                              </div>

                              <div className="flex items-center gap-4 bg-[hsl(45,30%,96%)] px-6 py-4 rounded-2xl border border-[hsl(45,30%,90%)] w-full justify-between">
                                 <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-[hsl(155,15%,50%)] leading-none mb-1">GCash Number</p>
                                    <p className="font-mono text-xl font-black text-[hsl(160,10%,20%)] tracking-wider">0942 639 8033</p>
                                 </div>
                                 <button 
                                   onClick={() => {
                                     navigator.clipboard.writeText("09426398033");
                                     setIsCopied(true);
                                     setTimeout(() => setIsCopied(false), 2000);
                                   }}
                                   className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-lg ${
                                     isCopied 
                                       ? "bg-emerald-500 text-white scale-110" 
                                       : "bg-[#0055D3] text-white hover:scale-110 active:scale-95 shadow-blue-500/20"
                                   }`}
                                 >
                                    {isCopied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                                 </button>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex items-center gap-5">
                         <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                             <CheckCircle2 size={24} />
                         </div>
                         <div>
                            <p className="font-black text-emerald-800 text-sm italic italic leading-none mb-1">Secure Transaction</p>
                            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Verified GCash Professional Account</p>
                         </div>
                     </div>

                     <p className="text-center text-[9px] text-[hsl(155,15%,40%)] font-black uppercase tracking-[0.3em] opacity-40">Dionimar Punzalan Flores • Solo Developer Roadmap 2026</p>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
