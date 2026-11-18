import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, it } from "node:test";
import type { Listing } from "../src/lib/studio/types";

let store: typeof import("../src/lib/studio/store");
let workspace: string;
let dataDir: string;
let dbFile: string;
let previousCwd: string;

function makeListing(overrides: Partial<Listing> = {}): Listing {
  return {
    id: "listing01",
    slug: "notes-app",
    jobId: "job01",
    version: 1,
    title: "Notes app",
    summary: "Personal notes with tags",
    price: 1200,
    currency: "PLN",
    agent: {
      name: "Alex",
      tone: "friendly",
      greeting: "Hi, ask me about the notes app.",
      highlights: ["No backend needed"],
      contact: "hello@studio.dev",
    },
    published: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

async function resetWorkspace(): Promise<void> {
  await rm(dataDir, { recursive: true, force: true });
  await mkdir(dataDir, { recursive: true });
}

before(async () => {
  previousCwd = process.cwd();
  workspace = await mkdtemp(path.join(tmpdir(), "studio-listings-"));
  dataDir = path.join(workspace, ".data");
  await mkdir(dataDir, { recursive: true });
  dbFile = path.join(dataDir, "studio.json");
  // The store resolves `.data` from the working directory at import time.
  process.chdir(workspace);
  store = await import("../src/lib/studio/store");
});

after(async () => {
  process.chdir(previousCwd);
  await rm(workspace, { recursive: true, force: true });
});

it("stores listings beside jobs and reads them back by id and slug", async () => {
  await resetWorkspace();

  await store.withDb((db) => {
    db.listings.push(makeListing());
  });

  const byId = await store.findListing("listing01");
  const bySlug = await store.findListingBySlug("notes-app");
  assert.ok(byId);
  assert.ok(bySlug);
  assert.equal(byId.title, "Notes app");
  assert.equal(bySlug.agent.contact, "hello@studio.dev");
  assert.equal(await store.findListing("missing"), null);
  assert.equal(await store.findListingBySlug("missing"), null);
});

it("keeps listings on disk after an unrelated save and preserves both keys", async () => {
  await resetWorkspace();

  await store.withDb((db) => {
    db.listings.push(makeListing());
  });
  await store.withDb((db) => {
    db.listings[0].published = true;
    db.listings[0].price = 2500;
  });

  const raw = JSON.parse(await readFile(dbFile, "utf8")) as { jobs: unknown[]; listings: Listing[] };
  assert.deepEqual(Object.keys(raw), ["jobs", "listings"]);
  assert.equal(raw.listings.length, 1);
  assert.equal(raw.listings[0].price, 2500);
  assert.equal(raw.listings[0].published, true);
  assert.deepEqual(raw.jobs, []);
});

it("starts workspaces written before listings existed with an empty list", async () => {
  await resetWorkspace();
  await writeFile(dbFile, JSON.stringify({ jobs: [] }), "utf8");

  assert.deepEqual(await store.readDb((db) => db.listings), []);

  await store.withDb((db) => {
    db.listings.push(makeListing({ id: "later", slug: "later" }));
  });

  const raw = JSON.parse(await readFile(dbFile, "utf8")) as { listings: Listing[] };
  assert.equal(raw.listings.length, 1);
  assert.equal(raw.listings[0].slug, "later");
});

it("deletes a listing without touching the jobs", async () => {
  await resetWorkspace();
  await store.withDb((db) => {
    db.listings.push(makeListing(), makeListing({ id: "listing02", slug: "notes-app-2" }));
  });

  const removed = await store.withDb((db) => {
    const index = db.listings.findIndex((item) => item.id === "listing01");
    if (index === -1) return false;
    db.listings.splice(index, 1);
    return true;
  });

  assert.equal(removed, true);
  assert.equal(await store.findListing("listing01"), null);
  assert.equal((await store.findListing("listing02"))?.slug, "notes-app-2");
  assert.deepEqual(await store.readDb((db) => db.jobs), []);
});
