import Reveal from "@/components/ui/Reveal";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import { useTestimonials } from "@/hooks/useContent";
import OptimizedImage from "@/components/ui/OptimizedImage";

export default function Outcomes() {
  // Single source of truth: published testimonials from Supabase (realtime).
  const { testimonials, isLoading } = useTestimonials();

  return (
    <section id="outcomes" className="relative px-6 py-24 sm:py-32 bg-slate-50/50">
      <div className="mx-auto max-w-6xl">
        
        {/* Header */}
        <Reveal>
          <SectionEyebrow>Outcomes</SectionEyebrow>
          <h2 className="font-display max-w-2xl text-3xl font-bold sm:text-4xl text-ink leading-tight">
            Our learners ship value at top teams.
          </h2>
          <p className="mt-4 max-w-xl text-sm sm:text-base text-ink-dim">
            Direct referral loops and placement support built for engineers. Here is what our alumni say about the intensive building blocks.
          </p>
        </Reveal>



        {isLoading && (
          <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-56 rounded-2xl border border-teal/10 bg-white skeleton-shimmer animate-shimmer" />
            ))}
          </div>
        )}

        {!isLoading && testimonials.length === 0 && (
          <p className="mt-16 text-sm text-ink-dim">Success stories coming soon.</p>
        )}

        {/* Success Stories Grid */}
        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {testimonials.map((t, i) => {
            const outcome = [t.job_role, t.company].filter(Boolean).join(" @ ");
            const stars = "⭐".repeat(Math.max(0, Math.min(5, t.rating ?? 5)));
            return (
              <Reveal key={t.id} delay={i * 0.08}>
                <blockquote className="group h-full rounded-2xl border border-teal/10 bg-white p-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
                  <div>
                    <div className="flex gap-1 text-primary text-xs mb-4">{stars}</div>
                    <p className="text-xs sm:text-sm italic text-ink leading-relaxed">
                      “{t.review}”
                    </p>
                  </div>
                  <footer className="mt-6 pt-4 border-t border-teal/5 flex items-center gap-3">
                    {t.photo && (
                      <OptimizedImage
                        src={t.photo}
                        alt={t.student_name}
                        className="h-10 w-10 rounded-full object-cover border border-teal/15"
                      />
                    )}
                    <div className="flex flex-col">
                      <span className="font-display text-sm font-extrabold text-ink leading-none">
                        {t.student_name}
                      </span>
                      {t.course && (
                        <span className="font-mono text-[9px] uppercase tracking-wider text-primary mt-1.5 leading-none">
                          {t.course}
                        </span>
                      )}
                      {outcome && (
                        <span className="inline-flex items-center gap-1.5 rounded bg-teal/5 border border-teal/10 px-2 py-0.5 mt-2.5 text-[9px] font-mono font-bold text-primary-strong uppercase w-fit">
                          💼 {outcome}
                        </span>
                      )}
                    </div>
                  </footer>
                </blockquote>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
