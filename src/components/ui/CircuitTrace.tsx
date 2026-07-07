"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export type CircuitStage = {
  label: string;
};

type CircuitTraceProps = {
  id: string;
  stages: CircuitStage[];
  colorFrom: string;
  colorTo: string;
};

export default function CircuitTrace({
  id,
  stages,
  colorFrom,
  colorTo,
}: CircuitTraceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const glowPathRef = useRef<SVGPathElement>(null);
  const [activeIndex, useStateIndex] = useState(-1);
  const activeIndexRef = useRef(-1); 
  const setActiveIndex = (val: number) => {
    useStateIndex(val);
    activeIndexRef.current = val;
  };

  const width = 1000;
  const height = 80;
  const padding = 40;
  const step = (width - padding * 2) / (stages.length - 1);
  const points = stages.map((_, i) => padding + step * i);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const path = pathRef.current;
    const glowPath = glowPathRef.current;
    const container = containerRef.current;
    if (!path || !glowPath || !container) return;

    if (prefersReducedMotion) {
      setActiveIndex(stages.length - 1);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const length = path.getTotalLength();
    gsap.set([path, glowPath], { strokeDasharray: length, strokeDashoffset: length });

    const ctx = gsap.context(() => {
      gsap.to([path, glowPath], {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top 80%",
          end: "bottom 55%",
          scrub: 0.6,
          onUpdate: (self) => {
            const idx = Math.floor(self.progress * stages.length);
            setActiveIndex(Math.min(idx, stages.length - 1));
          },
        },
      });
    }, container);

    return () => ctx.revert();
  }, [stages.length]);

  return (
    <div ref={containerRef} className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`grad-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colorFrom} />
            <stop offset="100%" stopColor={colorTo} />
          </linearGradient>
        </defs>

        <path
          d={`M ${padding} ${height / 2} L ${width - padding} ${height / 2}`}
          stroke="var(--color-line)"
          strokeWidth={2}
          fill="none"
        />

        {/* Glow bloom overlay */}
        <path
          ref={glowPathRef}
          d={`M ${padding} ${height / 2} L ${width - padding} ${height / 2}`}
          stroke={`url(#grad-${id})`}
          strokeWidth={6}
          opacity={0.65}
          fill="none"
          style={{ filter: "blur(4px)" }}
        />

        <path
          ref={pathRef}
          d={`M ${padding} ${height / 2} L ${width - padding} ${height / 2}`}
          stroke={`url(#grad-${id})`}
          strokeWidth={2.5}
          fill="none"
        />

        {points.map((x, i) => (
          <circle
            key={i}
            cx={x}
            cy={height / 2}
            r={i <= activeIndex ? 7 : 5}
            fill={i <= activeIndex ? colorTo : "var(--color-line)"}
            stroke={colorFrom}
            strokeWidth={1.5}
            className="transition-all duration-300"
          />
        ))}
      </svg>

      <div
        className="grid gap-2 mt-3"
        style={{ gridTemplateColumns: `repeat(${stages.length}, 1fr)` }}
      >
        {stages.map((stage, i) => (
          <p
            key={stage.label}
            className={`font-mono text-[11px] sm:text-xs uppercase tracking-wide text-center transition-colors duration-300 ${
              i <= activeIndex ? "text-primary-strong" : "text-ink-dim"
            }`}
          >
            {stage.label}
          </p>
        ))}
      </div>
    </div>
  );
}
