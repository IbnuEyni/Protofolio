import { getExperience } from "@/lib/api";
import ExperienceTimeline from "./ExperienceTimeline";

export default async function Experience() {
  let experience = await getExperience().catch(() => []);

  return (
    <section id="experience" className="max-w-5xl mx-auto px-6 py-24">
      <p className="text-sm font-medium text-indigo-400 tracking-widest uppercase mb-2">Career</p>
      <h2 className="text-3xl font-bold text-white mb-3">Work Experience</h2>
      <p className="text-gray-500 text-sm mb-14">
        A timeline of roles, impact, and the teams I&apos;ve built with.
      </p>
      {experience.length === 0 ? (
        <p className="text-gray-500">No experience data available.</p>
      ) : (
        <ExperienceTimeline experience={experience} />
      )}
    </section>
  );
}
