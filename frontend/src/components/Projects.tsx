"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { getProjects, type Project } from "@/lib/api";

// ── Category tag colours ──────────────────────────────────────────────────────
const TAG_PALETTE: Record<string, string> = {
  Python:        "bg-blue-500/10 text-blue-300 border-blue-500/20",
  LangGraph:     "bg-violet-500/10 text-violet-300 border-violet-500/20",
  LangChain:     "bg-violet-500/10 text-violet-300 border-violet-500/20",
  "Multi-Agent": "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20",
  Gemini:        "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  "Gemini Vision":"bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  PostgreSQL:    "bg-sky-500/10 text-sky-300 border-sky-500/20",
  NetworkX:      "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  RAG:           "bg-amber-500/10 text-amber-300 border-amber-500/20",
  "Vector Search":"bg-amber-500/10 text-amber-300 border-amber-500/20",
  Pydantic:      "bg-rose-500/10 text-rose-300 border-rose-500/20",
  AST:           "bg-orange-500/10 text-orange-300 border-orange-500/20",
  uv:            "bg-lime-500/10 text-lime-300 border-lime-500/20",
  "Event Sourcing":"bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
  CQRS:          "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
};

const defaultTag = "bg-gray-700/40 text-gray-400 border-gray-600/30";

// ── Project domain icons (SVG inline) ────────────────────────────────────────
const DOMAIN_ICONS: Record<string, JSX.Element> = {
  "Brownfield Cartographer": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503-10.498l4.875 2.437c.381.19.622.58.622 1.006V17.25a1.125 1.125 0 01-.621 1.006l-4.875 2.437a1.125 1.125 0 01-1.008 0l-4.875-2.437A1.125 1.125 0 014.5 17.25V9.375c0-.426.24-.816.622-1.006l4.875-2.437a1.125 1.125 0 011.006 0z" />
    </svg>
  ),
  "Automaton Auditor": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.97zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.97z" />
    </svg>
  ),
  "Document Intelligence Refinery": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  "Immutable Financial Ledger": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  ),
};

const DOMAIN_GRADIENTS: Record<string, string> = {
  "Brownfield Cartographer":        "from-emerald-500/20 via-teal-500/10 to-transparent",
  "Automaton Auditor":              "from-violet-500/20 via-fuchsia-500/10 to-transparent",
  "Document Intelligence Refinery": "from-cyan-500/20 via-sky-500/10 to-transparent",
  "Immutable Financial Ledger":     "from-indigo-500/20 via-blue-500/10 to-transparent",
};

const DOMAIN_ACCENT: Record<string, string> = {
  "Brownfield Cartographer":        "text-emerald-400 border-emerald-500/30 group-hover:border-emerald-400/60",
  "Automaton Auditor":              "text-violet-400 border-violet-500/30 group-hover:border-violet-400/60",
  "Document Intelligence Refinery": "text-cyan-400 border-cyan-500/30 group-hover:border-cyan-400/60",
  "Immutable Financial Ledger":     "text-indigo-400 border-indigo-500/30 group-hover:border-indigo-400/60",
};

const DOMAIN_GLOW: Record<string, string> = {
  "Brownfield Cartographer":        "shadow-emerald-500/10",
  "Automaton Auditor":              "shadow-violet-500/10",
  "Document Intelligence Refinery": "shadow-cyan-500/10",
  "Immutable Financial Ledger":     "shadow-indigo-500/10",
};

// ── External link icon ───────────────────────────────────────────────────────
function ExternalLinkIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}

// ── GitHub icon ───────────────────────────────────────────────────────────────
function GitHubIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

// ── Expanded detail modal ─────────────────────────────────────────────────────
function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const gradient = DOMAIN_GRADIENTS[project.title] ?? "from-indigo-500/20 via-violet-500/10 to-transparent";
  const accent   = DOMAIN_ACCENT[project.title]    ?? "text-indigo-400 border-indigo-500/30";
  const icon     = DOMAIN_ICONS[project.title];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        className="relative w-full max-w-2xl bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl"
        initial={{ scale: 0.92, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 24 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* gradient header */}
        <div className={`bg-gradient-to-br ${gradient} p-8 border-b border-gray-800/60`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className={`p-2.5 rounded-xl border bg-gray-900/60 ${accent}`}>{icon}</span>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">Project</p>
                <h3 className="text-xl font-bold text-white">{project.title}</h3>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors mt-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <p className="text-gray-300 leading-relaxed text-sm">{project.description}</p>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Tech Stack</p>
            <div className="flex flex-wrap gap-2">
              {project.tech_stack.map((t) => (
                <span key={t} className={`px-3 py-1 rounded-full text-xs font-medium border ${TAG_PALETTE[t] ?? defaultTag}`}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <ExternalLinkIcon />
                Live Site
              </a>
            )}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <GitHubIcon />
                View on GitHub
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Featured card (large) ─────────────────────────────────────────────────────
function FeaturedCard({ project, index, onClick }: { project: Project; index: number; onClick: () => void }) {
  const gradient = DOMAIN_GRADIENTS[project.title] ?? "from-indigo-500/20 via-violet-500/10 to-transparent";
  const accent   = DOMAIN_ACCENT[project.title]    ?? "text-indigo-400 border-indigo-500/30 group-hover:border-indigo-400/60";
  const glow     = DOMAIN_GLOW[project.title]      ?? "shadow-indigo-500/10";
  const icon     = DOMAIN_ICONS[project.title];

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`group relative flex flex-col rounded-2xl border bg-gray-900/40 overflow-hidden cursor-pointer shadow-xl ${glow} hover:shadow-2xl transition-all duration-300 ${accent}`}
      onClick={onClick}
    >
      {/* top gradient wash */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

      {/* featured badge */}
      <div className="absolute top-4 right-4 z-10">
        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase bg-white/5 border border-white/10 text-gray-400">
          Featured
        </span>
      </div>

      <div className="relative p-7 flex flex-col flex-1">
        {/* icon + title */}
        <div className="flex items-center gap-3 mb-4">
          <span className={`p-2.5 rounded-xl border bg-gray-800/60 transition-colors duration-300 ${accent}`}>
            {icon}
          </span>
          <h3 className="text-lg font-bold text-white group-hover:text-white/90 leading-tight">
            {project.title}
          </h3>
        </div>

        {/* description */}
        <p className="text-gray-400 text-sm leading-relaxed flex-1 mb-5 line-clamp-4">
          {project.description}
        </p>

        {/* tags — show first 5 */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.tech_stack.slice(0, 5).map((t) => (
            <span key={t} className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${TAG_PALETTE[t] ?? defaultTag}`}>
              {t}
            </span>
          ))}
          {project.tech_stack.length > 5 && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-gray-700/30 text-gray-500 border-gray-600/20">
              +{project.tech_stack.length - 5}
            </span>
          )}
        </div>

        {/* footer row */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-800/60">
          <div className="flex items-center gap-3">
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors"
              >
                <ExternalLinkIcon />
                Live
              </a>
            )}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors"
              >
                <GitHubIcon />
                GitHub
              </a>
            )}
          </div>
          <button className="ml-auto flex items-center gap-1 text-xs font-medium text-gray-500 group-hover:text-white transition-colors">
            View details
            <svg className="w-3.5 h-3.5 translate-x-0 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Compact card (grid) ───────────────────────────────────────────────────────
function CompactCard({ project, index, onClick }: { project: Project; index: number; onClick: () => void }) {
  const accent = DOMAIN_ACCENT[project.title] ?? "text-indigo-400 border-indigo-500/30 group-hover:border-indigo-400/60";
  const icon   = DOMAIN_ICONS[project.title];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`group relative flex flex-col rounded-xl border bg-gray-900/30 p-5 cursor-pointer hover:bg-gray-900/60 transition-all duration-200 ${accent}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          {icon && (
            <span className={`p-2 rounded-lg border bg-gray-800/50 transition-colors ${accent}`}>
              {icon}
            </span>
          )}
          <h3 className="text-sm font-semibold text-white group-hover:text-white/90 leading-snug">
            {project.title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-gray-600 hover:text-white transition-colors shrink-0 mt-0.5"
              >
                <ExternalLinkIcon />
              </a>
            )}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-gray-600 hover:text-white transition-colors shrink-0 mt-0.5"
              >
                <GitHubIcon />
              </a>
            )}
          </div>
      </div>
      <p className="text-gray-500 text-xs leading-relaxed flex-1 mb-3 line-clamp-3">
        {project.description}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {project.tech_stack.slice(0, 4).map((t) => (
          <span key={t} className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${TAG_PALETTE[t] ?? defaultTag}`}>
            {t}
          </span>
        ))}
        {project.tech_stack.length > 4 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium border bg-gray-700/30 text-gray-500 border-gray-600/20">
            +{project.tech_stack.length - 4}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ── Filter pill ───────────────────────────────────────────────────────────────
const FILTERS = ["All", "AI/ML", "Data Engineering", "Backend", "Agentic"];

const FILTER_MAP: Record<string, string[]> = {
  "AI/ML":            ["LangChain", "LangGraph", "Gemini", "Gemini Vision", "RAG", "Vector Search", "Multi-Agent"],
  "Data Engineering": ["PySpark", "dbt", "PostgreSQL", "Event Sourcing", "CQRS"],
  "Backend":          ["Python", "Pydantic", "uv", "Async", "SHA-256"],
  "Agentic":          ["LangGraph", "LangChain", "Multi-Agent", "LangSmith"],
};

function projectMatchesFilter(project: Project, filter: string): boolean {
  if (filter === "All") return true;
  const keywords = FILTER_MAP[filter] ?? [];
  return project.tech_stack.some((t) => keywords.includes(t));
}

// ── Main component (client, receives pre-fetched data as prop) ────────────────
export default function ProjectsClient({ projects }: { projects: Project[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [activeFilter, setActiveFilter] = useState("All");
  const [selected, setSelected] = useState<Project | null>(null);

  const filtered = projects.filter((p) => projectMatchesFilter(p, activeFilter));
  const featured = filtered.filter((p) => p.featured);
  const rest      = filtered.filter((p) => !p.featured);

  return (
    <section id="projects" ref={ref} className="max-w-6xl mx-auto px-6 py-24">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <p className="text-sm font-medium text-indigo-400 tracking-widest uppercase mb-2">
          Open Source
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <h2 className="text-4xl font-bold text-white mb-3">
              Project{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Gallery
              </span>
            </h2>
            <p className="text-gray-500 text-sm max-w-lg">
              Production-grade systems spanning agentic AI, data engineering, and distributed architecture.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {projects.length} projects
          </div>
        </div>
      </motion.div>

      {/* ── Filter pills ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="flex flex-wrap gap-2 mb-10"
      >
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
              activeFilter === f
                ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
                : "bg-gray-800/40 border-gray-700/40 text-gray-500 hover:text-gray-300 hover:border-gray-600"
            }`}
          >
            {f}
          </button>
        ))}
      </motion.div>

      {/* ── No results ── */}
      {filtered.length === 0 && (
        <p className="text-gray-600 text-sm py-12 text-center">No projects match this filter.</p>
      )}

      {/* ── Featured grid ── */}
      {featured.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {featured.map((p, i) => (
            <FeaturedCard key={p.id} project={p} index={i} onClick={() => setSelected(p)} />
          ))}
        </div>
      )}

      {/* ── Rest grid ── */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rest.map((p, i) => (
            <CompactCard key={p.id} project={p} index={i} onClick={() => setSelected(p)} />
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      <AnimatePresence>
        {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </section>
  );
}
