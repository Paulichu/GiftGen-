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
