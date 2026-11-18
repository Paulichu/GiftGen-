"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Eye,
  Globe,
  Layers,
  Loader2,
  Monitor,
  RefreshCw,
  Rocket,
  Send,
  Smartphone,
  Sparkles,
  Terminal,
  Trash2,
  X,
} from "lucide-react";
import { errorMessage, studio } from "@/lib/studio/client";
import type { AgentEvent, Job } from "@/lib/studio/types";

type Tab = "preview" | "code" | "blueprint" | "logs";

const TABS: Array<{ id: Tab; label: string; icon: typeof Eye }> = [
  { id: "preview", label: "Preview", icon: Eye },
  { id: "code", label: "Code", icon: Code2 },
  { id: "blueprint", label: "Blueprint", icon: Layers },
  { id: "logs", label: "Logs", icon: Terminal },
];

const QUICK_EDITS = [
  "Add a text field",
  "Make it light mode",
  "Use a teal accent",
  "Remove the CSV export",
];

function EventList({ events }: { events: AgentEvent[] }) {
  return (
    <details className="group mt-2">
      <summary className="cursor-pointer list-none text-[11px] font-medium text-zinc-500 hover:text-zinc-300">
        {events.length} agent steps
      </summary>
      <ul className="mt-2 space-y-1.5 border-l border-zinc-800 pl-3">
        {events.map((event, index) => (
          <li key={index} className="text-[11px] leading-relaxed text-zinc-500">
            <span className="font-semibold text-zinc-400">{event.agent}</span>{" "}
            <span className={event.level === "success" ? "text-emerald-500" : ""}>{event.message}</span>
            <span className="ml-1 text-zinc-600">· {event.durationMs}ms</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

export default function BuilderPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const jobId = params.id;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("preview");
  const [device, setDevice] = useState<"desktop" | "phone">("desktop");
  const [mobileView, setMobileView] = useState<"app" | "chat">("app");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeFile, setActiveFile] = useState("index.html");
  const [nonce, setNonce] = useState(0);
  const [origin, setOrigin] = useState("");

  const chatEnd = useRef<HTMLDivElement | null>(null);
  const zipMenuRef = useRef<HTMLDetailsElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const [menuTop, setMenuTop] = useState(64);

  const load = useCallback(async () => {
    try {
      const next = await studio.job(jobId);
      setJob(next);
      setError(null);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const update = () => setMenuTop(Math.round(header.getBoundingClientRect().height));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [loading]);

  useEffect(() => {
    function closeMenu() {
      if (zipMenuRef.current?.open) zipMenuRef.current.open = false;
    }
    function onPointerDown(event: PointerEvent) {
      const menu = zipMenuRef.current;
      if (!menu?.open) return;
      if (event.target instanceof Node && menu.contains(event.target)) return;
      menu.open = false;
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeMenu();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const currentVersion = useMemo(() => {
    if (!job) return null;
    return (
      job.versions.find((version) => version.number === job.currentVersion) ??
      job.versions[job.versions.length - 1] ??
      null
    );
  }, [job]);

  const files = currentVersion?.files ?? [];
  const activeFileContent = files.find((file) => file.path === activeFile) ?? files[0];

  useEffect(() => {
    setActiveFile(files[0]?.path ?? "index.html");
  }, [currentVersion?.number, files]);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [job?.messages.length]);

  async function send(text?: string) {
    if (!job || sending) return;
    const content = (text ?? draft).trim();
    if (!content) return;
    setSending(true);
    setError(null);
    setDraft("");
    try {
      const updated = await studio.iterate(job.id, content);
      setJob(updated);
      setNonce((value) => value + 1);
    } catch (caught) {
      setError(errorMessage(caught));
      setDraft(content);
    } finally {
      setSending(false);
    }
  }

  async function publish() {
    if (!job || publishing) return;
    setPublishing(true);
    setError(null);
    try {
      const updated = await studio.publish(job.id);
      setJob(updated);
      setPublishOpen(true);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setPublishing(false);
    }
  }

  async function restore(version: number) {
    if (!job || version === job.currentVersion) return;
    if (!window.confirm(`Restore version ${version}? The preview and future edits will start from it.`)) {
      return;
    }
    try {
      const updated = await studio.rollback(job.id, version);
      setJob(updated);
      setNonce((value) => value + 1);
    } catch (caught) {
      setError(errorMessage(caught));
    }
  }

  async function removeJob() {
    if (!job) return;
    if (!window.confirm(`Delete “${job.name}”? This cannot be undone.`)) return;
    try {
      await studio.remove(job.id);
      router.push("/");
    } catch (caught) {
      setError(errorMessage(caught));
    }
  }

  async function copyUrl() {
    if (!job?.publish) return;
    const url = `${origin}/p/${job.publish.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Copy failed — select the URL and copy it manually.");
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-zinc-500">
        <span className="inline-flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading build…
        </span>
      </div>
    );
  }

  if (!job || !currentVersion) {
    return (
      <div className="grid min-h-screen place-items-center px-6 text-center">
        <div>
          <p className="text-sm font-semibold text-zinc-200">{error ?? "This build does not exist."}</p>
          <Link href="/" className="mt-4 inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300">
            <ArrowLeft className="h-4 w-4" />
            Back to workspace
          </Link>
        </div>
      </div>
    );
  }

  const publishUrl = job.publish ? `${origin}/p/${job.publish.slug}` : "";
  const publishOutdated = Boolean(job.publish && job.publish.version !== job.currentVersion);
  const previewSrc = `/api/jobs/${job.id}/preview/index.html?v=${job.currentVersion}&r=${nonce}`;

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#06060a]">
      <header ref={headerRef} className="flex shrink-0 items-center gap-3 border-b border-zinc-800 bg-[#08080f] px-3 py-2.5 sm:px-4">
        <Link
          href="/"
          className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
          aria-label="Back to workspace"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-sm font-semibold text-zinc-100">{job.name}</h1>
            {job.publish ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-900/70 bg-emerald-950/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
                <Globe className="h-3 w-3" />
                live
              </span>
            ) : null}
          </div>
          <p className="truncate text-[11px] text-zinc-500">
            {job.versions.length} version{job.versions.length === 1 ? "" : "s"} · free, no limits
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <label className="relative hidden sm:block">
            <select
              value={job.currentVersion}
              onChange={(event) => void restore(Number(event.target.value))}
              className="appearance-none rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-3 pr-8 text-xs text-zinc-300 outline-none hover:border-zinc-700"
              aria-label="Version history"
            >
              {job.versions.map((version) => (
                <option key={version.number} value={version.number}>
                  v{version.number} · {version.summary.slice(0, 42)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
          </label>

          <details
            ref={zipMenuRef}
            className="relative"
            style={{ "--zip-menu-top": `${menuTop}px` } as CSSProperties}
          >
            <summary
              aria-label="Download app as ZIP"
              title="Download index.html, styles.css, app.js, schema.json and README as ZIP"
              className="flex cursor-pointer list-none items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-2 text-xs font-semibold text-zinc-300 transition hover:border-zinc-700 hover:text-white [&::-webkit-details-marker]:hidden"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">ZIP</span>
              <ChevronDown className="h-3 w-3 text-zinc-500" />
            </summary>
            <button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              onClick={() => {
                if (zipMenuRef.current) zipMenuRef.current.open = false;
              }}
              className="fixed inset-x-0 bottom-0 top-[var(--zip-menu-top)] z-30 cursor-default"
            />
            <div className="fixed inset-x-3 top-[var(--zip-menu-top)] z-40 max-h-[60vh] overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950 p-1 shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-1 sm:max-h-none sm:w-64">
              <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                Download version
              </p>
              {[...job.versions].reverse().map((version) => (
                <a
                  key={version.number}
                  href={`/api/jobs/${job.id}/export?version=${version.number}`}
                  download
                  onClick={(event) => {
                    const details = event.currentTarget.closest("details") as HTMLDetailsElement | null;
                    if (details) details.open = false;
                  }}
                  className="flex items-start gap-2 rounded-lg px-2 py-1.5 transition hover:bg-zinc-900"
                >
                  <Download className="mt-0.5 h-3 w-3 shrink-0 text-zinc-500" />
                  <span className="min-w-0">
                    <span className="block text-[11px] font-semibold text-zinc-200">
                      v{version.number}
                      {version.number === job.currentVersion ? (
                        <span className="ml-1 text-emerald-400">· current</span>
                      ) : null}
                    </span>
                    <span className="block truncate text-[10px] text-zinc-500">{version.summary}</span>
                  </span>
                </a>
              ))}
            </div>
          </details>

          <button
            type="button"
            onClick={removeJob}
            className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-900 hover:text-red-400"
            aria-label="Delete build"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={publish}
            disabled={publishing}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
          >
            {publishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Rocket className="h-3.5 w-3.5" />}
            {job.publish ? "Re-publish" : "Publish"}
          </button>
        </div>
      </header>

      <div className="flex items-center gap-2 border-b border-zinc-800 bg-[#08080f] px-3 py-1.5 lg:hidden">
        <div className="flex rounded-lg border border-zinc-800 bg-zinc-900/70 p-0.5">
          <button
            type="button"
            onClick={() => setMobileView("app")}
            className={`rounded-md px-3 py-1 text-[11px] font-semibold transition ${
              mobileView === "app" ? "bg-zinc-800 text-white" : "text-zinc-400"
            }`}
          >
            App
          </button>
          <button
            type="button"
            onClick={() => setMobileView("chat")}
            className={`rounded-md px-3 py-1 text-[11px] font-semibold transition ${
              mobileView === "chat" ? "bg-zinc-800 text-white" : "text-zinc-400"
            }`}
          >
            Chat
          </button>
        </div>
        <span className="truncate text-[11px] text-zinc-500">
          {mobileView === "app" ? `${device === "phone" ? "Phone" : "Full"} preview · v${job.currentVersion}` : "Describe a change to rebuild"}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside
          className={`${mobileView === "chat" ? "flex" : "hidden"} h-full min-h-0 w-full shrink-0 flex-col border-b border-zinc-800 bg-[#08080f] lg:flex lg:h-auto lg:w-[380px] lg:border-b-0 lg:border-r`}
        >
          <div className="flex items-center gap-2 border-b border-zinc-800/80 px-4 py-2.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Studio chat</span>
            <span className="ml-auto rounded-full border border-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500">
              v{job.currentVersion}
            </span>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-4">
            {job.messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === "user"
                    ? "ml-4 rounded-2xl rounded-br-md border border-indigo-900/50 bg-indigo-950/40 px-3.5 py-2.5"
                    : "mr-2 rounded-2xl rounded-bl-md border border-zinc-800 bg-zinc-900/60 px-3.5 py-2.5"
                }
              >
                <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                  {message.role === "user" ? "You" : "Studio"}
                  {message.version ? <span className="text-zinc-600">v{message.version}</span> : null}
                </div>
                <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-zinc-200">{message.content}</p>
                {message.events && message.events.length > 0 ? <EventList events={message.events} /> : null}
              </div>
            ))}
            <div ref={chatEnd} />
          </div>

          <div className="border-t border-zinc-800 p-3">
            <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {QUICK_EDITS.map((edit) => (
                <button
                  key={edit}
                  type="button"
                  onClick={() => void send(edit)}
                  disabled={sending}
                  className="shrink-0 rounded-full border border-zinc-800 bg-zinc-900/70 px-2.5 py-1 text-[11px] text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-200 disabled:opacity-50"
                >
                  {edit}
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-2 focus-within:border-indigo-600">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void send();
                  }
                }}
                rows={2}
                placeholder="Describe a change…"
                className="w-full resize-none bg-transparent px-1 text-[13px] text-zinc-100 placeholder-zinc-500 outline-none"
              />
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] text-zinc-600">Enter to send · unlimited edits</span>
                <button
                  type="button"
                  onClick={() => void send()}
                  disabled={sending || draft.trim().length === 0}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
                >
                  {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  Send
                </button>
              </div>
            </div>
          </div>
        </aside>

        <section
          className={`${mobileView === "app" ? "flex" : "hidden"} min-h-0 flex-1 flex-col lg:flex`}
        >
          <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-zinc-800 bg-[#08080f] px-2 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                aria-label={item.label}
                title={item.label}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                  tab === item.id ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <item.icon className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}

            <div className="ml-auto flex shrink-0 items-center gap-1">
              {tab === "preview" ? (
                <>
                  <button
                    type="button"
                    onClick={() => setDevice("desktop")}
                    className={`rounded-lg p-1.5 ${device === "desktop" ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                    aria-label="Desktop preview"
                  >
                    <Monitor className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDevice("phone")}
                    className={`rounded-lg p-1.5 ${device === "phone" ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                    aria-label="Phone preview"
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setNonce((value) => value + 1)}
                    className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-300"
                    aria-label="Reload preview"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                  <a
                    href={previewSrc}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-300"
                    aria-label="Open preview in a new tab"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </>
              ) : null}
            </div>
          </div>

          {publishOutdated ? (
            <div className="flex items-center gap-2 border-b border-amber-900/40 bg-amber-950/20 px-4 py-2 text-[11px] text-amber-300">
              <Globe className="h-3.5 w-3.5" />
              Version {job.publish?.version} is live. Re-publish to push version {job.currentVersion}.
            </div>
          ) : null}

          {tab === "preview" ? (
            <div className="min-h-0 flex-1 overflow-auto bg-zinc-950 p-3">
              <div
                className={
                  device === "phone"
                    ? "mx-auto h-full w-[390px] max-w-full overflow-hidden rounded-[30px] border-[8px] border-zinc-800 bg-white shadow-2xl"
                    : "h-full w-full overflow-hidden rounded-xl border border-zinc-800 bg-white"
                }
              >
                <iframe
                  key={`${job.currentVersion}-${nonce}-${device}`}
                  src={previewSrc}
                  title="App preview"
                  className="h-full w-full bg-white"
                  sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin allow-downloads"
                />
              </div>
            </div>
          ) : null}

          {tab === "code" ? (
            <div className="flex min-h-0 flex-1">
              <div className="w-32 shrink-0 overflow-y-auto border-r border-zinc-800 p-2 sm:w-44">
                {files.map((file) => (
                  <button
                    key={file.path}
                    type="button"
                    onClick={() => setActiveFile(file.path)}
                    className={`mb-0.5 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[11px] font-mono transition ${
                      activeFileContent?.path === file.path
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-300"
                    }`}
                  >
                    <Code2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{file.path}</span>
                  </button>
                ))}
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-1.5">
                  <span className="truncate font-mono text-[11px] text-zinc-500">
                    {activeFileContent ? `${activeFileContent.path} · ${activeFileContent.bytes} bytes` : "No files"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (!activeFileContent) return;
                      void navigator.clipboard.writeText(activeFileContent.content).then(() => {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      });
                    }}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-zinc-500 hover:text-zinc-200"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    Copy
                  </button>
                </div>
                <pre className="min-h-0 flex-1 overflow-auto bg-[#0b0b12] p-4 text-[11px] leading-relaxed text-zinc-300">
                  <code>{activeFileContent?.content ?? ""}</code>
                </pre>
              </div>
            </div>
          ) : null}

          {tab === "blueprint" ? (
            <div className="min-h-0 flex-1 overflow-y-auto bg-[#07070d] p-4">
              <div className="mx-auto max-w-3xl space-y-4">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-zinc-100">{currentVersion.blueprint.title}</h2>
                      <p className="mt-1 text-xs text-zinc-500">{currentVersion.blueprint.description}</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[11px] text-zinc-300">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: currentVersion.blueprint.theme.accent }}
                      />
                      {currentVersion.blueprint.theme.accentName} · {currentVersion.blueprint.theme.mode}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {Object.entries(currentVersion.blueprint.features)
                      .filter(([, enabled]) => enabled)
                      .map(([feature]) => (
                        <span
                          key={feature}
                          className="rounded-full border border-zinc-800 bg-zinc-900/70 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-400"
                        >
                          {feature === "exportCsv" ? "csv export" : feature}
                        </span>
                      ))}
                  </div>
                </div>

                {currentVersion.blueprint.fields.length > 0 ? (
                  <div className="overflow-x-auto rounded-2xl border border-zinc-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-900/70 text-[10px] uppercase tracking-wide text-zinc-500">
                        <tr>
                          <th className="px-4 py-2 font-semibold">Field</th>
                          <th className="px-4 py-2 font-semibold">Type</th>
                          <th className="px-4 py-2 font-semibold">Options</th>
                          <th className="px-4 py-2 font-semibold">Required</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/80 bg-zinc-950/50">
                        {currentVersion.blueprint.fields.map((field) => (
                          <tr key={field.key}>
                            <td className="px-4 py-2 text-zinc-200">
                              {field.label}
                              {field.unit ? <span className="ml-1 text-zinc-500">({field.unit.trim()})</span> : null}
                            </td>
                            <td className="px-4 py-2 font-mono text-[11px] text-zinc-400">{field.type}</td>
                            <td className="px-4 py-2 text-zinc-500">{field.options?.join(", ") ?? "—"}</td>
                            <td className="px-4 py-2 text-zinc-500">{field.required ? "yes" : "no"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Routes</h3>
                  <ul className="mt-2 space-y-1.5 text-xs text-zinc-400">
                    {currentVersion.blueprint.pages.map((page) => (
                      <li key={page.route}>
                        <span className="font-mono text-zinc-300">{page.route}</span> — {page.description}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Files</h3>
                  <ul className="mt-2 grid gap-1 text-xs text-zinc-400 sm:grid-cols-2">
                    {files.map((file) => (
                      <li key={file.path} className="font-mono">
                        {file.path} <span className="text-zinc-600">· {file.bytes} B</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}

          {tab === "logs" ? (
            <div className="min-h-0 flex-1 overflow-y-auto bg-[#07070d] p-4">
              <div className="mx-auto max-w-3xl space-y-4">
                {[...job.versions].reverse().map((version) => (
                  <div key={version.number} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-zinc-200">
                        v{version.number} · {version.summary}
                      </p>
                      <span className="text-[10px] text-zinc-600">
                        {new Date(version.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <ul className="mt-3 space-y-2">
                      {version.events.map((event, index) => (
                        <li key={index} className="flex gap-3 text-[11px] leading-relaxed">
                          <span
                            className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                              event.level === "success" ? "bg-emerald-400" : "bg-indigo-400"
                            }`}
                          />
                          <span className="text-zinc-400">
                            <span className="font-semibold text-zinc-300">{event.agent}</span> {event.message}
                            <span className="ml-1 text-zinc-600">({event.durationMs}ms)</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </div>

      {error ? (
        <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-red-900/60 bg-red-950/90 px-4 py-2.5 text-xs text-red-200 shadow-xl">
          {error}
          <button type="button" onClick={() => setError(null)} aria-label="Dismiss error">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}

      {publishOpen && job.publish ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-zinc-100">Version {job.publish.version} is live</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  This URL serves the published files. Re-publish after changes to push them live.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPublishOpen(false)}
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/70 p-2">
              <input
                readOnly
                value={publishUrl}
                onFocus={(event) => event.currentTarget.select()}
                className="min-w-0 flex-1 bg-transparent px-1 text-xs text-zinc-300 outline-none"
              />
              <button
                type="button"
                onClick={() => void copyUrl()}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 px-2 py-1 text-[11px] text-zinc-300 hover:bg-zinc-800"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <a
                href={publishUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open app
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
