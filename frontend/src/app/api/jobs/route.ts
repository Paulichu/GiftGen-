import { NextResponse } from "next/server";
import { buildBundle, GenerationError } from "@/lib/studio/pipeline";
import { newId, nowIso, readDb, withDb } from "@/lib/studio/store";
import type { AppType, Job, Version } from "@/lib/studio/types";

export const dynamic = "force-dynamic";

const APP_TYPES: AppType[] = ["fullstack", "mobile", "landing"];

export async function GET() {
  const jobs = await readDb((db) =>
    db.jobs.map((job) => {
      const version = job.versions.find((entry) => entry.number === job.currentVersion) ?? job.versions[0];
      return {
        id: job.id,
        name: job.name,
        prompt: job.prompt,
        appType: job.appType,
        status: job.status,
        currentVersion: job.currentVersion,
        versionCount: job.versions.length,
        updatedAt: job.updatedAt,
        publishedSlug: job.publish?.slug ?? null,
        fieldCount: version?.blueprint.fields.length ?? 0,
      };
    })
  );
  return NextResponse.json(jobs);
}

export async function POST(request: Request) {
  let body: { prompt?: unknown; appType?: unknown };
  try {
    body = (await request.json()) as { prompt?: unknown; appType?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const appType: AppType = APP_TYPES.includes(body.appType as AppType)
    ? (body.appType as AppType)
    : "fullstack";

  if (prompt.length < 10) {
    return NextResponse.json(
      { error: "Describe what you want to build in at least 10 characters." },
      { status: 400 }
    );
  }
  if (prompt.length > 2000) {
    return NextResponse.json({ error: "Prompts are limited to 2000 characters." }, { status: 400 });
  }

  const id = newId();

  try {
    const bundle = buildBundle(prompt, appType, id);
    const now = nowIso();

    const job = await withDb<Job>((db) => {
      const version: Version = {
        number: 1,
        createdAt: now,
        summary: "Initial build",
        blueprint: bundle.blueprint,
        files: bundle.files,
        events: bundle.events,
      };

      const created: Job = {
        id,
        prompt,
        name: bundle.blueprint.title,
        appType,
        status: "ready",
        createdAt: now,
        updatedAt: now,
        currentVersion: 1,
        versions: [version],
        messages: [
          {
            id: `msg_${id}_1`,
            role: "user",
            content: prompt,
            createdAt: now,
            kind: "build",
          },
          {
            id: `msg_${id}_2`,
            role: "agent",
            content:
              `Built “${bundle.blueprint.title}” as a ${appType === "landing" ? "landing page" : "working app"} with ` +
              `${bundle.files.length} files` +
              (bundle.blueprint.fields.length > 0 ? ` and ${bundle.blueprint.fields.length} fields` : "") +
              `. The preview is live — ask for changes in chat, or publish to get a shareable URL.`,
            createdAt: now,
            version: 1,
            events: bundle.events,
            kind: "build",
          },
        ],
        publish: null,
      };

      db.jobs.unshift(created);
      return created;
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    if (error instanceof GenerationError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error("Job creation failed", error);
    return NextResponse.json(
      { error: "The build failed before it produced a working app." },
      { status: 500 }
    );
  }
}
