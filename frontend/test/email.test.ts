import assert from "node:assert/strict";
import { it } from "node:test";
import { SELLER } from "../src/lib/seller";
import { EmailError, composeOfferEmail, sendEmail, validateEmail } from "../src/lib/studio/email";
import type { Job, Listing } from "../src/lib/studio/types";

function makeJob(): Job {
  return {
    id: "job01",
    prompt: "Build a notes app with title, body and tags",
    name: "Notes",
    appType: "fullstack",
    status: "published",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    currentVersion: 1,
    versions: [
      {
        number: 1,
        summary: "Notes with search",
        createdAt: "2026-01-01T00:00:00.000Z",
        events: [],
        blueprint: {
          title: "Notes",
          tagline: "Personal notes",
          description: "Notes with search and tags",
          appType: "fullstack",
          entity: { singular: "note", plural: "notes" },
          theme: { mode: "dark", accent: "indigo", accentName: "Indigo", radius: 12 },
          pages: [{ route: "/", title: "Notes", description: "All notes" }],
          fields: [
            { key: "title", label: "Title", type: "text" },
            { key: "body", label: "Body", type: "textarea" },
            { key: "tags", label: "Tags", type: "text" },
          ],
          features: { search: true, filter: false, sort: false, stats: false, exportCsv: false, editing: true },
        },
        files: [{ path: "index.html", language: "html", content: "<html></html>", bytes: 13 }],
      },
    ],
    messages: [],
    publish: null,
  };
}

function makeListing(overrides: Partial<Listing> = {}): Listing {
  return {
    id: "listing01",
    slug: "notes",
    jobId: "job01",
    version: 1,
    title: "Notes app",
    summary: "Personal notes with tags",
    price: 1500,
    currency: "EUR",
    agent: {
      name: "Alex",
      tone: "friendly",
      greeting: "Hi, ask me about the notes app.",
      highlights: [],
      contact: SELLER.email,
    },
    published: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

it("composes the offer from listing data, price and seller signature", () => {
  const draft = composeOfferEmail(makeListing(), makeJob(), "https://studio.dev/s/notes/");

  assert.equal(draft.from, SELLER.email);
  assert.match(draft.subject, /Notes app/);
  assert.match(draft.subject, /1\s?500 EUR/);
  assert.match(draft.body, /Live demo: https:\/\/studio\.dev\/s\/notes\//);
  assert.match(draft.body, /Personal notes with tags/);
  assert.match(draft.body, /Source files|self-contained/);
  assert.match(draft.body, new RegExp(SELLER.location));
  assert.match(draft.body, new RegExp(SELLER.linkedin.replace(/[/.]/g, "\\$&")));
  assert.match(draft.body, new RegExp(`WhatsApp ${SELLER.whatsapp.replace(/\+/g, "\\+")}`));
  assert.equal(draft.to, "");
});

it("accepts both approved mailboxes and rejects anything else", () => {
  const draft = composeOfferEmail(makeListing(), makeJob(), "https://studio.dev/s/notes/", "buyer@example.com");

  const ok = validateEmail(draft);
  assert.equal(ok.ok, true);

  const compliance = validateEmail({ ...draft, from: SELLER.complianceEmail });
  assert.equal(compliance.ok, true);

  for (const patch of [
    { from: "admin@ojjja.site" },
    { from: "someone@evil.test" },
    { to: "not-an-email" },
    { to: "" },
    { subject: "" },
    { body: "short" },
    { body: "x".repeat(4001) },
  ]) {
    const result = validateEmail({ ...draft, ...patch });
    assert.equal(result.ok, false, `should reject ${JSON.stringify(patch).slice(0, 40)}`);
  }
});

it("trims the approved draft before sending", () => {
  const draft = composeOfferEmail(makeListing(), makeJob(), "https://studio.dev/s/notes/", " buyer@example.com ");
  const checked = validateEmail({ ...draft, subject: "  Offer  " });

  assert.equal(checked.ok, true);
  assert.equal(checked.ok && checked.value.to, "buyer@example.com");
  assert.equal(checked.ok && checked.value.subject, "Offer");
});

it("refuses to send when SMTP_PASS is missing instead of pretending", async () => {
  const draft = composeOfferEmail(makeListing(), makeJob(), "https://studio.dev/s/notes/", "buyer@example.com");

  await assert.rejects(
    () => sendEmail(draft, { SMTP_HOST: "smtp.hostinger.com" }),
    (error: unknown) => error instanceof EmailError && error.status === 503 && /SMTP_PASS/.test(error.message)
  );
});
