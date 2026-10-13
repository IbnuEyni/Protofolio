// Proficiency (1–5, edited in the admin CMS) is shown to visitors as a plain
// experience tier rather than an arbitrary dot rating.
export const TIERS = [
  { id: "daily", label: "Daily driver", blurb: "What I reach for first and ship with every week.", min: 5 },
  { id: "production", label: "Shipped in production", blurb: "Used in delivered client or production systems.", min: 4 },
  { id: "working", label: "Working knowledge", blurb: "Used on real projects; not my first choice.", min: 0 },
] as const;

export type Tier = (typeof TIERS)[number];

export function tierFor(proficiency: number): Tier {
  return TIERS.find((t) => proficiency >= t.min) ?? TIERS[TIERS.length - 1];
}

const ALIASES: Record<string, string[]> = { gcp: ["google"] };
const first = (s: string) => s.toLowerCase().split(/[\s/]+/)[0];

// A project tag counts as using a skill when the names match, or share their
// leading word ("Gemini API" ↔ "Gemini Vision", "HuggingFace Transformers" ↔ "HuggingFace").
export function usesSkill(tag: string, skill: string): boolean {
  const t = tag.toLowerCase(), s = skill.toLowerCase();
  return t === s || first(t) === first(s) || (ALIASES[s] ?? []).includes(first(t));
}
