import { NextResponse } from "next/server";
import { findJob, newId, nowIso, withDb } from "@/lib/studio/store";
import type { Job } from "@/lib/studio/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  let body: { version?: unknown };
  try {
    body = (await request.json()) as { version?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const versionNumber = Number(body.version);
  if (!Number.isInteger(versionNumber) || versionNumber < 1) {
    return NextResponse.json({ error: "Provide a valid version number." }, { status: 400 });
  }

  const existing = await findJob(params.id);
  if (!existing) return NextResponse.json({ error: "Build not found." }, { status: 404 });
  if (!existing.versions.some((version) => version.number === versionNumber)) {
    return NextResponse.json({ error: `Version ${versionNumber} does not exist.` }, { status: 404 });
  }

  const now = nowIso();
  const job = await withDb<Job | null>((db) => {
    const target = db.jobs.find((entry) => entry.id === params.id);
    if (!target) return null;
    target.currentVersion = versionNumber;
    target.updatedAt = now;
    const snapshot = target.versions.find((version) => version.number === versionNumber);
    if (snapshot) target.name = snapshot.blueprint.title;
    target.messages.push({
      id: newId(),
      role: "agent",
      content: `Restored version ${versionNumber}. The preview now runs that build; earlier versions are kept.`,
      createdAt: now,
      version: versionNumber,
      kind: "notice",
    });
    return target;
  });

  if (!job) return NextResponse.json({ error: "Build not found." }, { status: 404 });
  return NextResponse.json(job);
}
