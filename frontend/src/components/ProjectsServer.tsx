import { getProjects } from "@/lib/api";
import ProjectsClient from "./Projects";

export default async function Projects() {
  let projects: import("@/lib/api").Project[] = [];
  try {
    projects = await getProjects();
  } catch (err) {
    console.error("[Projects] fetch failed:", err);
  }
  return <ProjectsClient projects={projects} />;
}
