import { NextResponse } from "next/server";
import { applyListingPatch } from "@/lib/studio/listings";
import { findListing, withDb } from "@/lib/studio/store";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const listing = await findListing(params.id);
  if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  return NextResponse.json(listing);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (Object.keys(body).length === 0) {
    return NextResponse.json({ error: "Send at least one field to change." }, { status: 400 });
  }

  const result = await withDb((db) => applyListingPatch(db, params.id, body));

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result.listing);
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const removed = await withDb((db) => {
    const index = db.listings.findIndex((item) => item.id === params.id);
    if (index === -1) return false;
    db.listings.splice(index, 1);
    return true;
  });
  if (!removed) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
