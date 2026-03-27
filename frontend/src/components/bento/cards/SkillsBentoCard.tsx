import BentoCard from "../BentoCard";

const SKILLS: { category: string; color: string; items: string[] }[] = [
  { category: "Languages",   color: "bg-indigo-500",  items: ["Python", "Dart", "TypeScript", "SQL"] },
  { category: "Frameworks",  color: "bg-violet-500",  items: ["Flask", "FastAPI", "Flutter", "Next.js"] },
  { category: "AI / ML",     color: "bg-cyan-500",    items: ["PyTorch", "HuggingFace", "NLP", "RAG"] },
  { category: "Infra",       color: "bg-emerald-500", items: ["PostgreSQL", "Docker", "Redis", "AWS"] },
];

export default function SkillsBentoCard() {
  return (
    <BentoCard accent="cyan" className="lg:col-span-2 lg:row-span-2">
      <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-4">Core Skills</p>
      <div className="grid grid-cols-2 gap-4">
        {SKILLS.map((group) => (
          <div key={group.category}>
            <div className="flex items-center gap-1.5 mb-2">
              <div className={`w-1.5 h-1.5 rounded-full ${group.color}`} />
              <p className="text-xs text-gray-500 font-medium">{group.category}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {group.items.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded-md text-xs text-gray-300 bg-gray-800/80 border border-gray-700/60"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute -top-8 -right-8 w-36 h-36 rounded-full bg-cyan-500/8 blur-3xl" />
    </BentoCard>
  );
}
