import BentoCard from "../BentoCard";

const HIGHLIGHTS = [
  { label: "Amharic NLP",      desc: "12% WER reduction — fine-tuned transformers for classification & NER" },
  { label: "RAG Systems",      desc: "40% accuracy gain — Neo4j recommendation & retrieval-augmented search" },
  { label: "Facial Recognition", desc: "10% accuracy improvement — CV pipelines at Ethiopian AI Institute" },
];

export default function AIResearchBentoCard() {
  return (
    <BentoCard accent="cyan" className="lg:col-span-2">
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">AI Research</p>
        <span className="px-2 py-0.5 rounded-full text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20">
          iCog-Labs
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {HIGHLIGHTS.map((h) => (
          <div key={h.label} className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-800/40 border border-gray-700/40">
            <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white">{h.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{h.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute -bottom-6 -right-6 w-28 h-28 rounded-full bg-cyan-500/10 blur-2xl" />
    </BentoCard>
  );
}
