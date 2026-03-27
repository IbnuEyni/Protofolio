"use client";

import { motion } from "framer-motion";
import { cardVariants } from "./BentoGrid";

type Accent = "indigo" | "violet" | "cyan" | "emerald";

const accentMap: Record<Accent, { border: string; glow: string; tag: string }> = {
  indigo:  { border: "border-indigo-500/30",  glow: "hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]",  tag: "text-indigo-400 bg-indigo-500/10"  },
  violet:  { border: "border-violet-500/30",  glow: "hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]",  tag: "text-violet-400 bg-violet-500/10"  },
  cyan:    { border: "border-cyan-500/30",    glow: "hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]",   tag: "text-cyan-400 bg-cyan-500/10"      },
  emerald: { border: "border-emerald-500/30", glow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]",  tag: "text-emerald-400 bg-emerald-500/10"},
};

type Props = {
  accent?: Accent;
  className?: string;
  children: React.ReactNode;
};

export default function BentoCard({ accent = "indigo", className = "", children }: Props) {
  const a = accentMap[accent];
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`
        relative overflow-hidden rounded-2xl border bg-gray-900/60 backdrop-blur-sm
        bg-card-shine transition-shadow duration-300
        ${a.border} ${a.glow} ${className}
      `}
    >
      {/* subtle inner shine */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent" />
      <div className="relative z-10 h-full p-5">{children}</div>
    </motion.div>
  );
}

export { accentMap };
export type { Accent };
