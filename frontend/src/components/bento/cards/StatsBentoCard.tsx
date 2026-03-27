import BentoCard from "../BentoCard";

const STATS = [
  { value: "4+", label: "Years exp." },
  { value: "2k+", label: "Users impacted" },
  { value: "5",   label: "Companies" },
];

export default function StatsBentoCard() {
  return (
    <BentoCard accent="emerald" className="lg:col-span-1">
      <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-4">Impact</p>
      <div className="flex flex-col gap-4">
        {STATS.map((s) => (
          <div key={s.label}>
            <p className="text-2xl font-bold text-white leading-none">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-2xl" />
    </BentoCard>
  );
}
