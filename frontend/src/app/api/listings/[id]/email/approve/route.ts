import { NextResponse } from "next/server";
import { ApprovalConfigError, offerApproval } from "../../../../../../lib/studio/approval";
import { validateEmail } from "../../../../../../lib/studio/email";
import { approvalGate } from "../../../../../../lib/studio/gate";
import { sameOrigin } from "../../../../../../lib/studio/http";
import { approveLimiter } from "../../../../../../lib/studio/offerLimits";
import { clientKey } from "../../../../../../lib/studio/ratelimit";
import { findListing } from "../../../../../../lib/studio/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin email requests are not allowed." }, { status: 403 });
  }

  const gate = approvalGate(request);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

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

  try {
    return NextResponse.json(offerApproval().issue(params.id, checked.value));
  } catch (error) {
    if (error instanceof ApprovalConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return NextResponse.json({ error: "The approval could not be signed." }, { status: 500 });
  }
}
