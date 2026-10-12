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
  MCP:           "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
  "Context Engineering": "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20",
  Evaluation:    "bg-teal-500/10 text-teal-300 border-teal-500/20",
  SimPO:         "bg-teal-500/10 text-teal-300 border-teal-500/20",
  "LLM-as-Judge":"bg-teal-500/10 text-teal-300 border-teal-500/20",
  HuggingFace:   "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
  Flutter:       "bg-sky-500/10 text-sky-300 border-sky-500/20",
  FastAPI:       "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
};

const defaultTag = "bg-gray-700/40 text-gray-400 border-gray-600/30";

// ── Per-project theme: accent colour + heroicons outline path ────────────────
type Accent = "indigo" | "violet" | "cyan" | "emerald" | "amber" | "pink" | "sky";

const ACCENTS: Record<Accent, { gradient: string; accent: string; glow: string }> = {
  indigo:  { gradient: "from-indigo-500/20 via-blue-500/10 to-transparent",    accent: "text-indigo-400 border-indigo-500/30 group-hover:border-indigo-400/60",    glow: "shadow-indigo-500/10"  },
  violet:  { gradient: "from-violet-500/20 via-fuchsia-500/10 to-transparent", accent: "text-violet-400 border-violet-500/30 group-hover:border-violet-400/60",    glow: "shadow-violet-500/10"  },
  cyan:    { gradient: "from-cyan-500/20 via-sky-500/10 to-transparent",       accent: "text-cyan-400 border-cyan-500/30 group-hover:border-cyan-400/60",          glow: "shadow-cyan-500/10"    },
  emerald: { gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",   accent: "text-emerald-400 border-emerald-500/30 group-hover:border-emerald-400/60", glow: "shadow-emerald-500/10" },
  amber:   { gradient: "from-amber-500/20 via-orange-500/10 to-transparent",   accent: "text-amber-400 border-amber-500/30 group-hover:border-amber-400/60",       glow: "shadow-amber-500/10"   },
  pink:    { gradient: "from-pink-500/20 via-rose-500/10 to-transparent",      accent: "text-pink-400 border-pink-500/30 group-hover:border-pink-400/60",          glow: "shadow-pink-500/10"    },
  sky:     { gradient: "from-sky-500/20 via-blue-500/10 to-transparent",       accent: "text-sky-400 border-sky-500/30 group-hover:border-sky-400/60",             glow: "shadow-sky-500/10"     },
};

const ICON_PATHS = {
  database: "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125",
  chart:    "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
  funnel:   "M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z",
  scale:    "M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.97zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.97z",
  lock:     "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z",
  bag:      "M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z",
  globe:    "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418",
  map:      "M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z",
  doc:      "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
  heart:    "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
  language: "M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802",
  camera:   "M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z",
} as const;

const PROJECT_THEME: Record<string, { color: Accent; icon: keyof typeof ICON_PATHS }> = {
  "Oracle Forge":                               { color: "indigo",  icon: "database" },
  "Tenacious Sales Bench":                      { color: "cyan",    icon: "chart"    },
  "Conversion Engine":                          { color: "emerald", icon: "funnel"   },
  "Automaton Auditor":                          { color: "violet",  icon: "scale"    },
  "The Ledger":                                 { color: "sky",     icon: "lock"     },
  "Biiftuu":                                    { color: "amber",   icon: "bag"      },
  "Kebena Heritage & Connect":                  { color: "pink",    icon: "globe"    },
  "Brownfield Cartographer":                    { color: "emerald", icon: "map"      },
  "Document Intelligence Refinery":             { color: "cyan",    icon: "doc"      },
  "Dr. Abdi Specialty Dental Clinic":           { color: "sky",     icon: "heart"    },
  "Amharic Speech & Language Models":           { color: "amber",   icon: "language" },
  "AI-Powered Multilingual Virtual Tour Guide": { color: "violet",  icon: "camera"   },
};

function themeFor(title: string) {
  const t = PROJECT_THEME[title] ?? { color: "indigo" as Accent, icon: "doc" as const };
  const icon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d={ICON_PATHS[t.icon]} />
    </svg>
  );
  return { ...ACCENTS[t.color], icon };
}

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
  const { gradient, accent, icon } = themeFor(project.title);

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
                {project.url.includes("huggingface.co") ? "View on HuggingFace" : "Live Site"}
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
  const { gradient, accent, glow, icon } = themeFor(project.title);

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
                {project.url.includes("huggingface.co") ? "HuggingFace" : "Live"}
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
  const { accent, icon } = themeFor(project.title);

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
const FILTERS = ["All", "Agentic", "Evaluation", "AI/ML", "Backend", "Mobile"];

const FILTER_MAP: Record<string, string[]> = {
  "Agentic":    ["LangGraph", "LangChain", "Multi-Agent", "LangSmith", "Langfuse", "MCP", "Context Engineering"],
  "Evaluation": ["Evaluation", "SimPO", "LLM-as-Judge"],
  "AI/ML":      ["Gemini", "Gemini Vision", "RAG", "HuggingFace", "NLP", "PyTorch", "Speech-to-Text", "Text-to-Speech", "SimPO"],
  "Backend":    ["FastAPI", "Django", "Flask", "PostgreSQL", "Event Sourcing", "CQRS", "Docker", "MCP"],
  "Mobile":     ["Flutter", "Isar"],
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
          Selected Work
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
              Agent systems, evaluation benchmarks, and production backends — from DataAgentBench to client apps in three languages.
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
