"use client";

import { motion } from "framer-motion";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-[hsl(155,15%,92%)] ${className}`}>
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
      />
    </div>
  );
}

export function ReportCardSkeleton() {
  return (
    <div className="w-full p-4 bg-white/50 rounded-3xl border border-[hsl(155,15%,95%)] flex items-start gap-4">
      <Skeleton className="w-14 h-14 rounded-2xl flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-4 w-20 rounded-full" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
        <Skeleton className="h-3 w-2/3 rounded-full" />
      </div>
    </div>
  );
}
