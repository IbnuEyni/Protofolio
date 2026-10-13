import { getProjects, getSkills, type Project, type Skill } from "@/lib/api";
import { TIERS, tierFor, usesSkill } from "@/lib/skillTiers";
import SkillsNetwork from "./SkillsNetwork";

const CATEGORY_DOT: Record<string, string> = {
  Language: "bg-indigo-400",
  Framework: "bg-violet-400",
  "AI/ML": "bg-cyan-400",
  Data: "bg-emerald-400",
  DevOps: "bg-amber-400",
  Integrations: "bg-pink-400",
};

const TIER_PILL: Record<string, string> = {
  daily: "border-indigo-500/40 bg-indigo-500/10 text-white",
  production: "border-gray-700 bg-gray-800/60 text-gray-200",
  working: "border-gray-800 bg-transparent text-gray-400",
};

function SkillPill({ skill, tierId, projects }: { skill: Skill; tierId: string; projects: string[] }) {
  return (
    <li className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm ${TIER_PILL[tierId]}`}>
      <span aria-hidden className={`w-1.5 h-1.5 rounded-full ${CATEGORY_DOT[skill.category] ?? "bg-gray-500"}`} />
      {skill.name}
      {projects.length > 0 && (
        <>
          <span
            aria-hidden
            title={`Used in ${projects.join(", ")}`}
            className="text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded bg-white/5 text-gray-400"
          >
            {projects.length}
          </span>
          <span className="sr-only">, used in {projects.join(", ")}</span>
        </>
      )}
    </li>
  );
}

export default async function Skills() {
  const [skills, projects] = await Promise.all([
    getSkills().catch((err) => { console.error("[Skills] fetch failed:", err); return [] as Skill[]; }),
    getProjects().catch(() => [] as Project[]),
  ]);

  const projectsUsing = (skill: Skill) =>
    projects.filter((p) => p.tech_stack.some((tag) => usesSkill(tag, skill.name))).map((p) => p.title);

  const byTier = TIERS.map((tier) => ({
    tier,
    skills: skills
      .filter((s) => tierFor(s.proficiency).id === tier.id)
      .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)),
  })).filter((g) => g.skills.length > 0);

  const categories = [...new Set(skills.map((s) => s.category))].sort();

  return (
    <section id="skills" className="max-w-5xl mx-auto px-6 py-24">
      <p className="text-sm font-medium text-indigo-400 tracking-widest uppercase mb-2">Expertise</p>
      <h2 className="text-3xl font-bold text-white mb-3">Skills</h2>
      <p className="text-gray-500 text-sm mb-12">
        Grouped by how much I&apos;ve actually used them. The number is how many of the projects above use that skill.
      </p>

      {byTier.length === 0 ? (
        <p className="text-gray-500">No skills data available.</p>
      ) : (
        <div className="flex flex-col divide-y divide-gray-800/60">
          {byTier.map(({ tier, skills: tierSkills }) => (
            <div key={tier.id} className="grid md:grid-cols-[14rem_1fr] gap-4 md:gap-8 py-8 first:pt-0">
              <div>
                <h3 className="text-sm font-semibold text-white">{tier.label}</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{tier.blurb}</p>
              </div>
              <ul className="flex flex-wrap gap-2 content-start">
                {tierSkills.map((s) => (
                  <SkillPill key={s.id} skill={s} tierId={tier.id} projects={projectsUsing(s)} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {categories.length > 0 && (
        <ul aria-label="Categories" className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
          {categories.map((c) => (
            <li key={c} className="inline-flex items-center gap-1.5">
              <span aria-hidden className={`w-1.5 h-1.5 rounded-full ${CATEGORY_DOT[c] ?? "bg-gray-500"}`} />
              {c}
            </li>
          ))}
        </ul>
      )}

      <SkillsNetwork />
    </section>
  );
}
