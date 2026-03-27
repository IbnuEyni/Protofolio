// Server components fetch directly via BACKEND_URL (server-side only, never
// exposed to the browser). Falls back to the rewrite proxy for local dev.
const API = process.env.NEXT_PUBLIC_INTERNAL_URL ?? "http://localhost:3000";

export type Project = {
  id: number;
  title: string;
  description: string;
  tech_stack: string[];
  url: string | null;
  github_url: string | null;
  featured: boolean;
};

export type Experience = {
  id: number;
  role: string;
  company: string;
  start_date: string;
  end_date: string | null;
  description: string;
  tech_stack: string[];
};

export type Skill = {
  id: number;
  name: string;
  category: string;
  proficiency: number;
};

export type Certification = {
  id: number;
  title: string;
  issuer: string;
  issued_date: string;
  url: string | null;
};

async function get<T>(path: string): Promise<T> {
  const url = process.env.BACKEND_URL
    ? `${process.env.BACKEND_URL}${path}`   // direct to backend, no proxy hop
    : `${API}${path}`;                       // local dev: through rewrite proxy

  const res = await fetch(url, {
    // no-store: always fetch fresh — prevents stale empty data when backend
    // cold-starts on Cloud Run or restarts locally
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json();
}

export const getProjects = () => get<Project[]>("/api/projects");
export const getExperience = () => get<Experience[]>("/api/experience");
export const getSkills = () => get<Skill[]>("/api/skills");
export const getCertifications = () => get<Certification[]>("/api/certifications");
