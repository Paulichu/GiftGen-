export type Language = "pl" | "en" | "de";

export interface TriText {
  pl: string;
  en: string;
  de: string;
}

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  billing: TriText;
  description: TriText;
  highlights: TriText[];
}

export interface ProductItem {
  id: string;
  title: string;
  category: "bci" | "compliance" | "ai_agents" | "saas" | "crm";
  badge: TriText;
  priceEur: number;
  priceUsd: number;
  period?: "one-time" | "month" | "year";
  tagline: TriText;
  description: TriText;
  features: TriText[];
  pricingTiers?: PricingTier[];
  architectureSpecs?: {
    layer: string;
    tech: string;
    detail: string;
  }[];
  primaryVideoId: string;
  relatedVideoIds?: string[];
}

export interface VideoItem {
  id: string;
  title: string;
  author: string;
  url: string;
  thumbnail: string;
  category: string;
  desc: TriText;
}

export const MONETIZATION_INFO = {
  founder: "Paulina Jakubowska",
  role: "Founder & Lead Architect",
  company: "INCANTO / OJJJA.XYZ",
  seller: "Paulina Jakubowska • INCANTO / OJJJA.XYZ",
  registeredCity: "NRW, Germany (100% remote, online call / Teams)",
  replyToEmail: "compliance@ojjja.site",
  contactEmail: "compliance@ojjja.site",
  directEmail: "admin@ojjja.site",
  ipEmail: "ip@ojjja.site",
  supportEmail: "ip@ojjja.site",
  paypalEmail: "admin@ojjja.site",
  whatsapp: "+49 152 10200523",
  whatsappUrl: "https://wa.me/4915210200523",
  linkedin: "https://www.linkedin.com/in/paulina-jakubowska-65712b163",
  crypto: {
    eth: "0x89ee3f2a2a7ddc9de821f93623aab58593cb1b59",
    btc: "bc1q3vkqn8mgnpvz9cj07scjpz65wn8j7fl9akp24p"
  },
  invoicingNote: {
    pl: "Faktury VAT UE (Reverse Charge) dla firm, bezpośredni kontakt WhatsApp/Teams, PayPal i krypto (ETH/BTC).",
    en: "EU VAT Invoices (Reverse Charge) for businesses, direct WhatsApp/Teams contact, PayPal & crypto (ETH/BTC).",
    de: "EU-USt-Rechnungen (Reverse Charge) für Unternehmen, direkter WhatsApp/Teams-Kontakt, PayPal und Krypto (ETH/BTC)."
  }
};

export const PRODUCTS: ProductItem[] = [
  {
    id: "compliance-twin-2",
    title: "Compliance Twin 2.0 — Autonomous AI Agent",
    category: "compliance",
    badge: {
      pl: "Enterprise Offer 2026",
      en: "Enterprise Offer 2026",
      de: "Enterprise Offer 2026"
    },
    priceEur: 150000,
    priceUsd: 160000,
    period: "year",
    tagline: {
      pl: "Autonomiczny agent regulacyjny: EU AI Act, GDPR, HIPAA, ISO 27001, SOC 2 Ready.",
      en: "Autonomous AI agent for regulatory obligations: EU AI Act, GDPR, HIPAA, ISO 27001, SOC 2 Ready.",
      de: "Autonomer KI-Agent für regulatorische Vorgaben: EU AI Act, DSGVO, HIPAA, ISO 27001, SOC 2 Ready."
    },
    description: {
      pl: "Cyfrowy bliźniak zgodności regulacyjnej inspirowany projektem Stanford Law School ComplianceTwin i walidowany przez COMBO. Autonomicznie czyta przepisy prawa, skanuje infrastrukturę IT w czasie rzeczywistym i generuje raporty dla regulatorów. Zmniejsza koszty audytów o 75% i chroni przed karami do 20 mln €.",
      en: "Digital regulatory compliance twin inspired by Stanford Law School ComplianceTwin project & validated by COMBO. Reads regulations autonomously, scans IT infrastructure real-time, and generates regulator-ready PDF/Excel reports. Slashes compliance time/cost by 75% and solves €20M fines.",
      de: "Digitaler Compliance-Zwilling inspiriert vom Stanford Law School ComplianceTwin-Projekt und validiert durch COMBO. Liest Vorschriften autonom, scannt IT-Infrastruktur in Echtzeit und erstellt behördenfertige Berichte. Senkt Zeit/Kosten um 75% und schützt vor Strafen bis 20 Mio. €."
    },
    features: [
      { pl: "Działa w 100% STANDALONE (niepowiązany z innymi pakietami)", en: "Sold 100% STANDALONE to protect pricing", de: "100% STANDALONE-Architektur ohne Bundle-Zwang" },
      { pl: "Backend: FastAPI + Multi-tenant z separacją schematów per klient", en: "Backend: FastAPI + Multi-tenant zero cross-leak schema", de: "Backend: FastAPI + Multi-tenant mandantensicher" },
      { pl: "Baza: PostgreSQL + TimescaleDB + WORM niezmienny audit log", en: "DB: PostgreSQL + TimescaleDB + WORM immutable audit log", de: "DB: PostgreSQL + TimescaleDB + WORM unveränderlicher Audit-Log" },
      { pl: "Skaner: Nuclei + Osquery + Prowler + ScoutSuite + dedykowane reguły AI Act", en: "Scanner: Nuclei + Osquery + Prowler + ScoutSuite + custom AI Act rules", de: "Scanner: Nuclei + Osquery + Prowler + ScoutSuite + KI-Regeln" },
      { pl: "Silnik AI: DeepSeek / Claude + lokalna Llama 3 (RAG z lokalną rezydencją danych w UE)", en: "AI Engine: DeepSeek / Claude + Local Llama 3 + RAG (EU data residency)", de: "KI-Engine: DeepSeek / Claude + Lokale Llama 3 + RAG (EU-Datenresidenz)" },
      { pl: "Bezpieczeństwo: AES-256 + PQC Kyber-like (odporność kwantowa, CNSA 2.0)", en: "Security: AES-256 + PQC Kyber-like quantum-resistant CNSA 2.0", de: "Sicherheit: AES-256 + PQC Kyber-like quantensicher CNSA 2.0" },
      { pl: "Orkiestracja: Celery / Redis + Evidence Locker + Human-in-the-loop", en: "Orchestration: Celery / Redis + Evidence Locker + Human-in-the-loop approvals", de: "Orchestrierung: Celery / Redis + Evidence Locker + Freigabeschleife" },
      { pl: "Wdrożenie: AWS / Azure / GCP lub On-Premise dla banków i fintechów z umową DPA", en: "Hosting: AWS / Azure / GCP or On-Premises for banking with custom DPA", de: "Hosting: AWS / Azure / GCP oder On-Premise für Banken inkl. ADV" }
    ],
    pricingTiers: [
      {
        id: "starter",
        name: "Starter",
        price: "€150,000 / year",
        billing: { pl: "rocznie", en: "per year", de: "pro Jahr" },
        description: {
          pl: "1 framework regulacyjny (np. samo GDPR lub EU AI Act), do 5 000 monitorowanych zasobów, podstawowy kokpit.",
          en: "1 regulatory framework (e.g. GDPR only), 5k assets, basic dashboard.",
          de: "1 Regelwerk (z. B. nur DSGVO), 5.000 Assets, Basis-Dashboard."
        },
        highlights: [
          { pl: "1 framework (np. GDPR lub AI Act)", en: "1 framework (e.g. GDPR)", de: "1 Regelwerk (z. B. DSGVO)" },
          { pl: "Do 5 000 zasobów IT", en: "5k assets covered", de: "Bis zu 5.000 Assets" },
          { pl: "Podstawowy kokpit analityczny", en: "Basic dashboard", de: "Basis-Dashboard" }
        ]
      },
      {
        id: "growth",
        name: "Growth",
        price: "€350,000 / year",
        billing: { pl: "rocznie", en: "per year", de: "pro Jahr" },
        description: {
          pl: "3 frameworki (GDPR + EU AI Act + NIS2 / ISO 27001), 25 000 zasobów, integracje Jira/Slack, SLA 24h.",
          en: "3 regulatory frameworks, 25k assets, Jira/Slack integrations, 24h SLA.",
          de: "3 Regelwerke, 25.000 Assets, Jira/Slack-Integrationen, 24h SLA."
        },
        highlights: [
          { pl: "3 frameworki regulacyjne", en: "3 frameworks", de: "3 Regelwerke" },
          { pl: "Do 25 000 zasobów IT", en: "25k assets covered", de: "Bis zu 25.000 Assets" },
          { pl: "Integracje Jira + Slack + alerty", en: "Jira / Slack integrations", de: "Jira / Slack-Integrationen" },
          { pl: "Gwarantowane SLA 24h", en: "24h SLA response", de: "24h SLA-Reaktionszeit" }
        ]
      },
      {
        id: "enterprise-perpetual",
        name: "Enterprise Perpetual (IP Transfer)",
        price: "$1,000,000",
        billing: { pl: "jednorazowo (wieczysta licencja)", en: "one-time (perpetual)", de: "einmalig (unbefristet)" },
        description: {
          pl: "Pełny kod źródłowy + przeniesienie praw IP + pełna dokumentacja techniczna + 2h dedykowanego szkolenia zespołu IT + 30 dni wdrożenia i wsparcia + wieczysta licencja komercyjna. Opcjonalne wsparcie/aktualizacje: $150k/rok.",
          en: "Full source code + full IP transfer + documentation + 2h IT team training + 30-day post-deployment support + perpetual commercial licence. Optional $150k/year updates/support.",
          de: "Vollständiger Quellcode + IP-Übertragung + Dokumentation + 2h Team-Schulung + 30 Tage Bereitstellungssupport + unbefristete Lizenz. Optional $150k/Jahr Support."
        },
        highlights: [
          { pl: "Kompletny kod źródłowy na własność (Full IP)", en: "Full source code + IP ownership", de: "Kompletter Quellcode + IP-Eigentum" },
          { pl: "30 dni dedykowanego wsparcia po wdrożeniu", en: "30-day post-deployment support", de: "30 Tage dedizierter Bereitstellungssupport" },
          { pl: "2h sesja szkoleniowa online dla zespołu IT", en: "2h online IT training session", de: "2h Online-Schulung für das IT-Team" },
          { pl: "Możliwość 100% self-host on-premise", en: "100% self-hosted on-premise capable", de: "100% On-Premise Self-Hosting fähig" }
        ]
      },
      {
        id: "enterprise-saas",
        name: "Enterprise SaaS",
        price: "$500,000 / year",
        billing: { pl: "rocznie", en: "per year", de: "pro Jahr" },
        description: {
          pl: "Wszystkie frameworki (AI Act, GDPR, HIPAA, ISO 27001, SOC 2), nielimitowane zasoby, opcja wdrożenia on-premise, dedykowana umowa DPA, gwarantowane SLA 4h, kryptograficzny evidence locker, human-in-the-loop.",
          en: "All frameworks, unlimited assets, on-prem option, custom DPA, 4h SLA, immutable evidence locker, human-in-the-loop approvals.",
          de: "Alle Regelwerke, unbegrenzte Assets, On-Premise-Option, DPA/ADV-Vertrag, 4h SLA, Evidence Locker, Freigabeschleife."
        },
        highlights: [
          { pl: "Wszystkie frameworki bez limitu zasobów", en: "All frameworks, unlimited assets", de: "Alle Regelwerke, unbegrenzte Assets" },
          { pl: "Rygorystyczne SLA 4h dla banków i enterprise", en: "Rigorous 4h SLA", de: "Strenges 4h Enterprise-SLA" },
          { pl: "Evidence locker z niezmiennym audytem WORM", en: "Cryptographic evidence locker", de: "Kryptografischer Evidence Locker" },
          { pl: "Dedykowana umowa powierzenia danych (DPA)", en: "Dedicated corporate DPA", de: "Dedizierter ADV/DPA-Vertrag" }
        ]
      }
    ],
    architectureSpecs: [
      { layer: "Frontend", tech: "React PWA + RBAC UI", detail: "Added roles: CISO/DPO/Auditor/Dev, ABAC policies" },
      { layer: "Backend", tech: "FastAPI + Multi-tenant", detail: "Tenant isolation, per-client DB schema, zero cross-leak" },
      { layer: "Database", tech: "PostgreSQL + TimescaleDB + WORM", detail: "Immutable audit log, TimescaleDB for scan history" },
      { layer: "Scanner", tech: "Nuclei + Osquery + Prowler + ScoutSuite", detail: "Cloud scan (AWS/Azure/GCP), IaC, CVE, custom AI Act checks" },
      { layer: "AI Engine", tech: "DeepSeek / Claude + Local Llama 3 + RAG", detail: "Local LLM option for EU data residency, RAG on AI Act/GDPR texts" },
      { layer: "Security", tech: "AES-256 + PQC Kyber-like (Quantum Vault IP)", detail: "Post-quantum encryption, CNSA 2.0 compliant" },
      { layer: "Orchestration", tech: "Celery / Redis + Evidence Locker", detail: "Encrypted evidence locker, human-in-the-loop approvals" },
      { layer: "Hosting", tech: "AWS / Azure / GCP + On-Prem Option", detail: "On-prem for banks, DPA ready" }
    ],
    primaryVideoId: "SQLkpb5MQ1M",
    relatedVideoIds: ["C5rWMaBir6g"]
  },
  {
    id: "neuro-soma-os",
    title: "INCANTO NEURO-SOMA OS",
    category: "bci",
    badge: {
      pl: "BCI & Bio-Feedback",
      en: "BCI & Bio-Feedback",
      de: "BCI & Bio-Feedback"
    },
    priceEur: 490,
    priceUsd: 530,
    period: "one-time",
    tagline: {
      pl: "Environment-Aware BCI OS v2.4 — Adaptacja środowiska w czasie rzeczywistym.",
      en: "Environment-Aware BCI OS v2.4 — Real-time environmental adaptation.",
      de: "Environment-Aware BCI OS v2.4 — Echtzeit-Umgebungsanpassung."
    },
    description: {
      pl: "Innowacyjny system łączący odczyty fal mózgowych (EEG Alpha/Theta/Delta/Gamma) z czujnikami środowiskowymi (światło, dźwięk, CO₂, temp, wilgotność) oraz pacerem oddechowym 4-7-8.",
      en: "Breakthrough system linking neural brainwaves (EEG Alpha/Theta/Delta/Gamma) with environmental room sensors (light, noise, CO₂, temp, humidity) and 4-7-8 breathing pacer.",
      de: "Innovatives System, das Gehirnwellen-Messungen (EEG Alpha/Theta/Delta/Gamma) mit Raumsensoren (Licht, Lärm, CO₂, Temp, Feuchte) und 4-7-8-Atem-Pacer verbindet."
    },
    features: [
      { pl: "Prawdziwa wizualizacja Canvas EEG na 8 kanałach", en: "Real-time 8-channel EEG Canvas waveform", de: "Echtzeit-8-Kanal-EEG-Canvas-Wellenform" },
      { pl: "Pętla adaptacji parametrów pokoju (Lux, dB, °C, PPM)", en: "Room adaptation feedback loop (Lux, dB, °C, PPM)", de: "Raumanpassungs-Regelkreis (Lux, dB, °C, PPM)" },
      { pl: "6 gotowych protokołów (Calm Focus, Deep Learning 92, Sleep)", en: "6 pre-loaded protocols (Calm Focus, Deep Learning 92, Sleep)", de: "6 vorkonfigurierte Protokolle (Calm Focus, Deep Learning 92, Sleep)" },
      { pl: "Pełny kod źródłowy z komercyjną licencją wieczystą", en: "Full source code with commercial perpetual license", de: "Vollständiger Quellcode mit unbefristeter Lizenz" }
    ],
    primaryVideoId: "3Y0uV3A7pXE",
    relatedVideoIds: ["auegpSVPblc", "rJDppY2OWvI", "eI7d2onteHA"]
  },
  {
    id: "sovereign-terminal",
    title: "Sovereign Intel Terminal (ASI)",
    category: "ai_agents",
    badge: {
      pl: "Kompilator Intencji",
      en: "Intent Compiler",
      de: "Intent-Compiler"
    },
    priceEur: 990,
    priceUsd: 1080,
    period: "one-time",
    tagline: {
      pl: "Twoja intencja. Twoja technologia. Twoja własność — niezależna od platform.",
      en: "Your intent. Your tech. Your ownership — independent of walled gardens.",
      de: "Deine Absicht. Deine Technologie. Dein Eigentum — unabhängig von Plattformen."
    },
    description: {
      pl: "Wyspecjalizowane środowisko przekładające naturalną intencję biznesową na suwerenne oprogramowanie bez uzależnienia od abonamentów vendor-lock.",
      en: "Specialized environment compiling natural business intent directly into sovereign software assets without vendor lock-in.",
      de: "Spezialisiertes System, das unternehmerische Absichten direkt in souveräne Software-Assets ohne Vendor-Lock übersetzt."
    },
    features: [
      { pl: "Heurystyczny parser intencji w czystym JavaScript", en: "Pure JavaScript heuristic intent parser", de: "Heuristischer Intent-Parser in modernem JS" },
      { pl: "Architektura Zero-Vendor-Lock (działa offline i on-premise)", en: "Zero-Vendor-Lock architecture (runs offline / on-premise)", de: "Zero-Vendor-Lock (funktioniert offline / on-premise)" },
      { pl: "Wsparcie dla agentów multimodalnych i lokalnych LLM", en: "Native support for multimodal agents & local LLMs", de: "Native Unterstützung für multimodale Agenten & lokale LLMs" }
    ],
    primaryVideoId: "3Jsft-tXi-0",
    relatedVideoIds: ["EsaaKL3H5js", "GPKkYEmWMoY", "FTRq5ZCZed4"]
  },
  {
    id: "makler-app",
    title: "AI Immobilien Makler App",
    category: "saas",
    badge: {
      pl: "SaaS dla Nieruchomości",
      en: "Real Estate SaaS",
      de: "Immobilien-KI-SaaS"
    },
    priceEur: 149,
    priceUsd: 160,
    period: "month",
    tagline: {
      pl: "Inteligentny system operacyjny dla biur i agentów nieruchomości.",
      en: "Intelligent operating system for real estate brokers and property agencies.",
      de: "Intelligentes Betriebssystem für Immobilienmakler und Agenturen."
    },
    description: {
      pl: "Automatyzuje wyceny, tworzenie ofert wielojęzycznych, kwalifikację kupujących oraz wirtualne prezentacje obiektów.",
      en: "Automates property valuations, multi-lingual listing generation, buyer qualification, and virtual staging.",
      de: "Automatisiert Immobilienbewertungen, mehrsprachige Exposé-Erstellung, Käufer-Qualifizierung und virtuelle Besichtigungen."
    },
    features: [
      { pl: "Generator ekspertyz i opisów nieruchomości (PL / EN / DE)", en: "Multi-language listing & valuation generator (PL/EN/DE)", de: "Mehrsprachiger Exposé- & Bewertungsmakler (PL/EN/DE)" },
      { pl: "Kwalifikacja leadów 24/7 przez agenta konwersacyjnego", en: "24/7 buyer qualification via conversational agent", de: "24/7 Käuferqualifizierung durch Konversations-Agenten" },
      { pl: "Integracja z portalami i bazami CRM", en: "Direct integration with portals and CRM databases", de: "Direkte Anbindung an Portale und CRM-Datenbanken" }
    ],
    primaryVideoId: "3vxcuSUf5EU",
    relatedVideoIds: ["aKo9RGiYOt0"]
  },
  {
    id: "quantum-crm",
    title: "Quantum CRM & Automation Hub",
    category: "crm",
    badge: {
      pl: "Business OS",
      en: "Business OS",
      de: "Business OS"
    },
    priceEur: 290,
    priceUsd: 315,
    period: "one-time",
    tagline: {
      pl: "Szybki CRM nowej generacji z autonomicznymi pipeline'ami sprzedaży.",
      en: "Next-gen agile CRM featuring autonomous sales pipelines.",
      de: "Agiles CRM der nächsten Generation mit autonomen Vertriebspipelines."
    },
    description: {
      pl: "Eliminuje ręczne wprowadzanie danych. Automatyzuje follow-upy, dispatch zadań oraz prognozowanie przychodów.",
      en: "Eliminates manual entry. Automates follow-ups, lead dispatching, and monthly revenue forecasting.",
      de: "Eliminiert manuelle Datenpflege. Automatisiert Follow-ups, Aufgabenverteilung und Umsatzprognosen."
    },
    features: [
      { pl: "Tablica Kanban z predykcją domykania umów", en: "Kanban pipeline with deal closing probability", de: "Kanban-Pipeline mit Abschlusswahrscheinlichkeit" },
      { pl: "Zintegrowane webhooki i automatyzacja zdarzeniowa", en: "Integrated webhooks & event-driven automation", de: "Integrierte Webhooks & ereignisgesteuerte Automation" },
      { pl: "Brak opłat per-użytkownik (Self-hosted)", en: "Zero per-seat fees (Self-hosted license)", de: "Keine Gebühren pro Benutzer (Self-hosted Lizenz)" }
    ],
    primaryVideoId: "aKo9RGiYOt0",
    relatedVideoIds: ["iENXspiq_X0", "EsaaKL3H5js"]
  },
  {
    id: "yt-os-hub",
    title: "YT OS HUB • Creator Operating System",
    category: "saas",
    badge: {
      pl: "Creator OS",
      en: "Creator OS",
      de: "Creator OS"
    },
    priceEur: 89,
    priceUsd: 95,
    period: "one-time",
    tagline: {
      pl: "Kompletny panel operacyjny dla twórców YouTube: pomysły, skrypty, kalendarz, produkcja.",
      en: "Complete operating dashboard for YouTube creators: ideas, scripts, schedule, production.",
      de: "Vollständiges Betriebssystem für YouTube-Creator: Ideen, Skripte, Kalender, Produktion."
    },
    description: {
      pl: "System stworzony na bazie doświadczeń kanału Incanto Soma. Zawiera scoring pomysłów (1-100), edytor skryptów z hookami 8s, 7-krokowy checklist produkcyjny oraz moduł finansowy.",
      en: "System built from the real workflow of Incanto Soma. Features idea scoring (1-100), 8-second hook script editor, 7-step production checklist, and revenue analytics.",
      de: "System basierend auf den Workflows von Incanto Soma. Enthält Ideen-Scoring (1-100), 8s-Hook-Skripteditor, 7-Stufen-Produktions-Checkliste und Finanzmodul."
    },
    features: [
      { pl: "Edytor Hooków i struktury scenariuszy YouTube", en: "Hook & script structuring editor", de: "Hook- & Skriptstruktur-Editor" },
      { pl: "7-etapowy checklist kontroli jakości publikacji", en: "7-step publication quality checklist", de: "7-Stufen-Checkliste für Veröffentlichungsqualität" },
      { pl: "Śledzenie przychodów (AdSense, Sponsorzy, Własne produkty)", en: "Revenue tracking (AdSense, Sponsors, Own products)", de: "Umsatz-Tracking (AdSense, Sponsoren, Eigene Produkte)" }
    ],
    primaryVideoId: "6_RcfSOXEaY",
    relatedVideoIds: ["qwQSXsKWwRw", "-X4uyT1h1S4"]
  }
];

export const VERIFIED_VIDEOS: VideoItem[] = [
  {
    id: "3Jsft-tXi-0",
    title: "Souveregn Intel Terminal",
    author: "paula jak",
    url: "https://youtube.com/shorts/3Jsft-tXi-0",
    thumbnail: "https://i.ytimg.com/vi/3Jsft-tXi-0/hqdefault.jpg",
    category: "ai_agents",
    desc: {
      pl: "Demonstracja kompilatora intencji i suwerennego terminala AI.",
      en: "Live demonstration of the Intent Compiler and sovereign AI terminal.",
      de: "Live-Demonstration des Intent-Compilers und des souveränen KI-Terminals."
    }
  },
  {
    id: "3Y0uV3A7pXE",
    title: "💜 INCANTO NEURO-SOMA OS",
    author: "paula jak",
    url: "https://youtube.com/shorts/3Y0uV3A7pXE",
    thumbnail: "https://i.ytimg.com/vi/3Y0uV3A7pXE/hqdefault.jpg",
    category: "bci",
    desc: {
      pl: "Prezentacja sensorycznego systemu adaptacji otoczenia i bio-feedbacku.",
      en: "Showcase of the sensory environment adaptation & bio-feedback OS.",
      de: "Vorstellung des sensorischen Umgebungs- und Bio-Feedback-Betriebssystems."
    }
  },
  {
    id: "SQLkpb5MQ1M",
    title: "Compliance twin",
    author: "paula jak",
    url: "https://youtube.com/shorts/SQLkpb5MQ1M",
    thumbnail: "https://i.ytimg.com/vi/SQLkpb5MQ1M/hqdefault.jpg",
    category: "compliance",
    desc: {
      pl: "Prezentacja cyfrowego bliźniaka zgodności z regulacjami UE i audytu AI.",
      en: "Walkthrough of the EU digital regulatory twin and AI compliance audit.",
      de: "Überblick über den digitalen EU-Regulierungszwilling und KI-Compliance-Audit."
    }
  },
  {
    id: "3vxcuSUf5EU",
    title: "AI - Immobilien Makler App",
    author: "paula jak",
    url: "https://youtube.com/shorts/3vxcuSUf5EU",
    thumbnail: "https://i.ytimg.com/vi/3vxcuSUf5EU/hqdefault.jpg",
    category: "saas",
    desc: {
      pl: "Inteligentna aplikacja dla agentów nieruchomości i wyceny lokali.",
      en: "Smart application for real estate agents and property valuation.",
      de: "Intelligente Anwendung für Immobilienmakler und Objektbewertung."
    }
  },
  {
    id: "aKo9RGiYOt0",
    title: "Quantum CRM",
    author: "paula jak",
    url: "https://youtube.com/shorts/aKo9RGiYOt0",
    thumbnail: "https://i.ytimg.com/vi/aKo9RGiYOt0/hqdefault.jpg",
    category: "crm",
    desc: {
      pl: "Pulpit sterowania relacjami z klientami i pipeline'ami sprzedaży.",
      en: "Customer relations cockpit and autonomous sales pipeline management.",
      de: "Cockpit für Kundenbeziehungen und autonome Vertriebspipelines."
    }
  },
  {
    id: "iENXspiq_X0",
    title: "Automation Hub",
    author: "paula jak",
    url: "https://youtube.com/shorts/iENXspiq_X0",
    thumbnail: "https://i.ytimg.com/vi/iENXspiq_X0/hqdefault.jpg",
    category: "ai_agents",
    desc: {
      pl: "Węzeł wieloagentowych automatyzacji i integracji API.",
      en: "Central multi-agent automation and API integration hub.",
      de: "Zentraler Hub für Multi-Agenten-Automatisierung und API-Integration."
    }
  },
  {
    id: "EsaaKL3H5js",
    title: "Referal, agent deploy in Action",
    author: "paula jak",
    url: "https://youtube.com/shorts/EsaaKL3H5js",
    thumbnail: "https://i.ytimg.com/vi/EsaaKL3H5js/hqdefault.jpg",
    category: "ai_agents",
    desc: {
      pl: "Wdrażanie autonomicznych agentów AI i pętli poleceń w akcji.",
      en: "Deploying autonomous AI agents and referral loops in action.",
      de: "Bereitstellung autonomer KI-Agenten und Empfehlungsschleifen in Aktion."
    }
  },
  {
    id: "rJDppY2OWvI",
    title: "Headset AI",
    author: "paula jak",
    url: "https://youtube.com/shorts/rJDppY2OWvI",
    thumbnail: "https://i.ytimg.com/vi/rJDppY2OWvI/hqdefault.jpg",
    category: "bci",
    desc: {
      pl: "Interfejs BCI dla zestawów nagłownych i urządzeń ubieralnych.",
      en: "BCI interface for AI headsets and wearable sensor arrays.",
      de: "BCI-Schnittstelle für KI-Headsets und tragbare Sensor-Arrays."
    }
  },
  {
    id: "eI7d2onteHA",
    title: "VR AI",
    author: "paula jak",
    url: "https://youtube.com/shorts/eI7d2onteHA",
    thumbnail: "https://i.ytimg.com/vi/eI7d2onteHA/hqdefault.jpg",
    category: "bci",
    desc: {
      pl: "Przestrzenne środowisko VR sterowane biosygnałami.",
      en: "Spatial VR environment driven by biological sensor signals.",
      de: "Räumliche VR-Umgebung gesteuert durch biologische Sensorsignale."
    }
  },
  {
    id: "C5rWMaBir6g",
    title: "@ojjja.site",
    author: "paula jak",
    url: "https://youtu.be/C5rWMaBir6g",
    thumbnail: "https://i.ytimg.com/vi/C5rWMaBir6g/hqdefault.jpg",
    category: "compliance",
    desc: {
      pl: "Główny hub własności intelektualnej i domena technologiczna @ojjja.site.",
      en: "Master intellectual property hub and tech identity @ojjja.site.",
      de: "Zentraler IP-Hub und Technologie-Identität @ojjja.site."
    }
  },
  {
    id: "GPKkYEmWMoY",
    title: "Future AI",
    author: "paula jak",
    url: "https://youtu.be/GPKkYEmWMoY",
    thumbnail: "https://i.ytimg.com/vi/GPKkYEmWMoY/hqdefault.jpg",
    category: "ai_agents",
    desc: {
      pl: "Architektura autonomicznych systemów AI nowej generacji.",
      en: "Architecture of next-generation autonomous AI systems.",
      de: "Architektur autonomer KI-Systeme der nächsten Generation."
    }
  },
  {
    id: "6_RcfSOXEaY",
    title: "4 listopada 2026",
    author: "paula jak",
    url: "https://youtu.be/6_RcfSOXEaY",
    thumbnail: "https://i.ytimg.com/vi/6_RcfSOXEaY/hqdefault.jpg",
    category: "saas",
    desc: {
      pl: "Kluczowy materiał wizyjny z rozwoju ekosystemu Incanto Soma.",
      en: "Key vision video from the Incanto Soma ecosystem journey.",
      de: "Zentrales Visions-Video aus der Entwicklung des Incanto Soma Ökosystems."
    }
  }
];
