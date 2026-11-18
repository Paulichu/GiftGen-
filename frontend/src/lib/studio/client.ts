import type { AppType, Job, WorkspaceStats } from "./types";

export interface JobSummary {
  id: string;
  name: string;
  prompt: string;
  appType: AppType;
  status: "ready" | "published";
  currentVersion: number;
  versionCount: number;
  updatedAt: string;
  publishedSlug: string | null;
  fieldCount: number;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    cache: "no-store",
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });

  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    const detail = typeof payload.error === "string" ? payload.error : `Request failed (${response.status})`;
    throw new Error(detail);
  }
  return payload as T;
}

export const studio = {
  stats: () => request<WorkspaceStats>("/api/stats"),
  jobs: () => request<JobSummary[]>("/api/jobs"),
  job: (id: string) => request<Job>(`/api/jobs/${id}`),
  create: (prompt: string, appType: AppType) =>
    request<Job>("/api/jobs", { method: "POST", body: JSON.stringify({ prompt, appType }) }),
  iterate: (id: string, content: string) =>
    request<Job>(`/api/jobs/${id}/messages`, { method: "POST", body: JSON.stringify({ content }) }),
  publish: (id: string) => request<Job>(`/api/jobs/${id}/publish`, { method: "POST" }),
  rollback: (id: string, version: number) =>
    request<Job>(`/api/jobs/${id}/rollback`, {
      method: "POST",
      body: JSON.stringify({ version }),
    }),
  remove: (id: string) => request<{ ok: boolean }>(`/api/jobs/${id}`, { method: "DELETE" }),
};

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}
