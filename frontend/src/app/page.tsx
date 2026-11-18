"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Code2,
  Eye,
  Globe,
  Layers,
  Loader2,
  Store,
  Rocket,
  Sparkles,
  Zap,
} from "lucide-react";
import InstallApp from "@/components/InstallApp";
import { errorMessage, studio, timeAgo, type JobSummary } from "@/lib/studio/client";
import type { AppType, WorkspaceStats } from "@/lib/studio/types";

const APP_TYPES: Array<{ id: AppType; label: string; hint: string }> = [
  { id: "fullstack", label: "Full-stack app", hint: "Records, fields and saved data" },
  { id: "mobile", label: "Mobile app", hint: "Mobile-first layout" },
  { id: "landing", label: "Landing page", hint: "Single page and a signup form" },
];

export default function HomePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [appType, setAppType] = useState<AppType>("fullstack");
  const [stats, setStats] = useState<WorkspaceStats | null>(null);
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [nextStats, nextJobs] = await Promise.all([studio.stats(), studio.jobs()]);
      setStats(nextStats);
      setJobs(nextJobs);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function startBuild() {
    const text = prompt.trim();
    if (text.length < 10) {
      setError("Describe the app in at least 10 characters.");
      return;
    }
    setBuilding(true);
    setError(null);
    try {
      const job = await studio.create(text, appType);
      router.push(`/jobs/${job.id}`);
    } catch (caught) {
      setError(errorMessage(caught));
      setBuilding(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute left-1/2 top-[-220px] h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[120px]" />

      <header className="relative z-10 border-b border-zinc-800/70 bg-[#06060a]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4">
          <Link href="/" aria-label="Emergent Studio — home" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 shadow-lg shadow-indigo-900/40">
              <Sparkles className="h-4 w-4 text-white" />
            </span>
            <span className="hidden text-lg font-bold tracking-tight sm:inline">Emergent Studio</span>
            <span className="hidden rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 sm:inline">
              self-hosted
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/showroom"
              aria-label="Showroom produktów i dem"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 sm:w-auto sm:justify-start sm:gap-1.5 sm:px-2"
            >
              <Store aria-hidden="true" className="h-4 w-4" />
              <span className="hidden text-xs font-medium sm:inline">Showroom</span>
            </Link>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-800/60 bg-emerald-950/40 px-2 py-1 text-[10px] font-medium text-emerald-300 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs">
              <Zap className="hidden h-3 w-3 text-emerald-400 sm:block sm:h-3.5 sm:w-3.5" />
              Free forever
            </span>
            <a
              href="#build"
              className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-900/30 transition hover:bg-indigo-500 sm:px-4 sm:text-sm"
            >
              New build
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </header>

      <main
        className="relative z-10 mx-auto max-w-6xl px-5"
        style={{ paddingBottom: "calc(max(5rem, var(--install-banner-space, 0px) + 1rem))" }}
      >
        <section className="pt-16 sm:pt-24">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-800/60 bg-emerald-950/40 px-3 py-1.5 text-xs font-medium text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Every build generates real files and a running preview
          </p>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
            Describe an app.
            <br />
            Get a working app.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-zinc-400 sm:text-lg">
            The studio reads your prompt, designs a data model, and writes a self-contained
            HTML/CSS/JS app. The preview is the app itself — no mockups, no placeholder screenshots.
          </p>
        </section>

        <section id="build" className="mt-10 scroll-mt-24">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-2xl shadow-black/40 sm:p-5">
            <div className="flex flex-wrap gap-2">
              {APP_TYPES.map((type) => {
                const active = appType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setAppType(type.id)}
                    className={`rounded-xl border px-3.5 py-2 text-left transition ${
                      active
                        ? "border-indigo-500 bg-indigo-600/10"
                        : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                    }`}
                  >
                    <span className={`block text-sm font-semibold ${active ? "text-white" : "text-zinc-300"}`}>
                      {type.label}
                    </span>
                    <span className="block text-[11px] text-zinc-500">{type.hint}</span>
                  </button>
                );
              })}
            </div>

            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={4}
              placeholder="Describe what you want to build, who it is for and the fields you need…"
              className="mt-4 w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-indigo-500 sm:text-[15px]"
            />

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-zinc-500">
                Unlimited builds, no credits · data model and fields are derived from your text
              </p>
              <button
                type="button"
                onClick={startBuild}
                disabled={building}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {building ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                {building ? "Building…" : "Build app"}
              </button>
            </div>

            {error ? (
              <p className="mt-3 rounded-xl border border-red-900/60 bg-red-950/40 px-3 py-2 text-xs text-red-300">
                {error}
              </p>
            ) : null}
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Your builds</h2>
              <p className="text-sm text-zinc-500">Stored in this workspace and kept across restarts.</p>
            </div>
            {stats ? (
              <div className="hidden gap-6 text-right text-xs text-zinc-500 sm:flex">
                <span>
                  <strong className="block text-lg font-bold text-zinc-200">{stats.jobs}</strong>
                  builds
                </span>
                <span>
                  <strong className="block text-lg font-bold text-zinc-200">{stats.versions}</strong>
                  versions
                </span>
                <span>
                  <strong className="block text-lg font-bold text-zinc-200">{stats.published}</strong>
                  published
                </span>
              </div>
            ) : null}
          </div>

          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((index) => (
                <div key={index} className="h-32 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/40" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 p-10 text-center">
              <p className="text-sm font-semibold text-zinc-300">No builds yet</p>
              <p className="mt-1 text-sm text-zinc-500">
                Describe your first app above — the studio will generate it and open the preview.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="group flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 transition hover:border-zinc-700 hover:bg-zinc-900/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="line-clamp-1 text-sm font-semibold text-zinc-100">{job.name}</h3>
                    <span className="shrink-0 rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                      v{job.currentVersion}
                    </span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-500">{job.prompt}</p>
                  <div className="mt-auto flex items-center gap-3 pt-4 text-[11px] text-zinc-500">
                    <span>{job.appType === "landing" ? "Landing page" : job.appType === "mobile" ? "Mobile app" : "Full-stack"}</span>
                    {job.fieldCount > 0 ? <span>{job.fieldCount} fields</span> : null}
                    <span>{timeAgo(job.updatedAt)}</span>
                    {job.publishedSlug ? (
                      <span className="ml-auto inline-flex items-center gap-1 text-emerald-400">
                        <Globe className="h-3 w-3" />
                        live
                      </span>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Layers,
              title: "Plans the model",
              copy: "Reads the prompt, picks the entity and turns mentioned attributes into typed fields.",
            },
            {
              icon: Code2,
              title: "Writes real files",
              copy: "Emits index.html, styles.css and app.js — no framework, no build step.",
            },
            {
              icon: Eye,
              title: "Runs the preview",
              copy: "The preview iframe is served from those exact files, so what you see is the app.",
            },
            {
              icon: Globe,
              title: "Publishes for real",
              copy: "Publishing serves the chosen version at its own URL, and re-publishing pushes updates.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5">
              <item.icon className="h-5 w-5 text-indigo-400" />
              <h3 className="mt-3 text-sm font-semibold text-zinc-200">{item.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">{item.copy}</p>
            </div>
          ))}
        </section>

        <p className="mt-14 text-center text-xs text-zinc-600">
          Builds, versions and messages live in <code className="rounded bg-zinc-900 px-1.5 py-0.5">.data/studio.json</code>.
          Generated apps keep their records in browser storage.
        </p>
      </main>

      <InstallApp />
    </div>
  );
}
