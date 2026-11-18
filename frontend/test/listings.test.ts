import assert from "node:assert/strict";
import { it } from "node:test";
import {
  appTypeLabel,
  buildPitch,
  demoPath,
  detectTopic,
  formatPrice,
  replyToBuyer,
  slugify,
  uniqueSlug,
} from "../src/lib/studio/sales";
import type { Job, Listing, Version } from "../src/lib/studio/types";

const version: Version = {
  number: 1,
  createdAt: "2026-01-01T00:00:00.000Z",
  summary: "Initial build",
  blueprint: {
    title: "Notes",
    tagline: "Personal notes with tags",
    description: "A notes app.",
    appType: "fullstack",
    entity: { singular: "note", plural: "notes" },
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "body", label: "Body", type: "textarea" },
      { key: "tags", label: "Tags", type: "text" },
    ],
    features: { search: true, filter: true, sort: false, stats: false, exportCsv: true, editing: true },
    theme: { mode: "dark", accent: "#6366f1", accentName: "indigo", radius: 12 },
    pages: [{ route: "/", title: "Notes", description: "List notes" }],
  },
  files: ["index.html", "styles.css", "app.js", "schema.json", "README.md"].map((path) => ({
    path,
    language: path.endsWith(".html") ? "html" : "text",
    content: "x",
    bytes: 1,
  })),
  events: [],
};

const job: Job = {
  id: "job01",
  prompt: "Build a notes app with title, body and tags",
  name: "Notes",
  appType: "fullstack",
  status: "published",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  currentVersion: 1,
  versions: [version],
  messages: [],
  publish: { slug: "notes", version: 1, publishedAt: "2026-01-01T00:00:00.000Z" },
};

const listing: Listing = {
  id: "listing01",
  slug: "notes-app",
  jobId: job.id,
  version: 1,
  title: "Notes app",
  summary: "Personal notes with tags",
  price: 1200,
  currency: "PLN",
  agent: {
    name: "Alex",
    tone: "friendly",
    greeting: "Hi, ask me about the notes app.",
    highlights: ["No backend needed", "Ready to rebrand"],
    contact: "hello@studio.dev",
  },
  published: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

it("routes buyer questions to grounded topics", () => {
  assert.equal(detectTopic("How much is it?"), "price");
  assert.equal(detectTopic("Ile to kosztuje?"), "price");
  assert.equal(detectTopic("Can I see a demo?"), "demo");
  assert.equal(detectTopic("What tech is it built with?"), "stack");
  assert.equal(detectTopic("How do I buy it?"), "buy");
  assert.equal(detectTopic("hello?"), "fallback");
});

it("answers the price question with the listing price and contact", () => {
  const { topic, reply } = replyToBuyer(listing, job, "How much does it cost?");
  assert.equal(topic, "price");
  assert.match(reply, /1200 PLN/);
  assert.match(reply, /hello@studio\.dev/);
});

it("describes the actual generated app instead of invented features", () => {
  const { reply } = replyToBuyer(listing, job, "What does it do?");
  assert.match(reply, /full-stack app/);
  assert.match(reply, /3 fields/);
  assert.match(reply, /No backend needed/);
});

it("points buyers at the real preview and handover contents", () => {
  assert.equal(demoPath(job), "/api/jobs/job01/preview/index.html");
  assert.match(replyToBuyer(listing, job, "Show me the demo").reply, /\/api\/jobs\/job01\/preview\/index\.html/);
  const handover = replyToBuyer(listing, job, "What files do I get?").reply;
  assert.match(handover, /5 files/);
  assert.match(handover, /ZIP/);
});

it("falls back to the supported questions and contact", () => {
  const { topic, reply } = replyToBuyer(listing, job, "Nice weather today");
  assert.equal(topic, "fallback");
  assert.match(reply, /price/);
  assert.match(reply, /hello@studio\.dev/);
});

it("formats prices, builds a pitch and keeps slugs unique", () => {
  assert.equal(formatPrice(listing), "1200 PLN");
  assert.match(formatPrice({ ...listing, price: 12000 }), /^12\s?000 PLN$/);
  assert.equal(formatPrice({ ...listing, price: 0 }), "free");
  assert.equal(appTypeLabel(job), "full-stack app");
  assert.ok(buildPitch(listing, job).length >= 4);

  assert.equal(slugify("Notes App — sprzedam!"), "notes-app-sprzedam");
  assert.equal(uniqueSlug("notes-app", []), "notes-app");
  assert.equal(uniqueSlug("notes-app", ["notes-app"]), "notes-app-2");
  assert.equal(uniqueSlug("notes-app", ["notes-app", "notes-app-2"]), "notes-app-3");
  assert.equal(uniqueSlug("", []), "project");
});
