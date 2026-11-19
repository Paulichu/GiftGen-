import { NextResponse } from "next/server";
import { SELLER } from "@/lib/seller";
import { slugify, uniqueSlug } from "@/lib/studio/sales";
import { newId, nowIso, readDb, withDb } from "@/lib/studio/store";
import type { AgentTone, Currency, Listing } from "@/lib/studio/types";

export const dynamic = "force-dynamic";

const TONES: AgentTone[] = ["friendly", "direct", "consultative"];
const CURRENCIES: Currency[] = ["PLN", "EUR", "USD"];

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function readHighlights(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim().slice(0, 90))
    .filter(Boolean)
    .slice(0, 6);
}

export async function GET() {
  const listings = await readDb((db) =>
    db.listings.map((listing) => {
      const job = db.jobs.find((entry) => entry.id === listing.jobId);
      return {
        id: listing.id,
        slug: listing.slug,
        title: listing.title,
        price: listing.price,
        currency: listing.currency,
        published: listing.published,
        jobId: listing.jobId,
        jobName: job?.name ?? "Deleted build",
        version: listing.version,
        agentName: listing.agent.name,
        updatedAt: listing.updatedAt,
      };
    })
  );
  return NextResponse.json(listings);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const jobId = text(body.jobId, 40);
  const price = typeof body.price === "number" && Number.isFinite(body.price) ? body.price : 0;
  const currency: Currency = CURRENCIES.includes(body.currency as Currency)
    ? (body.currency as Currency)
    : "PLN";
  const contact = text(body.contact, 160) || SELLER.email;
  const agentName = text(body.agentName, 40) || "Sales";
  const tone: AgentTone = TONES.includes(body.tone as AgentTone) ? (body.tone as AgentTone) : "friendly";
  const highlights = readHighlights(body.highlights);

  if (price < 0 || price > 10_000_000) {
    return NextResponse.json({ error: "Price must be between 0 and 10 000 000." }, { status: 400 });
  }
  if (contact.length < 3) {
    return NextResponse.json({ error: "Add an email or URL buyers can reach." }, { status: 400 });
  }

  const listing = await withDb<Listing | null>((db) => {
    const job = db.jobs.find((entry) => entry.id === jobId);
    if (!job) return null;

    const version = job.versions.find((entry) => entry.number === job.currentVersion) ?? job.versions[0];
    const title = text(body.title, 80) || job.name;
    const summary =
      text(body.summary, 320) ||
      version?.blueprint.tagline ||
      version?.blueprint.description ||
      "A generated, self-contained web app.";
    const now = nowIso();

    const created: Listing = {
      id: newId(),
      slug: uniqueSlug(slugify(title), db.listings.map((entry) => entry.slug)),
      jobId: job.id,
      version: job.currentVersion,
      title,
      summary,
      price,
      currency,
      agent: {
        name: agentName,
        tone,
        greeting:
          text(body.greeting, 200) || `Hi — I'm ${agentName}. Ask me about “${title}”, its price or the live demo.`,
        highlights,
        contact,
      },
      published: false,
      createdAt: now,
      updatedAt: now,
    };

    db.listings.unshift(created);
    return created;
  });

  if (!listing) return NextResponse.json({ error: "Pick a build that still exists." }, { status: 400 });
  return NextResponse.json(listing, { status: 201 });
}
