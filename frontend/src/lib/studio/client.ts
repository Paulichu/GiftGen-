import type { AgentTone, AppType, Currency, Job, Listing, WorkspaceStats } from "./types";

export interface ListingSummary {
  id: string;
  slug: string;
  title: string;
  price: number;
  currency: Currency;
  published: boolean;
  jobId: string;
  jobName: string;
  version: number;
  agentName: string;
  updatedAt: string;
}

export interface ListingInput {
  jobId: string;
  title?: string;
  summary?: string;
  price: number;
  currency: Currency;
  contact: string;
  agentName?: string;
  tone?: AgentTone;
  highlights?: string[];
}

export interface OfferReply {
  topic: string;
  reply: string;
  agent: string;
}

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
  listings: () => request<ListingSummary[]>("/api/listings"),
  createListing: (input: ListingInput) =>
    request<Listing>("/api/listings", { method: "POST", body: JSON.stringify(input) }),
  updateListing: (id: string, patch: Record<string, unknown>) =>
    request<Listing>(`/api/listings/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  removeListing: (id: string) => request<{ ok: boolean }>(`/api/listings/${id}`, { method: "DELETE" }),
  askOffer: (slug: string, message: string) =>
    request<OfferReply>(`/api/offers/${slug}/chat`, { method: "POST", body: JSON.stringify({ message }) }),
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
