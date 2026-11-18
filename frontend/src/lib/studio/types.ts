export type AppType = "fullstack" | "mobile" | "landing";
export type ThemeMode = "dark" | "light";
export type FieldType = "text" | "textarea" | "number" | "date" | "time" | "select" | "checkbox";

export interface Field {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  unit?: string;
  placeholder?: string;
}

export interface LandingCopy {
  headline: string;
  subheadline: string;
  cta: string;
  bullets: string[];
}

export interface Blueprint {
  title: string;
  tagline: string;
  description: string;
  appType: AppType;
  entity: { singular: string; plural: string };
  fields: Field[];
  features: {
    search: boolean;
    filter: boolean;
    sort: boolean;
    stats: boolean;
    exportCsv: boolean;
    editing: boolean;
  };
  theme: { mode: ThemeMode; accent: string; accentName: string; radius: number };
  pages: Array<{ route: string; title: string; description: string }>;
  copy?: LandingCopy;
}

export interface GeneratedFile {
  path: string;
  language: string;
  content: string;
  bytes: number;
}

export interface AgentEvent {
  agent: string;
  message: string;
  level: "info" | "success" | "warn";
  durationMs: number;
}

export interface Version {
  number: number;
  createdAt: string;
  summary: string;
  blueprint: Blueprint;
  files: GeneratedFile[];
  events: AgentEvent[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  createdAt: string;
  version?: number;
  events?: AgentEvent[];
  kind?: "build" | "iterate" | "publish" | "notice";
}

export interface PublishRecord {
  slug: string;
  version: number;
  publishedAt: string;
}

export interface Job {
  id: string;
  prompt: string;
  name: string;
  appType: AppType;
  status: "ready" | "published";
  createdAt: string;
  updatedAt: string;
  currentVersion: number;
  versions: Version[];
  messages: ChatMessage[];
  publish: PublishRecord | null;
}

export interface WorkspaceStats {
  jobs: number;
  versions: number;
  published: number;
}
