import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, beforeEach, it } from "node:test";
import type { EmailDraft } from "../src/lib/studio/email";
import type { Listing } from "../src/lib/studio/types";

let workspace: string;
let previousCwd: string;
let route: typeof import("../src/app/api/listings/[id]/email/approve/route");
let store: typeof import("../src/lib/studio/store");
let approval: typeof import("../src/lib/studio/approval");
let limits: typeof import("../src/lib/studio/offerLimits");

const LISTING_ID = "listing01";
const SECRET = "test-approval-secret-0123456789";
const PASSWORD = "test-approval-password";

function draft(overrides: Partial<EmailDraft> = {}): EmailDraft {
  return {
    to: "buyer@example.com",
    from: "ip@ojjja.site",
    subject: "“Notes” — 1500 EUR",
    body: "Hi, here is the finished notes app you asked about.",
    ...overrides,
  };
}

const params = { params: { id: LISTING_ID } };

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request(`http://studio.test/api/listings/${LISTING_ID}/email/approve/`, {
    method: "POST",
    headers: {
      origin: "http://studio.test",
      "x-forwarded-for": "127.0.0.1",
      "content-type": "application/json",
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

before(async () => {
  process.env.OFFER_EMAIL_SECRET = SECRET;
  process.env.OFFER_APPROVAL_PASSWORD = PASSWORD;
  previousCwd = process.cwd();
  workspace = await mkdtemp(path.join(tmpdir(), "studio-approve-"));
  await mkdir(path.join(workspace, ".data"), { recursive: true });
  process.chdir(workspace);

  store = await import("../src/lib/studio/store");
  approval = await import("../src/lib/studio/approval");
  limits = await import("../src/lib/studio/offerLimits");
  route = await import("../src/app/api/listings/[id]/email/approve/route");

  await store.withDb((db) => {
    const listing: Listing = {
      id: LISTING_ID,
      slug: "notes",
      jobId: "job01",
      version: 1,
      title: "Notes app",
      summary: "Personal notes with tags",
      price: 1500,
      currency: "EUR",
      agent: {
        name: "Alex",
        tone: "friendly",
        greeting: "Hi, ask me about the notes app.",
        highlights: [],
        contact: "ip@ojjja.site",
      },
      published: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    db.listings.push(listing);
  });
});

after(async () => {
  process.chdir(previousCwd);
  await rm(workspace, { recursive: true, force: true });
});

beforeEach(() => {
  limits.approveLimiter.reset();
});

it("signs a valid draft into a token that can be spent once", async () => {
  const response = await route.POST(post(draft()), params);
  const payload = (await response.json()) as { token?: string; expiresAt?: string };

  assert.equal(response.status, 200);
  assert.ok(payload.token && payload.token.includes("."));
  assert.ok(payload.expiresAt && new Date(payload.expiresAt).getTime() > Date.now());

  const spent = approval.offerApproval().consume(payload.token, LISTING_ID);
  assert.equal(spent.ok, true);
  assert.deepEqual(spent.ok && spent.draft, draft());
});

it("rejects a draft from a mailbox the studio may not send from", async () => {
  const response = await route.POST(post(draft({ from: "admin@ojjja.site" })), params);
  const payload = (await response.json()) as { error: string };

  assert.equal(response.status, 400);
  assert.match(payload.error, /ip@ojjja\.site or compliance@ojjja\.site/);
});

it("rejects a body that is not JSON", async () => {
  const response = await route.POST(post("not json"), params);
  assert.equal(response.status, 400);
});

it("rejects another origin", async () => {
  const response = await route.POST(post(draft(), { origin: "https://evil.test" }), params);
  assert.equal(response.status, 403);
});

it("returns 404 when the listing is gone", async () => {
  const response = await route.POST(post(draft()), { params: { id: "missing" } });
  assert.equal(response.status, 404);
});

it("refuses to sign when OFFER_EMAIL_SECRET is missing", async () => {
  const secret = process.env.OFFER_EMAIL_SECRET;
  delete process.env.OFFER_EMAIL_SECRET;
  try {
    const response = await route.POST(post(draft()), params);
    const payload = (await response.json()) as { error: string };
    assert.equal(response.status, 503);
    assert.match(payload.error, /OFFER_EMAIL_SECRET/);
  } finally {
    process.env.OFFER_EMAIL_SECRET = secret;
  }
});

it("refuses an unaddressed request without the approval password", async () => {
  const request = new Request(`http://studio.test/api/listings/${LISTING_ID}/email/approve/`, {
    method: "POST",
    headers: { origin: "http://studio.test", "content-type": "application/json" },
    body: JSON.stringify(draft()),
  });
  const response = await route.POST(request, params);
  assert.equal(response.status, 401);
});

it("accepts a remote caller that sends the approval password", async () => {
  const response = await route.POST(
    post(draft(), { "x-forwarded-for": "203.0.113.9", "x-offer-approval": PASSWORD }),
    params
  );
  assert.equal(response.status, 200);
});
