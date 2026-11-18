import { NextResponse } from "next/server";
import { applyInstruction } from "@/lib/studio/iterate";
import { GenerationError, materialize } from "@/lib/studio/pipeline";
import { findJob, newId, nowIso, withDb } from "@/lib/studio/store";
import type { ChatMessage, Job, Version } from "@/lib/studio/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  let body: { content?: unknown };
  try {
    body = (await request.json()) as { content?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (content.length < 2) {
    return NextResponse.json({ error: "Write an instruction first." }, { status: 400 });
  }

  const existing = await findJob(params.id);
  if (!existing) return NextResponse.json({ error: "Build not found." }, { status: 404 });

  const current =
    existing.versions.find((version) => version.number === existing.currentVersion) ??
    existing.versions[existing.versions.length - 1];
  if (!current) {
    return NextResponse.json({ error: "This build has no versions." }, { status: 500 });
  }

  const outcome = applyInstruction(current.blueprint, content);
  const now = nowIso();
  const userMessage: ChatMessage = {
    id: newId(),
    role: "user",
    content,
    createdAt: now,
    kind: "iterate",
  };

  if (!outcome.ok) {
    const updated = await withDb<Job | null>((db) => {
      const job = db.jobs.find((entry) => entry.id === params.id);
      if (!job) return null;
      job.messages.push(userMessage, {
        id: newId(),
        role: "agent",
        content: outcome.reply,
        createdAt: now,
        kind: "notice",
      });
      job.updatedAt = now;
      return job;
    });
    if (!updated) return NextResponse.json({ error: "Build not found." }, { status: 404 });
    return NextResponse.json(updated);
  }

  try {
    const bundle = materialize(outcome.blueprint, existing.id, outcome.summary);

    const updated = await withDb<Job | null>((db) => {
      const job = db.jobs.find((entry) => entry.id === params.id);
      if (!job) return null;

      const nextNumber = Math.max(...job.versions.map((version) => version.number)) + 1;
      const version: Version = {
        number: nextNumber,
        createdAt: now,
        summary: outcome.summary,
        blueprint: outcome.blueprint,
        files: bundle.files,
        events: bundle.events,
      };

      job.versions.push(version);
      job.currentVersion = nextNumber;
      job.name = outcome.blueprint.title;
      job.updatedAt = now;
      job.messages.push(userMessage, {
        id: newId(),
        role: "agent",
        content: `${outcome.summary} That is version ${nextNumber} — the preview is updated.`,
        createdAt: now,
        version: nextNumber,
        events: bundle.events,
        kind: "iterate",
      });
      return job;
    });

    if (!updated) return NextResponse.json({ error: "Build not found." }, { status: 404 });

    if (updated.publish && updated.publish.version !== updated.currentVersion) {
      updated.messages.push({
        id: newId(),
        role: "agent",
        content: `Published version ${updated.publish.version} is still live. Re-publish to push version ${updated.currentVersion}.`,
        createdAt: nowIso(),
        kind: "notice",
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof GenerationError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error("Iteration failed", error);
    return NextResponse.json({ error: "The rebuild failed before it produced a working version." }, { status: 500 });
  }
}
