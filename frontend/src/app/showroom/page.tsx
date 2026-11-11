"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Play,
  X,
  Copy,
  Check,
  Globe,
  Wallet,
  Mail,
  ChevronRight,
  Activity,
  Layers,
  Award,
  ExternalLink,
  Flame,
  CheckCircle2,
  ArrowLeft,
  Server,
  Cpu,
  Lock,
  PhoneCall,
  FileText
} from "lucide-react";
import {
  Language,
  PRODUCTS,
  VERIFIED_VIDEOS,
  MONETIZATION_INFO,
  ProductItem,
  VideoItem,
  PricingTier
} from "@/data/portfolio";

export default function ShowroomPage() {
  const [lang, setLang] = useState<Language>("pl");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [purchaseProduct, setPurchaseProduct] = useState<ProductItem | null>(null);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [orderSent, setOrderSent] = useState(false);
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerNote, setBuyerNote] = useState("");

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderSent(true);
  };

  const filteredProducts = activeCategory === "all"
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === activeCategory);

  const heroCopy = {
    badge: {
      pl: "OFICJALNE PORTFOLIO IP & AKTYWA TECHNOLOGICZNE 2026",
      en: "OFFICIAL IP PORTFOLIO & SOVEREIGN TECH ASSETS 2026",
      de: "OFFIZIELLES IP-PORTFOLIO & SOUVERÄNE TECH-ASSETS 2026"
    },
    titleMain: {
      pl: "Twoja intencja. Suwerenna technologia.",
      en: "Your intent. Sovereign technology.",
      de: "Deine Absicht. Souveräne Technologie."
    },
    titleSub: {
      pl: "Compliance Twin 2.0 & Aktywa AI do monetyzacji.",
      en: "Compliance Twin 2.0 & Sovereign AI Assets.",
      de: "Compliance Twin 2.0 & Souveräne KI-Assets."
    },
    lead: {
      pl: `Portfolio Pauliny Jakubowskiej (Founder & Lead Architect, INCANTO / OJJJA.XYZ). Autonomiczny agent zgodności regulacyjnej EU AI Act / GDPR oraz suwerenne oprogramowanie bez vendor-lock.`,
      en: `Portfolio of Paulina Jakubowska (Founder & Lead Architect, INCANTO / OJJJA.XYZ). Autonomous regulatory agent for EU AI Act / GDPR and sovereign software with zero vendor-lock.`,
      de: `Portfolio von Paulina Jakubowska (Founder & Lead Architect, INCANTO / OJJJA.XYZ). Autonomer Regulierungsagent für EU AI Act / DSGVO und souveräne Software ohne Vendor-Lock.`
    },
    ctaBuy: {
      pl: "Oferta Enterprise & Cennik",
      en: "Enterprise Offer & Pricing",
      de: "Enterprise-Angebot & Preise"
    },
    ctaDemos: {
      pl: "Obejrzyj Wideo Dema (14)",
      en: "Watch Video Demos (14)",
      de: "Video-Demos Ansehen (14)"
    },
    filterAll: { pl: "Wszystkie Produkty", en: "All Products", de: "Alle Produkte" }
  };

  return (
    <div className="min-h-screen bg-[#05060b] text-[#eaf6f5] selection:bg-teal-500 selection:text-black font-sans">
      {/* Top Notification Bar */}
      <div className="w-full bg-gradient-to-r from-teal-950/80 via-indigo-950/60 to-purple-950/80 border-b border-teal-500/20 py-2.5 px-4 text-center text-xs text-teal-200 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition mr-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Powrót do Emergent Studio</span>
        </Link>
        <span className="text-zinc-600">|</span>
        <span className="flex items-center gap-1.5 font-semibold text-white">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>{MONETIZATION_INFO.founder} ({MONETIZATION_INFO.role})</span>
        </span>
        <span className="text-zinc-600">•</span>
        <span>{MONETIZATION_INFO.company}</span>
        <span className="text-zinc-600">•</span>
        <span>{MONETIZATION_INFO.registeredCity}</span>
        <span className="text-zinc-600">•</span>
        <a href={`mailto:${MONETIZATION_INFO.replyToEmail}`} className="underline hover:text-white transition font-mono">
          {MONETIZATION_INFO.replyToEmail}
        </a>
      </div>

      {/* Main Header / Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#05060b]/90 border-b border-white/[0.08] px-6 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 to-violet-600 flex items-center justify-center text-black font-extrabold shadow-lg shadow-teal-500/20">
            PJ
          </div>
          <div>
            <div className="text-base font-extrabold tracking-wide leading-none text-white">
              PAULINA JAKUBOWSKA
            </div>
            <div className="text-[10px] tracking-[0.2em] text-teal-400 font-semibold mt-1">
              INCANTO / OJJJA.XYZ • ENTERPRISE OFFER 2026
            </div>
          </div>
        </div>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs text-zinc-400 font-medium">
          <a href="#compliance-twin-hero" className="hover:text-white transition text-amber-300 font-semibold">
            Compliance Twin 2.0
          </a>
          <a href="#products" className="hover:text-white transition">
            {lang === "pl" ? "Cennik & Pakiety" : lang === "de" ? "Preise & Tiers" : "Pricing & Tiers"}
          </a>
          <a href="#demos" className="hover:text-white transition">
            {lang === "pl" ? "Wideoteka Dema" : lang === "de" ? "Video-Demos" : "Video Demos"}
          </a>
          <a href="#contact" className="hover:text-white transition">
            {lang === "pl" ? "Kontakt & Reply" : lang === "de" ? "Kontakt" : "Contact & Reply"}
          </a>
          <Link href="/builder" className="hover:text-white transition text-teal-400 font-semibold">
            App Builder →
          </Link>
        </nav>

        {/* Language Switcher & Instant Checkout Trigger */}
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl bg-zinc-900 border border-white/10 p-1 text-xs font-semibold">
            <button
              onClick={() => setLang("pl")}
              className={`px-2.5 py-1 rounded-lg transition ${lang === "pl" ? "bg-teal-400 text-black shadow" : "text-zinc-400 hover:text-white"}`}
            >
              PL
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-2.5 py-1 rounded-lg transition ${lang === "en" ? "bg-teal-400 text-black shadow" : "text-zinc-400 hover:text-white"}`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("de")}
              className={`px-2.5 py-1 rounded-lg transition ${lang === "de" ? "bg-teal-400 text-black shadow" : "text-zinc-400 hover:text-white"}`}
            >
              DE
            </button>
          </div>

          <a
            href={MONETIZATION_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-12 px-6 lg:px-12 max-w-5xl mx-auto text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-xs font-bold text-teal-300 mb-6 backdrop-blur">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
          <span>{heroCopy.badge[lang]}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
          {heroCopy.titleMain[lang]}
          <br />
          <span className="bg-gradient-to-r from-teal-300 via-violet-300 to-amber-300 bg-clip-text text-transparent">
            {heroCopy.titleSub[lang]}
          </span>
        </h1>

        <p className="mt-5 text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed">
          {heroCopy.lead[lang]}
        </p>

        {/* Hero Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <a
            href="#compliance-twin-hero"
            className="w-full sm:w-auto px-7 py-3.5 bg-teal-400 hover:bg-teal-300 text-black font-extrabold text-sm rounded-2xl shadow-xl shadow-teal-500/25 transition flex items-center justify-center gap-2"
          >
            <Award className="w-4 h-4" />
            <span>{heroCopy.ctaBuy[lang]}</span>
          </a>
          <a
            href="#demos"
            className="w-full sm:w-auto px-7 py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-semibold text-sm rounded-2xl transition flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 text-teal-400" />
            <span>{heroCopy.ctaDemos[lang]}</span>
          </a>
        </div>

        {/* Quick Highlights with Document Facts */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-4xl pt-8 border-t border-white/[0.08] text-left">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <p className="text-[11px] text-zinc-400 uppercase tracking-widest font-mono">Model Sprzedaży</p>
            <p className="text-sm font-bold text-emerald-400 mt-1">Standalone (Not Bundled)</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <p className="text-[11px] text-zinc-400 uppercase tracking-widest font-mono">EU AI Act Faza 2</p>
            <p className="text-sm font-bold text-amber-300 mt-1">Sierpień 2026 (Kara 20M €)</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <p className="text-[11px] text-zinc-400 uppercase tracking-widest font-mono">Redukcja Kosztu</p>
            <p className="text-sm font-bold text-teal-300 mt-1">-75% Czas / Koszt (COMBO)</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <p className="text-[11px] text-zinc-400 uppercase tracking-widest font-mono">Szyfrowanie PQC</p>
            <p className="text-sm font-bold text-violet-400 mt-1">Kyber-like / CNSA 2.0</p>
          </div>
        </div>

        {/* Live Cobalt Visual Loop / Showroom Ambient Video */}
        <div className="mt-10 w-full max-w-4xl rounded-3xl overflow-hidden border border-teal-500/30 bg-black/60 shadow-2xl relative group">
          <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-[11px] font-mono tracking-widest uppercase text-teal-300 bg-black/70 px-2 py-0.5 rounded-md border border-teal-500/30">
              Live Cobalt Analytics Loop • Incanto Engine
            </span>
          </div>
          <div className="absolute top-3 right-4 z-10">
            <span className="text-[10px] font-mono text-zinc-400 bg-black/70 px-2 py-0.5 rounded border border-white/10">
              #05080F • #0A2A5A Real-time Telemetry
            </span>
          </div>
          <div className="relative aspect-video w-full bg-black">
            <video
              src="/videos/cobalt_clean_17s_loop.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-3.5 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-zinc-300 font-mono text-[11px]">
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              <span>Autonomiczny silnik analityczny EU AI Act &amp; Sovereign Telemetry 2026</span>
            </div>
            <a
              href="#compliance-twin-hero"
              className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 font-semibold text-xs transition"
            >
              <span>Specyfikacja Compliance Twin 2.0</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Compliance Twin 2.0 Spotlight Section */}
      <section id="compliance-twin-hero" className="py-16 px-6 lg:px-12 max-w-6xl mx-auto border-t border-white/[0.08]">
        <div className="rounded-3xl bg-gradient-to-b from-[#0e172a] via-[#090d16] to-[#05060b] border border-teal-500/30 p-8 lg:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <span className="px-3 py-1 rounded-full bg-teal-400/20 border border-teal-400/40 text-xs font-extrabold text-teal-300 uppercase tracking-wider">
              Flagowy Produkt 2026 • Standalone
            </span>
            <div className="text-xs text-zinc-400 font-mono">
              Enterprise Offer 2026 — $1M Perpetual / $500k SaaS / AI Act / GDPR / HIPAA / ISO27001
            </div>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            Compliance Twin 2.0 — Autonomous AI Agent for Regulatory Compliance
          </h2>

          <p className="mt-4 text-base text-zinc-300 max-w-3xl leading-relaxed">
            {lang === "pl"
              ? "Cyfrowy bliźniak Twoich zobowiązań prawnych inspirowany projektem Stanford Law School ComplianceTwin i walidowany przez badanie COMBO. W przeciwieństwie do zwykłych narzędzi raportujących, autonomicznie analizuje regulacje prawne, skanuje środowisko IT w czasie rzeczywistym i samoczynnie generuje raporty gotowe dla regulatorów. Zwraca się w 6-12 miesięcy, eliminując ryzyko kar do 20 000 000 €."
              : lang === "de"
              ? "Autonomer digitaler Zwilling für regulatorische Pflichten, inspiriert vom Stanford Law School Projekt und COMBO-validiert. Liest Gesetze autonom, scannt IT in Echtzeit und liefert behördenfertige Berichte. ROI in 6-12 Monaten, schützt vor 20 Mio. € Strafen."
              : "Autonomous AI agent acting as a digital twin of your regulatory obligations. Inspired by Stanford Law School ComplianceTwin and validated by COMBO. Autonomously reads regulations, scans IT infrastructure real-time, and generates regulator-ready PDF/Excel reports. Payback 6-12 months."}
          </p>

          {/* Business Model Tiers Grid from Attachment */}
          <div className="mt-10">
            <div className="text-xs font-bold uppercase tracking-widest text-amber-300 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Model Biznesowy — Standalone (Not Bundled)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {PRODUCTS[0].pricingTiers?.map((tier) => (
                <div
                  key={tier.id}
                  className="rounded-2xl bg-black/50 border border-white/10 hover:border-teal-400/50 p-5 flex flex-col justify-between transition group"
                >
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition">
                      {tier.name}
                    </h3>
                    <div className="mt-2 mb-3">
                      <span className="text-2xl font-black text-amber-300">{tier.price}</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                      {tier.description[lang]}
                    </p>
                    <ul className="space-y-1.5 border-t border-white/5 pt-3 text-[11px] text-zinc-300">
                      {tier.highlights.map((h, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                          <span>{h[lang]}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      setPurchaseProduct(PRODUCTS[0]);
                      setSelectedTier(tier);
                    }}
                    className="mt-5 w-full py-2.5 bg-teal-400 hover:bg-teal-300 text-black font-extrabold text-xs rounded-xl shadow transition"
                  >
                    Wybierz {tier.name}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Architecture 2.0 Specs from Attachment */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Cpu className="w-5 h-5 text-teal-400" />
              <span>Architektura 2.0 — Patron Edition Improvements</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {PRODUCTS[0].architectureSpecs?.map((spec, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-teal-400 block font-bold">
                    {spec.layer}
                  </span>
                  <div className="font-semibold text-white mt-0.5">{spec.tech}</div>
                  <p className="text-zinc-400 text-[11px] mt-1 leading-snug">{spec.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Product Catalog Section */}
      <section id="products" className="py-16 px-6 lg:px-12 max-w-6xl mx-auto border-t border-white/[0.08]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-xs tracking-[0.2em] text-teal-400 font-bold uppercase">
              {lang === "pl" ? "Pełne Portfolio Aktywów" : lang === "de" ? "Gesamtes Asset-Portfolio" : "Full Assets Catalog"}
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
              {lang === "pl" ? "Wybierz rozwiązanie dostosowane do Twojej skali" : lang === "de" ? "Wählen Sie eine auf Ihre Größe zugeschnittene Lösung" : "Select an asset tailored to your operational scale"}
            </h2>
            <p className="text-sm text-zinc-400 mt-2 max-w-xl">
              {MONETIZATION_INFO.invoicingNote[lang]}
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: heroCopy.filterAll[lang] },
              { id: "compliance", label: "Compliance 2.0" },
              { id: "bci", label: "BCI & Bio-Soma" },
              { id: "ai_agents", label: "AI Agents & Intent" },
              { id: "saas", label: "SaaS & Creator" },
              { id: "crm", label: "CRM & Hub" }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  activeCategory === cat.id
                    ? "bg-teal-400 text-black border-teal-400"
                    : "bg-zinc-900 border-white/10 text-zinc-400 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => {
            const video = VERIFIED_VIDEOS.find((v) => v.id === p.primaryVideoId);
            return (
              <article
                key={p.id}
                className="rounded-3xl bg-[#0a0f1c] border border-white/[0.08] hover:border-teal-500/40 p-6 flex flex-col justify-between transition-all duration-300 shadow-xl group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-teal-400/10 border border-teal-400/30 text-[11px] font-bold text-teal-300">
                      {p.badge[lang]}
                    </span>
                    <span className="text-xs font-mono text-zinc-500 uppercase">
                      {p.period ? (lang === "pl" ? `/${p.period === "month" ? "miesiąc" : p.period === "year" ? "rok" : "jednorazowo"}` : `/${p.period}`) : ""}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mt-4 group-hover:text-teal-300 transition">
                    {p.title}
                  </h3>

                  <p className="text-xs font-medium text-teal-400/90 mt-1">
                    {p.tagline[lang]}
                  </p>

                  <div className="my-5 p-3 rounded-2xl bg-black/40 border border-white/[0.05] flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl sm:text-3xl font-extrabold text-white">€{p.priceEur.toLocaleString()}</span>
                      <span className="text-xs text-zinc-400 ml-1.5 font-mono">(${p.priceUsd.toLocaleString()})</span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    {p.description[lang]}
                  </p>

                  <ul className="space-y-2 pt-3 border-t border-white/[0.06] text-xs text-zinc-300">
                    {p.features.slice(0, 4).map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                        <span>{f[lang]}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06] flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setPurchaseProduct(p);
                      setSelectedTier(p.pricingTiers ? p.pricingTiers[0] : null);
                    }}
                    className="w-full py-3 bg-teal-400 hover:bg-teal-300 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-teal-500/20 transition flex items-center justify-center gap-2"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>{lang === "pl" ? `Szczegóły & Zamówienie` : `Details & Order`}</span>
                  </button>

                  {video && (
                    <button
                      onClick={() => setSelectedVideo(video)}
                      className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl border border-white/10 transition flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3 h-3 text-teal-400" />
                      <span>{lang === "pl" ? "Obejrzyj Demo wideo" : lang === "de" ? "Video-Demo Ansehen" : "Watch Demo Video"}</span>
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Verified YouTube Demos Showcase */}
      <section id="demos" className="py-16 px-6 lg:px-12 max-w-6xl mx-auto border-t border-white/[0.08]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs tracking-[0.2em] text-violet-400 font-bold uppercase">
              {lang === "pl" ? "Oficjalna Wideoteka Kanału" : lang === "de" ? "Offizielle Videothek" : "Official Video Library"}
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
              {lang === "pl" ? "Dowód wdrożenia na kanale @paulajak8276" : lang === "de" ? "Bereitstellungsnachweis auf @paulajak8276" : "Live deployment proof on @paulajak8276"}
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              {lang === "pl"
                ? "Kliknij miniaturę, aby odtworzyć materiał demonstracyjny bezpośrednio w oknie odtwarzacza."
                : lang === "de"
                ? "Klicken Sie auf das Vorschaubild, um die Demo direkt abzuspielen."
                : "Click any thumbnail to stream the live implementation demo."}
            </p>
          </div>
          <a
            href="https://www.youtube.com/@paulajak8276"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-teal-400 hover:underline font-semibold"
          >
            <span>YouTube: @paulajak8276</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Video Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {VERIFIED_VIDEOS.map((v) => (
            <div
              key={v.id}
              onClick={() => setSelectedVideo(v)}
              className="cursor-pointer rounded-2xl bg-zinc-950 border border-white/[0.08] hover:border-violet-400/50 p-3 transition group flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900">
                  <img
                    src={v.thumbnail}
                    alt={v.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition">
                    <div className="w-10 h-10 rounded-full bg-violet-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                      <Play className="w-4 h-4 ml-0.5" />
                    </div>
                  </div>
                </div>
                <h4 className="text-sm font-bold text-white mt-3 line-clamp-1 group-hover:text-teal-300 transition">
                  {v.title}
                </h4>
                <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                  {v.desc[lang]}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                <span>{v.author}</span>
                <span className="text-teal-400 group-hover:underline">Play Demo →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Direct Contact & Reply Section (from Section 8 of attachment) */}
      <section id="contact" className="py-16 px-6 lg:px-12 max-w-6xl mx-auto border-t border-white/[0.08]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                <img
                  src="/paulina_jakubowska_avatar.png"
                  alt="Paulina Jakubowska - Founder & Lead Architect"
                  className="h-28 sm:h-32 w-auto object-contain drop-shadow-[0_10px_25px_rgba(20,184,166,0.3)] filter contrast-[1.03]"
                />
              </div>
              <div>
                <div className="text-xs tracking-[0.2em] text-amber-400 font-bold uppercase">
                  Section 8 • Contact &amp; Reply
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  Paulina Jakubowska
                </h2>
                <p className="text-sm text-teal-400 font-semibold mt-0.5">
                  {MONETIZATION_INFO.role} • {MONETIZATION_INFO.company}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <a
                    href={MONETIZATION_INFO.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-500/10 border border-sky-400/30 text-xs text-sky-300 hover:text-white hover:bg-sky-500/20 font-mono transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>LinkedIn • paulina-jakubowska-65712b163</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-6 p-6 rounded-3xl bg-[#0a0f1c] border border-white/10 space-y-4">
              <div className="space-y-1.5">
                <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-mono">Główny adres e-mail (Reply to):</span>
                <div>
                  <a href={`mailto:${MONETIZATION_INFO.replyToEmail}`} className="text-base text-white font-bold underline hover:text-teal-300">
                    {MONETIZATION_INFO.replyToEmail}
                  </a>
                </div>
              </div>

              <div className="space-y-1 text-xs text-zinc-300">
                <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-mono">Dodatkowe adresy:</span>
                <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono mt-1">
                  <a href={`mailto:${MONETIZATION_INFO.directEmail}`} className="text-teal-300 hover:underline">
                    {MONETIZATION_INFO.directEmail}
                  </a>
                  <a href={`mailto:${MONETIZATION_INFO.ipEmail}`} className="text-teal-300 hover:underline">
                    {MONETIZATION_INFO.ipEmail}
                  </a>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex flex-col gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-emerald-400" />
                  <span className="text-zinc-400">WhatsApp:</span>
                  <a href={MONETIZATION_INFO.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-white font-bold hover:underline">
                    {MONETIZATION_INFO.whatsapp}
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-sky-400" />
                  <span className="text-zinc-400">LinkedIn:</span>
                  <a href={MONETIZATION_INFO.linkedin} target="_blank" rel="noopener noreferrer" className="text-sky-300 hover:underline truncate max-w-xs">
                    paulina-jakubowska-65712b163
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span className="text-zinc-400">Lokalizacja:</span>
                  <span className="text-zinc-200">{MONETIZATION_INFO.registeredCity}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-zinc-400">
                <span className="font-semibold text-zinc-300">Załączniki na życzenie:</span> Diagram architektury, demo wideo dostępne pod umową NDA.
              </div>
            </div>
          </div>

          {/* Direct Purchase Dispatch Form */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0a0f1c] border border-white/[0.08] shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-teal-400" />
              <span>{lang === "pl" ? "Zapytanie Ofertowe / NDA / Zamówienie" : "Direct Inquiry / NDA / Order"}</span>
            </h3>

            {orderSent ? (
              <div className="mt-6 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <h4 className="text-base font-bold text-white">
                  {lang === "pl" ? "Zapytanie wysłane pomyślnie!" : "Inquiry sent successfully!"}
                </h4>
                <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                  {lang === "pl"
                    ? `Dziękujemy! Otrzymasz potwierdzenie na adres: ${buyerEmail}. Odpowiedź zostanie wysłana bezpośrednio z ${MONETIZATION_INFO.replyToEmail}.`
                    : `Thank you! Transfer details and confirmation will arrive at ${buyerEmail} directly from ${MONETIZATION_INFO.replyToEmail}.`}
                </p>
                <button
                  onClick={() => setOrderSent(false)}
                  className="mt-4 px-4 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs font-semibold text-zinc-300"
                >
                  {lang === "pl" ? "Wyślij kolejne zapytanie" : "Send another inquiry"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleOrderSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">
                    {lang === "pl" ? "Twój adres e-mail (do oferty / NDA / faktury)" : "Your email address (for offer / NDA / invoice)"}
                  </label>
                  <input
                    type="email"
                    required
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="kontakt@twojafirma.pl"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">
                    {lang === "pl" ? "Wybrany produkt / pakiet" : "Selected Asset / Tier"}
                  </label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-teal-400"
                  >
                    <option value="compliance-twin-perpetual">Compliance Twin 2.0 — Enterprise Perpetual ($1,000,000)</option>
                    <option value="compliance-twin-saas">Compliance Twin 2.0 — Enterprise SaaS ($500,000/rok)</option>
                    <option value="compliance-twin-growth">Compliance Twin 2.0 — Growth (€350,000/rok)</option>
                    <option value="compliance-twin-starter">Compliance Twin 2.0 — Starter (€150,000/rok)</option>
                    <option value="neuro-soma">INCANTO NEURO-SOMA OS (€490)</option>
                    <option value="sovereign-terminal">Sovereign Intel Terminal (€990)</option>
                    <option value="makler-app">AI Immobilien Makler App (€149/miesiąc)</option>
                    <option value="quantum-crm">Quantum CRM & Automation Hub (€290)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">
                    {lang === "pl" ? "Dodatkowe uwagi / zapotrzebowanie / prośba o NDA" : "Additional notes / NDA request"}
                  </label>
                  <textarea
                    rows={2}
                    value={buyerNote}
                    onChange={(e) => setBuyerNote(e.target.value)}
                    placeholder={lang === "pl" ? "Nazwa firmy / Zakres wdrożenia / Prośba o demo wideo pod NDA..." : "Company Name / Scope of deployment / NDA request..."}
                    className="w-full px-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-teal-400 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-teal-400 hover:bg-teal-300 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-teal-500/20 transition flex items-center justify-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  <span>{lang === "pl" ? "Wyślij Zapytanie do Pauliny Jakubowskiej" : "Send Inquiry to Paulina Jakubowska"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-[#020306] py-12 px-6 lg:px-12 text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-teal-400 text-black font-bold flex items-center justify-center text-xs">
              PJ
            </div>
            <div>
              <p className="font-bold text-white tracking-wide">PAULINA JAKUBOWSKA • INCANTO / OJJJA.XYZ</p>
              <p className="text-[11px] text-zinc-500">NRW, Germany (100% remote) • Reply to: compliance@ojjja.site</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <a href="https://www.youtube.com/@paulajak8276" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
              YouTube @paulajak8276
            </a>
            <a href={MONETIZATION_INFO.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
              LinkedIn
            </a>
            <a href={`mailto:${MONETIZATION_INFO.replyToEmail}`} className="hover:text-white transition">
              compliance@ojjja.site
            </a>
          </div>
        </div>
      </footer>

      {/* Video Modal Player */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
          <div className="bg-zinc-950 border border-white/15 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white truncate">{selectedVideo.title}</h3>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&rel=0`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            <div className="p-4 bg-zinc-900/60 flex items-center justify-between text-xs">
              <span className="text-zinc-400">{selectedVideo.desc[lang]}</span>
              <a
                href={selectedVideo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Open in YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Instant Purchase / Detail Modal */}
      {purchaseProduct && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
          <div className="bg-[#0a0f1c] border border-white/15 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl p-6 sm:p-8 relative">
            <button
              onClick={() => {
                setPurchaseProduct(null);
                setSelectedTier(null);
              }}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="px-2.5 py-1 rounded-full bg-teal-400/10 border border-teal-400/30 text-[10px] font-bold text-teal-300">
              {purchaseProduct.badge[lang]}
            </span>

            <h3 className="text-2xl font-extrabold text-white mt-3">
              {purchaseProduct.title}
            </h3>

            {selectedTier && (
              <div className="mt-2 text-xs font-semibold text-amber-300">
                Wybrany wariant: {selectedTier.name} — {selectedTier.price}
              </div>
            )}

            <div className="mt-4 p-4 rounded-2xl bg-black/50 border border-white/10 flex items-baseline justify-between">
              <div>
                <p className="text-xs text-zinc-400">{lang === "pl" ? "Cena katalogowa" : "Catalog Price"}</p>
                <p className="text-3xl font-extrabold text-teal-300 mt-0.5">
                  {selectedTier ? selectedTier.price : `€${purchaseProduct.priceEur.toLocaleString()}`}
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-semibold">B2B Direct Dispatch</span>
            </div>

            <div className="mt-5 space-y-3">
              <p className="text-xs text-zinc-300 leading-relaxed">
                {lang === "pl"
                  ? "Dedykowany kontakt do Pauliny Jakubowskiej (INCANTO / OJJJA.XYZ):"
                  : "Direct contact to Paulina Jakubowska (INCANTO / OJJJA.XYZ):"}
              </p>

              <div className="p-3.5 rounded-xl bg-zinc-950 border border-white/10 text-xs font-mono space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Reply to:</span>
                  <a href={`mailto:${MONETIZATION_INFO.replyToEmail}`} className="text-teal-300 font-bold hover:underline">{MONETIZATION_INFO.replyToEmail}</a>
                </div>
                <div className="flex justify-between items-center border-t border-white/5 pt-1.5">
                  <span className="text-zinc-400">WhatsApp:</span>
                  <a href={MONETIZATION_INFO.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-bold hover:underline">{MONETIZATION_INFO.whatsapp}</a>
                </div>
                <div className="flex flex-col gap-0.5 border-t border-white/5 pt-2">
                  <span className="text-zinc-400 text-[10px]">ETH (ERC-20):</span>
                  <span className="text-amber-300 text-[10px] break-all select-all font-mono">{MONETIZATION_INFO.crypto.eth}</span>
                </div>
                <div className="flex flex-col gap-0.5 border-t border-white/5 pt-2">
                  <span className="text-zinc-400 text-[10px]">Bitcoin (BTC):</span>
                  <span className="text-amber-300 text-[10px] break-all select-all font-mono">{MONETIZATION_INFO.crypto.btc}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <a
                href={`mailto:${MONETIZATION_INFO.replyToEmail}?subject=${encodeURIComponent(`Inquiry: ${purchaseProduct.title} - ${selectedTier?.name || "Enterprise"}`)}&body=${encodeURIComponent(`Dzień dobry,\n\nJestem zainteresowany wdrożeniem ${purchaseProduct.title} (${selectedTier?.name || "Oferta Enterprise"}).\nProszę o kontakt i szczegóły wdrożenia / NDA.\n\nPozdrawiam,`)}`}
                className="flex-1 py-3 bg-teal-400 hover:bg-teal-300 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-teal-500/20 text-center transition"
              >
                {lang === "pl" ? "Wyślij E-mail z Zapytaniem" : "Send Inquiry Email"}
              </a>
              <button
                onClick={() => {
                  setPurchaseProduct(null);
                  setSelectedTier(null);
                }}
                className="px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white"
              >
                {lang === "pl" ? "Zamknij" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
