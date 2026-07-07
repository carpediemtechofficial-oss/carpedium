import Reveal from "@/components/ui/Reveal";
import SectionEyebrow from "@/components/ui/SectionEyebrow";

export default function Certifications() {
  return (
    <section id="certifications" className="relative px-6 py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Staggered Info */}
          <div className="lg:col-span-6">
            <Reveal>
              <SectionEyebrow>Certifications</SectionEyebrow>
              <h2 className="font-display text-3xl font-bold sm:text-4xl text-ink leading-tight">
                Verified credentials for your next step.
              </h2>
              <p className="mt-4 text-sm sm:text-base text-ink-dim leading-relaxed">
                Every cohort graduate receives a cryptographically signed certificate of competency. This is not just a participation badge — it validates the production-grade code repositories you shipped.
              </p>
            </Reveal>

            <div className="mt-8 flex flex-col gap-5">
              <Reveal delay={0.08}>
                <div className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">✓</div>
                  <div>
                    <h4 className="font-display font-bold text-ink text-sm">ISO Certified Validation</h4>
                    <p className="text-xs text-ink-dim mt-0.5">Aligned with international software development training benchmarks.</p>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.12}>
                <div className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">✓</div>
                  <div>
                    <h4 className="font-display font-bold text-ink text-sm">One-Click LinkedIn Add</h4>
                    <p className="text-xs text-ink-dim mt-0.5">Integrates directly into your LinkedIn Certifications profile section.</p>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.16}>
                <div className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">✓</div>
                  <div>
                    <h4 className="font-display font-bold text-ink text-sm">QR Code Verification</h4>
                    <p className="text-xs text-ink-dim mt-0.5">Employers can scan to view your live, verified portfolio repos instantly.</p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Right Column: Premium Certificate Mockup */}
          <div className="lg:col-span-6 flex justify-center w-full">
            <Reveal delay={0.15}>
              <div className="relative w-full max-w-[460px] group cursor-pointer overflow-hidden rounded-2xl border border-teal/15 shadow-xl transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl">
                <img
                  src="/images/certificate.png"
                  alt="Carpediem Certificate of Completion - Software Development Internship"
                  className="w-full h-auto object-contain select-none"
                  loading="lazy"
                />
              </div>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
}
