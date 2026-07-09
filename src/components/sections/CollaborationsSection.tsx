"use client";

const COLLABORATIONS = [
  {
    title: "Curriculum Integration",
    description: "Aligning real-time tech modules and frameworks with academic programs.",
    icon: "📖"
  },
  {
    title: "Faculty Enablement",
    description: "Training educators with the latest industry tools, patterns, and teaching aids.",
    icon: "🎓"
  },
  {
    title: "Student Tech Incubation",
    description: "Providing production-style platforms for students to build and showcase innovations.",
    icon: "💡"
  },
  {
    title: "Joint Certification Programs",
    description: "Co-branded courses and certifications with recognized engineering institutions.",
    icon: "📜"
  }
];

export default function CollaborationsSection() {
  return (
    <section
      id="collaborations"
      data-edit-id="collaborations-section"
      data-edit-name="Collaborations Section"
      data-edit-kind="section"
      className="px-6 py-20 bg-white"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Content + Grid */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <span className="font-mono text-xs uppercase tracking-widest text-teal-600 font-bold">COLLABORATIONS</span>
              <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight leading-tight">
                Academic Partnerships <span className="text-teal-600">That Drive Innovation</span>
              </h2>
              <p className="text-slate-600 leading-relaxed max-w-xl">
                We build strong collaborations with educational institutions and universities to bridge 
                the gap between academic learning and real-world tech applications.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {COLLABORATIONS.map((collab) => (
                <div 
                  key={collab.title}
                  className="group flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:border-teal-500/20 transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-xl shrink-0 group-hover:bg-teal-500 group-hover:text-white transition-colors duration-200">
                    {collab.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{collab.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{collab.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Visual Box */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            <div className="relative w-full max-w-[380px] aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100 flex items-center justify-center p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent" />
              
              {/* Graphic showing node network representing collaboration */}
              <svg className="w-4/5 h-4/5 text-teal-500/20" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="12" className="fill-white stroke-teal-500 stroke-2" />
                <circle cx="20" cy="30" r="8" className="fill-white stroke-teal-500/50 stroke-2" />
                <circle cx="80" cy="30" r="8" className="fill-white stroke-teal-500/50 stroke-2" />
                <circle cx="20" cy="70" r="8" className="fill-white stroke-teal-500/50 stroke-2" />
                <circle cx="80" cy="70" r="8" className="fill-white stroke-teal-500/50 stroke-2" />
                
                <line x1="50" y1="50" x2="20" y2="30" className="stroke-teal-500/30 stroke-[1.5]" />
                <line x1="50" y1="50" x2="80" y2="30" className="stroke-teal-500/30 stroke-[1.5]" />
                <line x1="50" y1="50" x2="20" y2="70" className="stroke-teal-500/30 stroke-[1.5]" />
                <line x1="50" y1="50" x2="80" y2="70" className="stroke-teal-500/30 stroke-[1.5]" />

                <text x="50" y="53" textAnchor="middle" className="font-sans text-[10px] fill-teal-600 font-bold">Node</text>
                <text x="20" y="33" textAnchor="middle" className="font-sans text-[6px] fill-slate-400 font-bold">Lab</text>
                <text x="80" y="33" textAnchor="middle" className="font-sans text-[6px] fill-slate-400 font-bold">CoE</text>
                <text x="20" y="73" textAnchor="middle" className="font-sans text-[6px] fill-slate-400 font-bold">Class</text>
                <text x="80" y="73" textAnchor="middle" className="font-sans text-[6px] fill-slate-400 font-bold">Hub</text>
              </svg>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
