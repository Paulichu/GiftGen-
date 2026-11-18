import { findPublished } from "@/lib/studio/store";
import { serveFiles } from "@/lib/studio/serve";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string; file?: string[] } }
) {
  const published = await findPublished(params.slug);
  if (!published) return new Response("No published app at this address.", { status: 404 });

  const version =
    published.job.versions.find((entry) => entry.number === published.versionNumber) ??
    published.job.versions[published.job.versions.length - 1];

  if (!version) return new Response("No published app at this address.", { status: 404 });

  return serveFiles(version.files, params.file);
}
