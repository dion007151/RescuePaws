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
    <div className="min-h-screen bg-[hsl(45,30%,98%)] px-4 py-6 sm:p-6 lg:p-12 bg-paw-pattern relative overflow-x-hidden">
      <div className="max-w-lg sm:max-w-xl mx-auto space-y-8 sm:space-y-10">

        {/* Header */}
        <header className="flex flex-col gap-1">
           <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[hsl(15,80%,65%)]" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[hsl(15,80%,65%)]">Operational Hub</span>
           </div>
           <h1 className="font-display text-4xl lg:text-5xl font-black text-[hsl(160,10%,20%)] premium-glow leading-tight">
             Settings<span className="text-[hsl(15,80%,65%)]">.</span>
           </h1>
           <p className="text-[hsl(155,15%,50%)] font-medium text-sm max-w-sm">Manage your profile, security, and mission preferences.</p>
        </header>

        {/* Profile Card (Premium God-Card) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="god-card p-6 rounded-[2.5rem] border border-white shadow-xl relative overflow-hidden group cursor-default"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[hsl(15,80%,65%)]/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
          
          <div className="flex items-start justify-between mb-8 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-[1.75rem] bg-gradient-to-br from-[hsl(15,80%,65%)] to-[hsl(15,80%,75%)] flex items-center justify-center shadow-xl shadow-[hsl(15,80%,65%)]/20 relative">
                <PawPrint className="text-white" size={32} />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-lg border-[3px] border-white flex items-center justify-center text-white shadow-md">
                  <ShieldCheck size={10} />
                </div>
              </div>
              
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-600/70">Secured & Active</span>
                </div>
                <p className="font-black text-[hsl(160,10%,20%)] text-2xl capitalize leading-tight mb-1">{displayName}</p>
                <div className="flex items-center gap-2 text-[hsl(155,15%,50%)]">
                  <Mail size={10} className="opacity-40" />
                  <p className="text-[11px] font-bold truncate opacity-80">{user?.email}</p>
                </div>
              </div>
            </div>

            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="w-10 h-10 rounded-xl bg-white/60 backdrop-blur-md border border-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95 group flex items-center justify-center"
              >
                <User size={18} className="text-[hsl(160,10%,20%)] group-hover:text-[hsl(15,80%,65%)] transition-colors" />
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
                <div className="p-4 bg-[hsl(155,15%,97%)] rounded-2xl border border-[hsl(155,15%,93%)] font-display">
                  <p className="text-[9px] font-black text-[hsl(155,15%,60%)] uppercase tracking-widest mb-1">Rank Status</p>
                  <p className="font-black text-[hsl(160,10%,20%)] text-xs">Verified Field Agent</p>
                </div>
                <div className="p-4 bg-[hsl(155,15%,97%)] rounded-2xl border border-[hsl(155,15%,93%)]">
                  <p className="text-[9px] font-black text-[hsl(155,15%,60%)] uppercase tracking-widest mb-1">Missions Won</p>
                  <p className="font-black text-[hsl(15,80%,65%)] text-xs">{profile?.rescueCount || 0} Extraction(s)</p>
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
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[hsl(155,15%,50%)] ml-4">App Experience</p>
             <div className="glass rounded-[2rem] p-1.5 border-white shadow-lg overflow-hidden">
                <div className="flex items-center gap-4 p-4 bg-white/40 rounded-[1.5rem]">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[hsl(160,10%,20%)] shadow-sm">
                    <Bell size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-[hsl(160,10%,20%)] italic text-base">Rescue Alerts</p>
                    <p className="text-[10px] text-[hsl(155,15%,50%)] font-black uppercase tracking-widest">Nearby animal notifications</p>
                  </div>
                  <button
                    onClick={toggleNotifications}
                    className={`relative w-12 h-6 rounded-full transition-all duration-500 shadow-inner ${notifications ? "bg-[hsl(15,80%,65%)]" : "bg-[hsl(155,15%,85%)]"}`}
                  >
                    <motion.div
                      animate={{ x: notifications ? 26 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
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
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[hsl(155,15%,50%)] ml-4">Privacy & Access</p>
             <div className="glass rounded-[2rem] border-white shadow-lg overflow-hidden divide-y divide-white/20">
                <button
                  onClick={() => { setOpenModal("password"); setPwError(""); setPwSuccess(false); }}
                  className="w-full flex items-center gap-4 p-5 hover:bg-white/40 transition-all text-left group"
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[hsl(155,15%,50%)] group-hover:bg-[hsl(160,10%,20%)] group-hover:text-white transition-all shadow-sm">
                    <Lock size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-[hsl(160,10%,20%)] text-base italic leading-none">Reset Security Key</p>
                    <p className="text-[10px] text-[hsl(155,15%,50%)] font-black uppercase tracking-widest mt-1">Update your dashboard credentials</p>
                  </div>
                  <ChevronRight size={16} className="text-[hsl(155,15%,80%)] group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => setOpenModal("support")}
                  className="w-full flex items-center gap-4 p-5 hover:bg-white/40 transition-all text-left group"
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[hsl(155,15%,50%)] group-hover:bg-[hsl(160,10%,20%)] group-hover:text-white transition-all shadow-sm">
                    <Shield size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-[hsl(160,10%,20%)] text-base italic leading-none">System Permissions</p>
                    <p className="text-[10px] text-[hsl(155,15%,50%)] font-black uppercase tracking-widest mt-1">Manage camera and GPS settings</p>
                  </div>
                  <ChevronRight size={16} className="text-[hsl(155,15%,80%)] group-hover:translate-x-1 transition-transform" />
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
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[hsl(155,15%,50%)] ml-4">Mission Control</p>
             <div className="glass rounded-[2rem] border-white shadow-lg overflow-hidden divide-y divide-white/20">
                <button
                  onClick={() => setOpenModal("support")}
                  className="w-full flex items-center gap-4 p-5 hover:bg-white/40 transition-all text-left group"
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[hsl(155,15%,50%)] group-hover:bg-[hsl(15,80%,65%)] group-hover:text-white transition-all shadow-sm">
                    <CircleHelp size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-[hsl(160,10%,20%)] text-base italic leading-none">Rescue Field Guide</p>
                    <p className="text-[10px] text-[hsl(155,15%,50%)] font-black uppercase tracking-widest mt-1">Advanced operational rescue tips</p>
                  </div>
                  <ChevronRight size={16} className="text-[hsl(155,15%,80%)] group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 p-5 hover:bg-red-50/50 transition-all text-left group"
                >
                  <div className="w-10 h-10 bg-red-100/50 rounded-xl flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all shadow-sm">
                    <LogOut size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-red-500 text-base italic leading-none">Abandon Mission</p>
                    <p className="text-[10px] text-red-400/70 font-black uppercase tracking-widest mt-1">Sign out of operational session</p>
                  </div>
                  <div className="px-2 py-0.5 bg-red-50 rounded-md text-[8px] font-black text-red-500 uppercase tracking-widest">Key Required</div>
                </button>
             </div>

             <div className="mt-8">
                <button
                  onClick={() => setOpenModal("donate")}
                  className="w-full bg-gradient-to-br from-[#0055D3] to-[#0040A0] rounded-[2rem] p-6 shadow-2xl shadow-blue-500/20 group hover:shadow-blue-500/30 hover:-translate-y-1 transition-all text-left relative overflow-hidden border border-white/10"
                >
                   {/* GCash shimmer */}
                   <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.1),transparent_60%)]" />

                   <div className="flex items-center gap-4 relative z-10">
                      {/* GCash Icon */}
                      <div className="w-14 h-14 bg-white rounded-2xl flex flex-col items-center justify-center shadow-xl flex-shrink-0">
                        <span className="text-[#0055D3] font-black text-xl leading-none">G</span>
                        <span className="text-[#0055D3] font-black text-[8px] tracking-widest leading-none">CASH</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-black text-white text-base leading-none">Support Solo Developer</p>
                          <span className="text-[8px] font-black bg-white/20 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">GCash</span>
                        </div>
                        <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Any amount means the world 💙</p>
                      </div>
                   </div>
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
              {/* Donation Modal — Official GCash Support Hub */}
              {openModal === "donate" && (
                <>
                  {/* GCash Logo Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-[#0055D3] rounded-[1.5rem] flex flex-col items-center justify-center shadow-2xl shadow-blue-600/30 flex-shrink-0">
                      <span className="text-white font-black text-2xl leading-none">G</span>
                      <span className="text-white/80 font-black text-[9px] tracking-[0.15em] leading-none">CASH</span>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#0055D3]">Official GCash</p>
                      <h2 className="font-display text-2xl sm:text-3xl font-black text-[hsl(160,10%,20%)] leading-tight">
                        Support the Dev<span className="text-[#0055D3]">.</span>
                      </h2>
                    </div>
                  </div>

                  {/* Personal Developer Message */}
                  <div className="bg-gradient-to-br from-[hsl(45,40%,97%)] to-[hsl(45,30%,95%)] rounded-[1.5rem] p-5 border border-[hsl(45,30%,90%)] mb-6 relative overflow-hidden">
                    <div className="absolute top-3 left-4 text-5xl opacity-10 font-black leading-none select-none">❝</div>
                    <p className="text-[hsl(160,10%,25%)] text-sm font-medium leading-relaxed relative z-10">
                      Hi! I'm <span className="font-black text-[hsl(160,10%,20%)]">Dionimar Flores</span>, a solo developer 
                      who built <span className="font-black text-[hsl(15,80%,65%)] italic">RescuePaws</span> completely alone — 
                      from the design, to the code, to every little detail you see. This app is 
                      <span className="font-black"> 100% free</span> and always will be.
                    </p>
                    <p className="text-[hsl(160,10%,25%)] text-sm font-medium leading-relaxed mt-3 relative z-10">
                      If this app helped even one animal, please consider supporting me. 
                      <span className="font-black text-[hsl(15,80%,65%)]"> Any amount will do</span> — it's how I keep building for free. 
                      Thank you so much for using my app! Stay tuned for future updates 🐾💙
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-[hsl(155,15%,50%)] mt-3 opacity-70">— Dionimar Punzalan Flores</p>
                  </div>

                  {/* GCash Card */}
                  <div className="space-y-4">
                    <div className="bg-[#0055D3] rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-600/25 relative">
                      {/* Card shine */}
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />

                      {/* Card Top */}
                      <div className="px-6 pt-5 pb-4 flex items-center justify-between relative z-10">
                        <div>
                          <p className="text-white/50 text-[9px] font-black uppercase tracking-widest mb-1">Account Holder</p>
                          <p className="font-black text-white text-base uppercase tracking-tight">DIONIMAR P. FLORES</p>
                          <p className="font-mono text-white/70 text-sm tracking-widest mt-0.5">0942 639 8033</p>
                        </div>
                        {/* Real-styled GCash logo pill */}
                        <div className="bg-white rounded-xl px-3 py-2 shadow-lg flex flex-col items-center">
                          <span className="text-[#0055D3] font-black text-xl leading-none">G</span>
                          <span className="text-[#0055D3] font-black text-[7px] tracking-widest leading-none">CASH</span>
                        </div>
                      </div>

                      {/* QR Code area */}
                      <div className="bg-white mx-4 mb-4 rounded-[1.5rem] p-4 relative z-10">
                        <p className="text-[9px] font-black uppercase tracking-widest text-center text-[hsl(155,15%,50%)] mb-3">📱 Scan QR to Send</p>
                        <div className="flex justify-center">
                          <div className="w-[180px] h-[180px] rounded-2xl overflow-hidden border-2 border-dashed border-[#0055D3]/20 flex items-center justify-center bg-white">
                            <img
                              src="/images/gcash_qr.jpg"
                              alt="GCash QR Code of Dionimar Flores"
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                const t = e.target as HTMLImageElement;
                                t.style.display = 'none';
                                const p = t.parentElement;
                                if (p) {
                                  p.innerHTML = `<div style="text-align:center;padding:24px">
                                    <div style="font-size:40px;margin-bottom:8px">📷</div>
                                    <p style="font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:0.15em;color:#0055D3">Scan in GCash App</p>
                                  </div>`;
                                }
                              }}
                            />
                          </div>
                        </div>

                        {/* Copy number */}
                        <div className="flex items-center justify-between mt-4 bg-[hsl(45,30%,97%)] rounded-2xl px-4 py-3 border border-[hsl(45,30%,90%)]">
                          <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-[hsl(155,15%,50%)] mb-0.5">GCash Number</p>
                            <p className="font-mono text-lg font-black text-[hsl(160,10%,20%)] tracking-wider">0942 639 8033</p>
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText("09426398033");
                              setIsCopied(true);
                              setTimeout(() => setIsCopied(false), 2500);
                            }}
                            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow-md ${
                              isCopied
                                ? "bg-emerald-500 text-white scale-110"
                                : "bg-[#0055D3] text-white hover:scale-110 active:scale-95"
                            }`}
                          >
                            {isCopied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Thank you note */}
                    <div className="flex items-start gap-3 bg-blue-50 rounded-2xl p-4 border border-blue-100">
                      <div className="w-9 h-9 bg-[#0055D3] rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Heart size={16} className="text-white" fill="currentColor" />
                      </div>
                      <div>
                        <p className="font-black text-[#0055D3] text-sm leading-none mb-1">Thank you for your support!</p>
                        <p className="text-[10px] text-blue-500 font-medium leading-relaxed">
                          Every peso helps me stay motivated to build free tools for our community. 
                          Stay tuned for future updates 🐾
                        </p>
                      </div>
                    </div>

                    <p className="text-center text-[9px] text-[hsl(155,15%,45%)] font-black uppercase tracking-[0.25em] opacity-50">
                      Dionimar Punzalan Flores · Solo Developer · RescuePaws 2026
                    </p>
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
