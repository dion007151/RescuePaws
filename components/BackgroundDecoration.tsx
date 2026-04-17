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
    duration: `${15 + (i % 10)}s`,
    delay: `${-i * 3.5}s`,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Soft Cloud Blobs */}
      <div 
        className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-[hsl(155,15%,92%)] rounded-full blur-[120px] opacity-40 animate-fluid-blob"
        style={{ animationDuration: '25s' }}
      />
      <div 
        className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] bg-[hsl(15,80%,92%)] rounded-full blur-[120px] opacity-40 animate-fluid-blob"
        style={{ animationDuration: '30s', animationDirection: 'reverse' }}
      />
      <div 
        className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-[hsl(200,30%,94%)] rounded-full blur-[100px] opacity-30 animate-fluid-blob"
        style={{ animationDuration: '22s', animationDelay: '-10s' }}
      />

      {/* Floating Animal Stream */}
      {decorationItems.map((item, i) => (
        <div
          key={i}
          className="absolute animate-float-animal"
          style={{
            left: item.left,
            top: item.top,
            "--float-duration": item.duration,
            "--float-delay": item.delay,
          } as React.CSSProperties}
        >
          <div className={`${item.icon.match(/dog|cat|lion|panda/i) ? 'animate-wiggle' : ''} ${item.size} select-none`}>
            {item.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
