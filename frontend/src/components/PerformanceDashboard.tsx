"use client";

import { useRef, useState, useEffect } from "react";
import { useInView } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
  AreaChart, Area,
} from "recharts";

// ── Data ────────────────────────────────────────────────────────────────────

const responseTimeData = [
  { label: "Before", value: 100, fill: "#4b5563" },
  { label: "After",  value: 40,  fill: "#6366f1" },
];

const auditSpeed = [
  { name: "Sequential", value: 100, fill: "#1e293b" },
  { name: "Parallel",   value: 40,  fill: "#22d3ee" },
];

const growthData = [
  { month: "M1",  users: 40  },
  { month: "M2",  users: 120 },
  { month: "M3",  users: 230 },
  { month: "M4",  users: 380 },
  { month: "M5",  users: 520 },
  { month: "M6",  users: 680 },
  { month: "M7",  users: 810 },
  { month: "M8",  users: 940 },
  { month: "M9",  users: 1050 },
];

// ── Animated bar fill ────────────────────────────────────────────────────────

function AnimatedBar({ value, fill, label }: { value: number; fill: string; label: string }) {
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
    <div ref={ref} className="space-y-1">
      <div className="flex justify-between text-xs text-gray-400">
        <span>{label}</span>
        <span style={{ color: fill }} className="font-semibold">{value}%</span>
      </div>
      <div className="h-3 rounded-full bg-gray-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, background: fill }}
        />
      </div>
    </div>
  );
}

// ── Custom tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label, unit = "" }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      {label && <p className="text-gray-400 mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color ?? p.fill }} className="font-semibold">
          {p.name ?? p.dataKey}: {p.value}{unit}
        </p>
      ))}
    </div>
  );
}

// ── Animated counter ─────────────────────────────────────────────────────────

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setVal(Math.round(p * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, to]);

  return <span ref={ref}>{val}{suffix}</span>;
}

// ── Section label ────────────────────────────────────────────────────────────

function CardLabel({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: accent }}>
      {children}
    </p>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function PerformanceDashboard() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section ref={sectionRef} id="performance" className="py-20">

      {/* Header */}
      <div className="mb-12 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-2">
          By the Numbers
        </p>
        <h2 className="text-3xl font-bold text-white">
          Performance &amp; Scale
        </h2>
        <p className="mt-3 text-gray-400 max-w-xl mx-auto text-sm">
          Real metrics from production systems — optimised for speed, accuracy, and growth.
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-4 mb-12">
        {[
          { value: 60, suffix: "%", label: "Faster API responses", accent: "#6366f1" },
          { value: 2, suffix: ".5×", label: "Faster audit processing", accent: "#22d3ee" },
          { value: 1000, suffix: "+", label: "Platform users scaled", accent: "#10b981" },
        ].map(({ value, suffix, label, accent }) => (
          <div
            key={label}
            className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5 text-center"
            style={{ boxShadow: `0 0 0 1px ${accent}22, 0 0 24px ${accent}0d` }}
          >
            <p className="text-3xl font-extrabold" style={{ color: accent }}>
              {inView ? <Counter to={value} suffix={suffix} /> : `0${suffix}`}
            </p>
            <p className="text-xs text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* ── 1. Bar chart: Response time ─────────────────────────── */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 flex flex-col gap-4">
          <div>
            <CardLabel accent="#6366f1">Dr. Abdi Specialty Dental Clinic</CardLabel>
            <h3 className="text-white font-semibold text-sm">API Response Time</h3>
            <p className="text-gray-500 text-xs mt-0.5">Django · Gunicorn · Nginx · GCS</p>
          </div>

          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={responseTimeData} barCategoryGap="40%">
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 110]} tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip unit="%" />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} isAnimationActive={inView} animationDuration={1200} animationEasing="ease-out">
                {responseTimeData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="space-y-2 mt-auto">
            <AnimatedBar value={100} fill="#4b5563" label="Before optimisation" />
            <AnimatedBar value={40}  fill="#6366f1" label="After optimisation" />
          </div>

          <p className="text-indigo-400 text-xs font-semibold text-center">
            ↓ 60% reduction in response time
          </p>
        </div>

        {/* ── 2. Pie chart: Audit speed ─────────────────────────── */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 flex flex-col gap-4">
          <div>
            <CardLabel accent="#22d3ee">Automaton Auditor</CardLabel>
            <h3 className="text-white font-semibold text-sm">Audit Processing Speed</h3>
            <p className="text-gray-500 text-xs mt-0.5">Parallel multi-agent vs sequential</p>
          </div>

          <div className="relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={auditSpeed}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={76}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  isAnimationActive={inView}
                  animationBegin={200}
                  animationDuration={1400}
                  animationEasing="ease-out"
                  strokeWidth={0}
                >
                  {auditSpeed.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip content={<ChartTooltip unit="%" />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center pointer-events-none">
              <span className="text-2xl font-extrabold text-cyan-400">
                2.5×
              </span>
              <span className="text-gray-500 text-[10px]">faster</span>
            </div>
          </div>

          <div className="flex justify-center gap-6 text-xs">
            {auditSpeed.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: d.fill }} />
                <span className="text-gray-400">{d.name}</span>
              </span>
            ))}
          </div>

          <p className="text-cyan-400 text-xs font-semibold text-center mt-auto">
            LangGraph · Gemini · 3 detective + 3 judge agents
          </p>
        </div>

        {/* ── 3. Area chart: User growth ──────────────────────────── */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 flex flex-col gap-4">
          <div>
            <CardLabel accent="#10b981">SkillBridge · A2SV</CardLabel>
            <h3 className="text-white font-semibold text-sm">Platform User Growth</h3>
            <p className="text-gray-500 text-xs mt-0.5">Education platform · 1 000+ active learners</p>
          </div>

          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={growthData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip unit=" users" />} cursor={{ stroke: "#10b981", strokeWidth: 1, strokeDasharray: "4 4" }} />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#growthGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
                isAnimationActive={inView}
                animationDuration={1600}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="flex items-end justify-between text-xs text-gray-500 mt-auto">
            <span>Launch</span>
            <span className="text-emerald-400 font-semibold text-sm">
              {inView ? <Counter to={1050} suffix="+ users" /> : "0 users"}
            </span>
          </div>

          <p className="text-emerald-400 text-xs font-semibold text-center">
            Scalable architecture · 9-month trajectory
          </p>
        </div>

      </div>
    </section>
  );
}
