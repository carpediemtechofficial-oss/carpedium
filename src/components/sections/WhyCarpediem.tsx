import Reveal from "@/components/ui/Reveal";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import TiltCard from "@/components/ui/TiltCard";

const VALUES = [
  {
    label: "Real projects, not toy demos",
    metric: "12+",
    description:
      "Production-style projects shipped per cohort — fully functional web, mobile, and agent apps that hold up under senior developer review.",
    icon: (
      <path d="M8 9L4 12L8 15M16 9L20 12L16 15M13.5 6L10.5 18" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    label: "Mentor-led, not self-paced video",
    metric: "1:5",
    description:
      "Ultra-low mentor-to-learner ratio. Get direct line-by-line feedback on your code and live architecture reviews every single week.",
    icon: (
      <path
        d="M8 11a3 3 0 100-6 3 3 0 000 6zM16 11a3 3 0 100-6 3 3 0 000 6zM2 20c0-3.3 2.7-6 6-6s6 2.7 6 6M14 14c3.3 0 6 2.7 6 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    label: "Hiring partners in the loop",
    metric: "45+",
    description:
      "Active hiring partners in our network. Direct referrals, mock tech drills, and portfolio showcases once you complete the track.",
    icon: (
      <path
        d="M9 12l2 2 4-4M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    label: "Batches built for real life",
    metric: "Flexible",
    description:
      "Choose from intensive weekday cohorts or weekend tracks designed specifically for college students and working professionals.",
    icon: (
      <path
        d="M4 6h16M4 6a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2M4 6l1.5-3h13L20 6M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

export default function WhyCarpediem() {
  return (
    <section id="why" className="relative px-6 py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionEyebrow>Why Carpediem</SectionEyebrow>
          <h2 className="font-display max-w-2xl text-3xl font-bold sm:text-4xl text-ink leading-tight">
            Training built to get you building, fast.
          </h2>
          <p className="mt-4 max-w-xl text-sm sm:text-base text-ink-dim">
            We reject the outdated slide-deck approach. Our cohorts are active design-and-ship bootcamps led by engineers who build for a living.
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value, i) => (
            <Reveal key={value.label} delay={i * 0.08}>
              <TiltCard cursorLabel="LEARN" className="h-full bg-white">
                <div className="h-full p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-7 w-7 text-primary"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        aria-hidden="true"
                      >
                        {value.icon}
                      </svg>
                      <span className="font-display text-2xl font-black text-primary-strong/15 select-none">
                        {value.metric}
                      </span>
                    </div>
                    <h3 className="font-display text-base font-bold text-ink leading-snug">
                      {value.label}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-ink-dim leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
