"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CircuitShield() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shieldLeftRef = useRef<SVGPathElement>(null);
  const shieldRightRef = useRef<SVGPathElement>(null);
  const coreRef = useRef<SVGGElement>(null);
  
  const trace1Ref = useRef<SVGPathElement>(null);
  const trace2Ref = useRef<SVGPathElement>(null);
  const trace3Ref = useRef<SVGPathElement>(null);
  const glowCoreRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    // 1. Initial State (Clean technical alignment, subtle off-center scale for entry)
    gsap.set([shieldLeftRef.current, shieldRightRef.current], { opacity: 0, scale: 0.95, transformOrigin: "center center" });
    gsap.set(coreRef.current, { opacity: 0, scale: 0.8, transformOrigin: "center center" });
    
    const traces = [trace1Ref.current, trace2Ref.current, trace3Ref.current];
    traces.forEach(t => {
      if (t) {
        const length = t.getTotalLength();
        gsap.set(t, { strokeDasharray: length, strokeDashoffset: length, opacity: 0.2 });
      }
    });

    // 2. Simple, optimized entry animation (300-500ms feel)
    const tl = gsap.timeline();
    tl.to([shieldLeftRef.current, shieldRightRef.current], {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      ease: "power2.out",
    })
    .to(coreRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.4,
      ease: "back.out(1.5)",
    }, "-=0.25")
    .to(traces, {
      strokeDashoffset: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.1,
      ease: "power1.out"
    }, "-=0.2");

    // 3. Subtle ambient infinite breathing glow on the core (extremely low CPU overhead, no JS triggers)
    gsap.to(glowCoreRef.current, {
      opacity: 0.5,
      scale: 1.4,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[340px] aspect-square flex items-center justify-center z-10"
    >
      {/* Background Radial Glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/10 to-accent/20 opacity-30 blur-[60px] scale-95 pointer-events-none" />

      {/* SVG Canvas */}
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_4px_16px_rgba(20,184,166,0.1)]"
      >
        <defs>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="50%" stopColor="var(--color-primary-light)" />
            <stop offset="100%" stopColor="var(--color-accent)" />
          </linearGradient>
          
          <radialGradient id="coreGlowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-primary-light)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. Left Shield Frame Fragment */}
        <path
          ref={shieldLeftRef}
          d="M 100 25 L 45 50 L 45 130 L 100 165"
          stroke="url(#shieldGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 2. Right Shield Frame Fragment */}
        <path
          ref={shieldRightRef}
          d="M 100 25 L 155 50 L 155 130 L 100 165"
          stroke="url(#shieldGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 3. Central Core Node Assembly */}
        <g ref={coreRef}>
          {/* Inner Hexagon Core */}
          <polygon
            points="100,75 122,88 122,112 100,125 78,112 78,88"
            stroke="var(--color-primary)"
            strokeWidth="2.5"
            fill="rgba(248, 250, 252, 0.9)"
          />
          {/* Central Glow Core Dot */}
          <circle
            cx="100"
            cy="100"
            r="12"
            fill="var(--color-primary-light)"
            className="opacity-15"
          />
          <circle
            ref={glowCoreRef}
            cx="100"
            cy="100"
            r="7"
            fill="url(#coreGlowGrad)"
            opacity="0.35"
            style={{ transformOrigin: "100px 100px" }}
          />
          <circle
            cx="100"
            cy="100"
            r="4.5"
            fill="var(--color-primary-strong)"
          />
        </g>

        {/* 4. Circuit Trace 1 (Top Branch) */}
        <path
          ref={trace1Ref}
          d="M 100 75 L 100 48 L 70 34"
          stroke="var(--color-primary)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="70" cy="34" r="3" fill="var(--color-primary)" />

        {/* 5. Circuit Trace 2 (Bottom Left Branch) */}
        <path
          ref={trace2Ref}
          d="M 78 100 L 60 110 L 60 135"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="60" cy="135" r="3" fill="var(--color-accent)" />

        {/* 6. Circuit Trace 3 (Bottom Right Branch) */}
        <path
          ref={trace3Ref}
          d="M 122 100 L 140 110 L 140 135"
          stroke="var(--color-primary-light)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="140" cy="135" r="3" fill="var(--color-primary-light)" />
      </svg>
    </div>
  );
}
