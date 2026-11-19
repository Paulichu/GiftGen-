import assert from "node:assert/strict";
import { it } from "node:test";
import { clientKey, SlidingWindowLimiter } from "../src/lib/studio/ratelimit";

it("allows six questions per window and rejects the seventh", () => {
  const limiter = new SlidingWindowLimiter(6, 60_000);
  const start = 1_000_000;

  for (let index = 0; index < 6; index += 1) {
    const result = limiter.check("1.2.3.4", start + index * 100);
    assert.equal(result.allowed, true, `question ${index + 1} should pass`);
    assert.equal(result.remaining, 5 - index);
  }

  const blocked = limiter.check("1.2.3.4", start + 600);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.remaining, 0);
  assert.ok(blocked.retryAfterSeconds >= 1 && blocked.retryAfterSeconds <= 60);
});

it("lets the window expire and keeps keys independent", () => {
  const limiter = new SlidingWindowLimiter(2, 1_000);
  const start = 5_000;

  assert.equal(limiter.check("a", start).allowed, true);
  assert.equal(limiter.check("a", start + 10).allowed, true);
  assert.equal(limiter.check("a", start + 20).allowed, false);

  assert.equal(limiter.check("b", start + 30).allowed, true, "another IP keeps its own budget");
  assert.equal(limiter.check("a", start + 1_001).allowed, true, "the window slid past the old hits");
});

it("never grows without bound when many IPs ask once", () => {
  const limiter = new SlidingWindowLimiter(6, 1_000);

  for (let index = 0; index < 600; index += 1) {
    limiter.check(`ip-${index}`, 10_000);
  }
  assert.equal(limiter.size, 600);

  limiter.check("fresh", 20_000);
  assert.ok(limiter.size < 600, "entries outside the window are pruned");
});

it("reads the buyer address from proxy headers", () => {
  assert.equal(
    clientKey(new Request("https://studio.test/api/offers/x/chat", { headers: { "x-forwarded-for": "203.0.113.7, 10.0.0.1" } })),
    "203.0.113.7"
  );
  assert.equal(
    clientKey(new Request("https://studio.test/api/offers/x/chat", { headers: { "x-real-ip": "198.51.100.9" } })),
    "198.51.100.9"
  );
  assert.equal(clientKey(new Request("https://studio.test/api/offers/x/chat")), "unknown");
});
