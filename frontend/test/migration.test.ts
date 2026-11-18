import assert from "node:assert/strict";
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, it } from "node:test";

let store: typeof import("../src/lib/studio/store");
let workspace: string;
let previousCwd: string;
let dbFile: string;
let dataDir: string;

function makeJob(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: "job01",
    prompt: "Build a notes app with title, body and tags",
    name: "Notes",
    appType: "fullstack",
    status: "ready",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    currentVersion: 1,
    versions: [],
    messages: [],
    publish: null,
    ...overrides,
  };
}

const LEGACY_JOB = makeJob({ id: "legacy01", creditsUsed: 42 });

async function resetWorkspace(): Promise<void> {
  await rm(dataDir, { recursive: true, force: true });
  await mkdir(dataDir, { recursive: true });
}

async function seedLegacyState(): Promise<void> {
  const ledger = { credits: { starting: 500, used: 42 }, jobs: [LEGACY_JOB] };
  await writeFile(dbFile, JSON.stringify(ledger, null, 2), "utf8");
}

async function backups(): Promise<string[]> {
  const entries = await readdir(dataDir);
  return entries.filter((name) => name.startsWith("studio.json.corrupt-")).sort();
}

before(async () => {
  previousCwd = process.cwd();
  workspace = await mkdtemp(path.join(tmpdir(), "studio-state-"));
  dataDir = path.join(workspace, ".data");
  await mkdir(dataDir, { recursive: true });
  dbFile = path.join(dataDir, "studio.json");
  // The store resolves `.data` from the working directory at import time, so the
  // chdir has to happen before the module is loaded.
  process.chdir(workspace);
  store = await import("../src/lib/studio/store");
});

after(async () => {
  process.chdir(previousCwd);
  await rm(workspace, { recursive: true, force: true });
});

it("drops the credit ledger when reading a legacy workspace", async () => {
  await resetWorkspace();
  await seedLegacyState();

  const job = await store.findJob("legacy01");
  assert.ok(job, "legacy job should still load");
  assert.equal("creditsUsed" in (job as object), false);
  assert.equal(job.name, "Notes");
  assert.deepEqual(await store.readDb((db) => store.statsOf(db)), { jobs: 1, versions: 0, published: 0 });
});

it("writes the cleaned state back on the next save", async () => {
  await resetWorkspace();
  await seedLegacyState();

  await store.withDb((db) => {
    db.jobs[0].name = "Renamed";
  });

  const raw = await readFile(dbFile, "utf8");
  assert.equal(raw.includes("creditsUsed"), false);
  assert.equal(raw.includes('"credits"'), false);
  const parsed = JSON.parse(raw) as { jobs: Array<Record<string, unknown>> };
  assert.deepEqual(Object.keys(parsed), ["jobs"]);
  assert.equal(parsed.jobs[0].name, "Renamed");
});

it("starts empty when the state file is missing", async () => {
  await resetWorkspace();
  assert.deepEqual(await store.readDb((db) => store.statsOf(db)), { jobs: 0, versions: 0, published: 0 });
  assert.deepEqual(await backups(), []);
});

it("backs up invalid JSON, starts empty and accepts writes afterwards", async () => {
  await resetWorkspace();
  const broken = '{ "jobs": [ { "id": "broken" ';
  await writeFile(dbFile, broken, "utf8");

  assert.deepEqual(await store.readDb((db) => store.statsOf(db)), { jobs: 0, versions: 0, published: 0 });

  const saved = await backups();
  assert.equal(saved.length, 1, "the corrupt file should be kept as a backup");
  assert.equal(await readFile(path.join(dataDir, saved[0]), "utf8"), broken);
  assert.equal((await readdir(dataDir)).length, 1, "the live file should be moved away, not re-read");

  await store.withDb((db) => {
    db.jobs.push(makeJob({ id: "after-corruption", name: "Fresh" }) as unknown as (typeof db.jobs)[number]);
  });
  assert.deepEqual(await store.readDb((db) => store.statsOf(db)), { jobs: 1, versions: 0, published: 0 });
  assert.equal((await backups()).length, 1, "recovery must not create a second backup");
});

it("backs up a state file with the wrong shape and starts empty", async () => {
  await resetWorkspace();
  await writeFile(dbFile, JSON.stringify({ credits: { starting: 500, used: 0 }, jobs: "nope" }), "utf8");

  assert.deepEqual(await store.readDb((db) => store.statsOf(db)), { jobs: 0, versions: 0, published: 0 });
  assert.equal((await backups()).length, 1);
});
