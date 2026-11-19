import { NextResponse } from "next/server";
import { offerApproval } from "@/lib/studio/approval";
import { validateEmail } from "@/lib/studio/email";
import { clientKey, SlidingWindowLimiter } from "@/lib/studio/ratelimit";
import { findListing } from "@/lib/studio/store";

export const dynamic = "force-dynamic";

const approveLimiter = new SlidingWindowLimiter(20, 60 * 60_000);

export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    // Compare against the forwarded Host: dev servers and the preview proxy
    // rewrite request.url, so it is not the public origin.
    const host =
      request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
      request.headers.get("host") ||
      new URL(request.url).host;
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin email requests are not allowed." }, { status: 403 });
  }

  const limit = approveLimiter.check(clientKey(request));
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Too many approvals — try again in ${Math.ceil(limit.retryAfterSeconds / 60)} min.` },
      { status: 429, headers: { "retry-after": String(limit.retryAfterSeconds) } }
    );
  }

  if (!(await findListing(params.id))) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const checked = validateEmail(body);
  if (!checked.ok) return NextResponse.json({ error: checked.error }, { status: 400 });

  const approval = offerApproval.issue(params.id, checked.value);
  return NextResponse.json(approval);
}
