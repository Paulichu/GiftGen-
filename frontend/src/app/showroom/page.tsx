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
  ArrowLeft
} from "lucide-react";
import {
  Language,
  PRODUCTS,
  VERIFIED_VIDEOS,
  MONETIZATION_INFO,
  ProductItem,
  VideoItem
} from "@/data/portfolio";

export default function ShowroomPage() {
  const [lang, setLang] = useState<Language>("pl");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [purchaseProduct, setPurchaseProduct] = useState<ProductItem | null>(null);
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
      pl: "OFICJALNE PORTFOLIO IP & AKTYWA TECHNOLOGICZNE",
      en: "OFFICIAL IP PORTFOLIO & SOVEREIGN TECH ASSETS",
      de: "OFFIZIELLES IP-PORTFOLIO & SOUVERÄNE TECH-ASSETS"
    },
    titleMain: {
      pl: "Twoja intencja. Suwerenna technologia.",
      en: "Your intent. Sovereign technology.",
      de: "Deine Absicht. Souveräne Technologie."
    },
    titleSub: {
      pl: "Gotowe aktywa AI, BCI & Enterprise OS do monetyzacji.",
      en: "Production-ready AI, BCI & Enterprise OS assets.",
      de: "Produktionsbereite KI-, BCI- & Enterprise-OS-Assets."
    },
    lead: {
      pl: "Portfolio licencjonowanego oprogramowania Incanto Soma i @ojjja.site. Kup komercyjne licencje na własność, wdrażaj suwerenne systemy bez vendor-lock lub zamów audyt zgodności z EU AI Act.",
      en: "Licensed software ecosystem by Incanto Soma and @ojjja.site. Purchase perpetual commercial licenses, deploy sovereign systems with zero vendor-lock, or book an EU AI Act audit.",
      de: "Lizenziertes Software-Ökosystem von Incanto Soma und @ojjja.site. Erwerben Sie unbefristete Lizenzen, betreiben Sie souveräne Systeme ohne Vendor-Lock oder buchen Sie ein EU-AI-Act-Audit."
    },
    ctaBuy: {
      pl: "Kup Licencję Komercyjną",
      en: "Buy Commercial License",
      de: "Gewerbliche Lizenz Kaufen"
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
          <span>{MONETIZATION_INFO.seller}</span>
        </span>
        <span className="text-zinc-600">•</span>
        <span>{MONETIZATION_INFO.registeredCity}</span>
        <span className="text-zinc-600">•</span>
        <a href={`mailto:${MONETIZATION_INFO.contactEmail}`} className="underline hover:text-white transition">
          {MONETIZATION_INFO.contactEmail}
        </a>
      </div>

      {/* Main Header / Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#05060b]/90 border-b border-white/[0.08] px-6 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 to-violet-600 flex items-center justify-center text-black font-extrabold shadow-lg shadow-teal-500/20">
            I
          </div>
          <div>
            <div className="text-base font-extrabold tracking-wide leading-none text-white">
              INCANTO SOMA
            </div>
            <div className="text-[10px] tracking-[0.2em] text-teal-400 font-semibold mt-1">
              @OJJJA.SITE • IP ECOSYSTEM
            </div>
          </div>
        </div>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs text-zinc-400 font-medium">
          <a href="#products" className="hover:text-white transition">
            {lang === "pl" ? "Produkty & Cennik" : lang === "de" ? "Produkte & Preise" : "Products & Pricing"}
          </a>
          <a href="#demos" className="hover:text-white transition">
            {lang === "pl" ? "Wideoteka Dema" : lang === "de" ? "Video-Demos" : "Video Demos"}
          </a>
          <a href="#inquiry" className="hover:text-white transition">
            {lang === "pl" ? "Zamówienia B2B" : lang === "de" ? "B2B-Aufträge" : "B2B Orders"}
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

          <button
            onClick={() => setPurchaseProduct(PRODUCTS[0])}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-400 to-emerald-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-teal-500/20 hover:brightness-110 transition"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>{lang === "pl" ? "Kup Licencję" : lang === "de" ? "Lizenz Kaufen" : "Buy License"}</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-14 px-6 lg:px-12 max-w-5xl mx-auto text-center flex flex-col items-center">
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
          <button
            onClick={() => setPurchaseProduct(PRODUCTS[0])}
            className="w-full sm:w-auto px-7 py-3.5 bg-teal-400 hover:bg-teal-300 text-black font-extrabold text-sm rounded-2xl shadow-xl shadow-teal-500/25 transition flex items-center justify-center gap-2"
          >
            <Award className="w-4 h-4" />
            <span>{heroCopy.ctaBuy[lang]}</span>
          </button>
          <a
            href="#demos"
            className="w-full sm:w-auto px-7 py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-semibold text-sm rounded-2xl transition flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 text-teal-400" />
            <span>{heroCopy.ctaDemos[lang]}</span>
          </a>
        </div>

        {/* Quick Highlights */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-4xl pt-8 border-t border-white/[0.08] text-left">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <p className="text-[11px] text-zinc-400 uppercase tracking-widest font-mono">Status</p>
            <p className="text-sm font-bold text-emerald-400 mt-1">Live &amp; Verified</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <p className="text-[11px] text-zinc-400 uppercase tracking-widest font-mono">Licencja</p>
            <p className="text-sm font-bold text-white mt-1">Wieczysta / SaaS</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <p className="text-[11px] text-zinc-400 uppercase tracking-widest font-mono">Rozliczenie</p>
            <p className="text-sm font-bold text-amber-300 mt-1">Faktura VAT UE</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <p className="text-[11px] text-zinc-400 uppercase tracking-widest font-mono">Weryfikacja EU</p>
            <p className="text-sm font-bold text-violet-400 mt-1">CBL-8819-EU</p>
          </div>
        </div>
      </section>

      {/* Product Catalog Section */}
      <section id="products" className="py-16 px-6 lg:px-12 max-w-6xl mx-auto border-t border-white/[0.08]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-xs tracking-[0.2em] text-teal-400 font-bold uppercase">
              {lang === "pl" ? "Cennik Komercyjny" : lang === "de" ? "Kommerzielle Preisliste" : "Commercial Pricing"}
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
              {lang === "pl" ? "Wybierz produkt i zacznij generować dochód" : lang === "de" ? "Wählen Sie ein Produkt und starten Sie die Monetarisierung" : "Select an asset & start generating revenue"}
            </h2>
            <p className="text-sm text-zinc-400 mt-2 max-w-xl">
              {MONETIZATION_INFO.invoicingNote[lang]}
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: heroCopy.filterAll[lang] },
              { id: "bci", label: "BCI & Bio-Soma" },
              { id: "compliance", label: "Compliance & Audit" },
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
                      {p.period ? (lang === "pl" ? `/${p.period === "month" ? "miesiąc" : "jednorazowo"}` : `/${p.period}`) : ""}
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
                      <span className="text-3xl font-extrabold text-white">€{p.priceEur}</span>
                      <span className="text-xs text-zinc-400 ml-1.5 font-mono">(${p.priceUsd})</span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Instant Access
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    {p.description[lang]}
                  </p>

                  <ul className="space-y-2 pt-3 border-t border-white/[0.06] text-xs text-zinc-300">
                    {p.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                        <span>{f[lang]}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06] flex flex-col gap-2">
                  <button
                    onClick={() => setPurchaseProduct(p)}
                    className="w-full py-3 bg-teal-400 hover:bg-teal-300 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-teal-500/20 transition flex items-center justify-center gap-2"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>{lang === "pl" ? `Kup Licencję (€${p.priceEur})` : lang === "de" ? `Lizenz Kaufen (€${p.priceEur})` : `Buy License (€${p.priceEur})`}</span>
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

      {/* Direct Inquiry & Invoicing Section */}
      <section id="inquiry" className="py-16 px-6 lg:px-12 max-w-6xl mx-auto border-t border-white/[0.08]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <div className="text-xs tracking-[0.2em] text-amber-400 font-bold uppercase">
              {lang === "pl" ? "Natychmiastowa Realizacja" : lang === "de" ? "Sofortige Abwicklung" : "Instant Fulfillment"}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              {lang === "pl" ? "Sposoby zamówień komercyjnych i rozliczeń" : lang === "de" ? "Gewerbliche Aufträge & Abrechnung" : "Commercial dispatch & invoicing"}
            </h2>
            <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
              {lang === "pl"
                ? "Dostarczamy pełne kody źródłowe, wdrożenia chmurowe oraz audyty zgodności. Wystawiamy faktury VAT UE (Reverse Charge) oraz obsługujemy bezpośrednie transfery."
                : lang === "de"
                ? "Wir liefern vollständigen Quellcode, Cloud-Bereitstellung und Compliance-Audits. Wir stellen EU-USt-Rechnungen (Reverse Charge) aus."
                : "We deliver full source code, cloud deployment, and regulatory audits. Corporate EU VAT wire transfers with reverse charge supported."}
            </p>

            <div className="mt-6 p-5 rounded-2xl bg-zinc-950 border border-white/[0.08] space-y-3">
              <div className="flex items-center gap-2 text-xs text-teal-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Bezpośredni kontakt ze sprzedawcą:</span>
              </div>
              <p className="text-xs text-zinc-300">
                E-mail: <a href={`mailto:${MONETIZATION_INFO.contactEmail}`} className="text-white font-bold underline">{MONETIZATION_INFO.contactEmail}</a>
              </p>
              <p className="text-xs text-zinc-400">
                Lokalizacja rejestracji IP: {MONETIZATION_INFO.registeredCity}
              </p>
            </div>
          </div>

          {/* Direct Purchase Dispatch Form */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0a0f1c] border border-white/[0.08] shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-teal-400" />
              <span>{lang === "pl" ? "Zamówienie / Zapytanie o Licencję" : lang === "de" ? "Bestellung / Lizenzanfrage" : "Order / License Inquiry"}</span>
            </h3>

            {orderSent ? (
              <div className="mt-6 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <h4 className="text-base font-bold text-white">
                  {lang === "pl" ? "Zapytanie wysłane pomyślnie!" : lang === "de" ? "Anfrage erfolgreich gesendet!" : "Inquiry sent successfully!"}
                </h4>
                <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                  {lang === "pl"
                    ? `Dziękujemy! Otrzymasz potwierdzenie oraz dane do transferu na podany adres: ${buyerEmail}. W razie pilnych pytań pisz na admin@ojjja.site.`
                    : lang === "de"
                    ? `Vielen Dank! Sie erhalten die Überweisungsdaten an ${buyerEmail}. Bei Fragen schreiben Sie an admin@ojjja.site.`
                    : `Thank you! Transfer details and confirmation will arrive at ${buyerEmail}. For urgent queries: admin@ojjja.site.`}
                </p>
                <button
                  onClick={() => setOrderSent(false)}
                  className="mt-4 px-4 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs font-semibold text-zinc-300"
                >
                  {lang === "pl" ? "Wyślij kolejne zapytanie" : lang === "de" ? "Weitere Anfrage senden" : "Send another inquiry"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleOrderSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">
                    {lang === "pl" ? "Twój adres e-mail (do faktury / licencji)" : lang === "de" ? "Ihre E-Mail-Adresse" : "Your email address"}
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
                    {lang === "pl" ? "Wybrany produkt" : lang === "de" ? "Ausgewähltes Produkt" : "Selected Asset"}
                  </label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-teal-400"
                  >
                    {PRODUCTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} — €{p.priceEur} (${p.priceUsd})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">
                    {lang === "pl" ? "Dodatkowe uwagi / dane do faktury (opcjonalnie)" : lang === "de" ? "Zusätzliche Notiz / Rechnungsdaten" : "Additional notes / invoicing details"}
                  </label>
                  <textarea
                    rows={2}
                    value={buyerNote}
                    onChange={(e) => setBuyerNote(e.target.value)}
                    placeholder={lang === "pl" ? "NIP / Nazwa firmy / Specjalne wymagania..." : "VAT ID / Company Name..."}
                    className="w-full px-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-teal-400 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-teal-400 hover:bg-teal-300 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-teal-500/20 transition flex items-center justify-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  <span>{lang === "pl" ? "Wyślij Zamówienie i Odbierz Dostęp" : lang === "de" ? "Bestellung Absenden & Zugriff Erhalten" : "Send Order & Receive Access"}</span>
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
              I
            </div>
            <div>
              <p className="font-bold text-white tracking-wide">INCANTO SOMA • @OJJJA.SITE</p>
              <p className="text-[11px] text-zinc-500">Monheim am Rhein, NRW, Germany • admin@ojjja.site</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <a href="https://www.youtube.com/@paulajak8276" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
              YouTube @paulajak8276
            </a>
            <a href="mailto:admin@ojjja.site" className="hover:text-white transition">
              admin@ojjja.site
            </a>
            <a href="mailto:ip@ojjja.site" className="hover:text-white transition">
              ip@ojjja.site
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

      {/* Instant Purchase Modal */}
      {purchaseProduct && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
          <div className="bg-[#0a0f1c] border border-white/15 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl p-6 sm:p-8 relative">
            <button
              onClick={() => setPurchaseProduct(null)}
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

            <div className="mt-4 p-4 rounded-2xl bg-black/50 border border-white/10 flex items-baseline justify-between">
              <div>
                <p className="text-xs text-zinc-400">{lang === "pl" ? "Cena licencji wieczystej" : "Perpetual License Price"}</p>
                <p className="text-3xl font-extrabold text-teal-300 mt-0.5">€{purchaseProduct.priceEur} <span className="text-sm text-zinc-400 font-mono">(${purchaseProduct.priceUsd})</span></p>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-semibold">Immediate Transfer</span>
            </div>

            <div className="mt-5 space-y-3">
              <p className="text-xs text-zinc-300 leading-relaxed">
                {lang === "pl"
                  ? "Dostępne metody natychmiastowej płatności i zamówienia:"
                  : "Available instant payment methods and direct order options:"}
              </p>

              <div className="p-3.5 rounded-xl bg-zinc-950 border border-white/10 text-xs font-mono space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">PayPal / E-mail:</span>
                  <span className="text-teal-300 font-bold">{MONETIZATION_INFO.paypalEmail}</span>
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
                href={`mailto:${MONETIZATION_INFO.contactEmail}?subject=Licence Purchase: ${encodeURIComponent(purchaseProduct.title)}&body=Chce zakupic licencje na ${encodeURIComponent(purchaseProduct.title)} (€${purchaseProduct.priceEur}). Prosze o dane do przelewu / fakture.`}
                className="flex-1 py-3 bg-teal-400 hover:bg-teal-300 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-teal-500/20 text-center transition"
              >
                {lang === "pl" ? "Wyślij E-mail z Zamówieniem" : "Send Purchase Email"}
              </a>
              <button
                onClick={() => setPurchaseProduct(null)}
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
