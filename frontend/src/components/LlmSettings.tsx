"use client";

import { useEffect, useRef, useState } from "react";
import { Cpu, Check, KeyRound, Loader2, X } from "lucide-react";
import {
  DEFAULT_LLM_MODEL,
  LLM_MODELS,
  getLlmStatus,
  getStoredLlmKey,
  getStoredLlmModel,
  setStoredLlmKey,
  setStoredLlmModel,
} from "@/lib/api";

/**
 * Compact "AI Engine" control: paste a Cerebras key, pick a model, verify it.
 *
 * The key is stored in this browser's localStorage only and is forwarded to the
 * same-origin /api/llm route per request. It never enters the bundle, the repo
 * or any log.
 */
export default function LlmSettings() {
  const [open, setOpen] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [model, setModel] = useState(DEFAULT_LLM_MODEL);
  const [models, setModels] = useState<string[]>(LLM_MODELS);
  const [busy, setBusy] = useState<"save" | "test" | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const storedKey = getStoredLlmKey();
    setKeyInput(storedKey);
    setConfigured(storedKey.length > 0);
    setModel(getStoredLlmModel());
    getLlmStatus().then((status) => {
      setModels(status.models?.length ? status.models : LLM_MODELS);
      setConfigured(status.configured);
      if (status.configured && !status.hasLocalKey) {
        setMessage({ tone: "ok", text: "Klucz ustawiony po stronie serwera (env)." });
      }
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

  const save = () => {
    setStoredLlmKey(keyInput);
    setStoredLlmModel(model);
    const has = keyInput.trim().length > 0;
    setConfigured(has);
    setMessage({
      tone: "ok",
      text: has ? "Klucz zapisany w tej przeglądarce." : "Klucz usunięty — wracam do szablonów.",
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
          prompt: "Prosta aplikacja todo dla jednej osoby",
          api_key: keyInput.trim(),
          model,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        setMessage({ tone: "ok", text: `Działa. Model: ${data.model || model}` });
        setConfigured(true);
      } else {
        setMessage({ tone: "err", text: data?.error || `Błąd HTTP ${res.status}` });
      }
    } catch (err: any) {
      setMessage({ tone: "err", text: err?.message || "Brak połączenia z /api/llm" });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="relative" ref={boxRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-lg text-xs transition ${
          configured
            ? "bg-emerald-950/60 border-emerald-800 text-emerald-300 hover:bg-emerald-950"
            : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
        }`}
        title="AI Engine (Cerebras)"
      >
        <Cpu className="w-3.5 h-3.5" />
        <span className="font-medium">AI: Cerebras</span>
        <span className={`w-1.5 h-1.5 rounded-full ${configured ? "bg-emerald-400" : "bg-zinc-600"}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[320px] z-50 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-3.5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-white">AI Engine — Cerebras</p>
              <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">
                Klucz zostaje w tej przeglądarce i idzie tylko do Twojego proxy na Vercelu.
              </p>
            </div>
            <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white transition">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 mb-1 flex items-center gap-1.5">
              <KeyRound className="w-3 h-3 text-indigo-400" />
              Klucz API Cerebras
            </label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="csk-..."
              autoComplete="off"
              spellCheck={false}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition"
            />
            <a
              href="https://cloud.cerebras.ai"
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-indigo-400 hover:text-indigo-300 mt-1 inline-block"
            >
              cloud.cerebras.ai → API Keys
            </a>
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 mb-1 block">Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
            >
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
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
                message.tone === "ok" ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {message.text}
            </p>
          )}

          <p className="text-[10px] text-zinc-600 leading-relaxed">
            Bez klucza builder dalej działa, tylko generuje z wbudowanych szablonów.
          </p>
        </div>
      )}
    </div>
  );
}
