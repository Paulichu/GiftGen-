import type { AppType, Blueprint, Field, FieldType } from "./types";

/**
 * Turns a free-form prompt into a concrete blueprint.
 *
 * Everything here is derived from what the user actually wrote: there is no
 * preset library of example apps, no canned demo records and no fabricated
 * business domain. Unknown prompts fall back to a neutral record editor.
 */

const ATTRIBUTE_WORDS: Array<{ label: string; words: string[] }> = [
  { label: "Name", words: ["name"] },
  { label: "Title", words: ["title"] },
  { label: "Body", words: ["body"] },
  { label: "Content", words: ["content"] },
  { label: "Message", words: ["message"] },
  { label: "Email", words: ["email", "e-mail"] },
  { label: "Phone", words: ["phone", "telephone", "mobile"] },
  { label: "Address", words: ["address"] },
  { label: "Website", words: ["website", "url", "link"] },
  { label: "Company", words: ["company", "organisation", "organization"] },
  { label: "Price", words: ["price", "cost"] },
  { label: "Amount", words: ["amount", "total value"] },
  { label: "Quantity", words: ["quantity", "count", "stock"] },
  { label: "Due date", words: ["due date", "deadline"] },
  { label: "Priority", words: ["priority"] },
  { label: "Category", words: ["category", "categories"] },
  { label: "Tags", words: ["tag", "tags"] },
  { label: "Status", words: ["status"] },
  { label: "Notes", words: ["notes", "note", "comment"] },
  { label: "Description", words: ["description", "details"] },
  { label: "Rating", words: ["rating", "score"] },
  { label: "Progress", words: ["progress"] },
  { label: "Duration", words: ["duration", "length"] },
  { label: "Location", words: ["location", "venue"] },
  { label: "Image URL", words: ["image", "photo", "cover", "picture"] },
  { label: "City", words: ["city"] },
  { label: "Country", words: ["country"] },
  { label: "Age", words: ["age"] },
  { label: "Weight", words: ["weight"] },
  { label: "Calories", words: ["calories"] },
  { label: "Author", words: ["author", "creator"] },
  { label: "Date", words: ["date"] },
  { label: "Time", words: ["time"] },
];

const ACCENTS: Array<{ words: string[]; hex: string; name: string }> = [
  { words: ["purple", "violet", "lavender", "fiolet"], hex: "#8b5cf6", name: "violet" },
  { words: ["blue", "azure", "niebieski"], hex: "#3b82f6", name: "blue" },
  { words: ["green", "emerald", "mint", "zielony"], hex: "#10b981", name: "emerald" },
  { words: ["pink", "rose", "różowy"], hex: "#f43f5e", name: "rose" },
  { words: ["orange", "amber", "pomarańczowy"], hex: "#f59e0b", name: "amber" },
  { words: ["teal", "cyan", "turquoise"], hex: "#14b8a6", name: "teal" },
  { words: ["red", "crimson"], hex: "#ef4444", name: "red" },
];

const DESIGN_WORDS = /\b(design|designs|theme|themes|look|feels?|style|styles|color|colors|colour|colours|font|fonts|layout|mode|dark|light|clean|minimal|modern|responsive|mobile)\b/i;

const STOP_LABELS = new Set([
  "a",
  "an",
  "the",
  "users",
  "user",
  "team",
  "it",
  "them",
  "this",
  "that",
  "which",
  "who",
  "its",
  "my",
]);

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function pluralize(word: string): string {
  const lower = word.toLowerCase();
  if (/(s|x|z|ch|sh)$/.test(lower)) return `${word}es`;
  if (/[^aeiou]y$/.test(lower)) return `${word.slice(0, -1)}ies`;
  return `${word}s`;
}

function extractNounPhrase(prompt: string): string | null {
  const quoted = prompt.match(/["“']([^"”'\n]{2,40})["”']/);
  if (quoted) return quoted[1].trim();

  const called = prompt.match(/\b(?:called|named)\s+([^.,;\n]{2,40})/i);
  if (called) return called[1].trim();

  const built = prompt.match(
    /\b(?:build|create|make|design|develop|need|want)\s+(?:me\s+)?(?:a|an|the)?\s*([^.,;\n]{3,70}?)(?=\s+(?:where|that|which|with|for|to|so|using|and|including)\b|[.,;\n]|$)/i
  );
  if (!built) return null;

  const phrase = built[1]
    .replace(/\b(app|application|website|site|tool|platform|saas|page|dashboard)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  return phrase || null;
}

function entityFromPrompt(prompt: string, fallbackTitle: string): { singular: string; plural: string } {
  const phrase = extractNounPhrase(prompt) || "";
  const core = phrase
    .replace(
      /\b(landing|tracker|tracking|logger|manager|board|list|planner|organizer|organiser|dashboard|crm|system|portal|hub|keeper|diary|app|application|website|site|tool|platform|saas|page)\b/gi,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();

  let unit = core || fallbackTitle;
  const words = unit.split(" ");
  if (words.length > 1) unit = words[0];
  unit = unit.replace(/[^A-Za-z0-9 ]/g, "").trim();

  if (!unit || unit.length < 2) return { singular: "Entry", plural: "Entries" };

  const singular = titleCase(unit);
  return { singular, plural: pluralize(singular) };
}

function currencyFor(prompt: string): string {
  if (/\b(pln|zł|zl)\b/i.test(prompt)) return " zł";
  if (/€|\beur\b/i.test(prompt)) return " €";
  if (/£|\bgbp\b/i.test(prompt)) return " £";
  return "$";
}

export function inferField(label: string, prompt: string): Field {
  const lower = label.toLowerCase();
  const currency = currencyFor(prompt);
  const base = { key: slugify(label).replace(/-/g, "_"), label };

  if (/(paid|completed|complete|done|favourite|favorite|enabled|active|shipped|archived)\b/.test(lower)) {
    return { ...base, type: "checkbox" };
  }
  if (/date|deadline|due\b/.test(lower)) return { ...base, type: "date" };
  if (/^time$|time\b/.test(lower) && !/timestamp/.test(lower)) return { ...base, type: "time" };
  if (/notes|note\b|description|details|comment|body|summary|ingredients|content/.test(lower)) {
    return { ...base, type: "textarea" };
  }
  if (/price|cost|amount|fee|budget|balance/.test(lower)) {
    return { ...base, type: "number", unit: currency };
  }
  if (/rating|score/.test(lower)) return { ...base, type: "number", unit: " / 5" };
  if (/progress/.test(lower)) return { ...base, type: "number", unit: "%" };
  if (/weight/.test(lower)) return { ...base, type: "number", unit: " kg" };
  if (/duration|minutes|length/.test(lower)) return { ...base, type: "number", unit: " min" };
  if (/calories/.test(lower)) return { ...base, type: "number", unit: " kcal" };
  if (/quantity|count|stock|number\b/.test(lower)) return { ...base, type: "number" };
  if (/priority/.test(lower)) return { ...base, type: "select", options: ["High", "Medium", "Low"] };
  if (/status/.test(lower)) return { ...base, type: "select", options: ["Active", "Done", "Archived"] };
  if (/stage/.test(lower)) return { ...base, type: "select", options: ["New", "In progress", "Won", "Lost"] };
  if (/category/.test(lower)) return { ...base, type: "select", options: ["General", "Work", "Personal", "Other"] };
  if (/frequency/.test(lower)) return { ...base, type: "select", options: ["Daily", "Weekly", "Monthly"] };
  return { ...base, type: "text" };
}

/**
 * Field labels the user wrote out explicitly ("with title, author and rating",
 * or a "fields:" line). Only short, non-design chunks are accepted so prose
 * like "with a clean minimal design" never becomes a field.
 */
function explicitLabels(prompt: string): string[] {
  const labels: string[] = [];

  const lines = prompt.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!/^[-*•]/.test(trimmed) && !/\b(fields?|columns?)\s*[:=]/i.test(trimmed)) continue;
    const body = trimmed.replace(/^[-*•]\s*/, "").replace(/^.*?\b(fields?|columns?)\s*[:=]\s*/i, "");
    const afterWith = body.match(/\b(?:with|including)\s+(.+)$/i);
    const candidate = afterWith ? afterWith[1] : body.replace(/^(add|create|store|save|track)\s+/i, "");
    for (const chunk of candidate.split(/,|;|\band\b|\bor\b/i)) {
      const label = chunk
        .replace(/\b(a|an|the)\b/gi, " ")
        .replace(/\b(field|column|property)s?\b/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (!label) continue;
      const words = label.split(" ");
      if (words.length > 3) continue;
      if (label.length < 2 || label.length > 30) continue;
      if (STOP_LABELS.has(label.toLowerCase())) continue;
      if (DESIGN_WORDS.test(label)) continue;
      if (!/^[A-Za-z][A-Za-z0-9 '/-]*$/.test(label)) continue;
      labels.push(titleCase(label));
    }
  }

  const inline = prompt.match(/\b(?:fields?|columns?)\s*[:=]\s*([^.\n]+)/i);
  if (inline) {
    for (const chunk of inline[1].split(/,|;|\band\b/i)) {
      const label = chunk.trim().replace(/\s+/g, " ");
      if (label.length >= 2 && label.length <= 30 && label.split(" ").length <= 3 && !DESIGN_WORDS.test(label)) {
        labels.push(titleCase(label));
      }
    }
  }
  return labels;
}

function mentionScore(prompt: string, words: string[], skip: [number, number] | null): number {
  const haystack = prompt.toLowerCase();
  let score = -1;

  for (const word of words) {
    const needle = word.toLowerCase();
    let from = 0;
    while (from <= haystack.length) {
      const index = haystack.indexOf(needle, from);
      if (index === -1) break;
      const insideTitlePhrase = skip !== null && index >= skip[0] && index < skip[1];
      if (!insideTitlePhrase) {
        if (score === -1 || index < score) score = index;
        break;
      }
      from = index + needle.length;
    }
  }

  return score;
}

function collectFields(prompt: string): Field[] {
  const labels: string[] = [];
  const seen = new Set<string>();

  // Words that are only part of the app's name ("notes app") are not fields.
  const phrase = extractNounPhrase(prompt);
  const phraseLower = phrase ? phrase.toLowerCase() : "";
  const phraseIndex = phraseLower ? prompt.toLowerCase().indexOf(phraseLower) : -1;
  const titleRange: [number, number] | null =
    phraseIndex >= 0 ? [phraseIndex, phraseIndex + phraseLower.length] : null;

  const push = (raw: string) => {
    const label = raw.trim();
    if (!label) return;
    const key = label.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    labels.push(label);
  };

  for (const label of explicitLabels(prompt)) push(label);

  const mentioned = ATTRIBUTE_WORDS.map((entry) => ({
    label: entry.label,
    score: mentionScore(prompt, entry.words, titleRange),
  }))
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => a.score - b.score);
  for (const entry of mentioned) push(entry.label);

  if (labels.length === 0) return [];

  const fields = labels.slice(0, 8).map((label) => inferField(label, prompt));
  const hasPrimaryText = fields.some((field) => field.type === "text" || field.type === "textarea");
  if (!hasPrimaryText) fields.unshift(inferField("Name", prompt));
  return fields;
}

const GENERIC_PHRASE = /^(app|application|website|site|tool|platform|saas|page|dashboard|landing page|landing|software|product)$/i;

function subjectFromFor(prompt: string): string | null {
  const match = prompt.match(/\bfor\s+(?:my|our|a|an|the)?\s*([^.,;\n]{3,60})/i);
  if (!match) return null;
  const subject = match[1]
    .replace(/\s+(?:where|that|which|with|to|so|using|and)\b.*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  return subject.length >= 3 ? titleCase(subject) : null;
}

function describe(prompt: string): string {
  const clean = prompt.replace(/\s+/g, " ").trim();
  const first = clean.split(/(?<=[.!?])\s/)[0] || clean;
  return first.length > 180 ? `${first.slice(0, 177)}…` : first;
}

function landingBullets(prompt: string): string[] {
  return prompt
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^[-*•]\s+/.test(line))
    .map((line) => line.replace(/^[-*•]\s+/, "").replace(/[.!]$/, "").trim())
    .filter((line) => line.length > 3 && line.length <= 90)
    .slice(0, 6);
}

export function analyzePrompt(promptRaw: string, appType: AppType): Blueprint {
  const prompt = promptRaw.trim();
  const phrase = extractNounPhrase(prompt);
  const genericPhrase = !phrase || GENERIC_PHRASE.test(phrase);
  const title = genericPhrase
    ? subjectFromFor(prompt) ?? "Studio App"
    : titleCase(phrase as string);

  const accent =
    ACCENTS.find((candidate) =>
      candidate.words.some((word) => new RegExp(`\\b${word}\\b`, "i").test(prompt))
    ) || { hex: "#6366f1", name: "indigo" };

  const lightMode = /\b(light|white|bright|minimal|clean)\b/i.test(prompt) && !/\bdark\b/i.test(prompt);
  const theme = {
    mode: lightMode ? ("light" as const) : ("dark" as const),
    accent: accent.hex,
    accentName: accent.name,
    radius: appType === "mobile" ? 18 : 14,
  };

  const entity = entityFromPrompt(prompt, title);
  const description = describe(prompt);

  if (appType === "landing") {
    const bullets = landingBullets(prompt);
    return {
      title,
      tagline: description,
      description,
      appType,
      entity,
      fields: [],
      features: { search: false, filter: false, sort: false, stats: false, exportCsv: false, editing: false },
      theme,
      pages: [
        {
          route: "/",
          title: "Landing page",
          description: "Hero, product highlights, process and a signup call to action.",
        },
      ],
      copy: {
        headline: title,
        subheadline: description,
        cta: /\b(buy|shop|order)\b/i.test(prompt)
          ? "Shop now"
          : /\b(demo|book|call)\b/i.test(prompt)
            ? "Book a call"
            : /\b(waitlist|early access)\b/i.test(prompt)
              ? "Join the waitlist"
              : "Get started",
        bullets,
      },
    };
  }

  let fields = collectFields(prompt);
  if (fields.length === 0) {
    fields = [
      { key: "name", label: "Name", type: "text", required: true, placeholder: "First entry" },
      inferField("Status", prompt),
      inferField("Notes", prompt),
    ];
  }
  if (!fields[0].required) fields[0] = { ...fields[0], required: true };

  return {
    title,
    tagline: description.length > 0 && description.length <= 80
      ? description
      : `A focused ${entity.singular.toLowerCase()} workspace`,
    description,
    appType,
    entity,
    fields,
    features: { search: true, filter: true, sort: true, stats: true, exportCsv: true, editing: true },
    theme,
    pages: [
      {
        route: "/",
        title: title,
        description: `Dashboard with live counters, ${fields.length} fields, search, filters and record management.`,
      },
    ],
  };
}

export function fieldTypeLabel(type: FieldType): string {
  switch (type) {
    case "textarea":
      return "long text";
    case "number":
      return "number";
    case "date":
      return "date";
    case "time":
      return "time";
    case "select":
      return "choice";
    case "checkbox":
      return "yes/no";
    default:
      return "text";
  }
}
