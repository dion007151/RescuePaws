"use client";

import React from "react";

const ANIMALS = [
  { icon: "🐶", size: "text-7xl" },
  { icon: "🐱", size: "text-6xl" },
  { icon: "🐾", size: "text-5xl" },
  { icon: "🦴", size: "text-4xl" },
  { icon: "🐕", size: "text-7xl" },
  { icon: "🐈", size: "text-6xl" },
  { icon: "🦁", size: "text-8xl" },
  { icon: "🧸", size: "text-5xl" },
  { icon: "🐼", size: "text-7xl" },
];

export function BackgroundDecoration() {
  // Generate a random-ish set of animals for the background
  const decorationItems = Array.from({ length: 12 }).map((_, i) => ({
    ...ANIMALS[i % ANIMALS.length],
    left: `${(i * 15 + 5) % 95}%`,
    top: `${(i * 23 + 10) % 90}%`,
    duration: `${25 + (i % 15)}s`, // Slower for more premium feel
    delay: `${-i * 5.2}s`,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[radial-gradient(circle_at_top_right,hsl(155,15%,96%),transparent_50%),radial-gradient(circle_at_bottom_left,hsl(15,80%,96%),transparent_50%)]">
      {/* Sophisticated Fluid Blobs */}
      <div 
        className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-[hsl(155,20%,90%)] rounded-full blur-[140px] opacity-40 animate-fluid-blob mix-blend-multiply"
        style={{ animationDuration: '35s' }}
      />
      <div 
        className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-[hsl(15,80%,90%)] rounded-full blur-[140px] opacity-40 animate-fluid-blob mix-blend-multiply"
        style={{ animationDuration: '45s', animationDirection: 'reverse' }}
      />
      <div 
        className="absolute top-[20%] left-[30%] w-[35%] h-[35%] bg-[hsl(200,30%,92%)] rounded-full blur-[120px] opacity-20 animate-fluid-blob mix-blend-screen"
        style={{ animationDuration: '28s', animationDelay: '-12s' }}
      />

      {/* Floating Animal Stream - Subtle & Premium */}
      {decorationItems.map((item, i) => (
        <div
          key={i}
          className="absolute animate-float-animal opacity-[0.15] grayscale contrast-125"
          style={{
            left: item.left,
            top: item.top,
            "--float-duration": item.duration,
            "--float-delay": item.delay,
          } as React.CSSProperties}
        >
          <div className={`${item.icon.match(/dog|cat|lion|panda/i) ? 'animate-wiggle' : ''} ${item.size} select-none filter blur-[0.5px]`}>
            {item.icon}
          </div>
        </div>
      ))}

      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
