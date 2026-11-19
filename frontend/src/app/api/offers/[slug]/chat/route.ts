import { NextResponse } from "next/server";
import { clientKey, SlidingWindowLimiter } from "@/lib/studio/ratelimit";
import { replyToBuyer } from "@/lib/studio/sales";
import { findJob, findListingBySlug } from "@/lib/studio/store";

export const dynamic = "force-dynamic";

// Six questions per minute per IP: enough for a real buyer, useless for a spammer.
const QUESTIONS_PER_MINUTE = 6;
const chatLimiter = new SlidingWindowLimiter(QUESTIONS_PER_MINUTE, 60_000);

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  const limit = chatLimiter.check(clientKey(request));
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Too many questions — try again in ${limit.retryAfterSeconds}s.` },
      { status: 429, headers: { "retry-after": String(limit.retryAfterSeconds) } }
    );
  }

  let body: { message?: unknown };
  try {
    body = (await request.json()) as { message?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return NextResponse.json({ error: "Ask a question first." }, { status: 400 });
  if (message.length > 500) return NextResponse.json({ error: "Keep questions under 500 characters." }, { status: 400 });

  const listing = await findListingBySlug(params.slug);
  if (!listing || !listing.published) {
    return NextResponse.json({ error: "This offer is not available." }, { status: 404 });
  }

  const job = await findJob(listing.jobId);
  if (!job) return NextResponse.json({ error: "This offer has no build." }, { status: 404 });

  const { topic, reply } = replyToBuyer(listing, job, message);
  return NextResponse.json({ topic, reply, agent: listing.agent.name });
}
