"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

type TiltCardProps = {
  children: React.ReactNode;
  className?: string;
  cursorLabel?: string;
};

export default function TiltCard({
  children,
  className = "",
  cursorLabel = "VIEW",
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Relative cursor coordinates from -0.5 to 0.5
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Absolute cursor coordinates for the radial glow spotlight
  const glowX = useMotionValue(-500);
  const glowY = useMotionValue(-500);

  // Springs for smooth 3D rotation
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), {
    stiffness: 250,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), {
    stiffness: 250,
    damping: 22,
  });

  // Scale spring
  const scale = useSpring(hovering ? 1.025 : 1, {
    stiffness: 300,
    damping: 20,
  });

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    setReducedMotion(prefersReducedMotion);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Mouse coords relative to card
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;

    x.set(localX / width - 0.5);
    y.set(localY / height - 0.5);
    
    glowX.set(localX);
    glowY.set(localY);
  };

  const handleMouseEnter = () => {
    setHovering(true);
  };

  const handleMouseLeave = () => {
    setHovering(false);
    x.set(0);
    y.set(0);
    glowX.set(-500);
    glowY.set(-500);
  };

  // If prefers-reduced-motion is active, disable all 3D tilt effects
  if (reducedMotion) {
    return (
      <div
        ref={cardRef}
        data-hoverable="card"
        data-cursor-label={cursorLabel}
        className={`relative rounded-2xl overflow-hidden border border-teal/10 bg-white transition-all duration-300 hover:shadow-lg hover:border-primary/45 ${className}`}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-hoverable="card"
      data-cursor-label={cursorLabel}
      style={{
        rotateX,
        rotateY,
        scale,
        transformStyle: "preserve-3d",
      }}
      className={`relative rounded-2xl overflow-hidden border border-teal/10 bg-white transition-shadow duration-300 hover:shadow-xl ${className}`}
    >
      {/* Dynamic Cursor Spotlight Radial Glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(220px circle at var(--glow-x, -500px) var(--glow-y, -500px), rgba(20, 184, 166, 0.09), transparent 80%)`,
          WebkitMaskImage: "radial-gradient(circle, white, black)", // help clip borders cleanly
        }}
      />
      
      {/* CSS variable injection for the spotlight coords */}
      <div 
        style={{
          display: "contents",
          // MotionValue hooks
          "--glow-x": hovering ? `${glowX.get()}px` : "-500px",
          "--glow-y": hovering ? `${glowY.get()}px` : "-500px",
        } as React.CSSProperties}
        className="h-full w-full"
      >
        {/* Border Outer Spotlight highlight */}
        <div 
          className="absolute inset-0 pointer-events-none border border-transparent rounded-2xl"
          style={{
            background: hovering 
              ? `radial-gradient(150px circle at var(--glow-x, -500px) var(--glow-y, -500px), rgba(20, 184, 166, 0.45), transparent 80%)`
              : "none",
            WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "destination-out",
            maskComposite: "exclude",
          }}
        />
        
        {/* Render child elements in 3D perspective space */}
        <div style={{ transform: "translateZ(10px)" }} className="h-full w-full">
          {children}
        </div>
      </div>
    </motion.div>
  );
}
