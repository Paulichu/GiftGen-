import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Job, Listing, WorkspaceStats } from "./types";

export interface Database {
  jobs: Job[];
  listings: Listing[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "studio.json");

function emptyDb(): Database {
  return { jobs: [], listings: [] };
}

type LegacyJob = Job & { creditsUsed?: number };

function stripLegacyFields(job: LegacyJob): Job {
  const clean = { ...job };
  delete clean.creditsUsed;
  return clean;
}

/**
 * Moves an unreadable state file aside so the data is not lost and the next load
 * starts from a clean workspace instead of failing every request.
 */
async function quarantine(reason: string): Promise<void> {
  const target = `${DB_FILE}.corrupt-${new Date().toISOString().replace(/[:.]/g, "-")}.bak`;
  try {
    await fs.rename(DB_FILE, target);
    console.error(`studio.json is ${reason}: moved to ${path.basename(target)} and started from an empty workspace.`);
  } catch (error) {
    console.error(`studio.json is ${reason} and could not be backed up; starting from an empty workspace.`, error);
  }
}

async function loadDb(): Promise<Database> {
  let raw: string;
  try {
    raw = await fs.readFile(DB_FILE, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return emptyDb();
    throw error;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    await quarantine("not valid JSON");
    return emptyDb();
  }

  const workspace = parsed as { jobs?: unknown; listings?: unknown } | null;
  const jobs = workspace?.jobs;
  if (!Array.isArray(jobs)) {
    await quarantine("not a studio workspace");
    return emptyDb();
  }

  // Workspaces written before the studio became unlimited may still carry a
  // credits ledger (top-level `credits` plus per-job `creditsUsed`). Both are
  // dropped here, so they neither leak through the API nor come back on save.
  // Listings arrived later, so older workspaces simply start with none.
  const listings = Array.isArray(workspace?.listings) ? (workspace.listings as Listing[]) : [];
  return { jobs: (jobs as LegacyJob[]).map(stripLegacyFields), listings };
}

async function saveDb(db: Database): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const temp = `${DB_FILE}.${process.pid}.tmp`;
  await fs.writeFile(temp, JSON.stringify(db, null, 2), "utf8");
  await fs.rename(temp, DB_FILE);
}

let writeChain: Promise<unknown> = Promise.resolve();

export function withDb<T>(mutate: (db: Database) => T | Promise<T>): Promise<T> {
  const run = writeChain.then(async () => {
    const db = await loadDb();
    const result = await mutate(db);
    await saveDb(db);
    return result;
  });
  writeChain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

export function readDb<T>(read: (db: Database) => T): Promise<T> {
  return loadDb().then(read);
}

export function statsOf(db: Database): WorkspaceStats {
  return {
    jobs: db.jobs.length,
    versions: db.jobs.reduce((total, job) => total + job.versions.length, 0),
    published: db.jobs.filter((job) => job.publish !== null).length,
  };
}

export async function findJob(id: string): Promise<Job | null> {
  const db = await loadDb();
  return db.jobs.find((job) => job.id === id) ?? null;
}

export async function findPublished(slug: string): Promise<{ job: Job; versionNumber: number } | null> {
  const db = await loadDb();
  const job = db.jobs.find((entry) => entry.publish?.slug === slug);
  if (!job || !job.publish) return null;
  return { job, versionNumber: job.publish.version };
}

export async function findListing(id: string): Promise<Listing | null> {
  const db = await loadDb();
  return db.listings.find((listing) => listing.id === id) ?? null;
}

export async function findListingBySlug(slug: string): Promise<Listing | null> {
  const db = await loadDb();
  return db.listings.find((listing) => listing.slug === slug) ?? null;
}

export function newId(): string {
  return randomUUID().replace(/-/g, "").slice(0, 12);
}

export function nowIso(): string {
  return new Date().toISOString();
}
