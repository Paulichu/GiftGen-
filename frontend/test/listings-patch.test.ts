import assert from "node:assert/strict";
import { it } from "node:test";
import { applyListingPatch, type ListingWorkspace } from "../src/lib/studio/listings";
import type { Job, Listing } from "../src/lib/studio/types";

function makeJob(overrides: Partial<Job> = {}): Job {
  return {
    id: "job01",
    prompt: "Build a notes app with title, body and tags",
    name: "Notes",
    appType: "fullstack",
    status: "published",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    currentVersion: 1,
    versions: [],
    messages: [],
    publish: null,
    ...overrides,
  };
}

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

function workspace(listing = makeListing(), jobs: Job[] = [makeJob()]): ListingWorkspace {
  return { jobs, listings: [listing] };
}

function snapshot(db: ListingWorkspace) {
  return JSON.parse(JSON.stringify(db.listings[0])) as Listing;
}

it("applies a valid patch and bumps updatedAt", () => {
  const db = workspace();
  const result = applyListingPatch(
    db,
    "listing01",
    { price: 2500, currency: "EUR", contact: "buyer@studio.dev", agentName: "Marta", tone: "direct" },
    "2026-02-02T00:00:00.000Z"
  );

  assert.equal(result.ok, true);
  const listing = db.listings[0];
  assert.equal(listing.price, 2500);
  assert.equal(listing.currency, "EUR");
  assert.equal(listing.agent.contact, "buyer@studio.dev");
  assert.equal(listing.agent.name, "Marta");
  assert.equal(listing.agent.tone, "direct");
  assert.equal(listing.updatedAt, "2026-02-02T00:00:00.000Z");
});

it("rejects the whole patch when any field is invalid", () => {
  const db = workspace();
  const before = snapshot(db);

  const result = applyListingPatch(db, "listing01", {
    price: 9999,
    title: "Renamed offer",
    contact: "", // invalid: below the minimum length
  });

  assert.equal(result.ok, false);
  assert.equal(result.ok === false && result.status, 400);
  assert.deepEqual(snapshot(db), before, "nothing may be written when one field fails");
});

it("rejects non-numeric prices and invalid enums without touching the listing", () => {
  const db = workspace();
  const before = snapshot(db);

  for (const patch of [
    { price: "2500" },
    { price: Number.NaN },
    { price: -1 },
    { currency: "GBP" },
    { tone: "sarcastic" },
    { title: "ab" },
    { agentName: "x" },
    { greeting: "" },
    { published: "yes" },
  ]) {
    const result = applyListingPatch(db, "listing01", patch);
    assert.equal(result.ok, false, `patch should fail: ${JSON.stringify(patch)}`);
    assert.deepEqual(snapshot(db), before, `rejected patch must not write: ${JSON.stringify(patch)}`);
  }
});

it("refuses to publish a listing whose build is gone", () => {
  const db = workspace(makeListing(), []);
  const before = snapshot(db);

  const result = applyListingPatch(db, "listing01", { published: true, price: 1500 });

  assert.equal(result.ok, false);
  assert.equal(result.ok === false && result.error.includes("build is gone"), true);
  assert.deepEqual(snapshot(db), before);
});

it("publishes when the build still exists and trims highlights", () => {
  const db = workspace();
  const result = applyListingPatch(db, "listing01", {
    published: true,
    highlights: ["  No backend  ", "", "Ready to rebrand", "  ", "Third", "Fourth", "Fifth", "Sixth", "Seventh"],
  });

  assert.equal(result.ok, true);
  assert.equal(db.listings[0].published, true);
  assert.deepEqual(db.listings[0].agent.highlights, ["No backend", "Ready to rebrand", "Third", "Fourth", "Fifth", "Sixth"]);
});

it("returns 404 for an unknown listing", () => {
  const db = workspace();
  const result = applyListingPatch(db, "missing", { price: 100 });
  assert.equal(result.ok, false);
  assert.equal(result.ok === false && result.status, 404);
  assert.equal(db.listings[0].price, 1200);
});
