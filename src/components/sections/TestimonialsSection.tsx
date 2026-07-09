"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TESTIMONIALS = [
  {
    quote: "Our students thoroughly benefited from the hands-on IoT session—it bridged the gap between theory and industry practice. The IoT session was extremely relevant and well-structured—our IT students gained hands-on exposure.",
    author: "Dr. Ramesh",
    role: "HOD, Department of Information Technology",
    institution: "Bharathiar University",
    rating: 5
  },
  {
    quote: "The digital marketing session was interactive and informative—it gave me clarity on SEO, social media, and real-world tools. A well-curated program that introduced our students to core concepts and tools like Google Ads and SEO.",
    author: "Dr. S. Sasikala",
    role: "HOD, Department of Communication",
    institution: "Dr. G. R. Damodaran College of Science",
    rating: 5
  },
  {
    quote: "Our students were introduced to real-time sensor integration and IoT concepts that aligned well with their curriculum. This session bridged the gap between coding and hardware applications.",
    author: "Dr. Shanmuga Priya",
    role: "HOD, Computer Applications",
    institution: "Dr.S.N.S. Rajalakshmi College of Arts and Science",
    rating: 5
  },
  {
    quote: "The session delivered the perfect mix of IoT fundamentals and practical cybersecurity measures ideal for today’s tech-driven landscape.",
    author: "Mr. Rajasekaran",
    role: "Assistant Professor",
    institution: "PSG College of Arts and Science",
    rating: 5
  }
];

export default function TestimonialsSection() {
  const [activeIdx, setActiveIdx] = useState(0);

  const next = () => {
    setActiveIdx((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prev = () => {
    setActiveIdx((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  return (
    <section
      id="testimonials"
      data-edit-id="testimonials-section"
      data-edit-name="Testimonials Section"
      data-edit-kind="section"
      className="px-6 py-20 bg-slate-50 overflow-hidden"
    >
      <div className="mx-auto max-w-4xl">
        <div className="space-y-3 text-center mb-12">
          <span className="font-mono text-xs uppercase tracking-widest text-teal-600 font-bold">TESTIMONIALS</span>
          <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight leading-tight">
            What Our <span className="text-teal-600">Partners & Learners Say</span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-sm">
            Hear from institutions, educators, and students about their journey with our training and automation solutions.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-sm min-h-[250px] flex flex-col justify-between">
          <div className="absolute top-6 right-8 text-teal-600/10 text-7xl font-serif font-black select-none pointer-events-none">
            “
          </div>

          <div className="relative overflow-hidden flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex gap-1 text-amber-500 text-lg">
                  {Array.from({ length: TESTIMONIALS[activeIdx].rating }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>

                <blockquote className="text-slate-700 text-base sm:text-lg font-medium leading-relaxed italic">
                  "{TESTIMONIALS[activeIdx].quote}"
                </blockquote>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center font-bold text-teal-700 text-sm">
                    {TESTIMONIALS[activeIdx].author[0]}
                  </div>
                  <div>
                    <cite className="not-italic font-bold text-slate-900 text-sm block">
                      {TESTIMONIALS[activeIdx].author}
                    </cite>
                    <span className="text-xs text-slate-500">
                      {TESTIMONIALS[activeIdx].role}, {TESTIMONIALS[activeIdx].institution}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation controls */}
          <div className="flex justify-end gap-2 mt-8">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
              aria-label="Previous testimonial"
            >
              ←
            </button>
            <button
              onClick={next}
              className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
              aria-label="Next testimonial"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
