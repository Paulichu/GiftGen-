"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  Rocket,
  Store,
  Tag,
  Trash2,
} from "lucide-react";
import { errorMessage, studio, type JobSummary, type ListingSummary } from "@/lib/studio/client";
import type { AgentTone, Currency } from "@/lib/studio/types";

const TONES: Array<{ id: AgentTone; label: string }> = [
  { id: "friendly", label: "Friendly" },
  { id: "direct", label: "Direct" },
  { id: "consultative", label: "Consultative" },
];

const CURRENCIES: Currency[] = ["PLN", "EUR", "USD"];

const inputClass =
  "w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-indigo-500";

function ListingCard({
  listing,
  onChange,
  onRemove,
  onCopied,
  copied,
}: {
  listing: ListingSummary;
  onChange: (next: ListingSummary) => void;
  onRemove: (id: string) => void;
  onCopied: (slug: string) => void;
  copied: string | null;
}) {
  const [price, setPrice] = useState(String(listing.price));
  const [contact, setContact] = useState("");
  const [agentName, setAgentName] = useState(listing.agentName);
  const [tone, setTone] = useState<AgentTone>("friendly");
  const [highlights, setHighlights] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function patch(body: Record<string, unknown>) {
    setSaving(true);
    setError(null);
    try {
      const updated = await studio.updateListing(listing.id, body);
      onChange({
        ...listing,
        title: updated.title,
        price: updated.price,
        currency: updated.currency,
        published: updated.published,
        agentName: updated.agent.name,
      });
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  const offerUrl = typeof window === "undefined" ? `/s/${listing.slug}/` : `${window.location.origin}/s/${listing.slug}/`;

  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-zinc-100">{listing.title}</h2>
          <p className="mt-0.5 text-[11px] text-zinc-500">
            {listing.jobName} · v{listing.version} · agent {listing.agentName}
          </p>
        </div>
        <span
          className={
            listing.published
              ? "rounded-full border border-emerald-800/60 bg-emerald-950/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-300"
              : "rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold text-zinc-400"
          }
        >
          {listing.published ? "Published" : "Draft"}
        </span>
      </div>

      <p className="mt-2 text-sm font-bold text-emerald-300">
        {listing.price === 0 ? "free" : `${listing.price} ${listing.currency}`}
      </p>

      <details className="mt-3 rounded-xl border border-zinc-800/80 p-3">
        <summary className="cursor-pointer list-none text-[11px] font-medium text-zinc-400 hover:text-zinc-200">
          Edit offer &amp; sales agent
        </summary>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <label className="text-[11px] text-zinc-400">
            Price
            <input value={price} onChange={(event) => setPrice(event.target.value)} inputMode="decimal" className={`mt-1 ${inputClass}`} />
          </label>
          <label className="text-[11px] text-zinc-400">
            Agent name
            <input value={agentName} onChange={(event) => setAgentName(event.target.value)} className={`mt-1 ${inputClass}`} />
          </label>
          <label className="text-[11px] text-zinc-400">
            Buyer contact
            <input
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              placeholder="hello@studio.dev"
              className={`mt-1 ${inputClass}`}
            />
          </label>
          <label className="text-[11px] text-zinc-400">
            Tone
            <select value={tone} onChange={(event) => setTone(event.target.value as AgentTone)} className={`mt-1 ${inputClass}`}>
              {TONES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[11px] text-zinc-400 sm:col-span-2">
            Selling points (comma separated)
            <input
              value={highlights}
              onChange={(event) => setHighlights(event.target.value)}
              placeholder="Works offline, no backend, ready to rebrand"
              className={`mt-1 ${inputClass}`}
            />
          </label>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => {
              const body: Record<string, unknown> = { agentName };
              const parsed = Number(price);
              if (Number.isFinite(parsed)) body.price = parsed;
              if (contact.trim()) body.contact = contact.trim();
              body.tone = tone;
              if (highlights.trim()) body.highlights = highlights.split(",").map((item) => item.trim()).filter(Boolean);
              void patch(body);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Save
          </button>
          <span className="text-[10px] text-zinc-500">Price, contact and agent copy only — the build stays untouched.</span>
        </div>
        {error ? <p className="mt-2 text-[11px] text-red-400">{error}</p> : null}
      </details>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => void patch({ published: !listing.published })}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-[11px] font-semibold text-zinc-200 transition hover:border-zinc-500 hover:text-white disabled:opacity-60"
        >
          {listing.published ? "Unpublish" : "Publish offer"}
        </button>
        {listing.published ? (
          <>
            <Link
              href={`/s/${listing.slug}`}
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 px-3 py-1.5 text-[11px] text-zinc-300 transition hover:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Open offer
            </Link>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard?.writeText(offerUrl).then(() => onCopied(listing.slug));
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 px-3 py-1.5 text-[11px] text-zinc-300 transition hover:text-white"
            >
              {copied === listing.slug ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied === listing.slug ? "Copied" : "Copy link"}
            </button>
          </>
        ) : null}
        <button
          type="button"
          onClick={() => {
            if (window.confirm(`Delete the listing “${listing.title}”? The build stays.`)) void onRemove(listing.id);
          }}
          aria-label={`Delete listing ${listing.title}`}
          className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-zinc-500 transition hover:bg-zinc-900 hover:text-red-400"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

export default function SellPage() {
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const [jobId, setJobId] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("1200");
  const [currency, setCurrency] = useState<Currency>("PLN");
  const [contact, setContact] = useState("");
  const [agentName, setAgentName] = useState("Alex");
  const [tone, setTone] = useState<AgentTone>("friendly");
  const [highlights, setHighlights] = useState("");

  const load = useCallback(async () => {
    try {
      const [nextJobs, nextListings] = await Promise.all([studio.jobs(), studio.listings()]);
      setJobs(nextJobs);
      setListings(nextListings);
      setJobId((current) => current || nextJobs[0]?.id || "");
      setError(null);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function create(event: FormEvent) {
    event.preventDefault();
    if (!jobId) {
      setError("Build an app first — there is nothing to sell yet.");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const listing = await studio.createListing({
        jobId,
        title: title.trim() || undefined,
        price: Number(price) || 0,
        currency,
        contact: contact.trim(),
        agentName: agentName.trim() || "Sales",
        tone,
        highlights: highlights.split(",").map((item) => item.trim()).filter(Boolean),
      });
      setListings((current) => [
        {
          id: listing.id,
          slug: listing.slug,
          title: listing.title,
          price: listing.price,
          currency: listing.currency,
          published: listing.published,
          jobId: listing.jobId,
          jobName: jobs.find((job) => job.id === listing.jobId)?.name ?? "Build",
          version: listing.version,
          agentName: listing.agent.name,
          updatedAt: listing.updatedAt,
        },
        ...current,
      ]);
      setTitle("");
      setHighlights("");
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setCreating(false);
    }
  }

  async function remove(id: string) {
    try {
      await studio.removeListing(id);
      setListings((current) => current.filter((listing) => listing.id !== id));
    } catch (caught) {
      setError(errorMessage(caught));
    }
  }

  return (
    <div className="min-h-screen bg-[#06060a] text-white">
      <header className="border-b border-zinc-800/70 bg-[#06060a]/90">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Studio
          </Link>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
            <Store className="h-3.5 w-3.5" /> Sell
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Sell a project</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Pick a finished build, set a price and a buyer contact, and give it a sales agent. Publishing creates a
          public offer page where the agent answers buyers from the project data alone.
        </p>

        <form onSubmit={create} className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
            <Tag className="h-4 w-4 text-indigo-400" /> New listing
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <label className="text-[11px] text-zinc-400 sm:col-span-2">
              Build
              <select value={jobId} onChange={(event) => setJobId(event.target.value)} className={`mt-1 ${inputClass}`}>
                {jobs.length === 0 ? <option value="">No builds yet</option> : null}
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.name} · v{job.currentVersion}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-[11px] text-zinc-400 sm:col-span-2">
              Offer title (optional)
              <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Defaults to the build name" className={`mt-1 ${inputClass}`} />
            </label>
            <label className="text-[11px] text-zinc-400">
              Price
              <input value={price} onChange={(event) => setPrice(event.target.value)} inputMode="decimal" className={`mt-1 ${inputClass}`} />
            </label>
            <label className="text-[11px] text-zinc-400">
              Currency
              <select value={currency} onChange={(event) => setCurrency(event.target.value as Currency)} className={`mt-1 ${inputClass}`}>
                {CURRENCIES.map((entry) => (
                  <option key={entry} value={entry}>
                    {entry}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-[11px] text-zinc-400">
              Buyer contact
              <input
                value={contact}
                onChange={(event) => setContact(event.target.value)}
                placeholder="hello@studio.dev"
                required
                className={`mt-1 ${inputClass}`}
              />
            </label>
            <label className="text-[11px] text-zinc-400">
              Agent name
              <input value={agentName} onChange={(event) => setAgentName(event.target.value)} className={`mt-1 ${inputClass}`} />
            </label>
            <label className="text-[11px] text-zinc-400">
              Agent tone
              <select value={tone} onChange={(event) => setTone(event.target.value as AgentTone)} className={`mt-1 ${inputClass}`}>
                {TONES.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-[11px] text-zinc-400">
              Selling points (comma separated)
              <input
                value={highlights}
                onChange={(event) => setHighlights(event.target.value)}
                placeholder="No backend, ready to rebrand"
                className={`mt-1 ${inputClass}`}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={creating || loading}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
            {creating ? "Creating…" : "Create listing"}
          </button>
          {error ? <p className="mt-2 text-[11px] text-red-400">{error}</p> : null}
        </form>

        <section className="mt-8 space-y-3" aria-label="Your listings">
          {loading ? <p className="text-xs text-zinc-500">Loading listings…</p> : null}
          {!loading && listings.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-zinc-800 p-4 text-xs text-zinc-500">
              No listings yet. Build an app, then turn it into a project for sale above.
            </p>
          ) : null}
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              copied={copied}
              onCopied={(slug) => {
                setCopied(slug);
                window.setTimeout(() => setCopied(null), 2000);
              }}
              onChange={(next) => setListings((current) => current.map((entry) => (entry.id === next.id ? next : entry)))}
              onRemove={remove}
            />
          ))}
        </section>
      </main>
    </div>
  );
}
