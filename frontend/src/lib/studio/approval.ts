import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import type { EmailDraft } from "./email";

const TOKEN_TTL_MS = 15 * 60_000;

export interface ApprovalPayload {
  v: 1;
  listingId: string;
  draft: EmailDraft;
  nonce: string;
  exp: number;
}

type TokenResult =
  | { ok: true; payload: ApprovalPayload }
  | { ok: false; status: 400 | 403; error: string };

export type ConsumeResult =
  | { ok: true; draft: EmailDraft }
  | { ok: false; status: 400 | 403 | 409; error: string };

function sign(secret: string, body: string): string {
  return createHmac("sha256", secret).update(body).digest("base64url");
}

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function encodeApproval(
  secret: string,
  listingId: string,
  draft: EmailDraft,
  now = Date.now(),
  ttlMs = TOKEN_TTL_MS
): string {
  const payload: ApprovalPayload = {
    v: 1,
    listingId,
    draft,
    nonce: randomUUID(),
    exp: now + ttlMs,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(secret, body)}`;
}

export function decodeApproval(secret: string, token: unknown, now = Date.now()): TokenResult {
  if (typeof token !== "string" || !token) {
    return { ok: false, status: 400, error: "An approval token is required." };
  }
  const [body, signature, extra] = token.split(".");
  if (!body || !signature || extra) {
    return { ok: false, status: 400, error: "An approval token is required." };
  }
  if (!safeEqual(signature, sign(secret, body))) {
    return { ok: false, status: 403, error: "This approval token is not valid." };
  }

  let payload: ApprovalPayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as ApprovalPayload;
  } catch {
    return { ok: false, status: 400, error: "This approval token is not valid." };
  }

  if (
    payload.v !== 1 ||
    typeof payload.listingId !== "string" ||
    typeof payload.nonce !== "string" ||
    typeof payload.exp !== "number" ||
    typeof payload.draft?.to !== "string" ||
    typeof payload.draft?.from !== "string" ||
    typeof payload.draft?.subject !== "string" ||
    typeof payload.draft?.body !== "string"
  ) {
    return { ok: false, status: 400, error: "This approval token is not valid." };
  }
  if (payload.exp < now) {
    return { ok: false, status: 403, error: "This approval has expired — approve the draft again." };
  }

  return { ok: true, payload };
}

/**
 * Issues one signed token per approval and remembers spent nonces, so a token
 * can be sent at most once. The token carries the draft, which means the send
 * endpoint cannot be used to post arbitrary content.
 */
export class ApprovalTokens {
  private used = new Map<string, number>();

  constructor(
    private readonly secret: string,
    private readonly ttlMs = TOKEN_TTL_MS
  ) {}

  issue(listingId: string, draft: EmailDraft, now = Date.now()): { token: string; expiresAt: string } {
    const token = encodeApproval(this.secret, listingId, draft, now, this.ttlMs);
    return { token, expiresAt: new Date(now + this.ttlMs).toISOString() };
  }

  consume(token: unknown, listingId: string, now = Date.now()): ConsumeResult {
    const decoded = decodeApproval(this.secret, token, now);
    if (!decoded.ok) return decoded;

    const { payload } = decoded;
    if (payload.listingId !== listingId) {
      return { ok: false, status: 403, error: "This approval belongs to another listing." };
    }
    if (this.used.has(payload.nonce)) {
      return { ok: false, status: 409, error: "This approval has already been used." };
    }

    this.used.set(payload.nonce, payload.exp);
    this.prune(now);
    return { ok: true, draft: payload.draft };
  }

  private prune(now: number): void {
    if (this.used.size <= 500) return;
    this.used.forEach((exp, nonce) => {
      if (exp < now) this.used.delete(nonce);
    });
  }
}

export class ApprovalConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApprovalConfigError";
  }
}

let cached: { secret: string; tokens: ApprovalTokens } | null = null;

/**
 * There is deliberately no random fallback: a secret the process invents would
 * silently accept tokens nobody else can verify, and makes a missing config
 * look like a working deployment. Without OFFER_EMAIL_SECRET approvals are off.
 */
export function offerApproval(env: Record<string, string | undefined> = process.env): ApprovalTokens {
  const secret = env.OFFER_EMAIL_SECRET?.trim();
  if (!secret || secret.length < 16) {
    throw new ApprovalConfigError(
      "Email approvals are not configured. Set OFFER_EMAIL_SECRET (at least 16 characters) and restart the studio."
    );
  }
  if (!cached || cached.secret !== secret) cached = { secret, tokens: new ApprovalTokens(secret) };
  return cached.tokens;
}
