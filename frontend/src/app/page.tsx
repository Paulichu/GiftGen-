"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Code2,
  Cpu,
  Layers,
  Rocket,
  CheckCircle2,
  Globe,
  Database,
  ShieldCheck,
  ChevronRight,
  Terminal,
  Zap,
  Play,
  Bot,
  Infinity
} from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { apiRequest, getStoredToken } from "@/lib/api";

const PROMPT_SUGGESTIONS = [
  "Barbershop",
  "Gym",
  "Restaurant",
  "Salon"
];

export default function LandingPage() {
  const router = useRouter();
  const [stats, setStats] = useState({ projects: "0 Projects", bookings: "0 Bookings", credits: "∞ Credits" });
  const [prompt, setPrompt] = useState("");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("Free");

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await apiRequest("/api/stats");
        if (data) {
          setStats({
            projects: `${data.projects_generated || 0} Projects`,
            bookings: `0 Bookings`,
            credits: "∞ Credits",
          });
        }
      } catch {
        // Fallback default
      }
    }
    loadStats();
  }, []);

  const handleStartBuilding = (chosenPrompt?: string) => {
    const finalPrompt = chosenPrompt || prompt;
    if (typeof window !== "undefined") {
      if (finalPrompt.trim()) {
        localStorage.setItem("emergent_initial_prompt", finalPrompt.trim());
      }
    }
    router.push("/builder");
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white selection:bg-indigo-600 selection:text-white">
      {/* Top Banner */}
      <div className="w-full bg-gradient-to-r from-emerald-950/60 via-indigo-950/60 to-purple-950/60 border-b border-emerald-500/30 py-2.5 px-4 text-center text-xs sm:text-sm text-emerald-200 flex flex-wrap items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-semibold text-emerald-300">FREE FOREVER · NO CREDITS · NO CARD</span>
        <span className="hidden sm:inline text-zinc-400">| Complete full-stack autonomous studio with Always-On Persistent Agent</span>
        <Link href="/showroom" className="ml-2 font-bold text-teal-300 hover:text-white underline inline-flex items-center gap-1">
          <span>Odwiedź Showroom Produktów &amp; Dema IP →</span>
        </Link>
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#050507]/80 border-b border-zinc-800/80 px-6 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-600/30 ring-1 ring-white/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white font-sans">Vibe Engine</span>
            <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono font-semibold uppercase">
              Emergent Studio
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-400 font-medium">
          <Link href="/showroom" className="text-teal-400 hover:text-teal-300 font-semibold transition flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Showroom
          </Link>
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#pricing" className="hover:text-white transition">Pricing</a>
          <a href="#persistent" className="hover:text-white transition">24/7 Agent</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/builder"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
          >
            Launch Studio
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 lg:px-12 max-w-5xl mx-auto text-center flex flex-col items-center">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-800/80 text-xs text-emerald-300 mb-8 backdrop-blur">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold uppercase tracking-wider">FREE FOREVER · NO CREDITS · NO CARD</span>
        </div>

        {/* Hero title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
          Describe it. Five agents build it.
        </h1>

        <p className="mt-6 text-lg sm:text-2xl font-medium text-zinc-300 max-w-3xl leading-relaxed">
          Plus a 24/7 agent that books appointments on Telegram &amp; WhatsApp.
        </p>

        {/* Prompt Input Box */}
        <div className="w-full max-w-3xl mt-10 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-3 shadow-2xl backdrop-blur-xl focus-within:border-indigo-500/80 transition group">
          <div className="relative">
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your idea... e.g. Barbershop booking app with haircut services, calendar availability, and 24/7 Telegram confirmation"
              className="w-full bg-transparent p-3 text-sm sm:text-base text-white placeholder-zinc-500 resize-none focus:outline-none"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 px-2 border-t border-zinc-800/80">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>5 Sequential Builder Agents + 1 Persistent Always-On Bot</span>
            </div>
            <button
              onClick={() => handleStartBuilding()}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 group-hover:scale-[1.02]"
            >
              Start Building Free
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chips: Barbershop / Gym / Restaurant / Salon */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 max-w-3xl">
          <span className="text-xs text-zinc-500 mr-1">Popular templates:</span>
          {PROMPT_SUGGESTIONS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPrompt(`Full-stack appointment booking app for ${s}`);
                handleStartBuilding(`Full-stack appointment booking app for ${s}`);
              }}
              className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full text-xs font-medium text-zinc-300 transition"
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* Stats Row: 0 Projects, 0 Bookings, ∞ Credits */}
      <section className="border-y border-zinc-800/80 bg-zinc-950/60 py-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-zinc-800">
          <div className="pt-4 md:pt-0">
            <p className="text-4xl font-extrabold text-white tracking-tight">0 Projects</p>
            <p className="text-zinc-400 text-sm mt-1 uppercase tracking-wider font-medium">Projects Generated</p>
          </div>
          <div className="pt-4 md:pt-0">
            <p className="text-4xl font-extrabold text-white tracking-tight">0 Bookings</p>
            <p className="text-zinc-400 text-sm mt-1 uppercase tracking-wider font-medium">Persistent Appointments</p>
          </div>
          <div className="pt-4 md:pt-0">
            <p className="text-4xl font-extrabold text-emerald-400 tracking-tight flex items-center justify-center gap-1">
              <span>∞</span> Credits
            </p>
            <p className="text-zinc-400 text-sm mt-1 uppercase tracking-wider font-medium">Unlimited &amp; Free Forever</p>
          </div>
        </div>
      </section>

      {/* 5-Agent Swarm + Persistent Agent Overview */}
      <section id="features" className="py-20 px-6 lg:px-12 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/60 text-xs font-semibold text-indigo-400 mb-3">
            ARCHITECTURE
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            5 Sequential Studio Agents + 1 Always-On Agent
          </h2>
          <p className="mt-4 text-zinc-400 text-base max-w-2xl mx-auto">
            A collaborative multi-agent engine that takes your prompt from idea to production-ready Next.js &amp; FastAPI software.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl">
            <div className="text-xs font-mono font-bold text-indigo-400 mb-2">01. ARCHITECT</div>
            <h4 className="text-sm font-semibold text-white">Plans Structure</h4>
            <p className="text-xs text-zinc-400 mt-1">Defines schema, models, clarification questions, and endpoints.</p>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl">
            <div className="text-xs font-mono font-bold text-pink-400 mb-2">02. DESIGNER</div>
            <h4 className="text-sm font-semibold text-white">Palette &amp; Layout</h4>
            <p className="text-xs text-zinc-400 mt-1">Designs responsive Tailwind dark UI components and layout.</p>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl">
            <div className="text-xs font-mono font-bold text-emerald-400 mb-2">03. DEVELOPER</div>
            <h4 className="text-sm font-semibold text-white">Writes Code</h4>
            <p className="text-xs text-zinc-400 mt-1">Generates clean Next.js 14 and FastAPI Python services.</p>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl">
            <div className="text-xs font-mono font-bold text-amber-400 mb-2">04. INTEGRATION</div>
            <h4 className="text-sm font-semibold text-white">Wires APIs</h4>
            <p className="text-xs text-zinc-400 mt-1">Connects MongoDB collections, webhooks, and live routes.</p>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl">
            <div className="text-xs font-mono font-bold text-purple-400 mb-2">05. PM</div>
            <h4 className="text-sm font-semibold text-white">Reviews &amp; Ships</h4>
            <p className="text-xs text-zinc-400 mt-1">Conducts final verification and mounts live sandbox preview.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section (Display-only, zero paywalls) */}
      <section id="pricing" className="py-20 px-6 lg:px-12 max-w-6xl mx-auto border-t border-zinc-800/80">
        <div className="text-center mb-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Transparent Plans
          </h2>
          <p className="mt-2 text-zinc-400 text-sm max-w-md mx-auto">
            Everything stays free forever — plans are for display only, nothing is locked.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          {/* Free Plan */}
          <div
            onClick={() => setSelectedPlan("Free")}
            className={`cursor-pointer bg-zinc-950 border rounded-3xl p-8 flex flex-col justify-between transition ${
              selectedPlan === "Free" ? "border-emerald-500 shadow-xl shadow-emerald-500/10" : "border-zinc-800"
            }`}
          >
            <div>
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-bold text-white">Free</h4>
                {selectedPlan === "Free" && (
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                    SELECTED
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-1">Essential generation with full access</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-xs text-zinc-500">/ forever</span>
              </div>
              <ul className="mt-6 space-y-3 text-xs text-zinc-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Unlimited app generation</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 5-Agent pipeline</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 24/7 Persistent Telegram agent</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Live sandbox preview</li>
              </ul>
            </div>
            <button
              onClick={() => handleStartBuilding()}
              className="mt-8 w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-xl text-sm font-medium transition"
            >
              Select Free
            </button>
          </div>

          {/* Standard Plan */}
          <div
            onClick={() => setSelectedPlan("Standard")}
            className={`cursor-pointer bg-zinc-950 border rounded-3xl p-8 flex flex-col justify-between relative shadow-2xl transition ${
              selectedPlan === "Standard" ? "border-indigo-500 shadow-indigo-500/20" : "border-zinc-800"
            }`}
          >
            <div>
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-bold text-white">Standard</h4>
                {selectedPlan === "Standard" && (
                  <span className="text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-800 px-2 py-0.5 rounded font-mono">
                    SELECTED
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-1">Creator package (display only, fully unlocked)</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">$17</span>
                <span className="text-xs text-zinc-500">/ month</span>
              </div>
              <ul className="mt-6 space-y-3 text-xs text-zinc-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Everything unlocked</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> WhatsApp Cloud API integration</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> 1-Click cloud deployment</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> GitHub export</li>
              </ul>
            </div>
            <button
              onClick={() => handleStartBuilding()}
              className="mt-8 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition shadow-lg shadow-indigo-600/30"
            >
              Select Standard
            </button>
          </div>

          {/* Pro Plan */}
          <div
            onClick={() => setSelectedPlan("Pro")}
            className={`cursor-pointer bg-zinc-950 border rounded-3xl p-8 flex flex-col justify-between transition ${
              selectedPlan === "Pro" ? "border-purple-500 shadow-purple-500/20" : "border-zinc-800"
            }`}
          >
            <div>
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-bold text-white">Pro</h4>
                {selectedPlan === "Pro" && (
                  <span className="text-[10px] bg-purple-950 text-purple-400 border border-purple-800 px-2 py-0.5 rounded font-mono">
                    SELECTED
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-1">Agency tier (display only, fully unlocked)</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">$167</span>
                <span className="text-xs text-zinc-500">/ month</span>
              </div>
              <ul className="mt-6 space-y-3 text-xs text-zinc-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Everything in Standard</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Unlimited persistent bots</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Android APK packaging</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400" /> No credit limits forever</li>
              </ul>
            </div>
            <button
              onClick={() => handleStartBuilding()}
              className="mt-8 w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-xl text-sm font-medium transition"
            >
              Select Pro
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-12 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wide">Vibe Engine · Emergent Studio</span>
            <span>&copy; {new Date().getFullYear()} Free Forever Software Studio.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/showroom" className="hover:text-teal-400 transition font-medium">Showroom</Link>
            <Link href="/builder" className="hover:text-white transition">Builder</Link>
            <a href="#features" className="hover:text-white transition">Agents</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          router.push("/builder");
        }}
      />
    </div>
  );
}
