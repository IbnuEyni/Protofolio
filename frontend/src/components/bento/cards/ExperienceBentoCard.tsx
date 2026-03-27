import BentoCard from "../BentoCard";

const ROLES = [
  { role: "Backend Project Lead",                    company: "NextGen Solutions",                       period: "2025 — Present", accent: "bg-indigo-500" },
  { role: "API Integration Specialist",              company: "Calldi",                                  period: "Dec 2024 — Apr 2025", accent: "bg-emerald-500" },
  { role: "AI Developer",                            company: "iCog-Labs",                               period: "Aug — Dec 2024", accent: "bg-violet-500" },
  { role: "Flutter Developer",                       company: "A2SV",                                    period: "2024 — Present", accent: "bg-cyan-500" },
  { role: "AI Researcher",                           company: "Ethiopian AI Institute",                  period: "2023 — 2024",   accent: "bg-amber-500" },
];

export default function ExperienceBentoCard() {
  return (
    <BentoCard accent="violet" className="lg:col-span-2">
      <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-4">
        Professional Experience
      </p>
      <div className="flex flex-col gap-3">
        {ROLES.map((r, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${r.accent}`} />
            <div className="flex-1 flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-white leading-tight">{r.role}</p>
                <p className="text-xs text-gray-400">{r.company}</p>
              </div>
              <span className="text-xs text-gray-600 whitespace-nowrap">{r.period}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-violet-500/10 blur-3xl" />
    </BentoCard>
  );
}
