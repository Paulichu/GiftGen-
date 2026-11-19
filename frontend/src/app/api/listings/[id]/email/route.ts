import { NextResponse } from "next/server";
import { composeOfferEmail } from "@/lib/studio/email";
import { findJob, findListing } from "@/lib/studio/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const listing = await findListing(params.id);
  if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  const job = await findJob(listing.jobId);
  if (!job) return NextResponse.json({ error: "Listing not found." }, { status: 404 });

  const origin = new URL(request.url).origin;
  return NextResponse.json(composeOfferEmail(listing, job, `${origin}/s/${listing.slug}/`));
}
