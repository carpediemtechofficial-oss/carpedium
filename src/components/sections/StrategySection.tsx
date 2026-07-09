"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const STRATEGIES = [
  {
    title: "Real-World Project Integration",
    percent: 96,
    icon: "💻",
    description: "Aligning real-time tech modules with actual production deployments and codebase architectures."
  },
  {
    title: "Skill-Based Modular Curriculum",
    percent: 92,
    icon: "📚",
    description: "Breaking complex technical paths into bite-sized milestones focused on industry readiness."
  },
  {
    title: "Career Readiness & Placement Focus",
    percent: 90,
    icon: "🚀",
    description: "Mentoring students with live interviews, Resume building, and direct partner matchmaking."
  }
];

function StrategyProgressBar({ strategy, index }: { strategy: typeof STRATEGIES[0]; index: number }) {
  const barRef = useRef<HTMLDivElement>(null);
  const inView = useInView(barRef, { once: true });

  return (
    <div ref={barRef} className="space-y-3">
      <div className="flex justify-between items-center text-sm font-semibold text-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">{strategy.icon}</span>
          <span>{strategy.title}</span>
        </div>
        <span className="text-teal-600 font-mono font-bold">{strategy.percent}%</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${strategy.percent}%` } : {}}
          transition={{ duration: 1.2, delay: index * 0.15, ease: "easeOut" }}
          className="h-full bg-teal-500 rounded-full"
        />
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{strategy.description}</p>
    </div>
  );
}

export default function StrategySection() {
  return (
    <section
      id="strategy"
      data-edit-id="strategy-section"
      data-edit-name="Strategy Section"
      data-edit-kind="section"
      className="px-6 py-20 bg-slate-50"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading */}
          <div className="lg:col-span-5 space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-teal-600 font-bold">OUR STRATEGY</span>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight leading-tight">
              Driven by <span className="text-teal-600 font-black">Innovation & Outcomes</span>
            </h2>
            <p className="text-slate-600 leading-relaxed">
              We follow a learner-first strategy that blends hands-on experience with real-world industry tools. 
              Our approach ensures that learners gain practical expertise, career confidence, and the skills needed 
              to thrive in a competitive tech-driven world.
            </p>
          </div>

          {/* Right Column: Progress bars */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
            {STRATEGIES.map((strategy, idx) => (
              <StrategyProgressBar key={strategy.title} strategy={strategy} index={idx} />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
