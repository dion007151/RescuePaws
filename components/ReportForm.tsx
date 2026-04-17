"use client";

import { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { compressImage } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, MapPin, Loader2, Dog, Cat, PawPrint, Heart, Send, CheckCircle2 } from "lucide-react";
import Image from "next/image";

interface ReportFormProps {
  lat: number;
  lng: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReportForm({ lat, lng, onClose, onSuccess }: ReportFormProps) {
  const { user, profile } = useAuth();
  const [animalType, setAnimalType] = useState<"dog" | "cat" | "other">("dog");
  const [condition, setCondition] = useState<"injured" | "hungry" | "sick">("hungry");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "recording" | "success">("idle");
  const [error, setError] = useState("");

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      setError("User profile not found. Please log in again.");
      return;
    }
    if (!description.trim()) {
      setError("Please add a little description.");
      return;
    }
    setSubmitting(true);
    setStatus("uploading");
    setError("");

    try {
      let imageUrl = "";
      if (imageFile) {
        let readyFile: File = imageFile;
        
        try {
          setCompressing(true);
          readyFile = await compressImage(imageFile);
        } catch (compressErr) {
          console.warn("Image optimization failed, proceeding with original file:", compressErr);
          readyFile = imageFile;
        } finally {
          setCompressing(false);
        }
        
        const storageRef = ref(storage, `reports/${Date.now()}_${readyFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, readyFile);

        const uploadPromise = new Promise<string>((resolve, reject) => {
          setProgress(5);
          
          // Safety timeout: 30 seconds
          const timeout = setTimeout(() => {
            uploadTask.cancel();
            reject(new Error("Upload timed out. Is Firebase Storage configured? Check CORS."));
          }, 30000);

          uploadTask.on(
            "state_changed",
            (snapshot) => {
              if (snapshot.totalBytes > 0) {
                const p = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                setProgress(Math.max(5, p));
              }
            },
            (err) => {
              clearTimeout(timeout);
              reject(err);
            },
            async () => {
              clearTimeout(timeout);
              setProgress(100);
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            }
          );
        });

        imageUrl = await uploadPromise;
      }

      setStatus("recording");
      await addDoc(collection(db, "reports"), {
        userId: user.uid,
        reporterName: profile?.fullName || "Anonymous Rescuer",
        reporterPhone: profile?.phoneNumber || "",
        animalType,
        condition,
        description: description.trim(),
        imageUrl,
        latitude: lat,
        longitude: lng,
        status: "pending",
        createdAt: Timestamp.now(),
      });

      setStatus("success");
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (err: any) {
      console.error("Submission error:", err);
      setStatus("idle");
      setSubmitting(false);
      
      // Detailed Firebase Storage error mapping
      if (err.message?.includes("timed out")) {
        setError("Upload timed out. This often happens due to a missing CORS policy or poor connection.");
      } else if (err.code === "storage/unauthorized") {
        setError("Firebase Storage rules are blocking this upload. Please set them to public.");
      } else if (err.code === "storage/canceled") {
        setError("Upload was canceled. Please try again.");
      } else if (err.code === "storage/unknown") {
        setError("A network or CORS error occurred. Check browser console for details.");
      } else if (!storage) {
        setError("Firebase Storage is not initialized in your project.");
      } else {
        setError(`Upload failed: ${err.message || "Unknown error"}`);
      }
    } finally {
      if (status !== "success") {
        setSubmitting(false);
      }
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.95 }}
        className="bg-[hsl(45,30%,98%)] rounded-[2.5rem] shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col relative z-20 border border-white/50"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[hsl(15,80%,65%)] rounded-xl flex items-center justify-center shadow-lg shadow-[hsl(15,80%,65%)]/20">
              <PawPrint className="text-white" size={20} />
            </div>
            <div>
              <h2 className="font-display text-2xl font-black text-[hsl(160,10%,20%)]">New Report</h2>
              <div className="flex items-center gap-1.5 text-[hsl(155,15%,50%)]">
                <MapPin size={10} />
                <p className="text-[10px] font-black tracking-widest uppercase">
                  {lat.toFixed(4)}, {lng.toFixed(4)}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-10 h-10 rounded-full bg-white hover:bg-[hsl(155,15%,95%)] flex items-center justify-center text-[hsl(155,15%,50%)] transition shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
              {error}
            </motion.div>
          )}

          {/* Animal Type */}
          <div>
            <label className="block text-xs font-black uppercase tracking-[0.2em] text-[hsl(155,15%,50%)] mb-3 ml-1">
              What kind of animal?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["dog", "cat", "other"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAnimalType(type)}
                  className={`py-3 rounded-[1.5rem] border-2 font-black text-[10px] uppercase tracking-wider transition-all flex flex-col items-center gap-2 ${
                    animalType === type
                      ? "border-[hsl(15,80%,65%)] bg-[hsl(15,80%,98%)] text-[hsl(15,80%,65%)] shadow-md translate-y-[-2px]"
                      : "border-[hsl(155,15%,95%)] bg-white text-[hsl(155,15%,50%)] hover:border-[hsl(155,15%,90%)]"
                  }`}
                >
                  <span className="text-2xl">
                    {type === "dog" ? <Dog size={24} /> : type === "cat" ? <Cat size={24} /> : <PawPrint size={24} />}
                  </span>
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-xs font-black uppercase tracking-[0.2em] text-[hsl(155,15%,50%)] mb-3 ml-1">
              How are they doing?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["injured", "hungry", "sick"] as const).map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => setCondition(cond)}
                  className={`py-3 rounded-[1.5rem] border-2 font-black text-[10px] uppercase tracking-wider transition-all ${
                    condition === cond
                      ? "border-[hsl(15,80%,65%)] bg-[hsl(15,80%,98%)] text-[hsl(15,80%,65%)] shadow-md translate-y-[-2px]"
                      : "border-[hsl(155,15%,95%)] bg-white text-[hsl(155,15%,50%)] hover:border-[hsl(155,15%,90%)]"
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-black uppercase tracking-[0.2em] text-[hsl(155,15%,50%)] mb-3 ml-1">
              Details
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-5 py-4 rounded-[1.5rem] border border-[hsl(155,15%,95%)] focus:outline-none focus:ring-4 focus:ring-[hsl(15,80%,65%)]/10 focus:border-[hsl(15,80%,65%)] text-[hsl(160,10%,20%)] bg-white/50 transition-all resize-none text-sm font-medium"
              placeholder="Describe the animal's situation..."
              required
              disabled={submitting}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-black uppercase tracking-[0.2em] text-[hsl(155,15%,50%)] mb-3 ml-1">
              Add a Photo
            </label>
            {imagePreview ? (
              <div className="relative group">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={400}
                  height={300}
                  className="w-full h-44 object-cover rounded-[1.5rem] shadow-lg"
                />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white rounded-full w-8 h-8 flex items-center justify-center text-xs hover:bg-black/70 transition opacity-0 group-hover:opacity-100"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="block border-2 border-dashed border-[hsl(155,15%,90%)] rounded-[1.5rem] p-8 text-center cursor-pointer hover:border-[hsl(15,80%,65%)] hover:bg-[hsl(15,80%,98%)] transition group">
                <div className="w-12 h-12 bg-[hsl(155,15%,95%)] rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-[hsl(15,80%,65%)] group-hover:text-white transition-colors">
                  <Camera size={24} />
                </div>
                <span className="text-sm text-[hsl(155,15%,50%)] font-black uppercase tracking-widest group-hover:text-[hsl(15,80%,65%)] transition-colors">Choose Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={submitting}
                />
              </label>
            )}
          </div>

          {/* Submit / Progress Section */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-500 text-white p-8 rounded-[1.5rem] flex flex-col items-center justify-center text-center gap-3 shadow-xl"
                >
                  <motion.div
                    initial={{ rotate: -20, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: "spring", damping: 10 }}
                  >
                    <CheckCircle2 size={48} />
                  </motion.div>
                  <p className="font-display text-xl font-black italic">Record confirmed!</p>
                  <p className="text-xs font-black uppercase tracking-widest opacity-80">Check the map now!</p>
                </motion.div>
              ) : (
                <motion.div key="form-actions" exit={{ opacity: 0, scale: 0.95 }}>
                  {status === "uploading" || status === "recording" ? (
                    <div className="bg-white rounded-[1.5rem] p-6 border border-[hsl(155,15%,95%)] shadow-sm space-y-4">
                      <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-[hsl(155,15%,50%)]">
                        <span>{status === "uploading" ? (compressing ? "Optimizing photo..." : "Uploading...") : "Recording on map..."}</span>
                        <span>{status === "uploading" ? `${progress}%` : "100%"}</span>
                      </div>
                      <div className="h-3 bg-[hsl(155,15%,95%)] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${status === "recording" ? 100 : progress}%` }}
                          className="h-full bg-emerald-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-[hsl(160,10%,20%)] hover:bg-[hsl(160,10%,30%)] text-white font-black py-5 rounded-[1.5rem] transition-all shadow-xl shadow-black/20 hover:shadow-black/40 hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                    >
                      <Send size={18} />
                      Submit Report
                    </button>
                  )
                  }
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
