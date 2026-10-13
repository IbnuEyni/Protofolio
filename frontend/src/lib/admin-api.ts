const API = "/api";

// Thrown after a 401 once the redirect to sign-in has started; callers
// shouldn't show their own error on top of that navigation.
export class SessionExpiredError extends Error {
  constructor() { super("Session expired. Please sign in again."); }
}

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
  // Flask's 404 page is HTML, so don't assume a JSON body on errors
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    // token rotated or wrong: drop it and send the user back to sign in
    sessionStorage.removeItem("admin_token");
    // a full reload on purpose: it discards all in-memory admin state, and this
    // plain module has no access to the Next router
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/admin/login");
    throw new SessionExpiredError();
  }
  if (!res.ok) throw new Error(data.error ?? `${method} ${path} failed (${res.status})`);
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
