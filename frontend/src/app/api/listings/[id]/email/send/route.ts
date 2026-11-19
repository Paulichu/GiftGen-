import { NextResponse } from "next/server";
import { offerApproval } from "../../../../../../lib/studio/approval";
import { EmailError, sendEmail } from "../../../../../../lib/studio/email";
import { sameOrigin } from "../../../../../../lib/studio/http";
import { clientKey, SlidingWindowLimiter } from "../../../../../../lib/studio/ratelimit";
import { findListing } from "../../../../../../lib/studio/store";

export const dynamic = "force-dynamic";

const sendLimiter = new SlidingWindowLimiter(5, 60 * 60_000);

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

  if (!(await findListing(params.id))) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  let body: { token?: unknown };
  try {
    body = (await request.json()) as { token?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const approval = offerApproval.consume(body.token, params.id);
  if (!approval.ok) {
    return NextResponse.json({ error: approval.error }, { status: approval.status });
  }

  try {
    const result = await sendEmail(approval.draft);
    return NextResponse.json({ ok: true, sentTo: result.to, from: result.from });
  } catch (error) {
    if (error instanceof EmailError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "The email could not be sent." }, { status: 500 });
  }
}
