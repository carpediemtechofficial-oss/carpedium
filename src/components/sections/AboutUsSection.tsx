"use client";

import { useSettings } from "@/hooks/useSettings";

export default function AboutUsSection() {
  const { settings } = useSettings();

  return (
    <section
      id="about"
      data-edit-id="about-section"
      data-edit-name="About Us Section"
      data-edit-kind="section"
      className="px-6 py-20 bg-white"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Image/Visual Box */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            <div className="relative w-full max-w-[400px] aspect-[4/5] rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100 flex items-center justify-center p-4">
              {/* Creative background mesh or graphic */}
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-600/20 via-transparent to-slate-100" />
              
              {/* Abstract code visual or geometric art to look highly premium */}
              <div className="relative z-10 w-full h-full border border-teal-500/20 rounded-xl bg-white/70 backdrop-blur-sm p-6 flex flex-col justify-between shadow-inner">
                <div className="space-y-2">
                  <div className="flex gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <div className="font-mono text-[10px] text-slate-500 space-y-1 mt-4">
                    <p className="text-teal-600">const partner = {"{"}</p>
                    <p className="pl-4">name: "{settings.branding.brandName}",</p>
                    <p className="pl-4">type: "Academic & Tech Innovation",</p>
                    <p className="pl-4">mission: "Build Tomorrow's Skills"</p>
                    <p className="text-teal-600">{"};"}</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="w-12 h-12 rounded-lg bg-teal-500 flex items-center justify-center text-white text-xl">
                    ⚡
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-slate-400">Status</p>
                    <p className="text-xs font-bold text-teal-600">Active Node</p>
                  </div>
                </div>
              </div>

              {/* Float Experience badge */}
              <div className="absolute -left-6 bottom-10 z-20 flex items-center gap-3 bg-slate-900 text-white rounded-xl p-3.5 shadow-2xl max-w-[190px]">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-teal-400 font-bold shrink-0">
                  📅
                </div>
                <div>
                  <h4 className="text-base font-black text-white leading-none">10+</h4>
                  <p className="text-[10px] text-slate-400 font-semibold leading-tight mt-1">Years of Digital Innovation</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span 
                data-edit-id="about-eyebrow"
                data-edit-name="About Eyebrow"
                data-edit-kind="text"
                data-edit-path="about.eyebrow"
                className="font-mono text-xs uppercase tracking-widest text-teal-600 font-bold"
              >
                ABOUT US
              </span>
              <h2 
                data-edit-id="about-title"
                data-edit-name="About Title"
                data-edit-kind="heading"
                data-edit-path="about.title"
                className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight leading-tight"
              >
                Innovating Possibilities Through <span className="text-teal-600">Smart Technology</span>
              </h2>
            </div>

            <p 
              data-edit-id="about-subtitle"
              data-edit-name="About Description"
              data-edit-kind="text"
              data-edit-path="about.subtitle"
              className="text-slate-600 leading-relaxed"
            >
              At {settings.branding.brandName}, we believe that every great idea deserves great technology behind it.
              Founded with a mission to empower learners, startups, and institutions, we specialize in high-impact training, 
              custom software solutions, and digital workflow optimization.
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700 font-medium pt-2">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center text-xs shrink-0">✓</span>
                Custom software & platform systems
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center text-xs shrink-0">✓</span>
                AI, IoT, Cloud, and CRM integration
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center text-xs shrink-0">✓</span>
                Academic partnerships & training CoE
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center text-xs shrink-0">✓</span>
                End-to-end digital transformation
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center text-xs shrink-0">✓</span>
                Industry-aligned modular curriculum
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center text-xs shrink-0">✓</span>
                Driven by innovation & placement success
              </li>
            </ul>

            <div className="pt-4">
              <a 
                href="#courses"
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-slate-800 transition-all cursor-pointer"
              >
                Learn More
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
