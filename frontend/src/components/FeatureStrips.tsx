"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

// ── shared fade-in ────────────────────────────────────────────────────────────
function Strip({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
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

// ── 01 Identity ───────────────────────────────────────────────────────────────
function IdentityStrip() {
  return (
    <Strip delay={0}>
      <div className="flex flex-col md:flex-row md:items-center gap-8 py-14 px-2">
        <Label n="01" text="Identity" color="text-indigo-400" />
        <div className="flex-1">
          <h2 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white leading-none">
            Amir
            <span className="block text-2xl sm:text-3xl font-medium text-indigo-400 mt-2 tracking-normal">
              AI Engineer
            </span>
          </h2>
          <p className="mt-3 text-xs text-gray-500 tracking-wide">Kigali, Rwanda · M.S. AI, Carnegie Mellon University Africa</p>
        </div>
        <div className="md:max-w-sm text-gray-400 text-sm leading-relaxed">
          I build multi-agent systems, evaluation benchmarks, and production automation pipelines —
          from LangGraph orchestration and RAG to benchmarks published on HuggingFace.
          <div className="mt-4 flex flex-wrap gap-3">
            <a href="#projects" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
              View Projects
            </a>
            <a href="#experience" className="px-4 py-2 rounded-lg border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white text-sm font-medium transition-colors">
              Experience
            </a>
          </div>
        </div>
        <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 self-start">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Available
        </span>
      </div>
    </Strip>
  );
}

// ── 02 Impact ─────────────────────────────────────────────────────────────────
const STATS = [
  { value: "9",     label: "Agent systems shipped in 12 weeks", color: "text-indigo-400"  },
  { value: "35.2%", label: "pass@1 on DataAgentBench",          color: "text-violet-400"  },
  { value: "250",   label: "Benchmark tasks on HuggingFace",    color: "text-cyan-400"    },
  { value: "90%",   label: "Less manual CRM data entry",        color: "text-emerald-400" },
];

function ImpactStrip() {
  return (
    <Strip delay={0.05}>
      <div className="flex flex-col md:flex-row md:items-center gap-8 py-12 px-2">
        <Label n="02" text="Impact" color="text-emerald-400" />
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

// ── 03 Experience ─────────────────────────────────────────────────────────────
const ROLES = [
  { role: "AI Agent Systems Engineer",         company: "10 Academy",             period: "Feb 2026 — Present",  accent: "bg-indigo-500",  text: "text-indigo-400"  },
  { role: "Back-end Developer Project Lead",   company: "NextGen Solutions",      period: "Jul 2025 — Jan 2026", accent: "bg-violet-500",  text: "text-violet-400"  },
  { role: "API Integration & Automation",      company: "ReiSearch",              period: "Nov 2024 — Jun 2025", accent: "bg-emerald-500", text: "text-emerald-400" },
  { role: "AI Developer",                      company: "iCog-Labs",              period: "Mar — Oct 2024",      accent: "bg-cyan-500",    text: "text-cyan-400"    },
  { role: "AI Researcher",                     company: "Ethiopian AI Institute", period: "Apr 2023 — Mar 2024", accent: "bg-amber-500",   text: "text-amber-400"   },
  { role: "Flutter Developer",                 company: "A2SV",                   period: "Nov 2021 — Apr 2023", accent: "bg-pink-500",    text: "text-pink-400"    },
];

function ExperienceStrip() {
  return (
    <Strip delay={0.1}>
      <div className="flex flex-col md:flex-row gap-8 py-12 px-2">
        <Label n="03" text="Experience" color="text-violet-400" />
        <div className="flex-1 flex flex-col divide-y divide-gray-800/60">
          {ROLES.map((r) => (
            <div key={r.company} className="flex items-center justify-between gap-4 py-3 group">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${r.accent}`} />
                <span className="text-sm font-semibold text-white group-hover:text-white/90 truncate">{r.role}</span>
                <span className={`text-xs font-medium ${r.text} hidden sm:inline whitespace-nowrap`}>{r.company}</span>
              </div>
              <span className="text-xs text-gray-600 whitespace-nowrap tabular-nums">{r.period}</span>
            </div>
          ))}
        </div>
      </div>
    </Strip>
  );
}

// ── 04 Skills ─────────────────────────────────────────────────────────────────
const SKILL_GROUPS = [
  { category: "AI / Agents",  color: "bg-indigo-500",  text: "text-indigo-300",  items: ["LangGraph", "LangChain", "OpenAI API", "Gemini API", "Groq", "HuggingFace"] },
  { category: "Patterns",     color: "bg-violet-500",  text: "text-violet-300",  items: ["Multi-agent orchestration", "RAG", "Context engineering", "Evaluation design", "CQRS / Event Sourcing"] },
  { category: "Backend & Data", color: "bg-cyan-500",  text: "text-cyan-300",    items: ["Python", "FastAPI", "Django", "Node.js", "PostgreSQL", "Neo4j", "MongoDB", "DynamoDB"] },
  { category: "Cloud & Integrations", color: "bg-emerald-500", text: "text-emerald-300", items: ["AWS", "Docker", "CI/CD", "GoHighLevel", "HubSpot", "Langfuse", "LangSmith"] },
];

function SkillsStrip() {
  return (
    <Strip delay={0.15}>
      <div className="flex flex-col md:flex-row gap-8 py-12 px-2">
        <Label n="04" text="Skills" color="text-cyan-400" />
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SKILL_GROUPS.map((g) => (
            <div key={g.category}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-1.5 h-1.5 rounded-full ${g.color}`} />
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{g.category}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {g.items.map((s) => (
                  <span key={s} className={`px-2.5 py-1 rounded-md text-xs font-medium border border-gray-700/60 bg-gray-800/60 ${g.text}`}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Strip>
  );
}

// ── 05 Projects ───────────────────────────────────────────────────────────────
const PROJECTS = [
  { title: "Oracle Forge",          desc: "NL data-analytics agent — 35.2% pass@1 on DataAgentBench with zero fine-tuning", stack: ["LangGraph", "Context Eng.", "SQL"],     accent: "text-indigo-400",  dot: "bg-indigo-500"  },
  { title: "Tenacious Sales Bench", desc: "250-task agent benchmark + SimPO-trained judge, published on HuggingFace",        stack: ["SimPO", "HuggingFace", "Eval"],        accent: "text-cyan-400",    dot: "bg-cyan-500"    },
  { title: "Conversion Engine",     desc: "5-signal lead enrichment → grounded outreach → CRM, as one state machine",        stack: ["LangGraph", "HubSpot", "Cal.com"],     accent: "text-emerald-400", dot: "bg-emerald-500" },
  { title: "Automaton Auditor",     desc: "7-agent “Digital Courtroom” — audits a repo in 45 s for $0.02",                   stack: ["LangGraph", "Gemini", "Pydantic"],     accent: "text-violet-400",  dot: "bg-violet-500"  },
];

function ProjectsStrip() {
  return (
    <Strip delay={0.2}>
      <div className="flex flex-col md:flex-row gap-8 py-12 px-2">
        <Label n="05" text="Projects" color="text-indigo-400" />
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PROJECTS.map((p) => (
            <a href="#projects" key={p.title} className="group flex gap-3 p-4 rounded-xl border border-gray-800/60 hover:border-gray-700 bg-gray-900/30 hover:bg-gray-900/60 transition-all duration-200">
              <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${p.dot}`} />
              <div>
                <p className={`text-sm font-semibold ${p.accent}`}>{p.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 mb-2 leading-relaxed">{p.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.stack.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded text-[10px] text-gray-400 bg-gray-800/80 border border-gray-700/40">{t}</span>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </Strip>
  );
}

// ── 06 Education ──────────────────────────────────────────────────────────────
const EDUCATION = [
  { degree: "M.S. in Artificial Intelligence",                                   school: "Carnegie Mellon University Africa", year: "2026", accent: "text-indigo-400" },
  { degree: "B.S. in Software Engineering & Computing Technologies (AI Major)",  school: "Addis Ababa University",            year: "2024", accent: "text-violet-400" },
];

function EducationStrip() {
  return (
    <Strip delay={0.25}>
      <div id="education" className="flex flex-col md:flex-row gap-8 py-12 px-2 scroll-mt-20">
        <Label n="06" text="Education" color="text-amber-400" />
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
export default function FeatureStrips() {
  return (
    <div className="w-full">
      <IdentityStrip />
      <Divider />
      <ImpactStrip />
      <Divider />
      <ExperienceStrip />
      <Divider />
      <SkillsStrip />
      <Divider />
      <ProjectsStrip />
      <Divider />
      <EducationStrip />
      <Divider />
    </div>
  );
}
