"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 250, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(pointer: coarse)").matches);
    };
    checkMobile();

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsHovered(
        window.getComputedStyle(target).cursor === "pointer" ||
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") !== null ||
        target.closest("a") !== null
      );
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    
    // Add class to body to hide real cursor
    if (!window.matchMedia("(pointer: coarse)").matches) {
       document.documentElement.classList.add("custom-cursor-active");
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, [mouseX, mouseY]);

  if (isMobile) return null;

  return (
    <motion.div
      style={{
        left: smoothX,
        top: smoothY,
        x: "-50%",
        y: "-50%",
      }}
      className="fixed pointer-events-none z-[9999] flex items-center justify-center pointer-events-none"
    >
      {/* Outer Glow */}
      <motion.div
        animate={{
          scale: isHovered ? 1.5 : 1,
          rotate: isHovered ? 45 : 0,
        }}
        className="absolute w-12 h-12 bg-[hsl(15,80%,65%)]/10 rounded-full blur-xl"
      />
      
      {/* The Paw Cursor */}
      <motion.div
        animate={{
          scale: isHovered ? 1.2 : 1,
          rotate: isHovered ? 12 : -5,
        }}
        className="relative text-3xl drop-shadow-lg filter"
      >
        <span role="img" aria-label="paw">🐾</span>
      </motion.div>
    </motion.div>
  );
}
