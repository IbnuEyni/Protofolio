import { getSkills, type Skill } from "@/lib/api";

function ProficiencyDots({ level }: { level: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < level ? "bg-indigo-500" : "bg-gray-700"}`} />
      ))}
    </div>
  );
}

function SkillGroup({ category, skills }: { category: string; skills: Skill[] }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">{category}</h3>
      <div className="flex flex-col gap-3">
        {skills.map((s) => (
          <div key={s.id} className="flex items-center justify-between">
            <span className="text-sm text-gray-300">{s.name}</span>
            <ProficiencyDots level={s.proficiency} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function Skills() {
  let skills: Skill[] = [];
  try {
    skills = await getSkills();
  } catch (err) {
    console.error("[Skills] fetch failed:", err);
  }

  const grouped = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});
  const categories = Object.keys(grouped).sort();

  return (
    <section id="skills" className="max-w-5xl mx-auto px-6 py-24">
      <p className="text-sm font-medium text-indigo-400 tracking-widest uppercase mb-2">Expertise</p>
      <h2 className="text-3xl font-bold text-white mb-12">Skills</h2>
      {categories.length === 0 ? (
        <p className="text-gray-500">No skills data available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {categories.map((cat) => <SkillGroup key={cat} category={cat} skills={grouped[cat]} />)}
        </div>
      )}
    </section>
  );
}
