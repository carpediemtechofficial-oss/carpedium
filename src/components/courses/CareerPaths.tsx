"use client";
import { motion } from "framer-motion";
import { CAREER_PATHS } from "@/data/courses";

type CareerPathsProps = {
  onBrowse: (category: string) => void;
};

export default function CareerPaths({ onBrowse }: CareerPathsProps) {
  return (
    <section className="py-20 px-6 bg-slate-950">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <p className="font-mono text-xs uppercase tracking-widest text-teal mb-3">Career Roadmaps</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight">
            Popular Career Paths
          </h2>
          <p className="mt-4 text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            Choose your destination. We'll give you the roadmap, the skills, and the support to get there.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {CAREER_PATHS.map((path, i) => (
            <motion.button
              key={path.title}
              type="button"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              whileHover={{ y: -4, scale: 1.02 }}
              onClick={() => onBrowse(path.title)}
              className="group relative rounded-2xl border border-white/5 bg-slate-900 p-5 text-left hover:border-teal/30 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              {/* Gradient glow on hover */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br ${path.color} rounded-2xl`} />

              <span className="text-3xl block mb-3">{path.icon}</span>
              <h3 className="font-display text-sm font-bold text-white leading-snug mb-1">{path.title}</h3>
              <p className="font-mono text-[10px] text-emerald-400 mb-3">{path.avgSalary}</p>
              <div className="flex flex-wrap gap-1">
                {path.skills.slice(0, 3).map((skill) => (
                  <span key={skill} className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-white/5 text-slate-400">
                    {skill}
                  </span>
                ))}
              </div>
              <p className="mt-2 font-mono text-[9px] text-slate-500">{path.courses} course{path.courses > 1 ? "s" : ""}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
