"use client";

// We'll create a list of text/SVG based mock badges for colleges/partners
const PARTNERS = [
  { name: "PSG College", code: "PSG" },
  { name: "VIT University", code: "VIT" },
  { name: "KPRIET", code: "KPRIET" },
  { name: "SNS Institutions", code: "SNS" },
  { name: "Bharathiar Univ", code: "BU" },
  { name: "Rathinam College", code: "RTC" },
  { name: "GRD College", code: "GRD" }
];

export default function PartnerLogos() {
  return (
    <section 
      id="partners" 
      className="py-12 bg-white border-t border-b border-slate-100 overflow-hidden select-none"
    >
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center font-mono text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-6">
          TRUSTED BY LEADERS IN EDUCATION AND INDUSTRY
        </p>

        {/* Marquee flow */}
        <div className="relative w-full flex items-center overflow-hidden">
          <div className="flex gap-12 whitespace-nowrap animate-marquee">
            {/* Render twice for continuous loop */}
            {[...PARTNERS, ...PARTNERS].map((partner, idx) => (
              <div 
                key={idx} 
                className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-500 shadow-sm hover:text-teal-600 hover:border-teal-500/20 transition-all duration-200"
              >
                <span className="text-lg">🏛️</span>
                <span>{partner.name}</span>
                <span className="font-mono text-[9px] bg-slate-200/60 rounded px-1.5 py-0.5 text-slate-400 font-semibold">{partner.code}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </section>
  );
}
