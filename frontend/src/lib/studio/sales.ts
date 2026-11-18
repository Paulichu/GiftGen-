import type { Job, Listing } from "./types";

export type SalesTopic =
  | "price"
  | "features"
  | "demo"
  | "stack"
  | "buy"
  | "contact"
  | "custom"
  | "handover"
  | "fallback";

const TOPICS: Array<{ topic: SalesTopic; pattern: RegExp }> = [
  { topic: "price", pattern: /(price|cost|how much|cena|koszt|ile (to )?kosztuje|płatn)/i },
  { topic: "demo", pattern: /(demo|preview|see it|try it|podgląd|zobaczy|wypróbuj)/i },
  { topic: "stack", pattern: /(stack|tech|code|source|javascript|html|kod|technolog)/i },
  { topic: "buy", pattern: /(buy|purchase|order|kupi|zamów|checkout|pay for)/i },
  { topic: "contact", pattern: /(contact|email|phone|kontakt|telefon|mail)/i },
  { topic: "custom", pattern: /(custom|change|add a field|dostos|zmian|dodać pole|rozbudow)/i },
  { topic: "handover", pattern: /(deliver|handover|files|zip|przekaz|plik|źródł|licen)/i },
  { topic: "features", pattern: /(features?|what does|what is|funkcj|co robi|opis|szczegół)/i },
];

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function uniqueSlug(base: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  const root = base || "project";
  if (!used.has(root)) return root;
  let index = 2;
  while (used.has(`${root}-${index}`)) index += 1;
  return `${root}-${index}`;
}

export function detectTopic(message: string): SalesTopic {
  for (const entry of TOPICS) {
    if (entry.pattern.test(message)) return entry.topic;
  }
  return "fallback";
}

export function formatPrice(listing: Listing): string {
  const amount = new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 2 }).format(listing.price);
  return listing.price === 0 ? "free" : `${amount} ${listing.currency}`;
}

export function demoPath(job: Job): string {
  return `/api/jobs/${job.id}/preview/index.html`;
}

export function appTypeLabel(job: Job): string {
  if (job.appType === "landing") return "landing page";
  if (job.appType === "mobile") return "mobile-first app";
  return "full-stack app";
}

export function buildPitch(listing: Listing, job: Job): string[] {
  const version = job.versions.find((entry) => entry.number === listing.version) ?? job.versions[0];
  const fields = version?.blueprint.fields ?? [];
  const pitch = [
    `${appTypeLabel(job)} — ${version?.files.length ?? 5} self-contained files, no build step.`,
    fields.length > 0
      ? `${fields.length} fields: ${fields.slice(0, 4).map((field) => field.label).join(", ")}${fields.length > 4 ? "…" : ""}`
      : "Single page with a working signup form.",
    "Records live in each visitor's browser, so there is no database to run.",
    `Source files and a versioned ZIP export come with the project.`,
  ];
  return [...pitch, ...listing.agent.highlights].filter(Boolean);
}

/**
 * Deterministic sales agent: every answer is derived from the listing and the
 * generated bundle, so the offer page never invents capabilities or prices.
 */
export function replyToBuyer(listing: Listing, job: Job, message: string): { topic: SalesTopic; reply: string } {
  const topic = detectTopic(message);
  const version = job.versions.find((entry) => entry.number === listing.version) ?? job.versions[0];
  const fields = version?.blueprint.fields ?? [];
  const contact = listing.agent.contact;
  const price = formatPrice(listing);

  switch (topic) {
    case "price":
      return {
        topic,
        reply:
          listing.price === 0
            ? `“${listing.title}” is listed for free — write to ${contact} if you want the source files handed over.`
            : `“${listing.title}” is listed at ${price}. That covers the generated source files, the ZIP export and this build version. Write to ${contact} to start.`,
      };
    case "features":
      return {
        topic,
        reply:
          `“${listing.title}” is a ${appTypeLabel(job)}` +
          (fields.length > 0 ? ` with ${fields.length} fields (${fields.slice(0, 4).map((f) => f.label).join(", ")}).` : " with a working signup form.") +
          (listing.summary ? ` ${listing.summary}` : "") +
          (listing.agent.highlights.length > 0 ? ` Highlights: ${listing.agent.highlights.join(" · ")}.` : ""),
      };
    case "demo":
      return {
        topic,
        reply: `You can try the live build at ${demoPath(job)} — it is the actual generated app, not a mockup.`,
      };
    case "stack":
      return {
        topic,
        reply: `Plain HTML, CSS and JavaScript in ${version?.files.length ?? 5} files, no framework and no build step. Data is stored in the visitor's browser, so the project needs no backend or database.`,
      };
    case "buy":
      return {
        topic,
        reply: `To buy “${listing.title}” for ${price}, write to ${contact} with the offer link. Handover is the source files plus the ZIP export of version ${listing.version}.`,
      };
    case "contact":
      return { topic, reply: `The seller answers at ${contact}.` };
    case "custom":
      return {
        topic,
        reply: `The studio can iterate this build: describe the change (a field, a filter, a colour) and it regenerates the files with validation. Iterations after the sale are agreed with the seller at ${contact}.`,
      };
    case "handover":
      return {
        topic,
        reply: `Handover is version ${listing.version}: ${version?.files.length ?? 5} files (index.html, styles.css, app.js and the rest) plus a versioned ZIP export. You can host them anywhere static.`,
      };
    default:
      return {
        topic,
        reply: `I can answer about the price (${price}), what the app does, the live demo and how to buy. Ask about one of those, or write to ${contact}.`,
      };
  }
}
