"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView, useMotionValue, useSpring } from "framer-motion";

// ─── Data ───────────────────────────────────────────────────
const TECH_PILLS = [
  { label: "Full-Stack Development", icon: "⚡" },
  { label: "Artificial Intelligence", icon: "🤖" },
  { label: "Cloud Computing", icon: "☁️" },
  { label: "Cybersecurity", icon: "🛡️" },
];

const STATS = [
  { value: 95, suffix: "%", label: "Placement Success" },
  { label: "1:1 Expert Mentorship", raw: "1:1" },
  { value: 12, suffix: "+", label: "Production Projects" },
];

// ─── CountUp Hook ─────────────────────────────────────────
function useCountUp(target: number, duration = 1.8) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return { count, ref };
}

// ─── StatItem ─────────────────────────────────────────────
function StatItem({ stat }: { stat: (typeof STATS)[0] }) {
  const { count, ref } = useCountUp(stat.value ?? 0);
  return (
    <div className="text-left">
      <p className="font-display text-3xl sm:text-4xl font-bold text-ink tracking-tight">
        {stat.raw ? (
          <span>{stat.raw}</span>
        ) : (
          <span ref={ref}>
            {count}
            {stat.suffix}
          </span>
        )}
      </p>
      <p className="font-mono text-[9px] uppercase tracking-wider text-ink-dim mt-1">
        {stat.label}
      </p>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────
import { useSettings } from "@/hooks/useSettings";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettings();

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-[92vh] flex items-center justify-center overflow-x-clip bg-white pt-32 pb-32"
      aria-label="Welcome to Carpediem Tech Innovations"
    >
      {/* ── Background ──────────────────────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        {/* Existing hero video (very subtle) */}
        <video
          autoPlay muted loop playsInline
          className="absolute min-w-full min-h-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover opacity-[0.05] filter grayscale"
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>

        {/* Radial gradient glow */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-gradient-radial from-teal/10 via-teal/[0.04] to-transparent blur-[80px]" />

        {/* Corner accent glows */}
        <div className="absolute top-1/3 -left-24 h-[350px] w-[350px] rounded-full bg-primary/10 blur-[100px] animate-float-1" />
        <div className="absolute bottom-1/4 -right-24 h-[400px] w-[400px] rounded-full bg-accent/80 opacity-[0.06] blur-[120px] animate-float-2" />

        {/* Technical grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(20,184,166,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,184,166,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Diagonal shimmer line */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(20,184,166,0.6) 0%, transparent 50%, rgba(20,184,166,0.3) 100%)",
          }}
        />
      </div>

      {/* ── Floating Particles ──────────────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <svg className="w-full h-full opacity-50">
          <circle cx="8%"  cy="18%" r="2"   fill="var(--color-primary)"       className="animate-pulse" />
          <circle cx="88%" cy="12%" r="3.5" fill="var(--color-accent)"        className="animate-pulse" style={{ animationDelay: "0.8s" }} />
          <circle cx="45%" cy="82%" r="2.5" fill="var(--color-primary-light)" className="animate-pulse" style={{ animationDelay: "1.4s" }} />
          <circle cx="72%" cy="72%" r="3"   fill="var(--color-primary-strong)"className="opacity-30 animate-bounce" style={{ animationDuration: "11s" }} />
          <circle cx="18%" cy="60%" r="2"   fill="var(--color-accent)"        className="opacity-25 animate-bounce" style={{ animationDuration: "9s" }} />
          <circle cx="60%" cy="10%" r="1.5" fill="var(--color-primary)"       className="animate-pulse" style={{ animationDelay: "2s" }} />
          <circle cx="92%" cy="55%" r="2"   fill="var(--color-primary-light)" className="animate-pulse" style={{ animationDelay: "0.4s" }} />
        </svg>
      </div>

      {/* ── Main Grid ───────────────────────────────────── */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">

        {/* ── Left Column ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 text-left flex flex-col"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="inline-flex items-center gap-2 rounded-full border border-teal/20 bg-teal/5 px-4 py-1.5 w-fit mb-7 shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary-strong">
              {settings.hero.eyebrow || "Coimbatore's Premier Software Engineering Academy"}
            </span>
          </motion.div>

          {/* Headline */}
          <h1
            className="font-display font-bold leading-[1.05] tracking-tight"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4.2rem)" }}
          >
            <motion.span
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="block text-ink pb-1"
            >
              Build What's Next.
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.12, ease: "easeOut" }}
              className="block text-gradient pb-2"
            >
              The Skills Behind Tomorrow's Technology.
            </motion.span>
          </h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.26 }}
            className="mt-5 max-w-xl text-base sm:text-[17px] text-ink-dim leading-relaxed"
          >
            {settings.hero.subtitle ||
              "Master Full-Stack Development, Artificial Intelligence, Cloud Computing, and Cybersecurity through project-based learning, expert mentorship, internships, and industry-recognized certifications."}
          </motion.p>

          {/* Technology Pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.38 }}
            className="mt-6 flex flex-wrap gap-2"
          >
            {TECH_PILLS.map((pill, i) => (
              <motion.span
                key={pill.label}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.42 + i * 0.07, duration: 0.3 }}
                whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(20,184,166,0.2)" }}
                className="inline-flex items-center gap-1.5 rounded-full border border-teal/20 bg-teal/5 px-3.5 py-1.5 text-xs font-mono font-bold text-primary-strong shadow-sm cursor-default transition-colors hover:bg-teal/10 hover:border-teal/40"
              >
                <span className="text-sm">{pill.icon}</span>
                {pill.label}
              </motion.span>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 flex flex-wrap gap-3 items-center"
          >
            {/* Primary */}
            <motion.a
              href="#courses"
              whileHover={{ y: -2, boxShadow: "0 12px 30px rgba(20,184,166,0.3)" }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 font-mono text-[11px] font-bold uppercase tracking-wider text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary-light"
            >
              Explore Courses
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M5 12h14m-7-7 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.a>

            {/* Secondary */}
            <motion.a
              href="#contact"
              whileHover={{ y: -2, backgroundColor: "rgba(20,184,166,0.05)" }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-transparent px-6 py-3.5 font-mono text-[11px] font-bold uppercase tracking-wider text-primary-strong transition-all"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.66A2 2 0 012 3h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 10.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Talk to an Advisor
            </motion.a>
          </motion.div>

          {/* Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.64 }}
            className="mt-10 pt-8 border-t border-teal/10 grid grid-cols-3 gap-4 items-start"
          >
            {STATS.map((stat) => (
              <StatItem key={stat.label} stat={stat} />
            ))}
          </motion.div>
        </motion.div>

        {/* ── Right Column: Video ─────────────────────── */}
        <div className="lg:col-span-5 relative flex items-center justify-center min-h-[350px] w-full lg:pr-8 xl:pr-12">
          {/* Background glow blob */}
          <div className="absolute h-72 w-72 rounded-full bg-gradient-to-tr from-primary to-accent opacity-[0.14] blur-[70px] z-0" />

          {/* Floating ring decoration */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute h-[340px] w-[340px] rounded-full border border-teal/8 border-dashed z-0"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute h-[280px] w-[280px] rounded-full border border-teal/5 z-0"
          />

          {/* Video card */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            animate-float-1
            whileHover={{ scale: 1.02, y: -6 }}
            style={{
              animation: "float1 6s ease-in-out infinite",
            }}
            className="relative z-10 w-full max-w-[460px] aspect-video rounded-2xl overflow-hidden border border-teal/25 bg-slate-950/90 shadow-[0_30px_80px_-20px_rgba(20,184,166,0.25)] p-1.5 cursor-pointer"
          >
            {/* Glossy sheen overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.04] via-transparent to-teal/[0.03] pointer-events-none z-20 rounded-2xl" />
            {/* Glow edge */}
            <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_30px_rgba(20,184,166,0.08)] pointer-events-none z-20" />

            <video
              autoPlay muted loop playsInline
              className="w-full h-full rounded-xl object-cover"
            >
              <source src="/hero-bg.mp4" type="video/mp4" />
            </video>

            {/* Corner badges */}
            <div className="absolute bottom-4 left-4 z-30 flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-sm border border-white/10 px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse" />
              <span className="font-mono text-[9px] uppercase text-white/80 font-bold">Live Sessions</span>
            </div>
            <div className="absolute top-4 right-4 z-30 rounded-full bg-teal px-2.5 py-1 font-mono text-[9px] uppercase text-slate-950 font-bold shadow-lg">
              Coimbatore
            </div>
          </motion.div>

          {/* Floating stat card — top left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="absolute -left-4 top-12 z-20 rounded-xl border border-teal/15 bg-white/90 backdrop-blur-sm shadow-lg px-4 py-3 hidden lg:block"
          >
            <p className="font-display text-lg font-bold text-teal">7,500+</p>
            <p className="font-mono text-[9px] uppercase tracking-wider text-slate-400">Students Enrolled</p>
          </motion.div>

          {/* Floating stat card — bottom right */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.85, duration: 0.5 }}
            className="absolute -right-4 bottom-12 z-20 rounded-xl border border-teal/15 bg-white/90 backdrop-blur-sm shadow-lg px-4 py-3 hidden lg:block"
          >
            <p className="font-display text-lg font-bold text-teal">4.8 ★</p>
            <p className="font-mono text-[9px] uppercase tracking-wider text-slate-400">Avg. Rating</p>
          </motion.div>
        </div>
      </div>

      {/* ── Scroll Indicator ──────────────────────────── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 opacity-50">
        <span className="font-mono text-[8px] uppercase tracking-widest text-ink-dim">Scroll</span>
        <div className="h-6 w-3.5 rounded-full border border-ink-dim/40 flex justify-center p-1">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="h-1 w-1 rounded-full bg-primary-strong"
          />
        </div>
      </div>
    </section>
  );
}
