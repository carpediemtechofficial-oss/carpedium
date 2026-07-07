"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { Course } from "@/data/courses";
import RatingStars from "@/components/ui/RatingStars";

type CourseCatalogCardProps = {
  course: Course;
  onViewDetails: (slug: string) => void;
  onEnroll: (course: Course) => void;
};

const BADGE_STYLES: Record<string, string> = {
  Flagship: "bg-teal text-white",
  Bestseller: "bg-amber-500 text-white",
  New: "bg-emerald-500 text-white",
};

const MODE_STYLES: Record<string, string> = {
  Online: "bg-blue-50 text-blue-600 border-blue-100",
  Hybrid: "bg-teal/10 text-teal border-teal/20",
  Offline: "bg-purple-50 text-purple-600 border-purple-100",
};

const DIFF_DOT: Record<string, string> = {
  Beginner: "bg-emerald-500",
  Intermediate: "bg-amber-500",
  Advanced: "bg-rose-500",
};

export default function CourseCatalogCard({ course, onViewDetails, onEnroll }: CourseCatalogCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="flex flex-col h-full"
    >
      <div
        className={`group flex flex-col h-full rounded-2xl border bg-white overflow-hidden transition-all duration-300 ${
          hovered
            ? "shadow-[0_8px_40px_-8px_rgba(20,184,166,0.25)] border-teal/40 -translate-y-1"
            : "shadow-[0_1px_3px_rgba(15,23,42,0.06)] border-slate-100"
        }`}
      >
        {/* Cover Image */}
        <div className="relative h-48 overflow-hidden">
          <motion.img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover"
            animate={{ scale: hovered ? 1.07 : 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            loading="lazy"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent pointer-events-none" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {course.badge && (
              <span className={`px-2.5 py-0.5 rounded-full font-mono text-[9px] font-bold uppercase tracking-wider ${BADGE_STYLES[course.badge]}`}>
                {course.badge}
              </span>
            )}
            {course.placement && (
              <span className="px-2.5 py-0.5 rounded-full font-mono text-[9px] font-bold uppercase tracking-wider bg-white/90 text-teal border border-teal/20">
                Placement
              </span>
            )}
          </div>

          {/* Mode badge */}
          <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full border font-mono text-[9px] font-bold uppercase tracking-wider ${MODE_STYLES[course.mode]}`}>
            {course.mode}
          </span>

          {/* Seats badge */}
          {course.seats <= 8 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-amber-500/90 backdrop-blur-sm px-2.5 py-0.5">
              <span className="font-mono text-[9px] font-bold text-white">{course.seats} seats left</span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="flex flex-col flex-1 p-5">
          {/* Category & Difficulty */}
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[9px] uppercase tracking-widest text-teal font-bold">{course.category}</span>
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${DIFF_DOT[course.difficulty]}`} />
              <span className="font-mono text-[9px] text-slate-400">{course.difficulty}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-display text-base font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-teal transition-colors">
            {course.title}
          </h3>

          {/* Description */}
          <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed flex-1">
            {course.subtitle}
          </p>

          {/* Instructor */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-base">{course.mentor.avatar}</span>
            <span className="text-xs text-slate-500">{course.mentor.name} · {course.mentor.role}</span>
          </div>

          {/* Rating & Students */}
          <div className="mt-2 flex items-center gap-3">
            <RatingStars rating={course.rating} reviewCount={course.reviewCount} />
            <span className="text-[10px] text-slate-400">{course.studentsEnrolled.toLocaleString()} students</span>
          </div>

          {/* Stats Row */}
          <div className="mt-3 flex items-center gap-3 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <span>⏱</span>{course.duration}
            </span>
            <span className="flex items-center gap-1">
              <span>💼</span>{course.projectsCount} projects
            </span>
            {course.certificate && (
              <span className="flex items-center gap-1">
                <span>🏅</span>Certificate
              </span>
            )}
          </div>

          {/* Price Row */}
          <div className="mt-4 pt-3 border-t border-slate-50 flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-lg font-bold text-teal">{course.fees}</span>
                <span className="text-xs text-slate-400 line-through">{course.originalFees}</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{course.discountPercent}% off</span>
              </div>
              {course.emiAvailable && (
                <p className="text-[9px] text-slate-400 font-mono mt-0.5">EMI from {course.emiAmount}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onViewDetails(course.slug)}
              className="rounded-xl border border-teal/30 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-teal hover:bg-teal/5 transition-all cursor-pointer"
            >
              View Details →
            </button>
            <button
              type="button"
              onClick={() => onEnroll(course)}
              className="rounded-xl bg-teal py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-white hover:bg-teal-bright shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              Enroll Now
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
