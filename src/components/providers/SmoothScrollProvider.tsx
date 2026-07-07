import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { initSmoothScroll, getLenis } from "@/lib/scroll";

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const cleanup = initSmoothScroll();

    // Dynamically resize Lenis whenever document height changes
    const lenis = getLenis();
    let observer: ResizeObserver | null = null;
    if (lenis) {
      observer = new ResizeObserver(() => {
        lenis.resize();
      });
      observer.observe(document.body);
    }

    return () => {
      if (observer) observer.disconnect();
      cleanup();
    };
  }, []);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
