"use client";

import { useRef, useState, useEffect } from "react";
import { useInView } from "framer-motion";

// ── Data (every figure is a measured result from a shipped system) ──────────

const passAtOne = [
  { label: "Oracle Forge", value: 35.2, fill: "#6366f1" },
  { label: "SOTA ceiling", value: 54.3, fill: "#475569" },
];

const AUDITOR_STAGES = [
  { name: "Detectives", agents: ["AST analysis", "PDF parsing", "Diagram vision"] },
  { name: "Judges",     agents: ["Prosecutor", "Defense", "Tech Lead"] },
  { name: "Synthesis",  agents: ["Deterministic verdict"] },
];

const roleImpact = [
  { value: 90, label: "Less manual data entry",      source: "ReiSearch" },
  { value: 60, label: "Faster data response",        source: "A2SV" },
  { value: 40, label: "Higher retrieval accuracy",   source: "iCog-Labs" },
  { value: 30, label: "More leads generated",        source: "ReiSearch" },
  { value: 15, label: "Higher user retention",       source: "iCog-Labs" },
  { value: 12, label: "Lower word error rate",       source: "EAII" },
  { value: 10, label: "Higher face-ID accuracy",     source: "EAII" },
];

// ── Animated bar fill ────────────────────────────────────────────────────────

function AnimatedBar({ value, label, source }: { value: number; label: string; source: string }) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => setWidth(value), 100);
      return () => clearTimeout(t);
    }
  }, [inView, value]);

  return (
    <div ref={ref} className="group space-y-1" title={`${label}: ${value}% · ${source}`}>
      <div className="flex justify-between gap-3 text-xs">
        <span className="text-gray-400 truncate">
          {label} <span className="text-gray-600">· {source}</span>
        </span>
        <span className="text-gray-200 font-semibold tabular-nums">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500 group-hover:bg-emerald-400 transition-all duration-1000 ease-out"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

// ── Pass@1 column chart (HTML bars on a 0–60% scale) ─────────────────────────

const AXIS_MAX = 60;

function PassAtOneChart() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="flex gap-3 h-[200px]">
      {/* y-axis */}
      <div className="flex flex-col justify-between text-[11px] text-gray-500 tabular-nums pb-6 text-right w-8">
        {[60, 40, 20, 0].map((t) => <span key={t} className="leading-none">{t}%</span>)}
      </div>
      {/* plot */}
      <div className="relative flex-1">
        <div className="absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between pointer-events-none">
          {[0, 1, 2, 3].map((i) => <div key={i} className="border-t border-dashed border-gray-800" />)}
        </div>
        <div className="absolute inset-x-0 top-0 bottom-6 flex items-end justify-around gap-[2px]">
          {passAtOne.map((d) => (
            <div key={d.label} className="group relative w-1/4 h-full flex flex-col justify-end items-center" title={`${d.label}: ${d.value}% pass@1`}>
              <span className="text-xs font-semibold text-gray-200 mb-1 tabular-nums">{d.value}%</span>
              <div
                className="w-full rounded-t-[4px] transition-[height] duration-1000 ease-out group-hover:brightness-125"
                style={{ height: inView ? `${(d.value / AXIS_MAX) * 100}%` : "0%", background: d.fill }}
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-5 flex justify-around text-[11px] text-gray-400">
          {passAtOne.map((d) => <span key={d.label} className="w-1/4 text-center whitespace-nowrap">{d.label}</span>)}
        </div>
      </div>
    </div>
  );
}

// ── Animated counter (supports decimals and a prefix) ────────────────────────

function formatCount(v: number, prefix: string, suffix: string, decimals: number) {
  return `${prefix}${v.toFixed(decimals)}${suffix}`;
}

function Counter({ to, prefix = "", suffix = "", decimals = 0 }: { to: number; prefix?: string; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const format = (v: number) => formatCount(v, prefix, suffix, decimals);

  // writes the DOM text directly each frame — no React re-render per tick
  useEffect(() => {
    if (!inView || !ref.current) return;
    const el = ref.current;
    const format = (v: number) => formatCount(v, prefix, suffix, decimals);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = format(to); return; }
    const duration = 1400;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = format(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, prefix, suffix, decimals]);

  return <span ref={ref} className="tabular-nums">{format(0)}</span>;
}

// ── Section label ────────────────────────────────────────────────────────────

function CardLabel({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: accent }}>
      {children}
    </p>
  );
}

const KPIS = [
  { to: 35.2, decimals: 1, suffix: "%",  label: "pass@1 on DataAgentBench", accent: "#6366f1" },
  { to: 45,   suffix: "s",               label: "To audit a repository",    accent: "#8b5cf6" },
  { to: 0.02, decimals: 2, prefix: "$",  label: "Cost per audit",           accent: "#22d3ee" },
  { to: 250,                             label: "Benchmark tasks published", accent: "#10b981" },
];

// ── Main component ───────────────────────────────────────────────────────────

export default function PerformanceDashboard() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section ref={sectionRef} id="performance" className="py-20 scroll-mt-16">

      {/* Header */}
      <div className="mb-12 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-2">
          By the Numbers
        </p>
        <h2 className="text-3xl font-bold text-white">
          Results, Measured
        </h2>
        <p className="mt-3 text-gray-400 max-w-xl mx-auto text-sm">
          Every figure below comes from a shipped system or a production role — no projections.
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {KPIS.map(({ label, accent, ...c }) => (
          <div
            key={label}
            className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5 text-center"
            style={{ boxShadow: `0 0 0 1px ${accent}22, 0 0 24px ${accent}0d` }}
          >
            <p className="text-3xl font-extrabold text-white">
              <Counter {...c} />
            </p>
            <p className="text-xs text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* ── 1. Oracle Forge vs SOTA ─────────────────────────────── */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 flex flex-col gap-4">
          <div>
            <CardLabel accent="#818cf8">Oracle Forge</CardLabel>
            <h3 className="text-white font-semibold text-sm">DataAgentBench pass@1</h3>
            <p className="text-gray-500 text-xs mt-0.5">54 queries · 12 datasets · 9 domains</p>
          </div>

          <PassAtOneChart />

          <p className="text-gray-400 text-xs leading-relaxed mt-auto">
            <span className="text-indigo-300 font-semibold">65% of the SOTA ceiling with zero fine-tuning</span> —
            schema hints → domain knowledge → corrections memory.
          </p>
        </div>

        {/* ── 2. Automaton Auditor pipeline ───────────────────────── */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 flex flex-col gap-4">
          <div>
            <CardLabel accent="#a78bfa">Automaton Auditor</CardLabel>
            <h3 className="text-white font-semibold text-sm">7-agent Digital Courtroom</h3>
            <p className="text-gray-500 text-xs mt-0.5">LangGraph fan-out / fan-in</p>
          </div>

          <div className="flex items-stretch gap-2 flex-1">
            {AUDITOR_STAGES.map((stage, si) => (
              <div key={stage.name} className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 text-center">{stage.name}</p>
                  <div className="flex flex-col gap-1.5 justify-center h-full">
                    {stage.agents.map((a) => (
                      <div
                        key={a}
                        title={a}
                        className="rounded-md border border-violet-500/30 bg-violet-500/10 px-1.5 py-1.5 text-[10px] text-violet-200 text-center leading-tight"
                      >
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
                {si < AUDITOR_STAGES.length - 1 && <span className="text-gray-600 text-xs shrink-0">→</span>}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-800 mt-auto">
            <div className="text-center">
              <p className="text-2xl font-extrabold text-white">{inView ? <Counter to={45} suffix="s" /> : "0s"}</p>
              <p className="text-[11px] text-gray-500">per repository</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold text-white">{inView ? <Counter to={0.02} decimals={2} prefix="$" /> : "$0.00"}</p>
              <p className="text-[11px] text-gray-500">per audit</p>
            </div>
          </div>
        </div>

        {/* ── 3. Measured impact across roles ─────────────────────── */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 flex flex-col gap-4">
          <div>
            <CardLabel accent="#34d399">Across Roles</CardLabel>
            <h3 className="text-white font-semibold text-sm">Measured improvements</h3>
            <p className="text-gray-500 text-xs mt-0.5">Percent change, per role</p>
          </div>

          <div className="space-y-3">
            {roleImpact.map((r) => <AnimatedBar key={r.label} {...r} />)}
          </div>
        </div>

      </div>
    </section>
  );
}
