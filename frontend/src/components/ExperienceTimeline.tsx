"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate, AnimatePresence } from "framer-motion";
import {
  Briefcase, Code2, Brain, TrendingUp, Users, Zap,
  Clock, Star, ArrowUpRight, X, ExternalLink,
} from "lucide-react";
import type { Experience } from "@/lib/api";

// ── Per-role static enrichment ────────────────────────────────────────────────────

type ImpactBadge = { icon: React.ReactNode; metric: string; label: string; color: string };
type RoleMeta    = { icon: React.ReactNode; accent: string; badges: ImpactBadge[]; company_url?: string; project_url?: string; project_label?: string };

const ROLE_META: Record<string, RoleMeta> = {
  "NextGen Solutions": {
    icon:   <Briefcase className="w-5 h-5" />,
    accent: "indigo",
    company_url: undefined,
    badges: [
      { icon: <Users className="w-3.5 h-3.5" />,     metric: "10,000+", label: "Daily active users",        color: "indigo" },
      { icon: <TrendingUp className="w-3.5 h-3.5" />, metric: "40%",     label: "Latency reduction",         color: "emerald" },
      { icon: <Zap className="w-3.5 h-3.5" />,        metric: "4",       label: "Engineers led",             color: "violet" },
    ],
  },
  "A2SV": {
    icon:   <Code2 className="w-5 h-5" />,
    accent: "violet",
    company_url: "https://www.a2sv.org/",
    project_url: "https://skillbridge.academy/",
    project_label: "SkillBridge",
    badges: [
      { icon: <Users className="w-3.5 h-3.5" />,     metric: "5,000+",  label: "Students reached",          color: "violet" },
      { icon: <Star className="w-3.5 h-3.5" />,       metric: "1,000+",  label: "SkillBridge users",         color: "indigo" },
      { icon: <Code2 className="w-3.5 h-3.5" />,      metric: "3",       label: "Open-source contributions", color: "cyan" },
    ],
  },
  "Calldi": {
    icon:   <Zap className="w-5 h-5" />,
    accent: "emerald",
    company_url: undefined,
    project_url: "https://homedispo.com/",
    project_label: "HomeDisp",
    badges: [
      { icon: <TrendingUp className="w-3.5 h-3.5" />, metric: "90%",     label: "Manual entry reduced",      color: "emerald" },
      { icon: <Zap className="w-3.5 h-3.5" />,        metric: "30%",     label: "Lead generation boost",     color: "cyan" },
    ],
  },
  "iCog-Labs": {
    icon:   <Brain className="w-5 h-5" />,
    accent: "cyan",
    company_url: "https://icog-labs.com/",
    badges: [
      { icon: <TrendingUp className="w-3.5 h-3.5" />, metric: "40%",     label: "Retrieval accuracy boost",  color: "cyan" },
      { icon: <Users className="w-3.5 h-3.5" />,      metric: "15%",     label: "User retention increase",   color: "emerald" },
      { icon: <Brain className="w-3.5 h-3.5" />,      metric: "2",       label: "NLP models shipped",        color: "violet" },
    ],
  },
  "Ethiopian Artificial Intelligence Institute": {
    icon:   <Star className="w-5 h-5" />,
    accent: "emerald",
    company_url: "https://aii.et/Home",
    badges: [
      { icon: <TrendingUp className="w-3.5 h-3.5" />, metric: "10%",     label: "Facial recognition accuracy", color: "emerald" },
      { icon: <Brain className="w-3.5 h-3.5" />,      metric: "12%",     label: "WER reduction (Amharic NLP)", color: "cyan" },
    ],
  },
};

const ACCENT_STYLES: Record<string, { dot: string; border: string; text: string; badge: string; glow: string; line: string }> = {
  indigo:  { dot: "bg-indigo-500",  border: "border-indigo-500/40",  text: "text-indigo-400",  badge: "bg-indigo-500/10 border-indigo-500/30 text-indigo-300",  glow: "shadow-[0_0_20px_rgba(99,102,241,0.2)]",  line: "from-indigo-500" },
  violet:  { dot: "bg-violet-500",  border: "border-violet-500/40",  text: "text-violet-400",  badge: "bg-violet-500/10 border-violet-500/30 text-violet-300",  glow: "shadow-[0_0_20px_rgba(139,92,246,0.2)]",  line: "from-violet-500" },
  cyan:    { dot: "bg-cyan-500",    border: "border-cyan-500/40",    text: "text-cyan-400",    badge: "bg-cyan-500/10 border-cyan-500/30 text-cyan-300",        glow: "shadow-[0_0_20px_rgba(34,211,238,0.2)]",  line: "from-cyan-500"   },
  emerald: { dot: "bg-emerald-500", border: "border-emerald-500/40", text: "text-emerald-400", badge: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",glow: "shadow-[0_0_20px_rgba(16,185,129,0.2)]",  line: "from-emerald-500"},
};

// ── Animated counter ───────────────────────────────────────────────────────────────

function AnimatedMetric({ value, triggered }: { value: string; triggered: boolean }) {
  const [display, setDisplay] = useState("0");
  const numMatch = value.match(/[\d,]+/);

  useEffect(() => {
    if (!triggered || !numMatch) { setDisplay(value); return; }
    const target = parseInt(numMatch[0].replace(/,/g, ""), 10);
    const prefix = value.slice(0, value.search(/[\d,]/));
    const suffix = value.slice(value.search(/[\d,]/) + numMatch[0].length);
    const ctrl   = animate(0, target, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(`${prefix}${Math.round(v).toLocaleString()}${suffix}`),
    });
    return () => ctrl.stop();
  }, [triggered]);

  return <span className="font-bold tabular-nums">{display}</span>;
}

// ── Impact badge ───────────────────────────────────────────────────────────────

function ImpactBadge({ badge, index, triggered }: { badge: ImpactBadge; index: number; triggered: boolean }) {
  const styles = ACCENT_STYLES[badge.color] ?? ACCENT_STYLES.indigo;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 8 }}
      animate={triggered ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ delay: 0.3 + index * 0.12, duration: 0.4, ease: "easeOut" }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${styles.badge}`}
    >
      <span className="opacity-80">{badge.icon}</span>
      <span>
        <AnimatedMetric value={badge.metric} triggered={triggered} />
        {" "}<span className="opacity-70 font-normal">{badge.label}</span>
      </span>
    </motion.div>
  );
}

// ── Experience modal ───────────────────────────────────────────────────────────────

function ExperienceModal({ exp, onClose }: { exp: Experience; onClose: () => void }) {
  const meta   = ROLE_META[exp.company] ?? ROLE_META["NextGen Solutions"];
  const accent = ACCENT_STYLES[meta.accent] ?? ACCENT_STYLES.indigo;

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
        {/* header */}
        <div className={`p-8 border-b border-gray-800/60 bg-gradient-to-br from-gray-900 to-gray-950`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className={`p-2.5 rounded-xl border bg-gray-900/60 ${accent.border} ${accent.text}`}>
                {meta.icon}
              </span>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">Experience</p>
                <h3 className="text-xl font-bold text-white">{exp.role}</h3>
                <p className={`text-sm font-semibold mt-0.5 ${accent.text}`}>{exp.company}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors mt-1">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-4 flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {exp.start_date} — {exp.end_date ?? "Present"}
          </p>
        </div>

        <div className="p-8 space-y-6">
          <p className="text-gray-300 leading-relaxed text-sm">{exp.description}</p>

          {/* impact badges */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Impact</p>
            <div className="flex flex-wrap gap-2">
              {meta.badges.map((b, i) => (
                <ImpactBadge key={b.label} badge={b} index={i} triggered />
              ))}
            </div>
          </div>

          {/* tech stack */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Tech Stack</p>
            <div className="flex flex-wrap gap-2">
              {exp.tech_stack.map((t) => (
                <span key={t} className="px-3 py-1 rounded-full text-xs font-medium border bg-gray-800/80 border-gray-700/60 text-gray-300">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* company + project links */}
          <div className="flex flex-wrap gap-3">
            {meta.company_url && (
              <a
                href={meta.company_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                Visit {exp.company}
              </a>
            )}
            {meta.project_url && (
              <a
                href={meta.project_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                {meta.project_label}
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Single timeline card ───────────────────────────────────────────────────────────────

function TimelineCard({ exp, index, isLast, onOpen }: { exp: Experience; index: number; isLast: boolean; onOpen: () => void }) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px 0px" });
  const meta   = ROLE_META[exp.company] ?? ROLE_META["NextGen Solutions"];
  const accent = ACCENT_STYLES[meta.accent] ?? ACCENT_STYLES.indigo;
  const isLeft = index % 2 === 0;

  return (
    <div ref={ref} className="relative grid grid-cols-[1fr_48px_1fr] items-start gap-0 mb-12 last:mb-0">

      {/* left slot */}
      <div className={`pr-6 ${isLeft ? "block" : "invisible pointer-events-none"}`}>
        {isLeft && <CardContent exp={exp} meta={meta} accent={accent} inView={inView} isLeft onOpen={onOpen} />}
      </div>

      {/* centre spine */}
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={`relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center
            ${accent.dot} border-gray-900 ${accent.glow} text-white shrink-0`}
        >
          {meta.icon}
        </motion.div>
        {!isLast && (
          <motion.div
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeInOut" }}
            style={{ originY: 0 }}
            className={`w-0.5 flex-1 min-h-[80px] bg-gradient-to-b ${accent.line} to-gray-800`}
          />
        )}
      </div>

      {/* right slot */}
      <div className={`pl-6 ${!isLeft ? "block" : "invisible pointer-events-none"}`}>
        {!isLeft && <CardContent exp={exp} meta={meta} accent={accent} inView={inView} isLeft={false} onOpen={onOpen} />}
      </div>
    </div>
  );
}

// ── Card content ───────────────────────────────────────────────────────────────

function CardContent({
  exp, meta, accent, inView, isLeft, onOpen,
}: {
  exp: Experience;
  meta: RoleMeta;
  accent: (typeof ACCENT_STYLES)[string];
  inView: boolean;
  isLeft: boolean;
  onOpen: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -32 : 32 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
      className={`rounded-2xl border bg-gray-900/60 backdrop-blur-sm p-5 hover:${accent.border}
        transition-all duration-300 ${accent.border} ${accent.glow}`}
    >
      {/* header */}
      <div className="flex items-start justify-between gap-3 mb-1">
        <div>
          <h3 className="text-base font-bold text-white leading-tight">{exp.role}</h3>
          <p className={`text-sm font-semibold mt-0.5 ${accent.text}`}>{exp.company}</p>
        </div>
        <button
          onClick={onOpen}
          className={`shrink-0 p-1.5 rounded-lg border ${accent.border} ${accent.text} opacity-60 hover:opacity-100 transition-opacity`}
          title="View details"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* date */}
      <p className="text-xs text-gray-500 mb-3 flex items-center gap-1.5">
        <Clock className="w-3 h-3" />
        {exp.start_date} — {exp.end_date ?? "Present"}
      </p>

      {/* description */}
      <p className="text-gray-400 text-sm leading-relaxed mb-4">{exp.description}</p>

      {/* impact badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {meta.badges.map((b, i) => (
          <ImpactBadge key={b.label} badge={b} index={i} triggered={inView} />
        ))}
      </div>

      {/* tech stack */}
      <div className="flex flex-wrap gap-1.5 pt-3 border-t border-gray-800">
        {exp.tech_stack.map((t) => (
          <span key={t} className="px-2 py-0.5 rounded-md text-xs text-gray-400 bg-gray-800/80 border border-gray-700/60">
            {t}
          </span>
        ))}
      </div>

      {/* company + project links inline */}
      <div className="mt-3 flex flex-wrap gap-3">
        {meta.company_url && (
          <a
            href={meta.company_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={`inline-flex items-center gap-1 text-xs ${accent.text} opacity-60 hover:opacity-100 transition-opacity`}
          >
            <ExternalLink className="w-3 h-3" />
            {exp.company}
          </a>
        )}
        {meta.project_url && (
          <a
            href={meta.project_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={`inline-flex items-center gap-1 text-xs ${accent.text} opacity-60 hover:opacity-100 transition-opacity`}
          >
            <ExternalLink className="w-3 h-3" />
            {meta.project_label}
          </a>
        )}
      </div>
    </motion.div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function ExperienceTimeline({ experience }: { experience: Experience[] }) {
  const [selected, setSelected] = useState<Experience | null>(null);

  return (
    <div className="relative">
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ originX: 0 }}
        className="h-px bg-gradient-to-r from-indigo-500 via-violet-500 to-transparent mb-12"
      />

      {experience.map((exp, i) => (
        <TimelineCard
          key={exp.id}
          exp={exp}
          index={i}
          isLast={i === experience.length - 1}
          onOpen={() => setSelected(exp)}
        />
      ))}

      <AnimatePresence>
        {selected && <ExperienceModal exp={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
