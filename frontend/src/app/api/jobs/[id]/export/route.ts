import { NextResponse } from "next/server";
import { slugify } from "@/lib/studio/analyze";
import { findJob } from "@/lib/studio/store";
import type { Version } from "@/lib/studio/types";
import { createZip } from "@/lib/studio/zip";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const job = await findJob(params.id);
  if (!job) return NextResponse.json({ error: "Build not found." }, { status: 404 });

  const requested = new URL(request.url).searchParams.get("version");
  let version: Version | undefined =
    job.versions.find((entry) => entry.number === job.currentVersion) ??
    job.versions[job.versions.length - 1];

  if (requested !== null) {
    const wanted = Number(requested);
    if (!Number.isInteger(wanted) || wanted < 1) {
      return NextResponse.json({ error: "Version must be a positive whole number." }, { status: 400 });
    }
    version = job.versions.find((entry) => entry.number === wanted);
    if (!version) {
      return NextResponse.json(
        { error: `Version ${wanted} does not exist. Available: ${job.versions.map((entry) => entry.number).join(", ")}.` },
        { status: 404 }
      );
    }
  }

  if (!version || version.files.length === 0) {
    return NextResponse.json({ error: "This build has no files to export yet." }, { status: 400 });
  }

  const archive = createZip(version.files.map((file) => ({ name: file.path, content: file.content })));
  const base = slugify(job.name) || `app-${job.id.slice(0, 6)}`;
  const filename = `${base}-v${version.number}.zip`;

  return new Response(new Uint8Array(archive), {
    status: 200,
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="${filename}"`,
      "content-length": String(archive.byteLength),
      "cache-control": "no-store, max-age=0",
    },
  });
}
