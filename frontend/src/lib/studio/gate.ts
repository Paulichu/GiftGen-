import { timingSafeEqual } from "node:crypto";

export const APPROVAL_HEADER = "x-offer-approval";

function passwordMatches(supplied: string, expected: string): boolean {
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Every approve and send request must present OFFER_APPROVAL_PASSWORD in the
 * x-offer-approval header. Client addresses are ignored on purpose: proxy
 * headers are caller-controlled, so trusting "127.0.0.1" there would let a
 * remote client walk straight through the gate.
 */
export function approvalGate(
  request: Request,
  env: Record<string, string | undefined> = process.env
): { ok: true } | { ok: false; status: 401; error: string } {
  const expected = env.OFFER_APPROVAL_PASSWORD?.trim();
  if (!expected) {
    return {
      ok: false,
      status: 401,
      error:
        "Offer emails are locked. Set OFFER_APPROVAL_PASSWORD and send it in the x-offer-approval header to approve or send.",
    };
  }

  const supplied = request.headers.get(APPROVAL_HEADER)?.trim() ?? "";
  if (!supplied || !passwordMatches(supplied, expected)) {
    return { ok: false, status: 401, error: "The approval password is missing or wrong." };
  }
  return { ok: true };
}
