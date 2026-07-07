"use client";
import { motion } from "framer-motion";
import { type Course } from "@/data/courses";
import { usePublishedCourses } from "@/hooks/useContent";
import RatingStars from "@/components/ui/RatingStars";
import Reveal from "@/components/ui/Reveal";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import OptimizedImage from "@/components/ui/OptimizedImage";

// Re-export Course type for backward compatibility
export type { Course };

type CourseGridProps = {
  onEnroll: (course: Course) => void;
  onViewAll?: () => void;
  onViewDetails?: (slug: string) => void;
};

const MODE_STYLES: Record<string, string> = {
  Online: "bg-blue-50 text-blue-600",
  Hybrid: "bg-teal/10 text-teal",
  Offline: "bg-purple-50 text-purple-600",
};

const BADGE_STYLES: Record<string, string> = {
  Flagship: "bg-teal text-white",
  Bestseller: "bg-amber-500 text-white",
  New: "bg-emerald-500 text-white",
};

export default function CourseGrid({ onEnroll, onViewAll, onViewDetails }: CourseGridProps) {
  // Single source of truth: published courses from Supabase (realtime).
  const { courses, isLoading } = usePublishedCourses();
  const featured = courses.slice(0, 3);

  return (
    <section id="courses" className="relative px-6 py-24 sm:py-32 bg-slate-50/50">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <Reveal>
          <SectionEyebrow>Course Catalog</SectionEyebrow>
          <h2 className="font-display max-w-2xl text-3xl font-bold sm:text-4xl text-ink leading-tight">
            Learn what ships. Ship what's learned.
          </h2>
          <p className="mt-4 max-w-xl text-sm sm:text-base text-ink-dim">
            From Full-Stack to Generative AI — explore production-grade programs built for students and career-switchers in Coimbatore.
          </p>
        </Reveal>

        {/* Loading / empty states */}
        {isLoading && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-80 rounded-2xl border border-teal/10 bg-white skeleton-shimmer animate-shimmer" />
            ))}
          </div>
        )}
        {!isLoading && featured.length === 0 && (
          <p className="mt-12 text-sm text-ink-dim">
            New courses are on the way — check back soon.
          </p>
        )}

        {/* Featured Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {featured.map((course, idx) => (
            <motion.article
              key={course.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="h-full"
            >
              <div className="group flex flex-col h-full rounded-2xl border border-teal/10 bg-white shadow-sm hover:shadow-lg hover:scale-[1.015] hover:border-primary/40 transition-all duration-200 overflow-hidden">

                {/* Cover Image */}
                <div className="relative h-44 overflow-hidden">
                  <OptimizedImage
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent pointer-events-none" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {course.badge && (
                      <span className={`px-2.5 py-0.5 rounded-full font-mono text-[9px] font-bold uppercase ${BADGE_STYLES[course.badge]}`}>
                        {course.badge}
                      </span>
                    )}
                  </div>
                  <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full border font-mono text-[9px] font-bold uppercase ${MODE_STYLES[course.mode]}`}>
                    {course.mode}
                  </span>
                  {course.seats <= 8 && (
                    <span className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full bg-amber-500/90 font-mono text-[9px] font-bold text-white">
                      {course.seats} seats left
                    </span>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5 flex flex-col flex-1">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-teal font-bold">{course.category}</span>
                  <h3 className="mt-1 font-display text-base font-bold text-ink leading-snug group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-ink-dim line-clamp-2 leading-relaxed flex-1">{course.subtitle}</p>

                  {/* Instructor */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-base">{course.mentor.avatar}</span>
                    <span className="text-xs text-ink-dim">{course.mentor.name}</span>
                  </div>

                  {/* Rating */}
                  <div className="mt-2">
                    <RatingStars rating={course.rating} reviewCount={course.reviewCount} />
                  </div>

                  {/* Fee & Stats */}
                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-teal/5">
                    <div>
                      <span className="font-display text-lg font-bold text-primary-strong">{course.fees}</span>
                      <span className="ml-2 text-xs text-ink-dim line-through">{course.originalFees}</span>
                    </div>
                    <span className="font-mono text-[9px] text-ink-dim">{course.duration}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {onViewDetails && (
                      <button
                        type="button"
                        onClick={() => onViewDetails(course.slug)}
                        className="rounded-xl border border-teal/30 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-teal hover:bg-teal/5 transition-all cursor-pointer"
                      >
                        Details →
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onEnroll(course)}
                      className={`rounded-xl bg-primary py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-white hover:bg-primary-light transition-all shadow-sm cursor-pointer ${!onViewDetails ? "col-span-2" : ""}`}
                    >
                      Enroll Now
                    </button>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* View All CTA */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={onViewAll}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-primary-light hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            Browse All {courses.length > 0 ? courses.length : ""} Courses
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M5 12h14m-7-7 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="font-mono text-xs text-ink-dim">
            {courses.length > 0 ? `${courses.length} courses` : "Live catalog"} · Mentor-led · Placement support
          </span>
        </div>

      </div>
    </section>
  );
}
