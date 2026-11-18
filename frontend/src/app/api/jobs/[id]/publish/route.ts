import { NextResponse } from "next/server";
import { slugify } from "@/lib/studio/analyze";
import { findJob, newId, nowIso, withDb } from "@/lib/studio/store";
import type { Job } from "@/lib/studio/types";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const existing = await findJob(params.id);
  if (!existing) return NextResponse.json({ error: "Build not found." }, { status: 404 });
  if (existing.versions.length === 0) {
    return NextResponse.json({ error: "There is nothing to publish yet." }, { status: 400 });
  }

  const now = nowIso();

  try {
    const job = await withDb<Job | null>((db) => {
      const target = db.jobs.find((entry) => entry.id === params.id);
      if (!target) return null;

      const slug = target.publish?.slug ?? `${slugify(target.name) || "app"}-${target.id.slice(0, 5)}`;
      target.publish = { slug, version: target.currentVersion, publishedAt: now };
      target.status = "published";
      target.updatedAt = now;
      target.messages.push({
        id: newId(),
        role: "agent",
        content: `Published version ${target.currentVersion} at /p/${slug} — that URL serves this build and stays up until you publish something else.`,
        createdAt: now,
        kind: "publish",
      });
      return target;
    });

    if (!job) return NextResponse.json({ error: "Build not found." }, { status: 404 });
    return NextResponse.json(job);
  } catch (error) {
    console.error("Publish failed", error);
    return NextResponse.json({ error: "Publishing failed." }, { status: 500 });
  }
}
