import assert from "node:assert/strict";
import { it } from "node:test";
import { approvalGate } from "../src/lib/studio/gate";

const URL = "http://studio.test/api/listings/listing01/email/send/";
const ENV = { OFFER_APPROVAL_PASSWORD: "correct horse battery staple" };

function request(headers: Record<string, string> = {}): Request {
  return new Request(URL, { method: "POST", headers });
}

it("requires a password even when the caller claims localhost", () => {
  const forged: Array<Record<string, string>> = [
    { "x-forwarded-for": "127.0.0.1" },
    { "x-forwarded-for": "127.0.0.1, 10.0.0.1" },
    { "x-forwarded-for": "::1" },
    { "x-real-ip": "127.0.0.1" },
    { "x-forwarded-for": "localhost" },
  ];

  for (const headers of forged) {
    const result = approvalGate(request(headers), ENV);
    assert.equal(result.ok, false, JSON.stringify(headers));
    assert.equal(result.ok === false && result.status, 401);
  }
});

it("refuses every request when no approval password is configured", () => {
  const headerSets: Array<Record<string, string>> = [{}, { "x-forwarded-for": "127.0.0.1" }, { "x-offer-approval": "" }];
  for (const headers of headerSets) {
    const result = approvalGate(request(headers), {});
    assert.equal(result.ok, false, JSON.stringify(headers));
    assert.equal(result.ok === false && result.status, 401);
    assert.match(result.ok === false ? result.error : "", /OFFER_APPROVAL_PASSWORD/);
  }
});

it("rejects a wrong password even from localhost", () => {
  const wrong = approvalGate(request({ "x-forwarded-for": "127.0.0.1", "x-offer-approval": "nope" }), ENV);
  assert.equal(wrong.ok, false);
  assert.equal(wrong.ok === false && wrong.status, 401);
  assert.match(wrong.ok === false ? wrong.error : "", /missing or wrong/);
});

it("accepts the configured password regardless of the client address", () => {
  const headerSets: Array<Record<string, string>> = [
    { "x-offer-approval": ENV.OFFER_APPROVAL_PASSWORD },
    { "x-forwarded-for": "203.0.113.9", "x-offer-approval": ENV.OFFER_APPROVAL_PASSWORD },
    { "x-forwarded-for": "127.0.0.1", "x-offer-approval": ENV.OFFER_APPROVAL_PASSWORD },
  ];
  for (const headers of headerSets) {
    assert.equal(approvalGate(request(headers), ENV).ok, true, JSON.stringify(headers));
  }
});
