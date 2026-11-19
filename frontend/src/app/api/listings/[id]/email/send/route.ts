import { NextResponse } from "next/server";
import { ApprovalConfigError, offerApproval } from "../../../../../../lib/studio/approval";
import { EmailError, sendEmail } from "../../../../../../lib/studio/email";
import { approvalGate } from "../../../../../../lib/studio/gate";
import { rateLimited, sameOrigin } from "../../../../../../lib/studio/http";
import { sendLimiter, sendPasswordLimiter } from "../../../../../../lib/studio/offerLimits";
import { clientKey } from "../../../../../../lib/studio/ratelimit";
import { findListing } from "../../../../../../lib/studio/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin email requests are not allowed." }, { status: 403 });
  }

  // Guess protection runs before the password is compared, but only wrong
  // passwords are counted, and they spend a short budget of their own.
  const key = clientKey(request);
  const passwordBudget = sendPasswordLimiter.peek(key);
  if (!passwordBudget.allowed) {
    return rateLimited("Too many wrong approval passwords.", passwordBudget.retryAfterSeconds);
  }

  const gate = approvalGate(request);
  if (!gate.ok) {
    sendPasswordLimiter.record(key);
    return NextResponse.json({ error: gate.error }, { status: gate.status });
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

  // Sends get their own hourly budget, checked before the token is spent so a
  // throttled request never burns a valid approval.
  const sendBudget = sendLimiter.check(key);
  if (!sendBudget.allowed) {
    return rateLimited("Too many sends.", sendBudget.retryAfterSeconds);
  }

  try {
    const approval = offerApproval().consume(body.token, params.id);
    if (!approval.ok) {
      return NextResponse.json({ error: approval.error }, { status: approval.status });
    }

    const result = await sendEmail(approval.draft);
    return NextResponse.json({ ok: true, sentTo: result.to, from: result.from });
  } catch (error) {
    if (error instanceof ApprovalConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    if (error instanceof EmailError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "The email could not be sent." }, { status: 500 });
  }
}
