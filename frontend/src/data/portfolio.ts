export type Language = "pl" | "en" | "de";

export interface TriText {
  pl: string;
  en: string;
  de: string;
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
  seller: "Ojjja Tech IP / Incanto Soma",
  registeredCity: "Monheim am Rhein, NRW, Germany",
  contactEmail: "admin@ojjja.site",
  supportEmail: "ip@ojjja.site",
  paypalEmail: "admin@ojjja.site",
  crypto: {
    eth: "0x89ee3f2a2a7ddc9de821f93623aab58593cb1b59",
    btc: "bc1q3vkqn8mgnpvz9cj07scjpz65wn8j7fl9akp24p"
  },
  invoicingNote: {
    pl: "Faktury VAT UE (Reverse Charge) dla firm oraz bezpośrednie płatności PayPal i krypto (ETH/BTC).",
    en: "EU VAT Invoices (Reverse Charge) for businesses and direct PayPal & crypto (ETH/BTC) payments.",
    de: "EU-USt-Rechnungen (Reverse Charge) für Unternehmen sowie direkte PayPal- und Krypto-Zahlungen (ETH/BTC)."
  }
};

export const PRODUCTS: ProductItem[] = [
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
    id: "compliance-twin",
    title: "Compliance Twin Ultra V3",
    category: "compliance",
    badge: {
      pl: "Audyt EU AI Act",
      en: "EU AI Act Audit",
      de: "EU AI Act Audit"
    },
    priceEur: 1990,
    priceUsd: 2150,
    period: "one-time",
    tagline: {
      pl: "Cyfrowy bliźniak zgodności regulacyjnej: EU AI Act, NIS2, ISO 27001, GDPR.",
      en: "Digital compliance twin for EU AI Act, NIS2, ISO 27001, and GDPR.",
      de: "Digitaler Compliance-Zwilling für EU AI Act, NIS2, ISO 27001 und DSGVO."
    },
    description: {
      pl: "Kompleksowa platforma do zarządzania ryzykiem prawnym i technicznym systemów sztucznej inteligencji w Unii Europejskiej z automatycznym generatorem raportów audytowych.",
      en: "Comprehensive platform to manage legal and technical risk for AI systems in the European Union with automated audit report generation.",
      de: "Umfassende Plattform zur Steuerung rechtlicher und technischer Risiken von KI-Systemen in der EU mit automatischer Audit-Berichterstellung."
    },
    features: [
      { pl: "6-miesięczny wektor trendu scoringu zgodności", en: "6-month compliance score trend vector", de: "6-Monats-Compliance-Trendkurve" },
      { pl: "Macierz 42 punktów kontrolnych NIS2 i EU AI Act", en: "42-point NIS2 and EU AI Act control matrix", de: "42-Punkte-Kontrollmatrix für NIS2 & EU AI Act" },
      { pl: "Niezmienny audit trail z podpisem kryptograficznym", en: "Immutable audit trail with cryptographic signature", de: "Unveränderlicher Audit-Trail mit kryptografischer Signatur" },
      { pl: "Gotowe szablony raportów dla organów nadzorczych", en: "Ready-to-file regulatory supervisory templates", de: "Behördenfertige Berichts-Templates" }
    ],
    primaryVideoId: "SQLkpb5MQ1M",
    relatedVideoIds: ["C5rWMaBir6g"]
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
