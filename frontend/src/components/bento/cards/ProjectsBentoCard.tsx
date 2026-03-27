import BentoCard from "../BentoCard";

const PROJECTS = [
  {
    title: "Brownfield Cartographer",
    desc: "LLM-driven codebase knowledge graph with PageRank & data lineage",
    stack: ["Python", "LangChain", "NetworkX"],
    accent: "text-emerald-400",
  },
  {
    title: "Automaton Auditor",
    desc: "Parallel multi-agent judicial code auditing system",
    stack: ["LangGraph", "Gemini", "Pydantic"],
    accent: "text-violet-400",
  },
  {
    title: "Dr. Abdi Dental Clinic",
    desc: "Production clinic management with RBAC & GCS storage",
    stack: ["Django", "PostgreSQL", "Docker"],
    accent: "text-cyan-400",
  },
];

export default function ProjectsBentoCard() {
  return (
    <BentoCard accent="indigo" className="lg:col-span-2">
      <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-4">
        Featured Projects
      </p>
      <div className="flex flex-col gap-3">
        {PROJECTS.map((p) => (
          <div key={p.title} className="p-3 rounded-xl bg-gray-800/40 border border-gray-700/40 hover:border-indigo-500/30 transition-colors">
            <p className={`text-sm font-semibold ${p.accent}`}>{p.title}</p>
            <p className="text-xs text-gray-400 mt-0.5 mb-2">{p.desc}</p>
            <div className="flex flex-wrap gap-1.5">
              {p.stack.map((t) => (
                <span key={t} className="px-1.5 py-0.5 rounded text-xs text-gray-400 bg-gray-700/60">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute -top-6 -left-6 w-28 h-28 rounded-full bg-indigo-500/8 blur-2xl" />
    </BentoCard>
  );
}
