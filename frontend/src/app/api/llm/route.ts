/**
 * LLM proxy for the 5-agent pipeline (Cerebras / Groq / Gemini).
 *
 * The browser never talks to the provider directly: a key is read from the server
 * env (CEREBRAS_API_KEY, GROQ_API_KEY, GEMINI_API_KEY) or forwarded per request
 * from the browser's localStorage. Either way it never reaches the client bundle,
 * the repository or the logs.
 *
 * GET  /api/llm/  -> { providers: [...], defaultProvider }
 * POST /api/llm/  -> { ok, provider, model, data, usage } | { error, code }
 */

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_PROMPT_CHARS = 4000;
const UPSTREAM_TIMEOUT_MS = 50000;

type ProviderId = "groq" | "gemini" | "cerebras";

interface ProviderConfig {
  id: ProviderId;
  label: string;
  url: string;
  envKey: string | undefined;
  defaultModel: string;
  models: string[];
  /** Some OpenAI-compatible gateways reject max_completion_tokens. */
  maxTokensParam: "max_completion_tokens" | "max_tokens";
  /** Free tier reality, shown in the UI so nobody is surprised. */
  freeTier: string;
  consoleUrl: string;
}

const PROVIDERS: Record<ProviderId, ProviderConfig> = {
  groq: {
    id: "groq",
    label: "Groq",
    url: "https://api.groq.com/openai/v1/chat/completions",
    envKey: process.env.GROQ_API_KEY,
    defaultModel: "openai/gpt-oss-120b",
    models: ["openai/gpt-oss-120b", "llama-3.3-70b-versatile", "qwen/qwen3-32b"],
    maxTokensParam: "max_completion_tokens",
    freeTier: "Darmowy plan bez karty, limity zapytań na minutę i na dzień.",
    consoleUrl: "https://console.groq.com/keys",
  },
  gemini: {
    id: "gemini",
    label: "Gemini",
    url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    envKey: process.env.GEMINI_API_KEY,
    defaultModel: "gemini-2.5-flash",
    models: ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"],
    maxTokensParam: "max_tokens",
    freeTier: "Darmowy plan bez karty w Google AI Studio, dzienne limity zapytań.",
    consoleUrl: "https://aistudio.google.com/apikey",
  },
  cerebras: {
    id: "cerebras",
    label: "Cerebras",
    url: "https://api.cerebras.ai/v1/chat/completions",
    envKey: process.env.CEREBRAS_API_KEY,
    defaultModel: "gpt-oss-120b",
    models: ["gpt-oss-120b", "qwen-3.8-27b"],
    maxTokensParam: "max_completion_tokens",
    freeTier: "Tylko trial: 5 $ na 30 dni po dodaniu karty. Brak stałego darmowego planu.",
    consoleUrl: "https://cloud.cerebras.ai",
  },
};

const DEFAULT_PROVIDER: ProviderId = "groq";

interface ChatMessage {
  role: "system" | "user";
  content: string;
}

function fail(error: string, status: number, code?: string) {
  return NextResponse.json({ error, code }, { status });
}

function resolveProvider(raw: unknown): ProviderId {
  const id = String(raw || "").trim().toLowerCase();
  if (id === "groq" || id === "gemini" || id === "cerebras") return id;
  return DEFAULT_PROVIDER;
}

export async function GET() {
  return NextResponse.json({
    defaultProvider: DEFAULT_PROVIDER,
    providers: Object.values(PROVIDERS).map((p) => ({
      id: p.id,
      label: p.label,
      models: p.models,
      defaultModel: p.defaultModel,
      configured: Boolean(p.envKey),
      freeTier: p.freeTier,
      consoleUrl: p.consoleUrl,
    })),
  });
}

function blueprintMessages(prompt: string): ChatMessage[] {
  return [
    {
      role: "system",
      content: `You are the Architect Agent inside an AI app builder. You turn a product idea into a technical blueprint.

Reply with a single JSON object and nothing else. Exactly this shape:
{
  "needs_clarification": boolean,
  "questions": string[],
  "summary": string,
  "pages": [{ "name": string, "route": string, "description": string }],
  "data_models": [{ "name": string, "fields": string[] }],
  "api_endpoints": [{ "method": string, "path": string, "purpose": string }],
  "features": string[]
}

Rules:
- If the idea is too vague to design (no clear users, objects or goal), set needs_clarification to true, put 2-4 sharp questions in "questions", and leave the other fields as empty arrays.
- If the idea is clear, set needs_clarification to false and "questions" to [].
- 2 to 5 pages, 2 to 6 data models, 2 to 8 endpoints, 3 to 6 features.
- Keep every string short (max 120 characters). No prose outside JSON.`,
    },
    { role: "user", content: `App idea: ${prompt}` },
  ];
}

function codeMessages(prompt: string, blueprint: unknown): ChatMessage[] {
  return [
    {
      role: "system",
      content: `You are the Developer Agent inside an AI app builder. You write real files from an approved blueprint.

Reply with a single JSON object and nothing else. Exactly this shape:
{
  "files": [{ "path": string, "content": string }],
  "notes": string
}

Rules:
- 3 to 5 files, always include one Next.js App Router page (app/page.tsx) and one FastAPI module (backend/routes.py). Keep each file under 90 lines.
- Frontend files are React + TypeScript + Tailwind CSS (no imports outside next/react).
- Backend files are Python 3.11 with FastAPI.
- Call the backend through relative paths (/api/...). Never hardcode http://localhost or any host.
- Next.js 14 App Router: use <Link href="/x">text</Link> with no nested <a>, and put "use client" at the top when the file uses hooks or handlers.
- Every page must render real UI for the blueprint's main use case, not a placeholder.
- Write working, complete, self-contained code. No placeholders like "TODO" or "...".
- Escape newlines correctly inside JSON strings. No markdown fences, no prose outside JSON.`,
    },
    {
      role: "user",
      content: `Product idea: ${prompt}

Approved blueprint:
${JSON.stringify(blueprint).slice(0, 3500)}`,
    },
  ];
}

function parseJsonContent(raw: string): unknown {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end <= start) throw new Error("Model did not return JSON");
    return JSON.parse(cleaned.slice(start, end + 1));
  }
}

/**
 * Large code replies are sometimes cut off mid-JSON. Salvage every complete
 * {path, content} pair instead of throwing the whole generation away.
 */
function salvageFiles(raw: string): { path: string; content: string }[] {
  const out: { path: string; content: string }[] = [];
  const re = /"path"\s*:\s*"([^"]+)"\s*,\s*"content"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(raw)) !== null) {
    try {
      const content = JSON.parse(`"${match[2]}"`);
      if (match[1] && content && content.length > 20) out.push({ path: match[1], content });
    } catch {
      /* skip unparsable pair */
    }
  }
  // also handle the reversed key order: content first, then path
  const reverseRe = /"content"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,\s*"path"\s*:\s*"([^"]+)"/g;
  while ((match = reverseRe.exec(raw)) !== null) {
    try {
      const content = JSON.parse(`"${match[1]}"`);
      if (match[2] && content && content.length > 20 && !out.some((f) => f.path === match![2])) {
        out.push({ path: match[2], content });
      }
    } catch {
      /* skip */
    }
  }
  return out;
}

/** Some models emit an array as one quoted string; split and clean those. */
function cleanStringArray(input: unknown, limit = 6): string[] {
  if (!Array.isArray(input)) return [];
  const out: string[] = [];
  for (const item of input) {
    if (typeof item !== "string") continue;
    for (const piece of item.split(/"\s*,\s*"|\n/)) {
      const cleaned = piece.replace(/^[\s"'\[]+|[\s"'\]]+$/g, "").trim();
      if (cleaned.length > 1 && !out.includes(cleaned)) out.push(cleaned);
    }
  }
  return out.slice(0, limit);
}

function sanitizeBlueprint(raw: any) {
  if (!raw || typeof raw !== "object") return null;
  const pages = Array.isArray(raw.pages)
    ? raw.pages.filter((p: any) => p && typeof p === "object" && typeof p.name === "string").slice(0, 6)
    : [];
  const models = Array.isArray(raw.data_models)
    ? raw.data_models.filter((m: any) => m && typeof m === "object" && typeof m.name === "string").slice(0, 8)
    : [];
  const endpoints = Array.isArray(raw.api_endpoints)
    ? raw.api_endpoints.filter((e: any) => e && typeof e === "object" && typeof e.path === "string").slice(0, 10)
    : [];
  return {
    needs_clarification: Boolean(raw.needs_clarification),
    questions: cleanStringArray(raw.questions, 4),
    summary: typeof raw.summary === "string" ? raw.summary.slice(0, 300) : "",
    pages,
    data_models: models,
    api_endpoints: endpoints,
    features: cleanStringArray(raw.features, 6),
  };
}

async function callUpstream(
  provider: ProviderConfig,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  task: "blueprint" | "code",
  jsonMode: boolean
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  const payload: Record<string, unknown> = {
    model,
    messages,
    temperature: task === "code" ? 0.3 : 0.5,
    [provider.maxTokensParam]: task === "code" ? 8000 : 1600,
  };
  if (jsonMode) payload.response_format = { type: "json_object" };
  // gpt-oss models spend most of their budget on hidden reasoning; keep it short so
  // large JSON replies are not truncated and free tiers are not burned through.
  if (provider.id !== "gemini") payload.reasoning_effort = task === "code" ? "low" : "medium";

  try {
    const res = await fetch(provider.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    return { res, text: await res.text() };
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid JSON body", 400, "bad_request");
  }

  const task = body.task as "blueprint" | "code";
  if (task !== "blueprint" && task !== "code") {
    return fail('task must be "blueprint" or "code"', 400, "bad_request");
  }

  const prompt = String(body.prompt || "").trim().slice(0, MAX_PROMPT_CHARS);
  if (prompt.length < 3) {
    return fail("Prompt is too short", 400, "bad_request");
  }

  const provider = PROVIDERS[resolveProvider(body.provider)];
  const apiKey = String(provider.envKey || body.api_key || "").trim();
  if (!apiKey) {
    return fail(
      `Brak klucza ${provider.label}. Wklej go w panelu AI Engine w builderze (albo ustaw ${provider.id.toUpperCase()}_API_KEY w Vercelu).`,
      400,
      "no_key"
    );
  }

  const model = String(body.model || "").trim() || provider.defaultModel;
  const messages = task === "blueprint" ? blueprintMessages(prompt) : codeMessages(prompt, body.blueprint || {});

  try {
    // Gemini's OpenAI-compatible layer rejects response_format on some models,
    // so retry once without it if the gateway complains.
    let attempt = await callUpstream(provider, apiKey, model, messages, task, true);
    if (!attempt.res.ok && attempt.res.status === 400 && /response_format|json/i.test(attempt.text)) {
      attempt = await callUpstream(provider, apiKey, model, messages, task, false);
    }

    const { res, text } = attempt;

    if (!res.ok) {
      let detail = text.slice(0, 400);
      try {
        const errJson = JSON.parse(text);
        detail = errJson.message || errJson.error?.message || detail;
      } catch {
        /* keep raw text */
      }
      const looksLikeKeyProblem = /api[ _-]?key|unauthor|invalid.*key/i.test(detail);
      if (res.status === 401 || res.status === 403 || (res.status === 400 && looksLikeKeyProblem)) {
        return fail(
          `${provider.label} odrzucił klucz (${res.status}). Sprawdź, czy klucz jest poprawny i aktywny.`,
          401,
          "bad_key"
        );
      }
      if (res.status === 429) {
        return fail(`Limit darmowego planu ${provider.label} osiągnięty. Spróbuj za chwilę. (${detail})`, 429, "rate_limit");
      }
      return fail(`${provider.label} error ${res.status}: ${detail}`, 502, "upstream_error");
    }

    let payload: any;
    try {
      payload = JSON.parse(text);
    } catch {
      return fail(`${provider.label} returned a non-JSON response`, 502, "bad_upstream_response");
    }

    const choice = payload?.choices?.[0];
    const content = choice?.message?.content;
    if (!content || typeof content !== "string") {
      return fail(`${provider.label} returned an empty completion`, 502, "empty_completion");
    }

    let data: unknown;
    try {
      data = parseJsonContent(content);
    } catch (parseError) {
      if (task === "code") {
        const salvaged = salvageFiles(content);
        if (salvaged.length >= 2) {
          data = { files: salvaged, notes: "recovered from a truncated reply" };
        }
      }
      // One focused retry: ask for a smaller bundle instead of giving up.
      if (data === undefined && task === "code") {
        const shorter: ChatMessage[] = [
          ...messages,
          { role: "user", content: "Twój poprzedni JSON był ucięty. Zwróć ten sam obiekt JSON ponownie, ale maksymalnie 4 pliki i każdy plik krótki (do 60 linii). Tylko JSON." },
        ];
        const retry = await callUpstream(provider, apiKey, model, shorter, task, true);
        if (retry.res.ok) {
          const retryContent = (() => {
            try {
              return JSON.parse(retry.text)?.choices?.[0]?.message?.content as string | undefined;
            } catch {
              return undefined;
            }
          })();
          if (retryContent) {
            try {
              data = parseJsonContent(retryContent);
            } catch {
              const salvaged = salvageFiles(retryContent);
              if (salvaged.length >= 2) data = { files: salvaged, notes: "recovered on retry" };
            }
          }
        }
      }
      if (data === undefined) {
        const truncated = choice?.finish_reason === "length";
        return fail(
          truncated
            ? "Model uciął odpowiedź (limit tokenów). Spróbuj krótszego promptu albo mniejszego modelu."
            : "Model did not return valid JSON. Try again or switch the model.",
          502,
          truncated ? "truncated" : "invalid_model_json"
        );
      }
    }

    if (task === "blueprint") {
      const clean = sanitizeBlueprint(data);
      if (!clean) return fail("Model returned an unusable blueprint. Try again.", 502, "invalid_model_json");
      data = clean;
    }

    if (task === "code") {
      const files = (data as any)?.files;
      if (!Array.isArray(files) || files.length === 0) {
        return fail("Model nie zwrócił żadnych plików. Spróbuj ponownie.", 502, "no_files");
      }
    }

    return NextResponse.json({
      ok: true,
      provider: provider.id,
      model: payload?.model || model,
      data,
      usage: payload?.usage || null,
    });
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return fail(`${provider.label} przekroczył limit czasu (50 s). Spróbuj krótszego promptu.`, 504, "timeout");
    }
    return fail(`Nie udało się połączyć z ${provider.label}: ${err?.message || "network error"}`, 502, "network_error");
  }
}
