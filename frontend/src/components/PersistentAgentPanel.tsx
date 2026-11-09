"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Send,
  Copy,
  Check,
  Radio,
  Clock,
  Sparkles,
  ShieldCheck,
  Wrench,
  Key,
  Loader2,
  Smartphone
} from "lucide-react";
import { isNative } from "@/lib/capacitor";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  toolCall?: string;
  timestamp: string;
}

export default function PersistentAgentPanel() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [uptimeSeconds, setUptimeSeconds] = useState<number>(142850);
  const [channel, setChannel] = useState<"telegram" | "whatsapp">("telegram");
  const [copied, setCopied] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [nativeActive, setNativeActive] = useState<boolean>(false);

  useEffect(() => {
    setNativeActive(isNative());
  }, []);

  const [systemPrompt, setSystemPrompt] = useState<string>(
    "You are ALWAYS-ON assistant on Telegram/WhatsApp. Work 24/7 even when owner closes browser. Answer short, in Polish. Use tools for bookings. Never say you are AI model."
  );
  const [tokenInput, setTokenInput] = useState<string>("");

  const [tools, setTools] = useState({
    check_availability: true,
    create_booking: true,
    get_bookings: true,
  });

  const [inputMsg, setInputMsg] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init-1",
      sender: "agent",
      text: "Cześć! Jestem Twoim asystentem działającym 24/7 na Telegramie i WhatsAppie. Połączony bezpośrednio z bazą MongoDB oraz modelem OpenAI.",
      timestamp: "10:00",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOnline) return;
    const interval = setInterval(() => {
      setUptimeSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOnline]);

  useEffect(() => {
    // Only scroll internally inside the chat simulator container, prevent jumping the main page scroll
    if (messages.length > 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages, isTyping]);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hrs = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${days}d ${hrs}h ${mins}m ${secs}s`;
  };

  const [originUrl, setOriginUrl] = useState<string>("https://giftgen.emergent.sh");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOriginUrl(window.location.origin);
    }
  }, []);

  const getWebhookUrl = () => {
    return `${originUrl}/api/agent/webhook/${channel}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getWebhookUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleTool = (toolName: keyof typeof tools) => {
    setTools((prev) => ({ ...prev, [toolName]: !prev[toolName] }));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || isTyping) return;

    const userText = inputMsg.trim();
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: nowTime,
    };

    // Push user message and clear input
    setMessages((prev) => [...prev, newMsg]);
    setInputMsg("");
    setIsTyping(true);

    try {
      // Build history of last 6 messages
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      }));

      const res = await fetch(`${API_URL}/api/agent/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userText,
          channel: channel,
          chat_id: "app-user-paulina",
          history: historyPayload,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const agentMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: "agent",
        text: data.reply || "Brak odpowiedzi od asystenta.",
        toolCall: Array.isArray(data.tool_calls) && data.tool_calls.length > 0 ? data.tool_calls[0] : undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      if (isNative()) {
        console.log('[Native] Agent reply notification:', data.reply);
      }

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "agent",
        text: `Backend nie odpowiada. Sprawdź czy Railway działa i czy NEXT_PUBLIC_API_URL jest ustawione. Błąd: ${err.message || err}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="w-full max-w-full box-border overflow-x-hidden border border-zinc-800 rounded-2xl bg-zinc-950 p-4 sm:p-6 my-6 shadow-2xl relative">
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-800 gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-3.5 h-3.5 rounded-full ${isOnline ? "bg-emerald-500 animate-ping opacity-75" : "bg-zinc-600"} absolute inset-0`} />
            <div className={`w-3.5 h-3.5 rounded-full ${isOnline ? "bg-emerald-500" : "bg-zinc-600"} relative`} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                PERSISTENT AGENT — ALWAYS ON
              </span>
              {nativeActive && (
                <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950/70 border border-sky-800/80 px-2 py-0.5 rounded flex items-center gap-1">
                  <Smartphone className="w-3 h-3" />
                  NATIVE ANDROID - Push ON
                </span>
              )}
              <span className="text-xs text-zinc-500 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3 text-zinc-400" />
                Uptime: {formatUptime(uptimeSeconds)}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-1 flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-400 shrink-0" />
              1 Agent Always-On — nie w przeglądarce (Telegram / WhatsApp 24/7)
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className="text-xs text-zinc-400 font-medium">Status usera:</span>
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
              isOnline
                ? "bg-emerald-900/40 border-emerald-600 text-emerald-300"
                : "bg-zinc-900 border-zinc-700 text-zinc-400"
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isOnline ? "text-emerald-400" : "text-zinc-500"}`} />
            {isOnline ? "ONLINE 24/7" : "PAUSED"}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Config */}
        <div className="lg:col-span-7 space-y-5 min-w-0">
          <div>
            <label className="text-xs font-medium text-zinc-400 mb-2 block flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-zinc-400" />
              Wybierz kanał Always-On:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setChannel("telegram")}
                className={`py-2.5 px-4 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-2 ${
                  channel === "telegram"
                    ? "bg-sky-950/60 border-sky-500 text-sky-200"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span>✈️ Telegram Bot</span>
                {channel === "telegram" && <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />}
              </button>

              <button
                type="button"
                onClick={() => setChannel("whatsapp")}
                className={`py-2.5 px-4 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-2 ${
                  channel === "whatsapp"
                    ? "bg-emerald-950/60 border-emerald-500 text-emerald-200"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span>💬 WhatsApp Cloud API</span>
                {channel === "whatsapp" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Dedykowany Webhook Endpoint (Railway / Cloud):
              </label>
              <button
                onClick={handleCopy}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Skopiowano!" : "Kopiuj URL"}
              </button>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-300 break-all flex items-center justify-between">
              <span>{getWebhookUrl()}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              {channel === "telegram" ? "Telegram Bot Token (z @BotFather)" : "Meta WhatsApp Access Token"}:
            </label>
            <input
              type="password"
              placeholder={channel === "telegram" ? "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" : "EAAX...BearerToken"}
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition font-mono"
            />
            <p className="text-[11px] text-zinc-500 mt-1">
              Token jest wstrzykiwany bezpiecznie przez zmienne środowiskowe <code className="text-zinc-400">TELEGRAM_BOT_TOKEN</code> lub <code className="text-zinc-400">WHATSAPP_TOKEN</code>.
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              System Prompt (Instrukcja dla modelu gpt-4o-mini):
            </label>
            <textarea
              rows={3}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400 mb-2 block flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-emerald-400" />
              Narzędzia Bazy Danych (MongoDB `bookings` Tools):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div
                onClick={() => toggleTool("check_availability")}
                className={`cursor-pointer p-3 rounded-xl border transition flex items-center justify-between ${
                  tools.check_availability
                    ? "bg-zinc-900/90 border-emerald-800/80 text-white"
                    : "bg-zinc-900/40 border-zinc-800/60 text-zinc-500"
                }`}
              >
                <div>
                  <div className="text-xs font-mono font-semibold">check_availability</div>
                  <div className="text-[10px] text-zinc-400">Weryfikacja terminów</div>
                </div>
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${
                    tools.check_availability ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {tools.check_availability ? "✓" : ""}
                </div>
              </div>

              <div
                onClick={() => toggleTool("create_booking")}
                className={`cursor-pointer p-3 rounded-xl border transition flex items-center justify-between ${
                  tools.create_booking
                    ? "bg-zinc-900/90 border-emerald-800/80 text-white"
                    : "bg-zinc-900/40 border-zinc-800/60 text-zinc-500"
                }`}
              >
                <div>
                  <div className="text-xs font-mono font-semibold">create_booking</div>
                  <div className="text-[10px] text-zinc-400">Zapis do MongoDB</div>
                </div>
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${
                    tools.create_booking ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {tools.create_booking ? "✓" : ""}
                </div>
              </div>

              <div
                onClick={() => toggleTool("get_bookings")}
                className={`cursor-pointer p-3 rounded-xl border transition flex items-center justify-between ${
                  tools.get_bookings
                    ? "bg-zinc-900/90 border-emerald-800/80 text-white"
                    : "bg-zinc-900/40 border-zinc-800/60 text-zinc-500"
                }`}
              >
                <div>
                  <div className="text-xs font-mono font-semibold">get_bookings</div>
                  <div className="text-[10px] text-zinc-400">Lista rezerwacji</div>
                </div>
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${
                    tools.get_bookings ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {tools.get_bookings ? "✓" : ""}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Chat Simulator */}
        <div className="lg:col-span-5 flex flex-col bg-zinc-900/70 border border-zinc-800/80 rounded-xl overflow-hidden h-[440px] min-w-0">
          <div className="px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-zinc-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live {channel === "telegram" ? "Telegram" : "WhatsApp"} Chat
            </span>
            <span className="text-[10px] text-zinc-500 uppercase font-mono">Real Backend API</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                {m.toolCall && (
                  <span className="text-[10px] font-mono bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-md mb-1 flex items-center gap-1">
                    <Wrench className="w-2.5 h-2.5" />
                    Called {m.toolCall}
                  </span>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                    m.sender === "user"
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-zinc-800/90 text-zinc-200 border border-zinc-700/50 rounded-bl-none whitespace-pre-line"
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[9px] text-zinc-500 mt-1 px-1">{m.timestamp}</span>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 text-zinc-500 text-xs py-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>Asystent przetwarza zapytanie...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-3 py-1.5 bg-zinc-900/90 border-t border-zinc-800 flex gap-1.5 overflow-x-auto text-[11px]">
            <button
              type="button"
              onClick={() => setInputMsg("Czy jutro 15:00 wolne?")}
              className="whitespace-nowrap px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition text-[10px]"
            >
              🗓️ "Czy jutro wolne?"
            </button>
            <button
              type="button"
              onClick={() => setInputMsg("Zapisz mnie, Paulina, na jutro 15:00")}
              className="whitespace-nowrap px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition text-[10px]"
            >
              ✍️ "Zapisz Paulina"
            </button>
            <button
              type="button"
              onClick={() => setInputMsg("Pokaż aktualne rezerwacje")}
              className="whitespace-nowrap px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition text-[10px]"
            >
              📋 "Pokaż rezerwacje"
            </button>
          </div>

          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-zinc-900 border-t border-zinc-800 flex gap-2"
          >
            <input
              type="text"
              placeholder="Napisz do asystenta 24/7..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              disabled={isTyping}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim() || isTyping}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition disabled:opacity-50 flex items-center gap-1"
            >
              {isTyping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
