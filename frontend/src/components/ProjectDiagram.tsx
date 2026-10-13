import { Fragment } from "react";

// Architecture sketches for featured projects. Every node comes straight from
// the project's own description, so the diagram never claims more than the copy.
type Stage = { label?: string; nodes: string[] };

const DIAGRAMS: Record<string, Stage[]> = {
  "Oracle Forge": [
    { label: "Ask", nodes: ["NL question"] },
    { label: "Context", nodes: ["Schema hints", "Domain knowledge", "Corrections memory"] },
    { label: "Agent", nodes: ["Analytics agent"] },
    { label: "Eval", nodes: ["DataAgentBench", "35.2% pass@1"] },
  ],
  "Tenacious Sales Bench": [
    { label: "Source", nodes: ["Conversion Engine failure traces"] },
    { label: "250 tasks", nodes: ["Signal grounding", "Tone", "Resource honesty", "Workflow"] },
    { label: "Judge", nodes: ["SimPO-trained judge"] },
    { label: "Publish", nodes: ["HuggingFace"] },
  ],
  "Conversion Engine": [
    { nodes: ["NEW"] },
    { nodes: ["EMAILED"] },
    { nodes: ["REPLIED"] },
    { nodes: ["QUALIFIED"] },
    { nodes: ["BOOKED"] },
  ],
  "Automaton Auditor": [
    { label: "Detectives", nodes: ["AST analysis", "PDF parsing", "Diagram vision"] },
    { label: "Judges", nodes: ["Prosecutor", "Defense", "Tech Lead"] },
    { label: "Synthesis", nodes: ["Deterministic verdict"] },
  ],
  "The Ledger": [
    { label: "Write", nodes: ["Commands"] },
    { label: "Event store", nodes: ["PostgreSQL events", "SHA-256 audit chain"] },
    { label: "Read side", nodes: ["Projections", "What-if replay", "MCP server · 9 tools"] },
  ],
  Biiftuu: [
    { label: "Clients", nodes: ["Flutter app", "Next.js admin"] },
    { label: "API", nodes: ["FastAPI"] },
    { label: "Languages", nodes: ["English", "Amharic", "Afan Oromo"] },
  ],
};

export default function ProjectDiagram({ title, className = "" }: { title: string; className?: string }) {
  const stages = DIAGRAMS[title];
  if (!stages) return null;
  const description = stages.map((s) => s.nodes.join(", ")).join(" → ");

  return (
    <div
      role="img"
      aria-label={`Architecture: ${description}`}
      // phones: stages stack top-to-bottom; wider screens: left-to-right
      className={`flex flex-col sm:flex-row items-stretch gap-1.5 rounded-xl border border-gray-800 bg-gray-950/60 p-3 ${className}`}
    >
      {stages.map((stage, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <span aria-hidden className="self-center text-gray-600 text-xs shrink-0">
              <span className="sm:hidden">↓</span>
              <span className="hidden sm:inline">→</span>
            </span>
          )}
          <div className="flex flex-row flex-wrap sm:flex-col sm:flex-nowrap items-center sm:items-stretch justify-center gap-1 min-w-0 flex-1">
            {stage.label && (
              <p className="w-full text-[9px] uppercase tracking-widest text-gray-500 text-center truncate">{stage.label}</p>
            )}
            {stage.nodes.map((n) => (
              <div
                key={n}
                className="rounded-md border border-white/10 bg-white/[0.03] px-1.5 py-1 text-[10px] leading-tight text-gray-300 text-center"
              >
                {n}
              </div>
            ))}
          </div>
        </Fragment>
      ))}
    </div>
  );
}
