"use client";

import { useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { errorMessage, studio } from "@/lib/studio/client";

interface Message {
  role: "agent" | "user";
  text: string;
}

const SUGGESTIONS = ["What does it do?", "How much is it?", "Show me the demo", "How do I buy?"];

export default function SalesAgentChat({
  slug,
  agentName,
  greeting,
}: {
  slug: string;
  agentName: string;
  greeting: string;
}) {
  const [messages, setMessages] = useState<Message[]>([{ role: "agent", text: greeting }]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  async function ask(text: string) {
    const question = text.trim();
    if (!question || sending) return;
    setDraft("");
    setMessages((current) => [...current, { role: "user", text: question }]);
    setSending(true);
    try {
      const answer = await studio.askOffer(slug, question);
      setMessages((current) => [...current, { role: "agent", text: answer.reply }]);
    } catch (caught) {
      setMessages((current) => [...current, { role: "agent", text: errorMessage(caught) }]);
    } finally {
      setSending(false);
      requestAnimationFrame(() => endRef.current?.scrollIntoView({ block: "nearest" }));
    }
  }

  return (
    <section aria-label={`${agentName} — sales agent`} className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-500 text-xs font-bold text-white">
          {agentName.slice(0, 1).toUpperCase()}
        </span>
        <div>
          <p className="text-sm font-semibold text-zinc-100">{agentName}</p>
          <p className="text-[11px] text-zinc-500">Sales agent · answers from this project only</p>
        </div>
      </div>

      <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1" role="log" aria-live="polite">
        {messages.map((message, index) => (
          <p
            key={index}
            className={
              message.role === "user"
                ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-indigo-600 px-3 py-2 text-xs text-white"
                : "max-w-[90%] rounded-2xl rounded-bl-sm bg-zinc-900 px-3 py-2 text-xs leading-relaxed text-zinc-300"
            }
          >
            {message.text}
          </p>
        ))}
        <div ref={endRef} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => void ask(suggestion)}
            disabled={sending}
            className="rounded-full border border-zinc-800 px-2.5 py-1 text-[11px] text-zinc-400 transition hover:border-zinc-700 hover:text-white disabled:opacity-50"
          >
            {suggestion}
          </button>
        ))}
      </div>

      <form
        className="mt-3 flex items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void ask(draft);
        }}
      >
        <label htmlFor="offer-question" className="sr-only">
          Ask the sales agent
        </label>
        <input
          id="offer-question"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={500}
          placeholder="Ask about price, features or buying…"
          className="min-w-0 flex-1 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          aria-label="Send question"
          className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </section>
  );
}
