"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Cpu, Check, KeyRound, Loader2, X } from "lucide-react";
import {
  FALLBACK_PROVIDERS,
  getLlmProvider,
  getLlmStatus,
  getStoredLlmKey,
  getStoredLlmModel,
  setStoredLlmKey,
  setStoredLlmModel,
  setStoredLlmProvider,
  type LlmProviderId,
  type LlmProviderInfo,
} from "@/lib/api";

/**
 * "AI Engine" control: pick a provider (Groq / Gemini / Cerebras), paste a key,
 * choose a model, test it.
 *
 * Keys live in this browser's localStorage only and are forwarded to the
 * same-origin /api/llm/ route per request. They never enter the bundle, the repo
 * or any log.
 */
export default function LlmSettings() {
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState<LlmProviderId>("groq");
  const [providers, setProviders] = useState<LlmProviderInfo[]>(FALLBACK_PROVIDERS);
  const [keyInput, setKeyInput] = useState("");
  const [model, setModel] = useState("");
  const [configuredAny, setConfiguredAny] = useState(false);
  const [busy, setBusy] = useState<"save" | "test" | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "err" | "hint"; text: string } | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const active = getLlmProvider();
    setProvider(active);
    setKeyInput(getStoredLlmKey(active));
    setModel(getStoredLlmModel(active));
    getLlmStatus().then((status) => {
      setProviders(status.providers?.length ? status.providers : FALLBACK_PROVIDERS);
      setConfiguredAny(status.providers.some((p) => p.configured));
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const active = useMemo(
    () => providers.find((p) => p.id === provider) || FALLBACK_PROVIDERS[0],
    [providers, provider]
  );

  const pickProvider = (id: LlmProviderId) => {
    setProvider(id);
    setStoredLlmProvider(id);
    setKeyInput(getStoredLlmKey(id));
    setModel(getStoredLlmModel(id));
    setMessage(null);
  };

  const save = () => {
    setStoredLlmKey(keyInput, provider);
    setStoredLlmModel(model || active.defaultModel, provider);
    const has = keyInput.trim().length > 0;
    setConfiguredAny(has || providers.some((p) => p.configured));
    setMessage({
      tone: "ok",
      text: has ? `Klucz ${active.label} zapisany w tej przeglądarce.` : "Klucz usunięty — wracam do szablonów.",
    });
  };

  const test = async () => {
    setBusy("test");
    setMessage(null);
    try {
      const res = await fetch("/api/llm/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "blueprint",
          provider,
          prompt: "Prosta aplikacja todo dla jednej osoby",
          api_key: keyInput.trim(),
          model: model || active.defaultModel,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        setMessage({ tone: "ok", text: `Działa. ${active.label} · ${data.model || model}` });
        setConfiguredAny(true);
      } else {
        setMessage({ tone: "err", text: data?.error || `Błąd HTTP ${res.status}` });
      }
    } catch (err: any) {
      setMessage({ tone: "err", text: err?.message || "Brak połączenia z /api/llm/" });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="relative" ref={boxRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-lg text-xs transition ${
          configuredAny
            ? "bg-emerald-950/60 border-emerald-800 text-emerald-300 hover:bg-emerald-950"
            : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
        }`}
        title="AI Engine"
      >
        <Cpu className="w-3.5 h-3.5" />
        <span className="font-medium">AI: {configuredAny ? active.label : "off"}</span>
        <span className={`w-1.5 h-1.5 rounded-full ${configuredAny ? "bg-emerald-400" : "bg-zinc-600"}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[340px] z-50 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-3.5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-white">AI Engine</p>
              <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">
                Klucz zostaje w tej przeglądarce i idzie tylko do proxy na Vercelu.
              </p>
            </div>
            <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white transition">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {providers.map((p) => (
              <button
                key={p.id}
                onClick={() => pickProvider(p.id)}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border transition ${
                  provider === p.id
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                {p.label}
                {p.configured && <span className="ml-1 text-emerald-300">•</span>}
              </button>
            ))}
          </div>

          <p className="text-[10px] text-zinc-500 leading-relaxed">{active.freeTier}</p>

          <div>
            <label className="text-[11px] text-zinc-400 mb-1 flex items-center gap-1.5">
              <KeyRound className="w-3 h-3 text-indigo-400" />
              Klucz API {active.label}
            </label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="wklej klucz"
              autoComplete="off"
              spellCheck={false}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition"
            />
            <a
              href={active.consoleUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-indigo-400 hover:text-indigo-300 mt-1 inline-block"
            >
              {active.consoleUrl.replace("https://", "")} → pobierz klucz
            </a>
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 mb-1 block">Model</label>
            <input
              list={`models-${provider}`}
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={active.defaultModel}
              spellCheck={false}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition"
            />
            <datalist id={`models-${provider}`}>
              {active.models.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={save}
              className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
            >
              {busy === "save" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Zapisz
            </button>
            <button
              onClick={test}
              disabled={busy === "test" || !keyInput.trim()}
              className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 disabled:opacity-50 text-zinc-200 rounded-lg text-xs font-medium transition"
            >
              {busy === "test" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Cpu className="w-3.5 h-3.5" />}
              Testuj
            </button>
          </div>

          {message && (
            <p
              className={`text-[11px] leading-relaxed ${
                message.tone === "ok" ? "text-emerald-400" : message.tone === "err" ? "text-rose-400" : "text-zinc-400"
              }`}
            >
              {message.text}
            </p>
          )}

          <p className="text-[10px] text-zinc-600 leading-relaxed">
            Bez klucza builder działa dalej, tylko generuje z wbudowanych szablonów.
          </p>
        </div>
      )}
    </div>
  );
}
