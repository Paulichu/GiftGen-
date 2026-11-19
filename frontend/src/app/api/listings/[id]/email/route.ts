import { NextResponse } from "next/server";
import { EmailError, composeOfferEmail, sendEmail, validateEmail } from "@/lib/studio/email";
import { clientKey, SlidingWindowLimiter } from "@/lib/studio/ratelimit";
import { findJob, findListing } from "@/lib/studio/store";

export const dynamic = "force-dynamic";

// Offers are few and deliberate: five sends per hour is plenty, spam is not.
const sendLimiter = new SlidingWindowLimiter(5, 60 * 60_000);

function sameOrigin(request: Request): boolean {
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

async function loadListing(id: string) {
  const listing = await findListing(id);
  if (!listing) return null;
  const job = await findJob(listing.jobId);
  return job ? { listing, job } : null;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const found = await loadListing(params.id);
  if (!found) return NextResponse.json({ error: "Listing not found." }, { status: 404 });

  const origin = new URL(request.url).origin;
  return NextResponse.json(composeOfferEmail(found.listing, found.job, `${origin}/s/${found.listing.slug}/`));
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin email requests are not allowed." }, { status: 403 });
  }

  const limit = sendLimiter.check(clientKey(request));
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Too many emails — try again in ${Math.ceil(limit.retryAfterSeconds / 60)} min.` },
      { status: 429, headers: { "retry-after": String(limit.retryAfterSeconds) } }
    );
  }

  const found = await loadListing(params.id);
  if (!found) return NextResponse.json({ error: "Listing not found." }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const checked = validateEmail(body);
  if (!checked.ok) return NextResponse.json({ error: checked.error }, { status: 400 });

  try {
    const result = await sendEmail(checked.value);
    return NextResponse.json({ ok: true, sentTo: result.to, from: result.from });
  } catch (error) {
    if (error instanceof EmailError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "The email could not be sent." }, { status: 500 });
  }
}
