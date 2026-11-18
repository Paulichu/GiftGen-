import type { AgentTone, Currency, Job, Listing } from "./types";

export const TONES: AgentTone[] = ["friendly", "direct", "consultative"];
export const CURRENCIES: Currency[] = ["PLN", "EUR", "USD"];
export const MAX_PRICE = 10_000_000;

export interface ListingWorkspace {
  jobs: Job[];
  listings: Listing[];
}

export type ListingPatch = Record<string, unknown>;

export type PatchResult =
  | { ok: true; listing: Listing }
  | { ok: false; status: 400 | 404; error: string };

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function readHighlights(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim().slice(0, 90))
    .filter(Boolean)
    .slice(0, 6);
}

/**
 * Applies a patch to a copy of the listing and only writes it back once every
 * field has validated, so a rejected request cannot leave half of the edits in
 * the workspace.
 */
export function applyListingPatch(
  db: ListingWorkspace,
  id: string,
  patch: ListingPatch,
  now = new Date().toISOString()
): PatchResult {
  const entry = db.listings.find((item) => item.id === id);
  if (!entry) return { ok: false, status: 404, error: "Listing not found." };

  const next: Listing = {
    ...entry,
    agent: { ...entry.agent, highlights: [...entry.agent.highlights] },
  };

  if (patch.price !== undefined) {
    if (typeof patch.price !== "number" || !Number.isFinite(patch.price)) {
      return { ok: false, status: 400, error: "Price must be a number." };
    }
    if (patch.price < 0 || patch.price > MAX_PRICE) {
      return { ok: false, status: 400, error: "Price must be between 0 and 10 000 000." };
    }
    next.price = patch.price;
  }

  if (patch.currency !== undefined) {
    if (!CURRENCIES.includes(patch.currency as Currency)) {
      return { ok: false, status: 400, error: "Currency must be PLN, EUR or USD." };
    }
    next.currency = patch.currency as Currency;
  }

  if (patch.contact !== undefined) {
    const contact = text(patch.contact, 160);
    if (contact.length < 3) return { ok: false, status: 400, error: "Add an email or URL buyers can reach." };
    next.agent.contact = contact;
  }

  if (patch.title !== undefined) {
    const title = text(patch.title, 80);
    if (title.length < 3) return { ok: false, status: 400, error: "Offer titles need at least 3 characters." };
    next.title = title;
  }

  if (patch.summary !== undefined) next.summary = text(patch.summary, 320);

  if (patch.agentName !== undefined) {
    const agentName = text(patch.agentName, 40);
    if (agentName.length < 2) return { ok: false, status: 400, error: "Agent names need at least 2 characters." };
    next.agent.name = agentName;
  }

  if (patch.tone !== undefined) {
    if (!TONES.includes(patch.tone as AgentTone)) {
      return { ok: false, status: 400, error: "Tone must be friendly, direct or consultative." };
    }
    next.agent.tone = patch.tone as AgentTone;
  }

  if (patch.greeting !== undefined) {
    const greeting = text(patch.greeting, 200);
    if (greeting.length < 3) return { ok: false, status: 400, error: "Greetings need at least 3 characters." };
    next.agent.greeting = greeting;
  }

  if (patch.highlights !== undefined) next.agent.highlights = readHighlights(patch.highlights);

  if (patch.published !== undefined) {
    if (typeof patch.published !== "boolean") {
      return { ok: false, status: 400, error: "Published must be true or false." };
    }
    if (patch.published && !db.jobs.some((job) => job.id === entry.jobId)) {
      return { ok: false, status: 400, error: "This listing's build is gone; it cannot be published." };
    }
    next.published = patch.published;
  }

  next.updatedAt = now;
  Object.assign(entry, next);
  return { ok: true, listing: entry };
}
