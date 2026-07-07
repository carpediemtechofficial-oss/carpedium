"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type Course } from "@/data/courses";
import { usePublishedCourses } from "@/hooks/useContent";
import CourseCatalogCard from "@/components/courses/CourseCatalogCard";
import CareerPaths from "@/components/courses/CareerPaths";

const CATEGORIES = ["All", "Flagship", "Development", "AI & Data", "Security & Cloud", "Design & Marketing"];
const DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced"];
const MODES = ["All", "Online", "Offline", "Hybrid"];
const SORT_OPTIONS = ["Popular", "Latest", "Highest Rated", "Lowest Price"];

type CoursesPageProps = {
  onViewDetails: (slug: string) => void;
  onEnroll: (course: Course) => void;
  onBackHome: () => void;
};

export default function CoursesPage({ onViewDetails, onEnroll, onBackHome }: CoursesPageProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [mode, setMode] = useState("All");
  const [sort, setSort] = useState("Popular");
  const [visibleCount, setVisibleCount] = useState(9);

  // Single source of truth: published courses from Supabase (realtime).
  const { courses, isLoading } = usePublishedCourses();

  const featuredCourses = courses.slice(0, 3);
  const trendingCourses = useMemo(
    () => [...courses].sort((a, b) => b.studentsEnrolled - a.studentsEnrolled).slice(0, 8),
    [courses]
  );

  const filtered = useMemo(() => {
    let result = courses.filter((c) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.subtitle.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q)) ||
        c.skills.some((s) => s.toLowerCase().includes(q)) ||
        c.mentor.name.toLowerCase().includes(q);
      const matchCat = category === "All" || c.category === category;
      const matchDiff = difficulty === "All" || c.difficulty === difficulty;
      const matchMode = mode === "All" || c.mode === mode;
      return matchSearch && matchCat && matchDiff && matchMode;
    });

    if (sort === "Popular") result = [...result].sort((a, b) => b.studentsEnrolled - a.studentsEnrolled);
    if (sort === "Highest Rated") result = [...result].sort((a, b) => b.rating - a.rating);
    if (sort === "Lowest Price") result = [...result].sort((a, b) => parseInt(a.fees.replace(/\D/g, "")) - parseInt(b.fees.replace(/\D/g, "")));

    return result;
  }, [courses, search, category, difficulty, mode, sort]);

  const hasFilters = search || category !== "All" || difficulty !== "All" || mode !== "All";

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* Breadcrumb + Back */}
      <div className="px-6 py-4 border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <button
              type="button"
              onClick={onBackHome}
              className="flex items-center gap-1.5 hover:text-teal transition-colors cursor-pointer font-bold"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M19 12H5m7-7-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Home
            </button>
            <span>/</span>
            <span className="text-teal font-bold">All Courses</span>
          </nav>
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-1.5 rounded-full border border-teal/30 bg-teal/5 px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-teal hover:bg-teal hover:text-white transition-all cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M19 12H5m7-7-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Home
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-slate-950 px-6 py-20 overflow-hidden">
        {/* Background radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-teal/10 blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-cyan-500/5 blur-[80px]" />
        </div>
        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "linear-gradient(rgba(20,184,166,1) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        
        <div className="mx-auto max-w-4xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8 flex justify-center sm:justify-start"
          >
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-1.5 rounded-full border border-teal/40 bg-teal/10 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-teal hover:bg-teal hover:text-white transition-all cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M19 12H5m7-7-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to Home
            </button>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="font-mono text-xs uppercase tracking-widest text-teal mb-4"
          >
            Course Catalog
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight"
          >
            Learn What Ships.<br />
            <span className="text-teal">Build What Matters.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-slate-200 text-base max-w-2xl mx-auto leading-relaxed"
          >
            Master industry-ready software engineering, AI, cybersecurity, cloud, and product development through project-based learning.
          </motion.p>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 relative max-w-xl mx-auto"
          >
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-teal/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search courses, skills, tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-teal/30 bg-slate-800 pl-12 pr-6 py-4 text-sm text-white placeholder:text-slate-400 outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all"
            />
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex items-center justify-center gap-8 sm:gap-12"
          >
            {[
              { label: "Courses", value: "12+" },
              { label: "Students", value: "7,500+" },
              { label: "Avg. Rating", value: "4.8 ★" },
              { label: "Placement Rate", value: "89%" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-2xl font-bold text-teal">{stat.value}</div>
                <div className="font-mono text-[9px] uppercase tracking-wider text-slate-300 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <section className="px-6 py-16 bg-white border-b border-slate-100">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-teal mb-1">Curated Picks</p>
                <h2 className="font-display text-2xl font-bold text-slate-800">Featured Programs</h2>
              </div>
              <span className="font-mono text-xs text-slate-400">Flagship & Bestseller courses</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <CourseCatalogCard key={course.id} course={course} onViewDetails={onViewDetails} onEnroll={onEnroll} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending Courses Horizontal Slider */}
      {trendingCourses.length > 0 && (
        <section className="py-12 border-b border-slate-100 overflow-hidden">
          <div className="px-6 mx-auto max-w-7xl mb-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-teal mb-1">Most Enrolled</p>
            <h2 className="font-display text-2xl font-bold text-slate-800">Trending Now</h2>
          </div>
          <div className="pl-6">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none" style={{ scrollbarWidth: "none" }}>
              {trendingCourses.map((course) => (
                <div key={course.id} className="flex-shrink-0 w-72">
                  <CourseCatalogCard course={course} onViewDetails={onViewDetails} onEnroll={onEnroll} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Catalog */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          {/* Filters */}
          <div className="mb-8 rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
              
              {/* Category */}
              <div className="flex-1">
                <p className="font-mono text-[9px] uppercase tracking-wider text-slate-400 mb-2">Category</p>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                        category === cat ? "bg-teal text-white border-teal" : "bg-white text-slate-500 border-slate-200 hover:border-teal/40"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                {/* Difficulty */}
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-slate-400 mb-2">Difficulty</p>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="text-xs font-mono border border-slate-200 rounded-xl px-3 py-2 text-slate-600 bg-white outline-none focus:border-teal cursor-pointer"
                  >
                    {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>

                {/* Mode */}
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-slate-400 mb-2">Mode</p>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="text-xs font-mono border border-slate-200 rounded-xl px-3 py-2 text-slate-600 bg-white outline-none focus:border-teal cursor-pointer"
                  >
                    {MODES.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-slate-400 mb-2">Sort By</p>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="text-xs font-mono border border-slate-200 rounded-xl px-3 py-2 text-slate-600 bg-white outline-none focus:border-teal cursor-pointer"
                  >
                    {SORT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {hasFilters && (
                <button
                  type="button"
                  onClick={() => { setSearch(""); setCategory("All"); setDifficulty("All"); setMode("All"); }}
                  className="font-mono text-[10px] text-rose-500 hover:text-rose-600 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                >
                  ✕ Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between mb-6">
            <p className="font-mono text-xs text-slate-400">
              Showing <span className="font-bold text-slate-600">{Math.min(visibleCount, filtered.length)}</span> of <span className="font-bold text-slate-600">{filtered.length}</span> courses
            </p>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-96 rounded-2xl border border-slate-100 bg-white skeleton-shimmer animate-shimmer" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filtered.slice(0, visibleCount).map((course) => (
                    <CourseCatalogCard key={course.id} course={course} onViewDetails={onViewDetails} onEnroll={onEnroll} />
                  ))}
                </AnimatePresence>
              </div>

              {visibleCount < filtered.length && (
                <div className="mt-12 text-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((v) => v + 6)}
                    className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-white px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-teal shadow-sm hover:bg-teal hover:text-white transition-all cursor-pointer"
                  >
                    Load More Courses
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M19 9l-7 7-7-7" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-24 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
              <p className="text-4xl mb-4">🔍</p>
              <p className="font-display text-lg font-bold text-slate-600">No courses found</p>
              <p className="text-sm text-slate-400 mt-2">Try adjusting your filters or search terms</p>
              <button
                type="button"
                onClick={() => { setSearch(""); setCategory("All"); setDifficulty("All"); setMode("All"); }}
                className="mt-6 rounded-full bg-teal px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Career Paths */}
      <CareerPaths onBrowse={(path) => setCategory(path)} />

      {/* Bottom CTA */}
      <section className="px-6 py-20 bg-white border-t border-slate-100">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-teal mb-3">Get Started Today</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-800">
            Not sure which course to pick?
          </h2>
          <p className="mt-4 text-slate-500 text-sm leading-relaxed max-w-lg mx-auto">
            Our advisors will map your background to the right learning path and get you enrolled in under 10 minutes.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="tel:+917339512373"
              className="w-full sm:w-auto rounded-2xl bg-teal px-8 py-4 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:bg-teal-bright transition-all hover:-translate-y-0.5"
            >
              📞 Talk to an Advisor
            </a>
            <a
              href="https://wa.me/917339512373"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto rounded-2xl border border-teal/30 bg-white px-8 py-4 font-mono text-xs font-bold uppercase tracking-wider text-teal hover:border-teal transition-all hover:-translate-y-0.5"
            >
              💬 WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
