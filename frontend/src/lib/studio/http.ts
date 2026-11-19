import { NextResponse } from "next/server";

/**
 * Blocks cross-site browser requests to mutating endpoints. The forwarded Host
 * is used because dev servers and the preview proxy rewrite request.url.
 */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const host =
      request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
      request.headers.get("host") ||
      new URL(request.url).host;
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** One 429 shape for exhausted budgets: the reason, a minute hint and retry-after. */
export function rateLimited(error: string, retryAfterSeconds: number) {
  return NextResponse.json(
    { error: `${error} Try again in ${Math.ceil(retryAfterSeconds / 60)} min.` },
    { status: 429, headers: { "retry-after": String(retryAfterSeconds) } }
  );
}
