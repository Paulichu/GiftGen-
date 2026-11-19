import assert from "node:assert/strict";
import { it } from "node:test";
import { ApprovalTokens, decodeApproval } from "../src/lib/studio/approval";
import type { EmailDraft } from "../src/lib/studio/email";

function draft(overrides: Partial<EmailDraft> = {}): EmailDraft {
  return {
    to: "buyer@example.com",
    from: "ip@ojjja.site",
    subject: "“Notes” — 1500 EUR",
    body: "Hi, here is the finished notes app you asked about.",
    ...overrides,
  };
}

const SECRET = "test-secret-0123456789";

it("sends the draft carried inside the signed token", () => {
  const approvals = new ApprovalTokens(SECRET);
  const { token, expiresAt } = approvals.issue("listing01", draft(), 1_000_000);

  assert.ok(token.includes("."));
  assert.equal(new Date(expiresAt).getTime(), 1_000_000 + 15 * 60_000);

  const result = approvals.consume(token, "listing01", 1_000_100);
  assert.equal(result.ok, true);
  assert.deepEqual(result.ok && result.draft, draft());
});

it("rejects a missing or malformed token", () => {
  const approvals = new ApprovalTokens(SECRET);

  for (const token of [undefined, null, "", "garbage", "onlybody.", ".onlysig", "a.b.c"]) {
    const result = approvals.consume(token, "listing01", 1_000_000);
    assert.equal(result.ok, false, `should reject ${JSON.stringify(token)}`);
    assert.equal(result.ok === false && result.status, 400);
  }
});

it("rejects a token signed with a different secret", () => {
  const foreign = new ApprovalTokens("some-other-secret");
  const { token } = foreign.issue("listing01", draft(), 1_000_000);

  const result = new ApprovalTokens(SECRET).consume(token, "listing01", 1_000_100);
  assert.equal(result.ok, false);
  assert.equal(result.ok === false && result.status, 403);
  assert.match(result.ok === false ? result.error : "", /not valid/);
});

it("rejects a tampered draft even when the signature is kept", () => {
  const approvals = new ApprovalTokens(SECRET);
  const { token } = approvals.issue("listing01", draft(), 1_000_000);
  const [body, signature] = token.split(".");
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  payload.draft.to = "attacker@example.com";
  const forged = `${Buffer.from(JSON.stringify(payload)).toString("base64url")}.${signature}`;

  const result = approvals.consume(forged, "listing01", 1_000_100);
  assert.equal(result.ok, false);
  assert.equal(result.ok === false && result.status, 403);
});

it("rejects an expired approval", () => {
  const approvals = new ApprovalTokens(SECRET, 1_000);
  const { token } = approvals.issue("listing01", draft(), 1_000_000);

  const result = approvals.consume(token, "listing01", 1_000_000 + 1_001);
  assert.equal(result.ok, false);
  assert.equal(result.ok === false && result.status, 403);
  assert.match(result.ok === false ? result.error : "", /expired/);
});

it("rejects an approval issued for another listing", () => {
  const approvals = new ApprovalTokens(SECRET);
  const { token } = approvals.issue("listing01", draft(), 1_000_000);

  const result = approvals.consume(token, "listing02", 1_000_100);
  assert.equal(result.ok, false);
  assert.equal(result.ok === false && result.status, 403);
});

it("uses each approval token only once", () => {
  const approvals = new ApprovalTokens(SECRET);
  const { token } = approvals.issue("listing01", draft(), 1_000_000);

  assert.equal(approvals.consume(token, "listing01", 1_000_100).ok, true);
  const replay = approvals.consume(token, "listing01", 1_000_200);

  assert.equal(replay.ok, false);
  assert.equal(replay.ok === false && replay.status, 409);
  assert.match(replay.ok === false ? replay.error : "", /already been used/);
});

it("decodes a valid token without spending it", () => {
  const { token } = new ApprovalTokens(SECRET).issue("listing01", draft(), 1_000_000);
  const decoded = decodeApproval(SECRET, token, 1_000_100);

  assert.equal(decoded.ok, true);
  assert.equal(decoded.ok && decoded.payload.listingId, "listing01");
  assert.equal(decoded.ok && decoded.payload.draft.to, "buyer@example.com");
});
