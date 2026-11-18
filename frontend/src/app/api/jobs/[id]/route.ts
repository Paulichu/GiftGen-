import { NextResponse } from "next/server";
import { findJob, withDb } from "@/lib/studio/store";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const job = await findJob(params.id);
  if (!job) return NextResponse.json({ error: "Build not found." }, { status: 404 });
  return NextResponse.json(job);
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const removed = await withDb((db) => {
    const index = db.jobs.findIndex((job) => job.id === params.id);
    if (index === -1) return false;
    db.jobs.splice(index, 1);
    return true;
  });

  if (!removed) return NextResponse.json({ error: "Build not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
