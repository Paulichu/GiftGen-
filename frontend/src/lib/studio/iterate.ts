import { inferField, slugify, titleCase } from "./analyze";
import type { Blueprint, Field, ThemeMode } from "./types";

export type IterationOutcome =
  | { ok: true; blueprint: Blueprint; summary: string }
  | { ok: false; reply: string };

const SUPPORTED = [
  "add a field, e.g. “add a due date field”",
  "remove a field, e.g. “remove the notes field”",
  "rename a field, e.g. “rename the title field to Name”",
  "change a field type, e.g. “make the price field a number”",
  "rename the app, e.g. “rename the app to Garden Log”",
  "switch theme, e.g. “make it light mode” or “use a teal accent”",
  "turn features on or off, e.g. “remove the CSV export” or “add search”",
].join("; ");

const NAMED_COLORS: Array<{ words: string[]; hex: string; name: string }> = [
  { words: ["indigo"], hex: "#6366f1", name: "indigo" },
  { words: ["violet", "purple", "lavender"], hex: "#8b5cf6", name: "violet" },
  { words: ["blue", "azure"], hex: "#3b82f6", name: "blue" },
  { words: ["green", "emerald", "mint"], hex: "#10b981", name: "emerald" },
  { words: ["teal", "cyan", "turquoise"], hex: "#14b8a6", name: "teal" },
  { words: ["pink", "rose"], hex: "#f43f5e", name: "rose" },
  { words: ["orange", "amber"], hex: "#f59e0b", name: "amber" },
  { words: ["red", "crimson"], hex: "#ef4444", name: "red" },
];

const FIELD_TYPE_WORDS: Record<string, Field["type"]> = {
  text: "text",
  string: "text",
  "long text": "textarea",
  textarea: "textarea",
  paragraph: "textarea",
  number: "number",
  numeric: "number",
  date: "date",
  time: "time",
  select: "select",
  choice: "select",
  dropdown: "select",
  checkbox: "checkbox",
  boolean: "checkbox",
  toggle: "checkbox",
};

function clone(blueprint: Blueprint): Blueprint {
  return {
    ...blueprint,
    fields: blueprint.fields.map((field) => ({ ...field, options: field.options ? [...field.options] : undefined })),
    features: { ...blueprint.features },
    theme: { ...blueprint.theme },
    pages: blueprint.pages.map((page) => ({ ...page })),
    entity: { ...blueprint.entity },
    copy: blueprint.copy
      ? { ...blueprint.copy, bullets: [...blueprint.copy.bullets] }
      : undefined,
  };
}

function cleanLabel(raw: string): string {
  return titleCase(
    raw
      .replace(/["'“”]/g, "")
      .replace(/[.!?]+$/g, "")
      .replace(/\b(field|column|property)\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 40)
  );
}

function findField(blueprint: Blueprint, needle: string): Field | undefined {
  const target = needle.toLowerCase().trim();
  if (!target) return undefined;
  return (
    blueprint.fields.find((field) => field.label.toLowerCase() === target) ||
    blueprint.fields.find((field) => field.key === slugify(target).replace(/-/g, "_")) ||
    blueprint.fields.find((field) => field.label.toLowerCase().includes(target)) ||
    blueprint.fields.find((field) => target.includes(field.label.toLowerCase()))
  );
}

function featureName(raw: string): keyof Blueprint["features"] | null {
  const text = raw.toLowerCase();
  if (/search/.test(text)) return "search";
  if (/filter/.test(text)) return "filter";
  if (/sort/.test(text)) return "sort";
  if (/\bstats?\b|counters?|summar/.test(text)) return "stats";
  if (/csv|export/.test(text)) return "exportCsv";
  return null;
}

export function applyInstruction(blueprintInput: Blueprint, instructionRaw: string): IterationOutcome {
  const instruction = instructionRaw.trim();
  const blueprint = clone(blueprintInput);
  const useLandingCopy = blueprint.appType === "landing";

  if (!instruction) {
    return { ok: false, reply: "Send an instruction and I will update the app." };
  }

  // Rename the app.
  const renameApp = instruction.match(
    /(?:rename|change|update)\s+(?:the\s+)?(?:app|site|page|title|project)\s+(?:name\s+)?(?:to|as)\s+["']?(.+?)["']?\.?$/i
  ) || instruction.match(/\bcall it\s+["']?(.+?)["']?\.?$/i);
  if (renameApp) {
    const name = titleCase(renameApp[1].trim().slice(0, 48));
    if (name.length < 2) return { ok: false, reply: "That name is too short. Try something longer." };
    blueprint.title = name;
    if (blueprint.copy) blueprint.copy.headline = name;
    return { ok: true, blueprint, summary: `Renamed the app to “${name}”.` };
  }

  // Theme mode.
  if (/\b(light|white|bright)\b/i.test(instruction) && /\b(mode|theme|background|look)\b/i.test(instruction)) {
    blueprint.theme.mode = "light";
    return { ok: true, blueprint, summary: "Switched the theme to light mode." };
  }
  if (/\bdark\b/i.test(instruction) && /\b(mode|theme|background|look)\b/i.test(instruction)) {
    blueprint.theme.mode = "dark";
    return { ok: true, blueprint, summary: "Switched the theme to dark mode." };
  }

  // Accent colour.
  const hex = instruction.match(/#([0-9a-f]{6})\b/i);
  const named = NAMED_COLORS.find((color) =>
    color.words.some((word) => new RegExp(`\\b${word}\\b`, "i").test(instruction))
  );
  if ((hex || named) && /\b(accent|color|colour|theme|button|brand)\b/i.test(instruction)) {
    const accent = hex ? `#${hex[1].toLowerCase()}` : named!.hex;
    const accentName = hex ? "custom" : named!.name;
    blueprint.theme.accent = accent;
    blueprint.theme.accentName = accentName;
    return { ok: true, blueprint, summary: `Set the accent to ${accentName} (${accent}).` };
  }

  // Feature toggles.
  if (/\b(add|enable|turn on|bring back|include|show)\b/i.test(instruction)) {
    const feature = featureName(instruction);
    if (feature) {
      blueprint.features[feature] = true;
      return { ok: true, blueprint, summary: `Turned ${feature === "exportCsv" ? "CSV export" : feature} on.` };
    }
  }
  if (/\b(remove|disable|turn off|hide|drop|no)\b/i.test(instruction)) {
    const feature = featureName(instruction);
    if (feature) {
      blueprint.features[feature] = false;
      return { ok: true, blueprint, summary: `Turned ${feature === "exportCsv" ? "CSV export" : feature} off.` };
    }
  }

  if (useLandingCopy) {
    return {
      ok: false,
      reply: `This project is a landing page, so the supported edits are: rename the app, switch theme mode, change the accent colour. Send one of those and I will rebuild it.`,
    };
  }

  // Change a field type.
  const typeChange = instruction.match(
    /(?:make|change|set|turn)\s+(?:the\s+)?(.+?)\s+(?:field\s+)?(?:to|into|as)\s+(?:a\s+|an\s+)?(long text|textarea|text|string|number|numeric|date|time|select|choice|dropdown|checkbox|boolean|toggle)/i
  );
  if (typeChange) {
    const field = findField(blueprint, typeChange[1]);
    if (!field) return { ok: false, reply: `I could not find a “${typeChange[1]}” field. Current fields: ${blueprint.fields.map((entry) => entry.label).join(", ")}.` };
    const nextType = FIELD_TYPE_WORDS[typeChange[2].toLowerCase()] ?? "text";
    field.type = nextType;
    if (nextType === "select" && !field.options) field.options = ["Option one", "Option two", "Option three"];
    if (nextType !== "select") delete field.options;
    if (nextType === "number" && !field.unit) field.unit = "";
    if (nextType !== "number") delete field.unit;
    return { ok: true, blueprint, summary: `Changed “${field.label}” to a ${nextType} field.` };
  }

  // Rename a field.
  const renameField = instruction.match(
    /rename\s+(?:the\s+)?(.+?)\s+(?:field\s+)?to\s+["']?(.+?)["']?\.?$/i
  );
  if (renameField) {
    const field = findField(blueprint, renameField[1]);
    if (!field) return { ok: false, reply: `I could not find a “${renameField[1]}” field. Current fields: ${blueprint.fields.map((entry) => entry.label).join(", ")}.` };
    const label = cleanLabel(renameField[2]);
    if (!label) return { ok: false, reply: "That field name is too short." };
    field.label = label;
    return { ok: true, blueprint, summary: `Renamed the field to “${label}”.` };
  }

  // Remove a field.
  const removeField = instruction.match(
    /(?:remove|delete|drop)\s+(?:the\s+)?(.+?)\s+(?:field|column|property)\b/i
  ) || instruction.match(/(?:remove|delete|drop)\s+(?:the\s+)?(?:field|column|property)\s+(.+)$/i);
  if (removeField) {
    const field = findField(blueprint, removeField[1]);
    if (!field) return { ok: false, reply: `I could not find a “${removeField[1]}” field.` };
    if (blueprint.fields.length <= 1) return { ok: false, reply: "The app needs at least one field." };
    blueprint.fields = blueprint.fields.filter((entry) => entry !== field);
    if (!blueprint.fields[0].required) blueprint.fields[0] = { ...blueprint.fields[0], required: true };
    return { ok: true, blueprint, summary: `Removed the “${field.label}” field.` };
  }

  // Add a field.
  const addField =
    instruction.match(/(?:add|include|create)\s+(?:a\s+|an\s+)?(?:new\s+)?(?:text\s+|number\s+|date\s+|time\s+|select\s+|checkbox\s+)?(?:field|column|property)\s+(?:called\s+|named\s+|for\s+)?["']?(.+?)["']?\.?$/i) ||
    instruction.match(/(?:add|include|create)\s+(?:a\s+|an\s+)?(?:new\s+)?(.+?)\s+(?:field|column|property)\b/i);
  if (addField) {
    const label = cleanLabel(addField[1]);
    if (!label || label.length < 2) return { ok: false, reply: "Tell me the field name, for example “add a due date field”." };
    if (findField(blueprint, label)) return { ok: false, reply: `“${label}” already exists.` };
    if (blueprint.fields.length >= 12) return { ok: false, reply: "This app already has 12 fields; remove one first." };
    const field = inferField(label, `${blueprint.description} ${label}`);
    blueprint.fields.push(field);
    return { ok: true, blueprint, summary: `Added a “${field.label}” ${field.type} field.` };
  }

  return {
    ok: false,
    reply: `I did not catch that as a change I can apply. I can ${SUPPORTED}. Tell me which one you want and I will rebuild the app.`,
  };
}

export function themeModeLabel(mode: ThemeMode): string {
  return mode === "light" ? "Light" : "Dark";
}
