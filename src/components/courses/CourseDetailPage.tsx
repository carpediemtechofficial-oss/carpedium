"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type Course } from "@/data/courses";
import RatingStars from "@/components/ui/RatingStars";
import Accordion from "@/components/ui/Accordion";
import OptimizedImage from "@/components/ui/OptimizedImage";

const NAV_TABS = ["Overview", "Curriculum", "Projects", "Instructor", "Reviews", "FAQs"];

const MODE_BADGE: Record<string, string> = {
  Online: "bg-blue-50 text-blue-600",
  Hybrid: "bg-teal/10 text-teal",
  Offline: "bg-purple-50 text-purple-600",
};

type CourseDetailPageProps = {
  course: Course;
  onEnroll: (course: Course) => void;
  onBack: () => void;
  onBackHome: () => void;
};

export default function CourseDetailPage({ course, onEnroll, onBack, onBackHome }: CourseDetailPageProps) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  const tabRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [course.slug]);

  const scrollToSection = (tab: string) => {
    setActiveTab(tab);
    const el = tabRefs.current[tab];
    if (el) {
      const offset = 120;
      const y = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const faqItems = [
    { id: "f1", title: "Is this course suitable for absolute beginners?", content: `Yes! ${course.difficulty === "Beginner" ? "This course is specifically designed for beginners with no prior experience." : "We recommend having some basics before joining this course. Our advisors can help assess your readiness."}` },
    { id: "f2", title: "What is the learning mode?", content: `This course is offered in ${course.mode} mode. ${course.mode === "Hybrid" ? "You'll attend some sessions in our Coimbatore center and some online, giving you the best of both worlds." : course.mode === "Online" ? "All sessions are conducted live online via Zoom/Google Meet with recordings available." : "All sessions are conducted in-person at our Coimbatore center."}` },
    { id: "f3", title: "Is there a certificate after completion?", content: "Yes! All graduates receive an ISO-verified digital certificate with QR code for employer verification. You can add it directly to your LinkedIn profile." },
    { id: "f4", title: "What is the EMI/payment policy?", content: course.emiAvailable ? `We offer easy EMI at just ${course.emiAmount} for 10 months with zero cost. We accept UPI, net banking, and all major cards.` : "The full course fee can be paid via UPI, net banking, or cards. Contact us for any custom payment arrangements." },
    { id: "f5", title: "What is the batch size?", content: `We keep batches intentionally small (max 15 students) to ensure personalized mentorship. Currently ${course.seats} seats are available.` },
    { id: "f6", title: "What happens if I miss a class?", content: "All sessions are recorded and shared within 24 hours. You can catch up at your own pace and clarify doubts in the next session or via our Discord community." },
  ];

  const curriculumAccordionItems = course.curriculum.map((mod) => ({
    id: mod.id,
    title: mod.title,
    meta: `${mod.duration} · ${mod.lessons.length} items`,
    content: (
      <div className="space-y-2 pl-2">
        {mod.lessons.map((lesson, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
            <div className="flex items-center gap-3">
              <span className="text-base">
                {lesson.type === "quiz" ? "📝" : lesson.type === "project" ? "🚀" : lesson.type === "assignment" ? "📋" : "▶"}
              </span>
              <div>
                <span className="text-sm text-slate-700">{lesson.title}</span>
                {lesson.preview && <span className="ml-2 text-[9px] font-mono font-bold text-teal uppercase bg-teal/5 px-1.5 py-0.5 rounded">Preview</span>}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-mono text-[10px] text-slate-400">{lesson.duration}</span>
              {!lesson.preview && (
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-slate-300" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              )}
            </div>
          </div>
        ))}
      </div>
    ),
  }));

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* Breadcrumb */}
      <div className="px-6 py-3 border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl">
          <nav className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <button onClick={onBackHome} className="hover:text-teal transition-colors cursor-pointer">Home</button>
            <span>/</span>
            <button onClick={onBack} className="hover:text-teal transition-colors cursor-pointer">Courses</button>
            <span>/</span>
            <span className="text-teal font-bold truncate max-w-[200px]">{course.title}</span>
          </nav>
        </div>
      </div>

      {/* ============================
          HERO SECTION
      ============================= */}
      <section className="bg-slate-950 px-6 py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(20,184,166,0.5) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(14,165,233,0.3) 0%, transparent 50%)" }} />

        <div className="mx-auto max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

            {/* Left: Course Info */}
            <div className="lg:col-span-7">
              {/* Back Button */}
              <button
                type="button"
                onClick={onBack}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20 transition-all cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M19 12H5m7-7-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back to Courses
              </button>

              {/* Badge */}
              {course.badge && (
                <div className="mb-4">
                  <span className={`px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider ${course.badge === "Flagship" ? "bg-teal text-white" : course.badge === "Bestseller" ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"}`}>
                    ⭐ {course.badge}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight">
                {course.title}
              </h1>
              <p className="mt-3 text-slate-300 text-base leading-relaxed max-w-2xl">
                {course.subtitle}
              </p>

              {/* Rating & Students */}
              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
                <RatingStars rating={course.rating} reviewCount={course.reviewCount} size="md" />
                <span className="text-slate-300 text-xs">{course.studentsEnrolled.toLocaleString()} students enrolled</span>
                <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase ${MODE_BADGE[course.mode]}`}>{course.mode}</span>
              </div>

              {/* Meta */}
              <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-400 font-mono">
                <span>🌐 {course.language}</span>
                <span>🕐 Last updated: {course.lastUpdated}</span>
                <span>📅 Starts: {course.startDate}</span>
                <span>🏅 Certificate: Included</span>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  { icon: "⏱", label: course.duration },
                  { icon: "📊", label: course.difficulty },
                  { icon: "💼", label: `${course.projectsCount} Projects` },
                  { icon: "🎓", label: `${course.totalHours}h Content` },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-base">{s.icon}</span>
                    <span className="font-mono text-xs text-slate-300">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Instructor mini */}
              <div className="mt-6 flex items-center gap-3">
                <span className="text-3xl">{course.mentor.avatar}</span>
                <div>
                  <p className="text-slate-200 text-sm font-semibold">{course.mentor.name}</p>
                  <p className="text-slate-400 text-xs font-mono">{course.mentor.role}</p>
                </div>
              </div>
            </div>

            {/* Right: Sticky Purchase Card */}
            <div className="lg:col-span-5">
              <div className="sticky top-20 rounded-2xl bg-white shadow-2xl overflow-hidden">
                {/* Video Preview */}
                <div className="relative h-48 bg-slate-900 overflow-hidden group">
                  <OptimizedImage src={course.image} alt={course.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                  {!videoPlaying ? (
                    <button
                      type="button"
                      onClick={() => setVideoPlaying(true)}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-2 cursor-pointer"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="h-16 w-16 rounded-full bg-white/90 shadow-xl flex items-center justify-center"
                      >
                        <svg viewBox="0 0 24 24" className="h-7 w-7 text-teal ml-1" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </motion.div>
                      <span className="font-mono text-[10px] text-white uppercase tracking-wider">Preview Course</span>
                    </button>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-white font-mono text-xs">Preview video plays here</p>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="p-6">
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-3xl font-bold text-teal">{course.fees}</span>
                    <span className="text-slate-400 line-through text-base">{course.originalFees}</span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{course.discountPercent}% OFF</span>
                  </div>
                  {course.emiAvailable && (
                    <p className="mt-1 font-mono text-xs text-slate-500">or EMI at just {course.emiAmount}</p>
                  )}
                  <p className="mt-2 font-mono text-[10px] text-amber-600 font-bold">🔥 Only {course.seats} seats remaining!</p>

                  {/* CTA Buttons */}
                  <div className="mt-4 space-y-2.5">
                    <button
                      type="button"
                      onClick={() => onEnroll(course)}
                      className="w-full rounded-xl bg-teal py-3.5 font-mono text-sm font-bold uppercase tracking-wider text-white shadow-lg hover:bg-teal-bright transition-all hover:-translate-y-0.5 cursor-pointer"
                    >
                      Enroll Now →
                    </button>
                    <button
                      type="button"
                      onClick={() => setWishlist(!wishlist)}
                      className={`w-full rounded-xl border py-3 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${wishlist ? "border-rose-300 bg-rose-50 text-rose-600" : "border-slate-200 text-slate-600 hover:border-teal/40"}`}
                    >
                      {wishlist ? "❤️ Wishlisted" : "🤍 Add to Wishlist"}
                    </button>
                  </div>

                  {/* Guarantees */}
                  <div className="mt-5 space-y-2">
                    {[
                      "✅ Certificate included",
                      `✅ ${course.projectsCount} live projects`,
                      "✅ Mentor support",
                      "✅ Lifetime recordings access",
                      "✅ Community access",
                    ].map((item) => (
                      <p key={item} className="font-mono text-xs text-slate-500">{item}</p>
                    ))}
                  </div>

                  {/* Share & Advisor */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex gap-3">
                    <a href="tel:+917339512373" className="flex-1 text-center rounded-xl border border-slate-200 py-2.5 font-mono text-[10px] font-bold uppercase text-slate-600 hover:border-teal/40 transition-all">
                      📞 Call Advisor
                    </a>
                    <a href={`https://wa.me/917339512373?text=Hi, I'm interested in ${course.title}`} target="_blank" rel="noopener noreferrer" className="flex-1 text-center rounded-xl border border-emerald-200 bg-emerald-50 py-2.5 font-mono text-[10px] font-bold uppercase text-emerald-600 hover:bg-emerald-100 transition-all">
                      💬 WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================
          STICKY NAV TABS
      ============================= */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center overflow-x-auto gap-0 scrollbar-none" style={{ scrollbarWidth: "none" }}>
            {/* Back button — always visible */}
            <button
              type="button"
              onClick={onBack}
              className="shrink-0 flex items-center gap-1.5 mr-4 py-4 font-mono text-xs font-bold uppercase tracking-wider text-teal hover:text-teal-bright transition-colors cursor-pointer border-b-2 border-transparent"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M19 12H5m7-7-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Courses
            </button>
            <span className="shrink-0 text-slate-200 mr-4 text-sm">|</span>
            {NAV_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => scrollToSection(tab)}
                className={`shrink-0 px-5 py-4 font-mono text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  activeTab === tab ? "border-teal text-teal" : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ============================
          CONTENT SECTIONS
      ============================= */}
      <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-16">

          {/* OVERVIEW */}
          <section ref={(el) => { tabRefs.current["Overview"] = el; }}>
            <h2 className="font-display text-2xl font-bold text-slate-800 mb-6">Course Overview</h2>
            <p className="text-slate-600 leading-relaxed">{course.longDescription}</p>

            {/* Who it's for */}
            <div className="mt-8 p-6 rounded-2xl bg-teal/5 border border-teal/10">
              <h3 className="font-display font-bold text-slate-800 mb-4">Who This Course Is For</h3>
              <ul className="space-y-2">
                {course.careerOutcomes.map((outcome) => (
                  <li key={outcome} className="flex items-center gap-3 text-sm text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-teal shrink-0" />
                    {outcome}
                  </li>
                ))}
              </ul>
            </div>

            {/* Career Outcomes */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-emerald-100 bg-emerald-50">
                <p className="font-mono text-[9px] uppercase tracking-wider text-emerald-600 mb-1">Expected Salary</p>
                <p className="font-display text-xl font-bold text-emerald-700">{course.expectedSalary}</p>
              </div>
              <div className="p-5 rounded-2xl border border-blue-100 bg-blue-50">
                <p className="font-mono text-[9px] uppercase tracking-wider text-blue-600 mb-1">Industry Demand</p>
                <p className="text-sm text-blue-700 font-medium leading-snug">{course.industryDemand}</p>
              </div>
            </div>

            {/* What You'll Learn */}
            <div className="mt-10">
              <h3 className="font-display text-xl font-bold text-slate-800 mb-5">What You'll Learn</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {course.whatYouLearn.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="h-5 w-5 rounded-full bg-teal/10 text-teal flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">✓</span>
                    <span className="text-sm text-slate-600 leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Gained */}
            <div className="mt-10">
              <h3 className="font-display text-xl font-bold text-slate-800 mb-5">Skills You'll Gain</h3>
              <div className="flex flex-wrap gap-2">
                {course.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1.5 rounded-xl border border-teal/20 bg-teal/5 font-mono text-xs font-bold text-teal">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className="mt-10">
              <h3 className="font-display text-xl font-bold text-slate-800 mb-4">Requirements</h3>
              <ul className="space-y-2">
                {course.requirements.map((req) => (
                  <li key={req} className="flex items-center gap-3 text-sm text-slate-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* CURRICULUM */}
          <section ref={(el) => { tabRefs.current["Curriculum"] = el; }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-slate-800">Course Curriculum</h2>
              <span className="font-mono text-xs text-slate-400">{course.curriculum.reduce((a, m) => a + m.lessons.length, 0)} lessons · {course.duration}</span>
            </div>
            <Accordion items={curriculumAccordionItems} allowMultiple={false} defaultOpen={[course.curriculum[0]?.id]} />
          </section>

          {/* PROJECTS */}
          {course.projects.length > 0 && (
            <section ref={(el) => { tabRefs.current["Projects"] = el; }}>
              <h2 className="font-display text-2xl font-bold text-slate-800 mb-6">Live Projects</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {course.projects.map((proj, i) => (
                  <motion.div
                    key={proj.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className="rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 overflow-hidden"
                  >
                    <div className="h-28 relative overflow-hidden">
                      <OptimizedImage src={proj.image} alt={proj.title} className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <h3 className="absolute bottom-3 left-3 font-display text-sm font-bold text-white">{proj.title}</h3>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-slate-500 leading-relaxed">{proj.description}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {proj.tech.map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded bg-slate-50 border border-slate-100 font-mono text-[9px] font-bold text-slate-500">{t}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* TOOLS */}
          <section>
            <h2 className="font-display text-xl font-bold text-slate-800 mb-5">Tools & Technologies</h2>
            <div className="flex flex-wrap gap-3">
              {course.tools.map((tool) => (
                <div key={tool} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-100 bg-slate-50 hover:border-teal/30 transition-colors">
                  <span className="font-mono text-xs font-bold text-slate-600">{tool}</span>
                </div>
              ))}
            </div>
          </section>

          {/* CERTIFICATE */}
          <section>
            <h2 className="font-display text-xl font-bold text-slate-800 mb-5">Certificate</h2>
            <div className="rounded-2xl border border-teal/15 overflow-hidden shadow-lg max-w-sm">
              <OptimizedImage src="/images/certificate.png" alt="Course Certificate" className="w-full h-auto" />
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {["ISO Verified", "QR Code", "LinkedIn Ready", "Employer Verified"].map((feature) => (
                <div key={feature} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-teal/5 border border-teal/10">
                  <span className="text-teal">✓</span>
                  <span className="font-mono text-[10px] font-bold text-slate-600">{feature}</span>
                </div>
              ))}
            </div>
          </section>

          {/* INSTRUCTOR */}
          <section ref={(el) => { tabRefs.current["Instructor"] = el; }}>
            <h2 className="font-display text-2xl font-bold text-slate-800 mb-6">Your Instructor</h2>
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6">
              <div className="flex items-start gap-5">
                <div className="h-20 w-20 rounded-2xl bg-teal/10 border border-teal/15 flex items-center justify-center text-4xl shrink-0">
                  {course.mentor.avatar}
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl font-bold text-slate-800">{course.mentor.name}</h3>
                  <p className="font-mono text-xs text-teal font-bold mt-0.5">{course.mentor.role}</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400 font-mono">
                    <span>⭐ {course.mentor.rating} Rating</span>
                    <span>👥 {course.mentor.students.toLocaleString()} Students</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-500 leading-relaxed">{course.mentor.bio}</p>
                  <div className="mt-4 flex gap-2">
                    <a href={course.mentor.linkedin} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100 font-mono text-[10px] font-bold text-blue-600 hover:bg-blue-100 transition-colors">
                      LinkedIn →
                    </a>
                    <a href={course.mentor.github} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[10px] font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                      GitHub →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* REVIEWS */}
          <section ref={(el) => { tabRefs.current["Reviews"] = el; }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-slate-800">Student Reviews</h2>
              <div className="flex items-center gap-3">
                <RatingStars rating={course.rating} reviewCount={course.reviewCount} size="md" />
              </div>
            </div>

            {/* Rating Summary */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 mb-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="text-center">
                <p className="font-display text-5xl font-bold text-teal">{course.rating}</p>
                <RatingStars rating={course.rating} showCount={false} size="lg" />
                <p className="font-mono text-[10px] text-slate-400 mt-1">Course Rating</p>
              </div>
              <div className="flex-1 w-full space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const pct = star === 5 ? 72 : star === 4 ? 20 : star === 3 ? 5 : star === 2 ? 2 : 1;
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-slate-400 w-2">{star}</span>
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="font-mono text-slate-400 w-8 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-4">
              {course.reviews.map((review, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-teal/10 flex items-center justify-center text-xl shrink-0">
                      {review.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-sm text-slate-800">{review.name}</span>
                        {review.verified && <span className="font-mono text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Verified</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <RatingStars rating={review.rating} showCount={false} />
                        <span className="font-mono text-[9px] text-slate-400">{review.date}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600 leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* FAQs */}
          <section ref={(el) => { tabRefs.current["FAQs"] = el; }}>
            <h2 className="font-display text-2xl font-bold text-slate-800 mb-6">Frequently Asked Questions</h2>
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6">
              <Accordion items={faqItems} allowMultiple={true} />
            </div>
          </section>

        </div>

        {/* Right Sidebar (desktop only) — sticky summary */}
        <div className="hidden lg:block lg:col-span-4">
          <div className="sticky top-28 rounded-2xl border border-slate-100 bg-white shadow-lg overflow-hidden">
            <div className="p-6 border-b border-slate-50">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl font-bold text-teal">{course.fees}</span>
                <span className="text-slate-400 line-through text-sm">{course.originalFees}</span>
              </div>
              {course.emiAvailable && <p className="font-mono text-xs text-slate-400 mt-0.5">EMI from {course.emiAmount}</p>}
              <p className="mt-2 font-mono text-[10px] text-amber-600 font-bold animate-pulse">🔥 {course.seats} seats remaining!</p>
              <button
                type="button"
                onClick={() => onEnroll(course)}
                className="mt-4 w-full rounded-xl bg-teal py-3.5 font-mono text-sm font-bold uppercase tracking-wider text-white shadow-lg hover:bg-teal-bright transition-all cursor-pointer"
              >
                Enroll Now →
              </button>
              <a href="tel:+917339512373" className="mt-2 block w-full text-center rounded-xl border border-slate-200 py-2.5 font-mono text-xs font-bold uppercase text-slate-600 hover:border-teal/40 transition-all">
                Talk to Advisor
              </a>
            </div>

            <div className="p-6 space-y-2.5">
              <p className="font-mono text-[9px] uppercase tracking-wider text-slate-400 mb-3">This Course Includes</p>
              {[
                { icon: "⏱", text: `${course.totalHours}h on-demand content` },
                { icon: "💼", text: `${course.projectsCount} live projects` },
                { icon: "🏅", text: "Certificate of completion" },
                { icon: "🌐", text: `${course.mode} learning mode` },
                { icon: "👤", text: "1-on-1 mentor access" },
                { icon: "♾️", text: "Lifetime recording access" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3 text-xs text-slate-500">
                  <span>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <section className="px-6 py-16 bg-slate-950 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-teal mb-3">Ready to Start?</p>
        <h2 className="font-display text-3xl font-bold text-white mb-6">
          Become Job-Ready in {course.duration}
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onEnroll(course)}
            className="rounded-2xl bg-teal px-10 py-4 font-mono text-sm font-bold uppercase tracking-wider text-white shadow-xl hover:bg-teal-bright transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            Enroll Now — {course.fees}
          </button>
          <a href="tel:+917339512373" className="rounded-2xl border border-white/20 px-10 py-4 font-mono text-sm font-bold uppercase tracking-wider text-white hover:border-teal/50 transition-all hover:-translate-y-0.5">
            📞 Talk to Advisor
          </a>
        </div>
      </section>
    </div>
  );
}
