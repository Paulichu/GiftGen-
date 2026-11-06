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
  Play
} from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { apiRequest, getStoredToken } from "@/lib/api";

const COMPETITORS = ["Lovable", "Replit", "Cursor", "Bubble", "v0"];

const PROMPT_SUGGESTIONS = [
  "SaaS Analytics dashboard with Stripe subscriptions",
  "App for tracking my gym workouts and PR records",
  "Multi-tenant CRM with custom pipeline stages",
  "AI Resume review & scoring web platform"
];

export default function LandingPage() {
  const router = useRouter();
  const [competitorIndex, setCompetitorIndex] = useState(0);
  const [stats, setStats] = useState({ active_builders: 1420, apps_created: 8940, countries: 84 });
  const [prompt, setPrompt] = useState("");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Cycling competitor name
  useEffect(() => {
    const interval = setInterval(() => {
      setCompetitorIndex((prev) => (prev + 1) % COMPETITORS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Fetch live stats
  useEffect(() => {
    async function loadStats() {
      try {
        const data = await apiRequest("/api/stats");
        if (data) {
          setStats(data);
        }
      } catch (e) {
        // Fallback already set
      }
    }
    loadStats();

    // Check token presence
    const token = getStoredToken();
    if (token) {
      setCurrentUser({ loggedIn: true });
    }
  }, []);

  const handleStartBuilding = (chosenPrompt?: string) => {
    const finalPrompt = chosenPrompt || prompt;
    if (typeof window !== "undefined") {
      if (finalPrompt.trim()) {
        localStorage.setItem("emergent_initial_prompt", finalPrompt.trim());
      }
    }
    const token = getStoredToken();
    if (token) {
      router.push("/builder");
    } else {
      setIsAuthOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white selection:bg-indigo-600 selection:text-white">
      {/* Top Banner */}
      <div className="w-full bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-indigo-900/40 border-b border-indigo-500/20 py-2.5 px-4 text-center text-xs sm:text-sm text-indigo-200 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        <span>Describe your idea. Build websites &amp; full-stack apps with multi-agent AI.</span>
        <span className="hidden sm:inline font-semibold text-white ml-1">Frontend + backend included.</span>
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#050507]/80 border-b border-zinc-800/80 px-6 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-600/30 ring-1 ring-white/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-sans">emergent</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-400 font-medium">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#pricing" className="hover:text-white transition">Pricing</a>
          <a href="#pipeline" className="hover:text-white transition">Agent Team</a>
          <a href="#faq" className="hover:text-white transition">FAQs</a>
        </nav>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <Link
              href="/builder"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
            >
              Go to Builder
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <button
                onClick={() => {
                  setAuthMode("login");
                  setIsAuthOpen(true);
                }}
                className="px-4 py-2 text-sm text-zinc-300 hover:text-white font-medium transition"
              >
                Log in
              </button>
              <button
                onClick={() => {
                  setAuthMode("register");
                  setIsAuthOpen(true);
                }}
                className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-zinc-950 text-sm font-semibold rounded-xl transition flex items-center gap-2 shadow-sm"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 lg:px-12 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Glow effect */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300 mb-8 backdrop-blur">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Full-Stack AI App Builder Platform</span>
          <span className="text-zinc-500">|</span>
          <span className="text-indigo-400 font-medium">Next.js 14 + FastAPI + MongoDB</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
          Build Monetizable Software with AI
        </h1>

        <div className="mt-4 text-xl sm:text-2xl font-medium text-zinc-400 flex items-center justify-center gap-2 h-10">
          <span>Build what</span>
          <span className="text-indigo-400 font-semibold inline-block min-w-[120px] transition-all">
            {COMPETITORS[competitorIndex]}
          </span>
          <span>can't.</span>
        </div>

        <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
          From concept to deployment, Emergent handles every aspect of software development so you can focus on what matters most — your vision!
        </p>

        {/* Prompt Input Box */}
        <div className="w-full max-w-3xl mt-10 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-3 shadow-2xl backdrop-blur-xl focus-within:border-indigo-500/80 transition group">
          <div className="relative">
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your idea... e.g. App for tracking my gym workouts, exercises, personal records with charts and Stripe subscription"
              className="w-full bg-transparent p-3 text-sm sm:text-base text-white placeholder-zinc-500 resize-none focus:outline-none"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 px-2 border-t border-zinc-800/80">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Orchestrates 5 sequential AI agents</span>
            </div>
            <button
              onClick={() => handleStartBuilding()}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 group-hover:scale-[1.02]"
            >
              Start Building
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick prompt suggestion chips */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 max-w-3xl">
          <span className="text-xs text-zinc-500 mr-1">Suggestions:</span>
          {PROMPT_SUGGESTIONS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPrompt(s);
                handleStartBuilding(s);
              }}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/90 rounded-full text-xs text-zinc-300 transition"
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* Live Stats Row */}
      <section className="border-y border-zinc-800/80 bg-zinc-950/60 py-10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-zinc-800">
          <div className="pt-4 md:pt-0">
            <p className="text-4xl font-extrabold text-white tracking-tight">
              {stats.active_builders.toLocaleString()}+
            </p>
            <p className="text-zinc-400 text-sm mt-1 uppercase tracking-wider font-medium">Active Builders</p>
          </div>
          <div className="pt-4 md:pt-0">
            <p className="text-4xl font-extrabold text-white tracking-tight">
              {stats.apps_created.toLocaleString()}+
            </p>
            <p className="text-zinc-400 text-sm mt-1 uppercase tracking-wider font-medium">Apps Created</p>
          </div>
          <div className="pt-4 md:pt-0">
            <p className="text-4xl font-extrabold text-white tracking-tight">
              {stats.countries}+
            </p>
            <p className="text-zinc-400 text-sm mt-1 uppercase tracking-wider font-medium">Countries Worldwide</p>
          </div>
        </div>
      </section>

      {/* 3 Feature Sections */}
      <section id="features" className="py-24 px-6 lg:px-12 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/60 text-xs font-semibold text-indigo-400 mb-3">
            HOW IT WORKS
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            What can Emergent do for you?
          </h2>
          <p className="mt-4 text-zinc-400 text-base max-w-xl mx-auto">
            From single sentence concept to fully deployed production application in seconds.
          </p>
        </div>

        <div className="space-y-16">
          {/* Feature 1: Describe Idea */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center bg-zinc-950 border border-zinc-800/90 rounded-3xl p-8 sm:p-12">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-lg mb-6 border border-indigo-500/20">
                01
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">1. Describe Idea</h3>
              <p className="mt-3 text-zinc-400 leading-relaxed text-sm sm:text-base">
                Simply type what you want to build. If your idea is vague or missing key domain entities, our Architect Agent asks interactive clarifying questions to craft the optimal data schema, API contract, and page structure.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">Clarifying Questions Engine</span>
                <span className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">Data Models Schema</span>
                <span className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">REST API Endpoints</span>
              </div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 font-mono text-xs text-zinc-300 shadow-xl overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-zinc-500">
                <span>Architect Agent Blueprint</span>
                <span className="text-emerald-400">Validated JSON</span>
              </div>
              <pre className="mt-4 text-zinc-400 overflow-x-auto leading-relaxed">
{`{
  "project": "Gym Workout Tracker",
  "data_models": ["User", "Workout", "ExerciseSet"],
  "api_endpoints": [
    "GET /api/workouts",
    "POST /api/workouts",
    "GET /api/analytics/prs"
  ],
  "pages": ["Dashboard", "Log Workout", "PR Charts"]
}`}
              </pre>
            </div>
          </div>

          {/* Feature 2: Shape It */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center bg-zinc-950 border border-zinc-800/90 rounded-3xl p-8 sm:p-12">
            <div className="order-2 lg:order-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-800 text-xs text-zinc-400">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="ml-2 font-mono">Live Interactive Sandbox</span>
              </div>
              <div className="bg-zinc-950 rounded-xl p-5 border border-zinc-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white text-sm">Workout Logs</span>
                  <span className="text-xs text-emerald-400 font-mono">2 Sets Logged</span>
                </div>
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-3/4 rounded-full" />
                </div>
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Bench Press: 100kg × 5 reps</span>
                  <span>Personal Record 🎉</span>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-lg mb-6 border border-purple-500/20">
                02
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">2. Shape It</h3>
              <p className="mt-3 text-zinc-400 leading-relaxed text-sm sm:text-base">
                Inspect real production code files across Frontend (Next.js), Backend (FastAPI), and Database schemas. Preview your live app in an embedded sandbox iframe with instant hot refresh.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">Sandboxed Live Preview</span>
                <span className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">File Tree Explorer</span>
                <span className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">Multi-tab Code Inspector</span>
              </div>
            </div>
          </div>

          {/* Feature 3: Go Live */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center bg-zinc-950 border border-zinc-800/90 rounded-3xl p-8 sm:p-12">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-lg mb-6 border border-emerald-500/20">
                03
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">3. Go Live</h3>
              <p className="mt-3 text-zinc-400 leading-relaxed text-sm sm:text-base">
                Deploy with a single click to custom emergent domains with automatic SSL. Fork projects to iterate safely, rollback to earlier versions whenever needed, and export directly to GitHub.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">1-Click Cloud Deploy</span>
                <span className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">Project Forking</span>
                <span className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">Version Rollback</span>
                <span className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">GitHub API Export</span>
              </div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <div className="truncate">
                  <p className="text-xs text-zinc-400">Production URL</p>
                  <p className="text-sm font-mono text-white truncate">https://gym-workout-tracker-981f12.emergent.app</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800">
                <span>SSL Certificate: Active</span>
                <span className="text-emerald-400 font-medium">Ready for monetization</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent Pricing Section */}
      <section id="pricing" className="py-20 px-6 lg:px-12 max-w-6xl mx-auto border-t border-zinc-800/80">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Transparent pricing for every builder
          </h2>
          <p className="mt-3 text-zinc-400 text-sm max-w-md mx-auto">
            Choose the plan that fits your building ambitions. Start with 100 free credits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 flex flex-col justify-between">
            <div>
              <h4 className="text-lg font-bold text-white">Free</h4>
              <p className="text-xs text-zinc-400 mt-1">Get started with essential features at no cost</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-xs text-zinc-500">/ month</span>
              </div>
              <ul className="mt-6 space-y-3 text-xs text-zinc-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100 free starting credits</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 5-Agent orchestration pipeline</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sandboxed live preview</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Project forking &amp; versions</li>
              </ul>
            </div>
            <button
              onClick={() => handleStartBuilding()}
              className="mt-8 w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-xl text-sm font-medium transition"
            >
              Try Emergent
            </button>
          </div>

          {/* Standard Plan */}
          <div className="bg-zinc-950 border-2 border-indigo-500 rounded-3xl p-8 flex flex-col justify-between relative shadow-2xl shadow-indigo-500/10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
              Popular
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Standard</h4>
              <p className="text-xs text-zinc-400 mt-1">Perfect for first-time builders &amp; creators</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">$17</span>
                <span className="text-xs text-zinc-500">/ month</span>
              </div>
              <ul className="mt-6 space-y-3 text-xs text-zinc-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Everything in Free, plus:</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> 1,000 monthly credits</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Custom domain deployment</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> GitHub 1-click sync</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Stripe billing wiring</li>
              </ul>
            </div>
            <button
              onClick={() => handleStartBuilding()}
              className="mt-8 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition shadow-lg shadow-indigo-600/30"
            >
              Get Standard
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 flex flex-col justify-between">
            <div>
              <h4 className="text-lg font-bold text-white">Pro</h4>
              <p className="text-xs text-zinc-400 mt-1">Built for serious creators and agencies</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">$167</span>
                <span className="text-xs text-zinc-500">/ month</span>
              </div>
              <ul className="mt-6 space-y-3 text-xs text-zinc-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Unlimited app generation</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400" /> 1M context reasoning window</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400" /> High-performance compute</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Priority 24/7 engineering support</li>
              </ul>
            </div>
            <button
              onClick={() => handleStartBuilding()}
              className="mt-8 w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-xl text-sm font-medium transition"
            >
              Get Pro
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-12 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wide">emergent</span>
            <span>&copy; {new Date().getFullYear()} Emergent Labs. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition">Terms of Service</a>
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Security</a>
            <a href="#" className="hover:text-white transition">Docs</a>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          router.push("/builder");
        }}
      />
    </div>
  );
}
