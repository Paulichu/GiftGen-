import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, beforeEach, it } from "node:test";
import type { EmailDraft } from "../src/lib/studio/email";
import type { Listing } from "../src/lib/studio/types";

let workspace: string;
let previousCwd: string;
let route: typeof import("../src/app/api/listings/[id]/email/send/route");
let store: typeof import("../src/lib/studio/store");
let approval: typeof import("../src/lib/studio/approval");
let limits: typeof import("../src/lib/studio/offerLimits");

const LISTING_ID = "listing01";
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

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request(`http://studio.test/api/listings/${LISTING_ID}/email/send/`, {
    method: "POST",
    headers: {
      origin: "http://studio.test",
      "x-offer-approval": PASSWORD,
      "content-type": "application/json",
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const params = { params: { id: LISTING_ID } };

beforeEach(() => {
  limits.sendLimiter.reset();
  limits.sendPasswordLimiter.reset();
});

before(async () => {
  // Signing is refused without a configured secret, so the route needs one here.
  process.env.OFFER_EMAIL_SECRET = "test-approval-secret-0123456789";
  process.env.OFFER_APPROVAL_PASSWORD = PASSWORD;
  previousCwd = process.cwd();
  workspace = await mkdtemp(path.join(tmpdir(), "studio-send-"));
  await mkdir(path.join(workspace, ".data"), { recursive: true });
  // The store resolves `.data` from the working directory at import time.
  process.chdir(workspace);

  store = await import("../src/lib/studio/store");
  approval = await import("../src/lib/studio/approval");
  limits = await import("../src/lib/studio/offerLimits");
  route = await import("../src/app/api/listings/[id]/email/send/route");

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

it("rejects a send without a token", async () => {
  const response = await route.POST(post({}), params);
  const payload = (await response.json()) as { error: string };

  assert.equal(response.status, 400);
  assert.match(payload.error, /approval token is required/);
});

it("rejects a body that is not JSON", async () => {
  const response = await route.POST(post("not json"), params);
  assert.equal(response.status, 400);
});

it("rejects a send from another origin", async () => {
  const response = await route.POST(post({}, { origin: "https://evil.test" }), params);
  assert.equal(response.status, 403);
});

it("refuses an unaddressed request when no approval password is configured", async () => {
  const password = process.env.OFFER_APPROVAL_PASSWORD;
  delete process.env.OFFER_APPROVAL_PASSWORD;
  try {
    const request = new Request(`http://studio.test/api/listings/${LISTING_ID}/email/send/`, {
      method: "POST",
      headers: { origin: "http://studio.test", "content-type": "application/json" },
      body: "{}",
    });
    const response = await route.POST(request, params);
    assert.equal(response.status, 401);
  } finally {
    if (password === undefined) delete process.env.OFFER_APPROVAL_PASSWORD;
    else process.env.OFFER_APPROVAL_PASSWORD = password;
  }
});

it("refuses a token when no signing secret is configured", async () => {
  const secret = process.env.OFFER_EMAIL_SECRET;
  delete process.env.OFFER_EMAIL_SECRET;
  try {
    const response = await route.POST(post({ token: "anything" }), params);
    const payload = (await response.json()) as { error: string };
    assert.equal(response.status, 503);
    assert.match(payload.error, /OFFER_EMAIL_SECRET/);
  } finally {
    process.env.OFFER_EMAIL_SECRET = secret;
  }
});

it("rate-limits wrong approval passwords on a short budget instead of letting them be guessed", async () => {
  const attempts: number[] = [];
  for (let index = 0; index < 5; index += 1) {
    const response = await route.POST(post({ token: "x" }, { "x-offer-approval": `guess-${index}` }), params);
    attempts.push(response.status);
  }
  assert.deepEqual(attempts, [401, 401, 401, 401, 401]);

  const blocked = await route.POST(post({ token: "x" }, { "x-offer-approval": "guess-5" }), params);
  const payload = (await blocked.json()) as { error: string };
  assert.equal(blocked.status, 429);
  assert.match(payload.error, /Too many wrong approval passwords/);
  const retryAfter = Number(blocked.headers.get("retry-after"));
  // Short budget: wait in minutes, not in the full hour of the send budget.
  assert.ok(retryAfter > 0 && retryAfter <= 600, `unexpected retry-after ${retryAfter}`);
});

it("does not spend the send budget on wrong passwords", async () => {
  for (let index = 0; index < 5; index += 1) {
    const wrong = await route.POST(post({ token: "x" }, { "x-offer-approval": `typo-${index}` }), params);
    assert.equal(wrong.status, 401);
  }

  // Once the typo budget is exhausted, the send budget still has all its room.
  limits.sendPasswordLimiter.reset();
  const { token } = approval.offerApproval().issue(LISTING_ID, draft());
  const sent = await route.POST(post({ token }), params);
  const payload = (await sent.json()) as { error?: string };
  assert.equal(sent.status, 503);
  assert.match(payload.error ?? "", /SMTP_PASS/);
});

it("rate-limits real sends on their own hourly budget", async () => {
  for (let index = 0; index < 5; index += 1) {
    const { token } = approval.offerApproval().issue(LISTING_ID, draft());
    const response = await route.POST(post({ token }), params);
    const payload = (await response.json()) as { error?: string };
    assert.equal(response.status, 503);
    assert.match(payload.error ?? "", /SMTP_PASS/);
  }

  const { token } = approval.offerApproval().issue(LISTING_ID, draft());
  const blocked = await route.POST(post({ token }), params);
  const payload = (await blocked.json()) as { error: string };
  assert.equal(blocked.status, 429);
  assert.match(payload.error, /Too many sends/);
  assert.ok(Number(blocked.headers.get("retry-after")) > 600);

  // The throttled approval was not spent, so it still works once the hour rolls over.
  limits.sendLimiter.reset();
  const retried = await route.POST(post({ token }), params);
  assert.equal(retried.status, 503);
});

it("consumes the approval, then refuses to reuse it", async () => {
  const { token } = approval.offerApproval().issue(LISTING_ID, draft());

  const first = await route.POST(post({ token }), params);
  const firstPayload = (await first.json()) as { error?: string };
  // No SMTP_PASS in tests, so the approved send reaches the transport guard.
  assert.equal(first.status, 503);
  assert.match(firstPayload.error ?? "", /SMTP_PASS/);

  const replay = await route.POST(post({ token }), params);
  const replayPayload = (await replay.json()) as { error: string };
  assert.equal(replay.status, 409);
  assert.match(replayPayload.error, /already been used/);
});
