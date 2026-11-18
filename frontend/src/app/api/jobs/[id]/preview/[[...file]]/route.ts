import { findJob } from "@/lib/studio/store";
import { serveFiles } from "@/lib/studio/serve";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string; file?: string[] } }
) {
  const job = await findJob(params.id);
  if (!job) return new Response("This app does not exist.", { status: 404 });

  const version =
    job.versions.find((entry) => entry.number === job.currentVersion) ??
    job.versions[job.versions.length - 1];

  if (!version) return new Response("This app has no build yet.", { status: 404 });

  return serveFiles(version.files, params.file);
}
