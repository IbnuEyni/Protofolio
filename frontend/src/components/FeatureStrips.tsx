"use client";

import { useRef } from "react";
import { m, useInView } from "framer-motion";

// ── shared fade-in ────────────────────────────────────────────────────────────
function Strip({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <m.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </m.div>
  );
}

// ── divider ───────────────────────────────────────────────────────────────────
function Divider() {
  return <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />;
}

// ── strip label ───────────────────────────────────────────────────────────────
function Label({ n, text, color }: { n: string; text: string; color: string }) {
  return (
    <div className="flex items-center gap-3 shrink-0 w-48">
      <span className="text-xs font-mono text-gray-700">{n}</span>
      <span className={`text-xs font-semibold uppercase tracking-widest ${color}`}>{text}</span>
    </div>
  );
}

// ── 01 Impact ─────────────────────────────────────────────────────────────────
const STATS = [
  { value: "9",     label: "Agent systems shipped in 12 weeks", color: "text-indigo-400"  },
  { value: "35.2%", label: "pass@1 on DataAgentBench",          color: "text-violet-400"  },
  { value: "250",   label: "Benchmark tasks on HuggingFace",    color: "text-cyan-400"    },
  { value: "90%",   label: "Less manual CRM data entry",        color: "text-emerald-400" },
];

function ImpactStrip() {
  return (
    <Strip delay={0}>
      <div className="flex flex-col md:flex-row md:items-center gap-8 py-12 px-2">
        <Label n="01" text="Impact" color="text-emerald-400" />
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className={`text-4xl font-extrabold leading-none tabular-nums ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1.5 leading-snug">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </Strip>
  );
}

// ── 02 Education ──────────────────────────────────────────────────────────────
const EDUCATION = [
  { degree: "M.S. in Artificial Intelligence",                                   school: "Carnegie Mellon University Africa", year: "2026", accent: "text-indigo-400" },
  { degree: "B.S. in Software Engineering & Computing Technologies (AI Major)",  school: "Addis Ababa University",            year: "2024", accent: "text-violet-400" },
];

function EducationStrip() {
  return (
    <Strip delay={0.1}>
      <div id="education" className="flex flex-col md:flex-row gap-8 py-12 px-2 scroll-mt-20">
        <Label n="02" text="Education" color="text-amber-400" />
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {EDUCATION.map((e) => (
            <div key={e.school} className="flex items-start justify-between gap-4 p-4 rounded-xl border border-gray-800/60 bg-gray-900/30">
              <div>
                <p className="text-sm font-semibold text-white leading-snug">{e.degree}</p>
                <p className={`text-xs font-medium mt-1 ${e.accent}`}>{e.school}</p>
              </div>
              <span className="text-xs text-gray-600 tabular-nums">{e.year}</span>
            </div>
          ))}
        </div>
      </div>
    </Strip>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
// Identity, experience, skills and projects each have a full section further
// down the page, so the strips only cover what isn't shown elsewhere.
export default function FeatureStrips() {
  return (
    <div className="w-full">
      <ImpactStrip />
      <Divider />
      <EducationStrip />
      <Divider />
    </div>
  );
}
