import Reveal from "@/components/ui/Reveal";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import { useMentors } from "@/hooks/useContent";
import OptimizedImage from "@/components/ui/OptimizedImage";

// ─── Inline SVG Avatars (cartoon style, consistent across all cards) ──────────

function AvatarCloud() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      {/* Background circle */}
      <circle cx="60" cy="60" r="60" fill="url(#cloud-bg)" />
      {/* Body */}
      <ellipse cx="60" cy="90" rx="32" ry="20" fill="#5B6CF6" />
      {/* T-shirt */}
      <path d="M38 90 Q60 78 82 90 L80 110 H40Z" fill="#6366F1" />
      {/* Neck */}
      <ellipse cx="60" cy="75" rx="10" ry="8" fill="#FBBFA0" />
      {/* Head */}
      <ellipse cx="60" cy="58" rx="22" ry="21" fill="#FBBFA0" />
      {/* Hair */}
      <path d="M38 50 Q42 30 60 32 Q78 30 82 50 Q78 38 60 38 Q42 38 38 50Z" fill="#1E1B4B" />
      {/* Eyes */}
      <ellipse cx="52" cy="55" rx="4" ry="4.5" fill="white" />
      <ellipse cx="68" cy="55" rx="4" ry="4.5" fill="white" />
      <circle cx="53" cy="56" r="2.2" fill="#312E81" />
      <circle cx="69" cy="56" r="2.2" fill="#312E81" />
      <circle cx="54" cy="55" r="0.8" fill="white" />
      <circle cx="70" cy="55" r="0.8" fill="white" />
      {/* Smile */}
      <path d="M53 65 Q60 70 67 65" stroke="#C97A60" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Ears */}
      <ellipse cx="38" cy="59" rx="4" ry="5" fill="#FBBFA0" />
      <ellipse cx="82" cy="59" rx="4" ry="5" fill="#FBBFA0" />
      {/* Cloud icon floating */}
      <g transform="translate(70, 28)">
        <rect x="0" y="6" width="28" height="14" rx="7" fill="white" opacity="0.9" />
        <circle cx="8" cy="9" r="7" fill="white" opacity="0.9" />
        <circle cx="20" cy="7" r="9" fill="white" opacity="0.9" />
        <path d="M4 14 L8 10 L12 14" stroke="#6366F1" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M16 14 L20 10 L24 14" stroke="#6366F1" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </g>
      <defs>
        <radialGradient id="cloud-bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#EEF2FF" />
          <stop offset="100%" stopColor="#C7D2FE" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function AvatarDesigner() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      {/* Background circle */}
      <circle cx="60" cy="60" r="60" fill="url(#design-bg)" />
      {/* Body */}
      <path d="M34 90 Q60 76 86 90 L84 112 H36Z" fill="#F97316" />
      {/* Collar / shirt detail */}
      <path d="M54 82 L60 88 L66 82 L62 76 H58Z" fill="#FED7AA" />
      {/* Neck */}
      <ellipse cx="60" cy="76" rx="10" ry="8" fill="#FEB893" />
      {/* Head */}
      <ellipse cx="60" cy="58" rx="23" ry="22" fill="#FEB893" />
      {/* Hair */}
      <path d="M37 52 Q40 28 60 30 Q80 28 83 52 Q80 36 60 36 Q40 36 37 52Z" fill="#7C2D12" />
      {/* Sideburn detail */}
      <path d="M37 52 Q35 58 37 64" stroke="#7C2D12" strokeWidth="4" strokeLinecap="round" />
      <path d="M83 52 Q85 58 83 64" stroke="#7C2D12" strokeWidth="4" strokeLinecap="round" />
      {/* Eyes */}
      <ellipse cx="51" cy="55" rx="4.5" ry="5" fill="white" />
      <ellipse cx="69" cy="55" rx="4.5" ry="5" fill="white" />
      <circle cx="52.5" cy="56" r="2.5" fill="#451A03" />
      <circle cx="70.5" cy="56" r="2.5" fill="#451A03" />
      <circle cx="53.5" cy="55" r="0.9" fill="white" />
      <circle cx="71.5" cy="55" r="0.9" fill="white" />
      {/* Eyebrows */}
      <path d="M47 50 Q52 47 56 50" stroke="#7C2D12" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M64 50 Q69 47 73 50" stroke="#7C2D12" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Smile */}
      <path d="M52 66 Q60 73 68 66" stroke="#C07050" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Ears */}
      <ellipse cx="37" cy="59" rx="4" ry="5.5" fill="#FEB893" />
      <ellipse cx="83" cy="59" rx="4" ry="5.5" fill="#FEB893" />
      {/* Design palette floating */}
      <g transform="translate(72, 25)">
        <circle cx="14" cy="14" r="14" fill="white" opacity="0.95" />
        <circle cx="14" cy="6" r="3" fill="#F97316" />
        <circle cx="20" cy="18" r="3" fill="#EC4899" />
        <circle cx="8" cy="18" r="3" fill="#6366F1" />
        <circle cx="22" cy="8" r="2.5" fill="#FBBF24" />
        <circle cx="6" cy="8" r="2.5" fill="#34D399" />
        <circle cx="14" cy="14" r="4" fill="#1C1917" />
        <circle cx="14" cy="14" r="2.5" fill="#44403C" />
      </g>
      <defs>
        <radialGradient id="design-bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FFF7ED" />
          <stop offset="100%" stopColor="#FED7AA" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// Fallback avatars used when a mentor has no uploaded photo.
const FALLBACK_AVATARS = [AvatarCloud, AvatarDesigner];

export default function Mentors() {
  // Single source of truth: active mentors from Supabase (realtime).
  const { mentors, isLoading } = useMentors();

  return (
    <section id="mentors" className="relative px-6 py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionEyebrow>Mentors</SectionEyebrow>
          <h2 className="font-display max-w-2xl text-3xl font-bold sm:text-4xl text-ink leading-tight">
            Learn from engineers, not instructors.
          </h2>
          <p className="mt-4 max-w-xl text-sm sm:text-base text-ink-dim">
            Our mentors build, scale, and secure production systems daily. They review your pull
            requests, correct your architectures, and guide your portfolio.
          </p>
        </Reveal>

        {isLoading && (
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-72 rounded-2xl border border-teal/10 bg-white skeleton-shimmer animate-shimmer" />
            ))}
          </div>
        )}

        {!isLoading && mentors.length === 0 && (
          <p className="mt-16 text-sm text-ink-dim">Mentor profiles are being updated.</p>
        )}

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {mentors.map((mentor, i) => {
            const FallbackAvatar = FALLBACK_AVATARS[i % FALLBACK_AVATARS.length];
            const tag = mentor.company || mentor.experience || "Mentor";
            const role = mentor.designation || "Mentor";
            const credibility = mentor.bio || [mentor.designation, mentor.company].filter(Boolean).join(" · ");
            return (
              <Reveal key={mentor.id} delay={i * 0.08}>
                <div className="group h-full rounded-2xl border border-teal/10 bg-gradient-to-b from-teal/5 to-white p-6 shadow-sm hover:shadow-xl hover:border-primary/25 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between items-center text-center relative overflow-hidden">
                  {/* Badge top-right */}
                  <span className="absolute top-3 right-3 font-mono text-[8px] font-bold uppercase tracking-wider border rounded px-1.5 py-0.5 text-teal bg-teal/5 border-teal/15">
                    {tag}
                  </span>

                  <div className="flex flex-col items-center">
                    {/* Avatar */}
                    <div
                      className="h-20 w-20 rounded-full overflow-hidden border-2 border-teal/15 shadow-lg group-hover:scale-105 group-hover:shadow-xl transition-all duration-300 bg-white"
                      aria-label={mentor.name}
                    >
                      {mentor.profile_image ? (
                        <OptimizedImage
                          src={mentor.profile_image}
                          alt={mentor.name}
                          className="h-full w-full object-cover object-top"
                          draggable={false}
                        />
                      ) : (
                        <FallbackAvatar />
                      )}
                    </div>

                    <h3 className="font-display mt-5 text-base font-extrabold text-ink leading-none">
                      {mentor.name}
                    </h3>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-primary-strong mt-1.5">
                      {role}
                    </p>
                    <p className="mt-3.5 text-xs sm:text-sm text-ink-dim leading-relaxed">
                      {credibility}
                    </p>
                  </div>

                  {/* Social Row */}
                  {mentor.linkedin && (
                    <div className="mt-6 flex justify-center gap-3">
                      <a
                        href={mentor.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-7 w-7 rounded-full border border-teal/15 flex items-center justify-center text-ink-dim hover:text-primary hover:border-primary hover:bg-teal/5 transition-all text-xs font-bold"
                        aria-label={`${mentor.name}'s LinkedIn profile`}
                      >
                        in
                      </a>
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
