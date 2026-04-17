"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Bell, Lock, Shield, CircleHelp, LogOut,
  ChevronRight, X, Eye, EyeOff, CheckCircle2, AlertTriangle, PawPrint, Mail
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { auth } from "@/lib/firebase";
import {
  signOut,
  updatePassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";

type Modal = "password" | "delete" | "support" | null;

export default function SettingsPage() {
  const { user } = useAuth();
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

  async function handleLogout() {
    await signOut(auth);
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

  const displayName = user?.email?.split("@")[0] ?? "User";

  return (
    <div className="min-h-screen bg-[hsl(45,30%,98%)] p-6 lg:p-12 bg-paw-pattern">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <header className="mb-8">
          <h1 className="font-display text-5xl font-black text-[hsl(160,10%,20%)] mb-2">Settings</h1>
          <p className="text-[hsl(155,15%,50%)] font-medium">Manage your account and preferences.</p>
        </header>

        {/* Profile Card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/60 shadow-xl shadow-black/5 mb-4 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(15,80%,65%)] flex items-center justify-center shadow-lg shadow-[hsl(15,80%,65%)]/20 flex-shrink-0">
            <PawPrint className="text-white" size={28} />
          </div>
          <div className="min-w-0">
            <p className="font-black text-[hsl(160,10%,20%)] text-xl capitalize truncate">{displayName}</p>
            <div className="flex items-center gap-1.5 text-[hsl(155,15%,50%)]">
              <Mail size={12} />
              <p className="text-sm font-medium truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Settings List */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-xl shadow-black/5 divide-y divide-[hsl(155,15%,90%)] mb-4">
          {/* Notifications Toggle */}
          <div className="flex items-center gap-5 p-5 first:rounded-t-[2.5rem]">
            <div className="w-12 h-12 bg-[hsl(155,15%,95%)] rounded-2xl flex items-center justify-center text-[hsl(155,15%,50%)]">
              <Bell size={22} />
            </div>
            <div className="flex-1">
              <p className="font-black text-[hsl(160,10%,20%)]">Rescue Alerts</p>
              <p className="text-sm text-[hsl(155,15%,50%)] font-medium">Get notified about nearby rescues</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${notifications ? "bg-[hsl(15,80%,65%)]" : "bg-[hsl(155,15%,85%)]"}`}
            >
              <motion.div
                animate={{ x: notifications ? 28 : 4 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
              />
            </button>
          </div>

          {/* Change Password */}
          <button
            onClick={() => { setOpenModal("password"); setPwError(""); setPwSuccess(false); }}
            className="w-full flex items-center gap-5 p-5 hover:bg-white/80 transition-all text-left group"
          >
            <div className="w-12 h-12 bg-[hsl(155,15%,95%)] rounded-2xl flex items-center justify-center text-[hsl(155,15%,50%)] group-hover:bg-[hsl(15,80%,65%)] group-hover:text-white transition-all">
              <Lock size={22} />
            </div>
            <div className="flex-1">
              <p className="font-black text-[hsl(160,10%,20%)]">Change Password</p>
              <p className="text-sm text-[hsl(155,15%,50%)] font-medium">Update your account password</p>
            </div>
            <ChevronRight size={20} className="text-[hsl(155,15%,60%)]" />
          </button>

          {/* Permissions Info */}
          <button
            onClick={() => setOpenModal("support")}
            className="w-full flex items-center gap-5 p-5 hover:bg-white/80 transition-all text-left group"
          >
            <div className="w-12 h-12 bg-[hsl(155,15%,95%)] rounded-2xl flex items-center justify-center text-[hsl(155,15%,50%)] group-hover:bg-[hsl(15,80%,65%)] group-hover:text-white transition-all">
              <Shield size={22} />
            </div>
            <div className="flex-1">
              <p className="font-black text-[hsl(160,10%,20%)]">Permissions</p>
              <p className="text-sm text-[hsl(155,15%,50%)] font-medium">Camera and GPS access tips</p>
            </div>
            <ChevronRight size={20} className="text-[hsl(155,15%,60%)]" />
          </button>

          {/* Support */}
          <button
            onClick={() => setOpenModal("support")}
            className="w-full flex items-center gap-5 p-5 hover:bg-white/80 transition-all rounded-b-[2.5rem] text-left group"
          >
            <div className="w-12 h-12 bg-[hsl(155,15%,95%)] rounded-2xl flex items-center justify-center text-[hsl(155,15%,50%)] group-hover:bg-[hsl(15,80%,65%)] group-hover:text-white transition-all">
              <CircleHelp size={22} />
            </div>
            <div className="flex-1">
              <p className="font-black text-[hsl(160,10%,20%)]">Help & Support</p>
              <p className="text-sm text-[hsl(155,15%,50%)] font-medium">How to use RescuePaws</p>
            </div>
            <ChevronRight size={20} className="text-[hsl(155,15%,60%)]" />
          </button>
        </div>

        {/* Sign Out */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-xl shadow-black/5 divide-y divide-[hsl(155,15%,90%)] mb-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-5 p-5 hover:bg-red-50 transition-all rounded-t-[2.5rem] rounded-b-[2.5rem] text-left group"
          >
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
              <LogOut size={22} />
            </div>
            <div className="flex-1">
              <p className="font-black text-red-500 text-lg">Sign Out</p>
              <p className="text-sm text-red-400 font-medium">{user?.email}</p>
            </div>
          </button>
        </div>

        {/* Danger Zone */}
        <button
          onClick={() => { setOpenModal("delete"); setDeleteError(""); setDeletePw(""); }}
          className="w-full text-center text-sm text-[hsl(155,15%,60%)] hover:text-red-500 transition-colors font-bold py-4"
        >
          Delete my account
        </button>
      </motion.div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {openModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpenModal(null)} />

            {/* Change Password Modal */}
            {openModal === "password" && (
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.95 }}
                className="bg-[hsl(45,30%,98%)] rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 relative z-10"
              >
                <button onClick={() => setOpenModal(null)} className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white flex items-center justify-center text-[hsl(155,15%,50%)] hover:bg-red-50 hover:text-red-500 transition">
                  <X size={18} />
                </button>
                <div className="w-12 h-12 bg-[hsl(15,80%,65%)] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[hsl(15,80%,65%)]/20">
                  <Lock className="text-white" size={22} />
                </div>
                <h2 className="font-display text-3xl font-black text-[hsl(160,10%,20%)] mb-1">Change Password</h2>
                <p className="text-sm text-[hsl(155,15%,50%)] mb-6 font-medium">Enter your current password to continue.</p>

                {pwSuccess ? (
                  <div className="flex flex-col items-center gap-3 py-6">
                    <CheckCircle2 className="text-emerald-500" size={48} />
                    <p className="font-black text-emerald-600 text-lg">Password updated!</p>
                  </div>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    {pwError && (
                      <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-2">
                        <AlertTriangle size={14} /> {pwError}
                      </div>
                    )}
                    <div className="relative">
                      <input
                        type={showCurrent ? "text" : "password"}
                        placeholder="Current password"
                        value={currentPw}
                        onChange={e => setCurrentPw(e.target.value)}
                        required
                        className="w-full px-5 py-4 rounded-2xl border border-[hsl(155,15%,90%)] focus:outline-none focus:ring-4 focus:ring-[hsl(15,80%,65%)]/10 focus:border-[hsl(15,80%,65%)] bg-white text-[hsl(160,10%,20%)] font-medium pr-12"
                      />
                      <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(155,15%,60%)]">
                        {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showNew ? "text" : "password"}
                        placeholder="New password (min. 6 chars)"
                        value={newPw}
                        onChange={e => setNewPw(e.target.value)}
                        required
                        className="w-full px-5 py-4 rounded-2xl border border-[hsl(155,15%,90%)] focus:outline-none focus:ring-4 focus:ring-[hsl(15,80%,65%)]/10 focus:border-[hsl(15,80%,65%)] bg-white text-[hsl(160,10%,20%)] font-medium pr-12"
                      />
                      <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(155,15%,60%)]">
                        {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={pwLoading}
                      className="w-full bg-[hsl(160,10%,20%)] hover:bg-[hsl(160,10%,30%)] text-white font-black py-4 rounded-2xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {pwLoading ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Updating…</> : "Update Password"}
                    </button>
                  </form>
                )}
              </motion.div>
            )}

            {/* Delete Account Modal */}
            {openModal === "delete" && (
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.95 }}
                className="bg-[hsl(45,30%,98%)] rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 relative z-10"
              >
                <button onClick={() => setOpenModal(null)} className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white flex items-center justify-center text-[hsl(155,15%,50%)] hover:bg-red-50 hover:text-red-500 transition">
                  <X size={18} />
                </button>
                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
                  <AlertTriangle className="text-red-500" size={22} />
                </div>
                <h2 className="font-display text-3xl font-black text-[hsl(160,10%,20%)] mb-1">Delete Account</h2>
                <p className="text-sm text-red-500 font-bold mb-6">This is permanent. All your data will be lost.</p>
                <form onSubmit={handleDeleteAccount} className="space-y-4">
                  {deleteError && (
                    <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-2">
                      <AlertTriangle size={14} /> {deleteError}
                    </div>
                  )}
                  <input
                    type="password"
                    placeholder="Enter your password to confirm"
                    value={deletePw}
                    onChange={e => setDeletePw(e.target.value)}
                    required
                    className="w-full px-5 py-4 rounded-2xl border border-red-200 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-400 bg-white text-[hsl(160,10%,20%)] font-medium"
                  />
                  <button
                    type="submit"
                    disabled={deleteLoading}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deleteLoading ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Deleting…</> : "Delete My Account"}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Support Modal */}
            {openModal === "support" && (
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.95 }}
                className="bg-[hsl(45,30%,98%)] rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 relative z-10"
              >
                <button onClick={() => setOpenModal(null)} className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white flex items-center justify-center text-[hsl(155,15%,50%)] hover:bg-red-50 hover:text-red-500 transition">
                  <X size={18} />
                </button>
                <div className="w-12 h-12 bg-[hsl(15,80%,65%)] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[hsl(15,80%,65%)]/20">
                  <CircleHelp className="text-white" size={22} />
                </div>
                <h2 className="font-display text-3xl font-black text-[hsl(160,10%,20%)] mb-4">Help & Tips</h2>
                <div className="space-y-3">
                  {[
                    { icon: "📍", title: "Allow GPS", desc: "Tap 'Allow' when your browser asks to use location. This pins your report to the right spot." },
                    { icon: "📷", title: "Add a Photo", desc: "Photos help rescuers find the animal faster. Images are auto-compressed for faster upload." },
                    { icon: "🗺️", title: "Tap the Map", desc: "Tap anywhere on the map to drop a pin and report a stray animal at that location." },
                    { icon: "✅", title: "Mark as Rescued", desc: "After an animal is helped, open its report and tap 'Mark as Rescued' to update the community." },
                  ].map(tip => (
                    <div key={tip.title} className="flex items-start gap-4 bg-white/70 rounded-2xl p-4">
                      <span className="text-2xl mt-0.5">{tip.icon}</span>
                      <div>
                        <p className="font-black text-[hsl(160,10%,20%)] text-sm">{tip.title}</p>
                        <p className="text-xs text-[hsl(155,15%,50%)] font-medium mt-0.5">{tip.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
