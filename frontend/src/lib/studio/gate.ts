import { timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";

export const APPROVAL_HEADER = "x-offer-approval";

function isLoopback(address: string): boolean {
  const bare = address.replace(/^\[|\]$/g, "").toLowerCase();
  if (bare === "::1" || bare === "localhost") return true;
  const family = isIP(bare);
  if (family === 4) return bare.split(".")[0] === "127";
  if (family === 6) return bare.startsWith("::ffff:127.");
  return false;
}

function passwordMatches(supplied: string, expected: string): boolean {
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Issuing and spending approval tokens is limited to callers that are provably
 * local (a proxy header naming a loopback address) or that know
 * OFFER_APPROVAL_PASSWORD. A request with no client address is treated as
 * remote: the route handler has no socket information, so absence of proxy
 * headers must never be read as "localhost", or anyone could bypass the gate.
 */
export function approvalGate(
  request: Request,
  env: Record<string, string | undefined> = process.env
): { ok: true } | { ok: false; status: 401; error: string } {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const client = forwarded || realIp;

  if (client && isLoopback(client)) return { ok: true };

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
