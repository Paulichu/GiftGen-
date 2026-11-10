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
  Loader2,
  Smartphone,
  RefreshCw,
  Building2,
  CalendarCheck
} from "lucide-react";
import { isNative } from "@/lib/capacitor";
import { API_URL, checkHealth, sendToPersistentAgent } from "@/lib/api";

interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  toolCall?: string;
  timestamp: string;
}

export default function PersistentAgentPanel() {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [isCheckingBackend, setIsCheckingBackend] = useState<boolean>(false);
  const [uptimeSeconds, setUptimeSeconds] = useState<number>(142850);
  const [channel, setChannel] = useState<"telegram" | "whatsapp" | "app">("telegram");
  const [copiedWebhook, setCopiedWebhook] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [nativeActive, setNativeActive] = useState<boolean>(false);
  const [bookingsCount, setBookingsCount] = useState<number>(0);

  const [businessName, setBusinessName] = useState<string>("Gentlemen's Cut Barbershop");
  const [systemPrompt, setSystemPrompt] = useState<string>(
    "Jesteś ALWAYS-ON asystentem na Telegram/WhatsApp. Pracujesz 24/7. Odpowiadaj krótko, po polsku. Możesz sprawdzać dostępność i rezerwować. Nigdy nie proś o top-up. FREE FOREVER."
  );

  const [tools, setTools] = useState({
    check_availability: true,
    create_booking: true,
    get_bookings: true,
    cancel_booking: true,
  });

  const [inputMsg, setInputMsg] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init-1",
      sender: "agent",
      text: "Cześć! Jestem Twoim ALWAYS-ON asystentem działającym 24/7 na Telegramie, WhatsAppie i w aplikacji. Obsługuję rezerwacje i sprawdzam dostępność w bazie MongoDB.",
      timestamp: "12:00",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNativeActive(isNative());
    testBackendHealth();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setUptimeSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (messages.length > 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages, isTyping]);

  const testBackendHealth = async () => {
    setIsCheckingBackend(true);
    try {
      const data = await checkHealth();
      if (data && data.status === "ok") {
        setBackendOnline(true);
      } else {
        setBackendOnline(false);
      }
    } catch {
      setBackendOnline(false);
    } finally {
      setIsCheckingBackend(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hrs = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${days}d ${hrs}h ${mins}m ${secs}s`;
  };

  const getWebhookUrl = (ch: "telegram" | "whatsapp") => {
    const base = API_URL.replace(/\/$/, "");
    return `${base}/api/agent/webhook/${ch}`;
  };

  const handleCopyWebhook = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const toggleTool = (toolName: keyof typeof tools) => {
    setTools((prev) => ({ ...prev, [toolName]: !prev[toolName] }));
  };

  const handleSendMessage = async (e?: React.FormEvent, directText?: string) => {
    if (e) e.preventDefault();
    const userText = (directText || inputMsg).trim();
    if (!userText || isTyping) return;

    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: nowTime,
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!directText) setInputMsg("");
    setIsTyping(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      }));

      const res = await sendToPersistentAgent({
        message: userText,
        channel,
        chat_id: "app-user-paulina",
        history: historyPayload,
        business_name: businessName,
        system_prompt: systemPrompt,
      });

      // Increment bookings counter ONLY if tool_calls includes create_booking
      if (res.tool_calls && res.tool_calls.some((t) => t.includes("create_booking"))) {
        setBookingsCount((prev) => prev + 1);
      }

      const agentMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: "agent",
        text: res.reply || "Brak odpowiedzi od asystenta.",
        toolCall: Array.isArray(res.tool_calls) && res.tool_calls.length > 0 ? res.tool_calls[0] : undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "agent",
        text: `⚠️ Backend niedostępny. Sprawdź Railway i NEXT_PUBLIC_API_URL. (${err.message || err})`,
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
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping opacity-75 absolute inset-0" />
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 relative" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                Persistent Agent — ALWAYS ON
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
              <span className="text-xs font-semibold text-emerald-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                ∞ Credits
              </span>
              <span className="text-xs font-semibold text-indigo-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded flex items-center gap-1">
                <CalendarCheck className="w-3 h-3 text-indigo-400" />
                {bookingsCount} Bookings
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-1 flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-400 shrink-0" />
              1 Agent Always-On — nie w przeglądarce (Telegram / WhatsApp 24/7)
            </h3>
          </div>
        </div>

        {/* Backend health & connection status */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-900 border border-zinc-800">
            {backendOnline ? (
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                🟢 Backend online
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1 font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                🔴 Backend offline
              </span>
            )}
            <button
              onClick={testBackendHealth}
              disabled={isCheckingBackend}
              className="p-1 hover:text-white text-zinc-400 transition"
              title="Test connection with GET /health"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingBackend ? "animate-spin text-indigo-400" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Settings */}
        <div className="lg:col-span-7 space-y-4 min-w-0">
          {/* Channel toggle: Telegram / WhatsApp / App */}
          <div>
            <label className="text-xs font-medium text-zinc-400 mb-2 block flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-zinc-400" />
              Wybierz kanał Always-On:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setChannel("telegram")}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 ${
                  channel === "telegram"
                    ? "bg-sky-950/60 border-sky-500 text-sky-200"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span>✈️ Telegram</span>
                {channel === "telegram" && <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />}
              </button>

              <button
                type="button"
                onClick={() => setChannel("whatsapp")}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 ${
                  channel === "whatsapp"
                    ? "bg-emerald-950/60 border-emerald-500 text-emerald-200"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span>💬 WhatsApp</span>
                {channel === "whatsapp" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              </button>

              <button
                type="button"
                onClick={() => setChannel("app")}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 ${
                  channel === "app"
                    ? "bg-indigo-950/60 border-indigo-500 text-indigo-200"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span>📱 App / Web</span>
                {channel === "app" && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
              </button>
            </div>
          </div>

          {/* Business Name */}
          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-zinc-400" />
              Nazwa firmy (business_name):
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="np. Gentlemen's Cut Barbershop"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition font-sans"
            />
          </div>

          {/* Backend URL Display & Test */}
          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Backend URL (process.env.NEXT_PUBLIC_API_URL):
              </span>
              <button
                type="button"
                onClick={testBackendHealth}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-mono transition"
              >
                Test connection
              </button>
            </label>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono text-zinc-300 break-all flex items-center justify-between">
              <span>{API_URL}</span>
              <span className="text-[10px] text-zinc-500">GET /health</span>
            </div>
          </div>

          {/* Webhook info with copy buttons */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Webhooks (Telegram &amp; WhatsApp):
              </span>
              {copiedWebhook && <span className="text-[11px] text-emerald-400">Skopiowano!</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 flex items-center justify-between">
                <span className="truncate text-zinc-300 pr-2">{getWebhookUrl("telegram")}</span>
                <button
                  type="button"
                  onClick={() => handleCopyWebhook(getWebhookUrl("telegram"))}
                  className="p-1 text-zinc-400 hover:text-white transition shrink-0"
                  title="Copy Telegram Webhook URL"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 flex items-center justify-between">
                <span className="truncate text-zinc-300 pr-2">{getWebhookUrl("whatsapp")}</span>
                <button
                  type="button"
                  onClick={() => handleCopyWebhook(getWebhookUrl("whatsapp"))}
                  className="p-1 text-zinc-400 hover:text-white transition shrink-0"
                  title="Copy WhatsApp Webhook URL"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* System Prompt */}
          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              System Prompt (Instrukcja dla modelu gpt-4o-mini):
            </label>
            <textarea
              rows={2}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition resize-none leading-relaxed"
            />
          </div>

          {/* Tools toggles */}
          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-emerald-400" />
              Narzędzia Bazy Danych (MongoDB `bookings` Tools):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div
                onClick={() => toggleTool("check_availability")}
                className={`cursor-pointer p-2.5 rounded-xl border transition flex items-center justify-between ${
                  tools.check_availability
                    ? "bg-zinc-900 border-emerald-800/80 text-white"
                    : "bg-zinc-900/40 border-zinc-800/60 text-zinc-500"
                }`}
              >
                <div className="text-[11px] font-mono">check_availability</div>
                <div className={`w-3.5 h-3.5 rounded text-[10px] font-bold flex items-center justify-center ${tools.check_availability ? "bg-emerald-500 text-black" : "bg-zinc-800"}`}>
                  {tools.check_availability ? "✓" : ""}
                </div>
              </div>

              <div
                onClick={() => toggleTool("create_booking")}
                className={`cursor-pointer p-2.5 rounded-xl border transition flex items-center justify-between ${
                  tools.create_booking
                    ? "bg-zinc-900 border-emerald-800/80 text-white"
                    : "bg-zinc-900/40 border-zinc-800/60 text-zinc-500"
                }`}
              >
                <div className="text-[11px] font-mono">create_booking</div>
                <div className={`w-3.5 h-3.5 rounded text-[10px] font-bold flex items-center justify-center ${tools.create_booking ? "bg-emerald-500 text-black" : "bg-zinc-800"}`}>
                  {tools.create_booking ? "✓" : ""}
                </div>
              </div>

              <div
                onClick={() => toggleTool("get_bookings")}
                className={`cursor-pointer p-2.5 rounded-xl border transition flex items-center justify-between ${
                  tools.get_bookings
                    ? "bg-zinc-900 border-emerald-800/80 text-white"
                    : "bg-zinc-900/40 border-zinc-800/60 text-zinc-500"
                }`}
              >
                <div className="text-[11px] font-mono">get_bookings</div>
                <div className={`w-3.5 h-3.5 rounded text-[10px] font-bold flex items-center justify-center ${tools.get_bookings ? "bg-emerald-500 text-black" : "bg-zinc-800"}`}>
                  {tools.get_bookings ? "✓" : ""}
                </div>
              </div>

              <div
                onClick={() => toggleTool("cancel_booking")}
                className={`cursor-pointer p-2.5 rounded-xl border transition flex items-center justify-between ${
                  tools.cancel_booking
                    ? "bg-zinc-900 border-emerald-800/80 text-white"
                    : "bg-zinc-900/40 border-zinc-800/60 text-zinc-500"
                }`}
              >
                <div className="text-[11px] font-mono">cancel_booking</div>
                <div className={`w-3.5 h-3.5 rounded text-[10px] font-bold flex items-center justify-center ${tools.cancel_booking ? "bg-emerald-500 text-black" : "bg-zinc-800"}`}>
                  {tools.cancel_booking ? "✓" : ""}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Real API Chat */}
        <div className="lg:col-span-5 flex flex-col bg-zinc-900/70 border border-zinc-800/80 rounded-xl overflow-hidden h-[450px] min-w-0">
          <div className="px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-zinc-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Persistent Chat ({channel.toUpperCase()})
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">Real Backend API</span>
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
                    ⚙️ Called {m.toolCall}
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
                <span>Asystent przetwarza zapytanie w backendzie...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick chips */}
          <div className="px-3 py-1.5 bg-zinc-900/90 border-t border-zinc-800 flex gap-1.5 overflow-x-auto text-[11px]">
            <button
              type="button"
              onClick={() => handleSendMessage(undefined, "Czy jutro 15:00 wolne?")}
              className="whitespace-nowrap px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition text-[10px]"
            >
              🗓️ "Czy jutro 15:00 wolne?"
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage(undefined, "Zapisz mnie na jutro 15:00, Paulina")}
              className="whitespace-nowrap px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition text-[10px]"
            >
              ✍️ "Zapisz mnie na jutro 15:00, Paulina"
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage(undefined, "Pokaż moje rezerwacje")}
              className="whitespace-nowrap px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition text-[10px]"
            >
              📋 "Pokaż moje rezerwacje"
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
