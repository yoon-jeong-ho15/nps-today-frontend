import React from "react";

export function StockChartBackground({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none -z-10 ${className}`}
      aria-hidden="true"
    >
      {/* Radiant ambient glow spheres */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-linear-to-b from-amber-500/15 via-yellow-500/10 to-transparent dark:from-amber-500/20 dark:via-yellow-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/4 -left-40 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-1/3 w-[600px] h-[400px] bg-amber-500/10 dark:bg-amber-600/10 rounded-full blur-3xl" />

      {/* Subtle Financial Coordinate Grid Pattern */}
      <svg
        className="absolute inset-0 h-full w-full stroke-foreground/[0.04] [mask-image:radial-gradient(100%_100%_at_top_center,white,transparent_85%)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="stock-grid-pattern"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <path d="M 48 0 L 0 0 0 48" fill="none" strokeWidth="1" />
            <circle cx="0" cy="0" r="1.5" className="fill-foreground/[0.08]" />
          </pattern>
          <linearGradient id="chart-line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
            <stop offset="35%" stopColor="#eab308" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#10b981" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" strokeWidth="0" fill="url(#stock-grid-pattern)" />
      </svg>

      {/* Stylized Abstract Stock Trend Lines in the background */}
      <svg
        className="absolute top-20 left-0 right-0 w-full h-[480px] opacity-40 dark:opacity-30 overflow-visible"
        viewBox="0 0 1200 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d="M0 320 Q 200 280, 350 310 T 650 200 T 900 140 T 1200 60"
          stroke="url(#chart-line-gradient)"
          strokeWidth="3"
          strokeDasharray="6 6"
        />
        <path
          d="M0 350 C 250 340, 450 260, 700 230 C 950 200, 1050 110, 1200 90"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-amber-500/30 dark:text-amber-400/30"
        />
        {/* Glowing Indicator Dots */}
        <circle cx="650" cy="200" r="4" className="fill-amber-500 animate-ping" />
        <circle cx="650" cy="200" r="3" className="fill-amber-500" />
        <circle cx="900" cy="140" r="4" className="fill-emerald-500" />
        <circle cx="1200" cy="60" r="5" className="fill-emerald-400" />
      </svg>
    </div>
  );
}
