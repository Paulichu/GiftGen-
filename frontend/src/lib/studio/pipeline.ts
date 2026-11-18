import { analyzePrompt } from "./analyze";
import { generateFiles } from "./generate";
import type { AgentEvent, AppType, Blueprint, GeneratedFile } from "./types";

export class GenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GenerationError";
  }
}

export interface Bundle {
  files: GeneratedFile[];
  events: AgentEvent[];
}

const REQUIRED_FILES = ["index.html", "styles.css", "app.js", "schema.json", "README.md"];
const SCHEME_REF = /^(?:[a-z][a-z0-9+.-]*:)?\/\//i;
const INLINE_REF = /^(?:data|mailto|tel|javascript):/i;

function localPath(reference: string): string {
  return reference.split(/[?#]/)[0].replace(/^\.\//, "");
}

function referencesInHtml(html: string): string[] {
  const references: string[] = [];
  const pattern = /\b(?:src|href)\s*=\s*["']([^"']+)["']/gi;
  let match = pattern.exec(html);
  while (match) {
    references.push(match[1].trim());
    match = pattern.exec(html);
  }
  return references;
}

function referencesInCss(css: string): string[] {
  const references: string[] = [];
  const pattern = /url\(\s*["']?([^"')]+)["']?\s*\)/gi;
  let match = pattern.exec(css);
  while (match) {
    references.push(match[1].trim());
    match = pattern.exec(css);
  }
  return references;
}

interface SchemaShape {
  appType?: string;
  fields?: Array<{ key?: string }>;
  storageKey?: string;
}

/**
 * Real checks over the generated bundle: structure, resolvable local assets,
 * JavaScript that actually parses, and a schema that matches the blueprint.
 * A bundle that fails here is rejected instead of being presented as working.
 */
export function validateBundle(blueprint: Blueprint, files: GeneratedFile[]): string[] {
  const problems: string[] = [];
  const byPath = new Map(files.map((entry) => [entry.path, entry]));

  for (const required of REQUIRED_FILES) {
    if (!byPath.has(required)) problems.push(`missing ${required}`);
  }

  for (const entry of files) {
    if (!entry.content.trim()) problems.push(`${entry.path} is empty`);
  }

  const html = byPath.get("index.html")?.content ?? "";
  if (!html.includes("styles.css")) problems.push("index.html does not link styles.css");
  if (!html.includes("app.js")) problems.push("index.html does not load app.js");

  for (const reference of referencesInHtml(html)) {
    if (!reference || reference.startsWith("#") || INLINE_REF.test(reference)) continue;
    if (SCHEME_REF.test(reference)) {
      problems.push(`index.html loads external resource ${reference} — the app must be self-contained`);
      continue;
    }
    const target = localPath(reference);
    if (target && !byPath.has(target)) problems.push(`index.html references missing file ${target}`);
  }

  const css = byPath.get("styles.css")?.content ?? "";
  for (const reference of referencesInCss(css)) {
    if (INLINE_REF.test(reference)) continue;
    if (SCHEME_REF.test(reference)) {
      problems.push(`styles.css loads external resource ${reference} — the app must be self-contained`);
      continue;
    }
    const target = localPath(reference);
    if (target && !byPath.has(target)) problems.push(`styles.css references missing file ${target}`);
  }

  for (const entry of files) {
    if (!entry.path.endsWith(".js")) continue;
    try {
      // Compiles without executing: catches syntax errors the browser would hit.
      new Function(entry.content);
    } catch (error) {
      problems.push(`${entry.path} has a syntax error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  try {
    const schema = JSON.parse(byPath.get("schema.json")?.content ?? "null") as SchemaShape | null;
    if (!schema || typeof schema !== "object") {
      problems.push("schema.json is not an object");
    } else {
      if (schema.appType !== blueprint.appType) {
        problems.push(`schema.json appType "${schema.appType}" does not match the blueprint ("${blueprint.appType}")`);
      }
      if (!schema.storageKey) problems.push("schema.json has no storageKey");
      if (blueprint.appType !== "landing") {
        const written = (schema.fields ?? []).map((field) => field.key);
        const planned = blueprint.fields.map((field) => field.key);
        const mismatched = planned.filter((key) => !written.includes(key));
        if (mismatched.length > 0 || written.length !== planned.length) {
          problems.push(
            `schema.json fields do not match the blueprint (${written.join(", ") || "none"} vs ${planned.join(", ") || "none"})`
          );
        }
      }
    }
  } catch {
    problems.push("schema.json is not valid JSON");
  }

  if (blueprint.appType !== "landing" && blueprint.fields.length === 0) {
    problems.push("blueprint has no fields");
  }

  return problems;
}

/**
 * Turns an existing blueprint into files and agent events. Validation is a real
 * check over the generated bundle, so a broken build fails instead of pretending
 * to have succeeded.
 */
export function materialize(blueprint: Blueprint, jobId: string, change: string): Bundle {
  const started = Date.now();
  const files = generateFiles(blueprint, jobId);
  const generated = Date.now();
  const problems = validateBundle(blueprint, files);
  const validated = Date.now();

  if (problems.length > 0) {
    throw new GenerationError(`Generated bundle failed validation: ${problems.join("; ")}`);
  }

  const bytes = files.reduce((total, entry) => total + entry.bytes, 0);
  const fieldCount = blueprint.fields.length;

  const events: AgentEvent[] = [
    {
      agent: "Architect",
      message:
        blueprint.appType === "landing"
          ? `Planned a landing page for “${blueprint.title}”`
          : `Modelled “${blueprint.entity.singular}” with ${fieldCount} field${fieldCount === 1 ? "" : "s"}`,
      level: "info",
      durationMs: Math.max(1, Math.round((generated - started) * 0.2)),
    },
    {
      agent: "Designer",
      message: `Applied a ${blueprint.theme.mode} ${blueprint.theme.accentName} theme with ${blueprint.theme.radius}px radii`,
      level: "info",
      durationMs: Math.max(1, Math.round((generated - started) * 0.15)),
    },
    {
      agent: "Developer",
      message: `${change} Wrote ${files.length} files (${(bytes / 1024).toFixed(1)} KB): ${files
        .map((entry) => entry.path)
        .join(", ")}`,
      level: "info",
      durationMs: generated - started,
    },
    {
      agent: "Reviewer",
      message: `Validated ${files.length} files: required files present, asset links resolve locally, JavaScript parses, schema matches blueprint, no external resources`,
      level: "success",
      durationMs: Math.max(1, validated - generated),
    },
  ];

  return { files, events };
}

export function buildBundle(prompt: string, appType: AppType, jobId: string): Bundle & { blueprint: Blueprint } {
  const settled = analyzePrompt(prompt, appType);
  return { blueprint: settled, ...materialize(settled, jobId, "Built the first version.") };
}
