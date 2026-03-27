const API = "/api";

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? sessionStorage.getItem("admin_token") ?? "" : "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: authHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `${method} ${path} failed`);
  return data;
}

export const adminLogin = (token: string) =>
  fetch(`${API}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

// Projects
export const createProject = (b: unknown) => req("POST", "/projects", b);
export const updateProject = (id: number, b: unknown) => req("PUT", `/projects/${id}`, b);
export const deleteProject = (id: number) => req("DELETE", `/projects/${id}`);

// Experience
export const createExperience = (b: unknown) => req("POST", "/experience", b);
export const updateExperience = (id: number, b: unknown) => req("PUT", `/experience/${id}`, b);
export const deleteExperience = (id: number) => req("DELETE", `/experience/${id}`);

// Skills
export const createSkill = (b: unknown) => req("POST", "/skills", b);
export const updateSkill = (id: number, b: unknown) => req("PUT", `/skills/${id}`, b);
export const deleteSkill = (id: number) => req("DELETE", `/skills/${id}`);

// Certifications
export const createCertification = (b: unknown) => req("POST", "/certifications", b);
export const updateCertification = (id: number, b: unknown) => req("PUT", `/certifications/${id}`, b);
export const deleteCertification = (id: number) => req("DELETE", `/certifications/${id}`);
