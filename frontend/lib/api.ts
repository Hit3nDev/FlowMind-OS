const BASE = "http://localhost:8080";

export function getToken(): string { return (typeof window !== "undefined" && localStorage.getItem("fm_token")) || ""; }
export function getUser(): { username?: string; displayName?: string } {
  try { return JSON.parse(localStorage.getItem("fm_user") || "{}"); } catch { return {}; }
}
export function clearAuth() {
  localStorage.removeItem("fm_token");
  localStorage.removeItem("fm_user");
}

async function apiFetch<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: { "Content-Type": "application/json", "X-Token": getToken(), ...opts.headers },
  });
  if (res.status === 401) { clearAuth(); window.location.href = "/login"; throw new Error("Unauthorized"); }
  return res.json();
}

export const API = {
  health:      ()            => fetch(BASE + "/auth/health").then(r => r.json()),
  login:       (u: string, p: string) => apiFetch<any>("/auth/login", { method: "POST", body: JSON.stringify({ username: u, password: p }) }),
  signup:      (u: string, p: string, d: string, e: string) => apiFetch<any>("/auth/signup", { method: "POST", body: JSON.stringify({ username: u, password: p, displayName: d, email: e }) }),
  logout:      ()            => apiFetch("/auth/logout", { method: "POST" }),
  me:          ()            => apiFetch<any>("/auth/me"),
  setTracking: (en: boolean) => apiFetch("/auth/tracking", { method: "POST", body: JSON.stringify({ enabled: en }) }),
  status:      ()            => apiFetch<any>("/status"),
  logs:        ()            => apiFetch<any[]>("/logs"),
  predict:     (app: string) => apiFetch<any>(`/predict?currentApp=${encodeURIComponent(app)}`),
  transitions: ()            => apiFetch<any>("/transitions"),
  analytics:   ()            => apiFetch<any>("/analytics"),
  timeline:    ()            => apiFetch<any[]>("/timeline"),
  chat:        (msg: string) => apiFetch<any>("/chat", { method: "POST", body: JSON.stringify({ message: msg }) }),
  chatHistory: ()            => apiFetch<any[]>("/chat/history"),
  automate:    (action: string, body?: any) => apiFetch<any>(`/automate/${action}`, { method: "POST", body: JSON.stringify(body || {}) }),
};
