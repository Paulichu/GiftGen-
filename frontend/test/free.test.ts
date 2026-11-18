import assert from "node:assert/strict";
import { it } from "node:test";
import { statsOf } from "../src/lib/studio/store";
import type { Job } from "../src/lib/studio/types";

function fakeJob(overrides: Partial<Job>): Job {
  return {
    id: "job",
    prompt: "prompt",
    name: "App",
    appType: "fullstack",
    status: "ready",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    currentVersion: 1,
    versions: [],
    messages: [],
    publish: null,
    ...overrides,
  } as Job;
}

it("counts usage without any credit ledger", () => {
  const job = fakeJob({
    versions: [
      { number: 1 } as Job["versions"][number],
      { number: 2 } as Job["versions"][number],
    ],
    publish: { slug: "app-abc", version: 2, publishedAt: "2026-01-01T00:00:00.000Z" },
  });

  const stats = statsOf({ jobs: [job, fakeJob({})] });

  assert.deepEqual(stats, { jobs: 2, versions: 2, published: 1 });
  assert.deepEqual(Object.keys(stats).sort(), ["jobs", "published", "versions"]);
});
