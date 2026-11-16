/**
 * Cerebras proxy for the 5-agent pipeline.
 *
 * The browser never talks to Cerebras directly: the API key stays on the server
 * side (CEREBRAS_API_KEY env var) or, for a personal setup, is forwarded per
 * request from the browser's localStorage. Either way the key is never baked
 * into the client bundle or committed to the repository.
 *
 * GET  /api/llm  -> { configured, model, models, provider }
 * POST /api/llm  -> { ok, provider, model, data, usage } | { error, code }
 */

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const CEREBRAS_URL = "https://api.cerebras.ai/v1/chat/completions";
const DEFAULT_MODEL = process.env.CEREBRAS_MODEL || "gpt-oss-120b";
const AVAILABLE_MODELS = ["gpt-oss-120b", "qwen-3.8-27b"];
const MAX_PROMPT_CHARS = 4000;

type Task = "blueprint" | "code";

interface ChatMessage {
  role: "system" | "user";
  content: string;
}

function fail(error: string, status: number, code?: string) {
  return NextResponse.json({ error, code }, { status });
}

export async function GET() {
  return NextResponse.json({
    provider: "cerebras",
    configured: Boolean(process.env.CEREBRAS_API_KEY),
    model: DEFAULT_MODEL,
    models: AVAILABLE_MODELS,
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
- 3 to 6 files, always include one Next.js App Router page (app/page.tsx) and one FastAPI module (backend/routes.py).
- Frontend files are React + TypeScript + Tailwind CSS (no imports outside next/react).
- Backend files are Python 3.11 with FastAPI.
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

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid JSON body", 400, "bad_request");
  }

  const task = body.task as Task;
  if (task !== "blueprint" && task !== "code") {
    return fail('task must be "blueprint" or "code"', 400, "bad_request");
  }

  const prompt = String(body.prompt || "").trim().slice(0, MAX_PROMPT_CHARS);
  if (prompt.length < 3) {
    return fail("Prompt is too short", 400, "bad_request");
  }

  const apiKey = String(process.env.CEREBRAS_API_KEY || body.api_key || "").trim();
  if (!apiKey) {
    return fail(
      "Brak klucza Cerebras. Wklej go w panelu AI Engine w builderze (albo ustaw CEREBRAS_API_KEY w Vercelu).",
      400,
      "no_key"
    );
  }

  const requested = String(body.model || "").trim();
  const model = requested || DEFAULT_MODEL;

  const messages = task === "blueprint" ? blueprintMessages(prompt) : codeMessages(prompt, body.blueprint || {});
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 50000);

  try {
    const upstream = await fetch(CEREBRAS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: task === "code" ? 0.3 : 0.5,
        max_completion_tokens: task === "code" ? 6000 : 1600,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });

    const text = await upstream.text();

    if (!upstream.ok) {
      let detail = text.slice(0, 400);
      try {
        const errJson = JSON.parse(text);
        detail = errJson.message || errJson.error?.message || detail;
      } catch {
        /* keep raw text */
      }
      if (upstream.status === 401) {
        return fail("Cerebras odrzucił klucz (401). Sprawdź, czy klucz jest poprawny i aktywny.", 401, "bad_key");
      }
      if (upstream.status === 429) {
        return fail(`Limit darmowego planu Cerebras osiągnięty. Spróbuj za chwilę. (${detail})`, 429, "rate_limit");
      }
      return fail(`Cerebras error ${upstream.status}: ${detail}`, 502, "upstream_error");
    }

    let payload: any;
    try {
      payload = JSON.parse(text);
    } catch {
      return fail("Cerebras returned a non-JSON response", 502, "bad_upstream_response");
    }

    const content = payload?.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return fail("Cerebras returned an empty completion", 502, "empty_completion");
    }

    let data: unknown;
    try {
      data = parseJsonContent(content);
    } catch {
      return fail("Model did not return valid JSON. Try again or switch the model.", 502, "invalid_model_json");
    }

    return NextResponse.json({
      ok: true,
      provider: "cerebras",
      model: payload?.model || model,
      data,
      usage: payload?.usage || null,
    });
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return fail("Cerebras przekroczył limit czasu (50 s). Spróbuj krótszego promptu.", 504, "timeout");
    }
    return fail(`Nie udało się połączyć z Cerebras: ${err?.message || "network error"}`, 502, "network_error");
  } finally {
    clearTimeout(timeout);
  }
}
