import assert from "node:assert/strict";
import { it } from "node:test";
import { approvalGate } from "../src/lib/studio/gate";

const URL = "http://studio.test/api/listings/listing01/email/send/";
const ENV = { OFFER_APPROVAL_PASSWORD: "correct horse battery staple" };

function request(headers: Record<string, string> = {}): Request {
  return new Request(URL, { method: "POST", headers });
}

it("refuses a request with no client address and no password (fail closed)", () => {
  for (const env of [{}, ENV]) {
    const result = approvalGate(request(), env);
    assert.equal(result.ok, false, JSON.stringify(env));
    assert.equal(result.ok === false && result.status, 401);
  }
});

it("allows a request with no client address only with the right password", () => {
  const result = approvalGate(request({ "x-offer-approval": ENV.OFFER_APPROVAL_PASSWORD }), ENV);
  assert.equal(result.ok, true);
});

it("allows proxied requests that resolve to loopback without a password", () => {
  const loopbackHeaders: Array<Record<string, string>> = [
    { "x-forwarded-for": "127.0.0.1" },
    { "x-forwarded-for": "127.0.0.1, 10.0.0.1" },
    { "x-forwarded-for": "::1" },
    { "x-real-ip": "127.0.0.5" },
  ];
  for (const headers of loopbackHeaders) {
    assert.equal(approvalGate(request(headers), ENV).ok, true, JSON.stringify(headers));
  }
});

it("refuses remote callers and tells them to set a password when none exists", () => {
  const result = approvalGate(request({ "x-forwarded-for": "203.0.113.9" }), {});
  assert.equal(result.ok, false);
  assert.equal(result.ok === false && result.status, 401);
  assert.match(result.ok === false ? result.error : "", /OFFER_APPROVAL_PASSWORD/);
});

it("refuses a remote caller with a missing or wrong password", () => {
  const remote = { "x-forwarded-for": "203.0.113.9" };

  const missing = approvalGate(request(remote), ENV);
  assert.equal(missing.ok, false);
  assert.equal(missing.ok === false && missing.status, 401);
  assert.match(missing.ok === false ? missing.error : "", /missing or wrong/);

  const wrong = approvalGate(request({ ...remote, "x-offer-approval": "nope" }), ENV);
  assert.equal(wrong.ok, false);
  assert.equal(wrong.ok === false && wrong.status, 401);
});

it("allows a remote caller that knows the approval password", () => {
  const result = approvalGate(
    request({ "x-forwarded-for": "203.0.113.9", "x-offer-approval": ENV.OFFER_APPROVAL_PASSWORD }),
    ENV
  );
  assert.equal(result.ok, true);
});

it("does not treat a spoofed localhost suffix as loopback", () => {
  for (const address of ["127.0.0.1.evil.test", "localhost.evil.test", "10.0.0.1"]) {
    const result = approvalGate(request({ "x-forwarded-for": address }), ENV);
    assert.equal(result.ok, false, address);
  }
});
