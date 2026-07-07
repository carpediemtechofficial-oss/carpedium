"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [cursorType, setCursorType] = useState<"default" | "hover" | "card">("default");
  const [hoverLabel, setHoverLabel] = useState("");
  const [visible, setVisible] = useState(false);

  // Mouse coordinates
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth spring configuration for the lagging outer ring
  const ringX = useSpring(mouseX, { stiffness: 220, damping: 24 });
  const ringY = useSpring(mouseY, { stiffness: 220, damping: 24 });

  useEffect(() => {
    // 1. Feature detection: disable on mobile/touch devices or reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    
    if (prefersReducedMotion || isTouchDevice) {
      return;
    }

    // Enable custom cursor styles in document body
    document.body.classList.add("custom-cursor-active");

    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const handleMouseLeaveWindow = () => {
      setVisible(false);
    };

    const handleMouseEnterWindow = () => {
      setVisible(true);
    };

    // Track hovered elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Explore Card Hover
      const cardParent = target.closest('[data-hoverable="card"]');
      if (cardParent) {
        setCursorType("card");
        setHoverLabel(cardParent.getAttribute("data-cursor-label") || "VIEW");
        return;
      }

      // Standard link/button hover
      const isInteractive = target.closest("a, button, [role='button'], summary");
      if (isInteractive) {
        setCursorType("hover");
        return;
      }

      setCursorType("default");
    };

    window.addEventListener("mousemove", moveCursor, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeaveWindow);
    document.addEventListener("mouseenter", handleMouseEnterWindow);
    document.addEventListener("mouseover", handleMouseOver);

    return () => {
      document.body.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseleave", handleMouseLeaveWindow);
      document.removeEventListener("mouseenter", handleMouseEnterWindow);
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, [visible, mouseX, mouseY]);

  if (!visible) return null;

  return (
    <>
      {/* Outer Ring */}
      <motion.div
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: cursorType === "card" ? 76 : cursorType === "hover" ? 44 : 28,
          height: cursorType === "card" ? 76 : cursorType === "hover" ? 44 : 28,
          backgroundColor: cursorType === "card" ? "rgba(20, 184, 166, 0.12)" : "rgba(20, 184, 166, 0)",
          borderColor: cursorType === "card" ? "rgba(20, 184, 166, 0.45)" : "var(--color-primary)",
        }}
        transition={{ type: "tween", ease: "backOut", duration: 0.3 }}
        className="fixed top-0 left-0 rounded-full border-[1.5px] pointer-events-none z-[99999] flex items-center justify-center overflow-hidden"
      >
        {/* VIEW / EXPLORE label inside ring on cards */}
        {cursorType === "card" && (
          <motion.span
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            className="font-mono text-[8px] font-bold uppercase tracking-wider text-primary-strong"
          >
            {hoverLabel}
          </motion.span>
        )}
      </motion.div>

      {/* Inner Dot */}
      <motion.div
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: cursorType === "card" ? 0 : cursorType === "hover" ? 1.5 : 1,
          backgroundColor: cursorType === "hover" ? "var(--color-primary-light)" : "var(--color-primary-strong)",
        }}
        className="fixed top-0 left-0 h-2 w-2 rounded-full pointer-events-none z-[99999]"
      />
    </>
  );
}
