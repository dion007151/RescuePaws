"use client";

import React from "react";
import { motion } from "framer-motion";
import { Dog, PawPrint } from "lucide-react";

interface LoadingDogProps {
  size?: "small" | "large";
}

export function LoadingDog({ size = "large" }: LoadingDogProps) {
  const isSmall = size === "small";

  return (
    <div className={`flex flex-col items-center justify-center ${isSmall ? "space-y-1" : "space-y-8"}`}>
      <div className={`relative ${isSmall ? "w-20 h-10" : "w-48 h-24"} flex items-center justify-center`}>
        {/* Galloping Dog */}
        <motion.div
          animate={{
            y: [0, isSmall ? -5 : -20, 0],
            rotate: [0, 10, -5, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`relative z-10 ${isSmall ? "text-white" : "text-[hsl(15,80%,65%)]"}`}
        >
          <Dog size={isSmall ? 24 : 64} strokeWidth={isSmall ? 3 : 2.5} />
        </motion.div>

        {/* Trailing Paws - only on large */}
        {!isSmall && [0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0, x: 20 }}
            animate={{
              opacity: [0, 0.4, 0],
              scale: [0.5, 1, 0.5],
              x: [-20, -100],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeOut",
            }}
            className="absolute left-1/2 top-1/2 text-[hsl(15,80%,65%)]/30"
          >
            <PawPrint size={24} />
          </motion.div>
        ))}

        {/* Speed lines */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`line-${i}`}
              animate={{
                x: [isSmall ? 40 : 100, isSmall ? -80 : -200],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 0.4,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "linear",
              }}
              className={`absolute h-[1px] ${isSmall ? "bg-white/40" : "bg-[hsl(15,80%,65%)]/20"} rounded-full`}
              style={{
                width: isSmall ? (i === 1 ? "15px" : "8px") : (i === 1 ? "40px" : "20px"),
                top: `${40 + i * 15}%`,
                right: "0",
              }}
            />
          ))}
        </div>
      </div>

      {!isSmall && (
        <div className="text-center space-y-2">
          <motion.h3 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="font-display text-xl font-black text-[hsl(160,10%,20%)] tracking-tight italic"
          >
            Rescue Mission in Progress...
          </motion.h3>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[hsl(155,15%,50%)]">
            Every second counts • Saving lives together
          </p>
        </div>
      )}
    </div>
  );
}
