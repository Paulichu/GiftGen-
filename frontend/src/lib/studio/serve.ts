import type { GeneratedFile } from "./types";

const CONTENT_TYPES: Record<string, string> = {
  html: "text/html; charset=utf-8",
  css: "text/css; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  json: "application/json; charset=utf-8",
  md: "text/markdown; charset=utf-8",
  svg: "image/svg+xml",
};

export function serveFiles(files: GeneratedFile[], requested?: string[]): Response {
  if (files.length === 0) {
    return new Response("This app has no files yet.", { status: 404 });
  }

  const name = requested && requested.length > 0 ? requested.join("/") : "index.html";
  const file =
    files.find((entry) => entry.path === name) ||
    files.find((entry) => entry.path === `${name}.html`) ||
    files.find((entry) => entry.path === "index.html") ||
    files[0];

  const extension = file.path.split(".").pop()?.toLowerCase() ?? "";
  return new Response(file.content, {
    status: 200,
    headers: {
      "content-type": CONTENT_TYPES[extension] ?? "text/plain; charset=utf-8",
      "cache-control": "no-store, max-age=0",
      "x-content-type-options": "nosniff",
    },
  });
}
