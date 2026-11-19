import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, Sparkles } from "lucide-react";
import SalesAgentChat from "@/components/SalesAgentChat";
import { SELLER } from "@/lib/seller";
import { appTypeLabel, buildPitch, demoPath, formatPrice } from "@/lib/studio/sales";
import { findJob, findListingBySlug } from "@/lib/studio/store";

export const dynamic = "force-dynamic";

export default async function OfferPage({ params }: { params: { slug: string } }) {
  const listing = await findListingBySlug(params.slug);
  if (!listing || !listing.published) notFound();

  const job = await findJob(listing.jobId);
  if (!job) notFound();

  const pitch = buildPitch(listing, job);
  const contactHref = listing.agent.contact.includes("@")
    ? `mailto:${listing.agent.contact}`
    : listing.agent.contact;

  return (
    <div className="min-h-screen bg-[#06060a] text-white">
      <header className="border-b border-zinc-800/70 bg-[#06060a]/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2" aria-label="Emergent Studio — home">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500">
              <Sparkles className="h-4 w-4 text-white" />
            </span>
            <span className="text-sm font-semibold">Emergent Studio</span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Studio
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
        <p className="inline-flex items-center gap-2 rounded-full border border-emerald-800/60 bg-emerald-950/40 px-3 py-1 text-[11px] font-medium text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Project for sale · {appTypeLabel(job)}
        </p>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{listing.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">{listing.summary}</p>
          </div>
          <div className="shrink-0 rounded-2xl border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-right">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Price</p>
            <p className="text-2xl font-bold text-emerald-300">{formatPrice(listing)}</p>
            <p className="mt-0.5 text-[10px] text-zinc-500">version {listing.version}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80">
              <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2">
                <p className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-400">
                  <Eye className="h-3.5 w-3.5" /> Live build
                </p>
                <a
                  href={demoPath(job)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-indigo-300 hover:text-white"
                >
                  Open full screen
                </a>
              </div>
              <iframe
                title={`${listing.title} — live preview`}
                src={demoPath(job)}
                className="h-[380px] w-full bg-white sm:h-[460px]"
                loading="lazy"
              />
            </section>

            <section className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
              <h2 className="text-sm font-semibold text-zinc-200">What you get</h2>
              <ul className="mt-2 space-y-1.5">
                {pitch.map((line) => (
                  <li key={line} className="flex gap-2 text-xs leading-relaxed text-zinc-400">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-indigo-400" />
                    {line}
                  </li>
                ))}
              </ul>
              <a
                href={contactHref}
                className="mt-4 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-500"
              >
                Contact the seller · {listing.agent.contact}
              </a>
              <div className="mt-4 border-t border-zinc-800 pt-3 text-[11px] leading-relaxed text-zinc-500">
                Sold by <span className="text-zinc-300">{SELLER.name}</span> · {SELLER.location}
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <a href={`mailto:${SELLER.complianceEmail}`} className="hover:text-white">
                    {SELLER.complianceEmail}
                  </a>
                  <a href={SELLER.whatsappUrl} target="_blank" rel="noreferrer" className="hover:text-white">
                    WhatsApp
                  </a>
                  <a href={SELLER.linkedin} target="_blank" rel="noreferrer" className="hover:text-white">
                    LinkedIn
                  </a>
                  <a href={SELLER.youtube} target="_blank" rel="noreferrer" className="hover:text-white">
                    YouTube
                  </a>
                  <a href={SELLER.sideProjectors} target="_blank" rel="noreferrer" className="hover:text-white">
                    SideProjectors
                  </a>
                </div>
              </div>
            </section>
          </div>

          <SalesAgentChat slug={listing.slug} agentName={listing.agent.name} greeting={listing.agent.greeting} />
        </div>
      </main>
    </div>
  );
}
