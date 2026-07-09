"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useSettings } from "@/hooks/useSettings";
import { renderCustomElements } from "@/editor/customElements";

// CountUp Hook for statistics
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

export default function Hero() {
  const { settings } = useSettings();
  const { count: projectCount, ref: projectRef } = useCountUp(500);
  const { count: partnerCount, ref: partnerRef } = useCountUp(100);
  const { count: yearCount, ref: yearRef } = useCountUp(10);

  return (
    <section
      id="hero"
      data-edit-id="hero-section"
      data-edit-name="Hero Section"
      data-edit-kind="section"
      className="relative min-h-screen flex items-center bg-slate-50 pt-28 pb-20 overflow-hidden"
    >
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-gradient-radial from-teal-500/10 via-transparent to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-gradient-radial from-teal-500/5 via-transparent to-transparent blur-2xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(20,184,166,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,184,166,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Content Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-50/50 px-4 py-1.5 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
              </span>
              <span 
                data-edit-id="hero-eyebrow"
                data-edit-name="Hero Eyebrow"
                data-edit-kind="text"
                data-edit-path="hero.eyebrow"
                className="font-mono text-[10px] font-bold uppercase tracking-wider text-teal-700"
              >
                {(settings.hero.eyebrow || "").trim() || "Coimbatore's Premier Software Engineering Academy"}
              </span>
            </div>

            <h1 
              data-edit-id="hero-title"
              data-edit-name="Hero Title"
              data-edit-kind="heading"
              data-edit-path="hero.title"
              className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-slate-900 tracking-tight leading-[1.1]"
            >
              {(settings.hero.title || "").trim() || "Build What's Next. The Skills Behind Tomorrow's Technology."}
            </h1>

            <p 
              data-edit-id="hero-subtitle"
              data-edit-name="Hero Subtitle"
              data-edit-kind="text"
              data-edit-path="hero.subtitle"
              className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl"
            >
              {(settings.hero.subtitle || "").trim() || "Master Full-Stack Development, Artificial Intelligence, Cloud Computing, and Cybersecurity through project-based learning, expert mentorship, internships, and industry-recognized certifications."}
            </p>

            {renderCustomElements("hero", settings.custom_elements)}

            <div className="flex flex-wrap gap-4 items-center pt-2">
              <a 
                href="#contact"
                data-edit-id="hero-cta-btn"
                data-edit-name="Hero CTA Button"
                data-edit-kind="button"
                className="inline-flex items-center justify-center rounded-lg bg-teal-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-teal-500 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                Start Your Digital Journey
              </a>
              
              {/* Delivered project counter inline */}
              <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm">
                <div className="flex -space-x-2">
                  <span className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold">👤</span>
                  <span className="w-8 h-8 rounded-full bg-teal-100 border-2 border-white flex items-center justify-center text-xs font-bold">💻</span>
                  <span className="w-8 h-8 rounded-full bg-teal-500 border-2 border-white flex items-center justify-center text-xs font-bold text-white">✓</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 leading-none">
                    <span ref={projectRef}>{projectCount}</span>+
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Projects Delivered</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Visual / Mockup) */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            <div className="relative w-full max-w-[500px] aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-2xl p-2 group hover:scale-[1.01] transition-transform">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-slate-500/5 z-0" />
              {/* Hero video preview */}
              <video
                data-edit-id="hero-video"
                data-edit-name="Hero Video"
                data-edit-kind="video"
                data-edit-path="hero.video"
                src={settings.hero.video || "/hero-bg.mp4"}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover rounded-xl z-10 relative cursor-pointer"
              />

              {/* Floating badges like Innov8 */}
              
              {/* Institution badge */}
              <div className="absolute -left-6 top-10 z-20 flex items-center gap-3 bg-white border border-slate-100 rounded-xl p-3 shadow-xl max-w-[190px]">
                <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 font-bold shrink-0">
                  🏛️
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 leading-none">
                    <span ref={partnerRef}>{partnerCount}</span>+
                  </h4>
                  <p className="text-[10px] text-slate-500 font-semibold leading-tight mt-1">Institutions Partnered</p>
                </div>
              </div>

              {/* Experience badge */}
              <div className="absolute -right-6 bottom-10 z-20 flex items-center gap-3 bg-white border border-slate-100 rounded-xl p-3 shadow-xl max-w-[190px]">
                <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 font-bold shrink-0">
                  🏆
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 leading-none">
                    <span ref={yearRef}>{yearCount}</span>+
                  </h4>
                  <p className="text-[10px] text-slate-500 font-semibold leading-tight mt-1">Years of Innovation</p>
                </div>
              </div>

              {/* MSME stamp */}
              <div className="absolute right-4 top-4 z-20 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg px-2.5 py-1 text-[10px] font-mono font-bold text-slate-700 shadow-sm flex items-center gap-1.5 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                MSME REGISTERED
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
