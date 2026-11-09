const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("emergent_token") || "demo-token-commander-paulina";
}

export function setStoredToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("emergent_token", token);
}

export function clearStoredToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("emergent_token");
}

// Local mock storage helpers for offline/Vercel standalone demo mode
const LOCAL_STORAGE_KEY_PROJECTS = "emergent_local_projects";
const LOCAL_STORAGE_KEY_CREDITS = "emergent_local_credits";

function getLocalProjects(): any[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY_PROJECTS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  const defaultProjects = [
    {
      id: "proj_commander_1",
      name: "Percepcio Neuro-Soma Hub",
      prompt: "Next-gen AI telemetry and automation platform for Commander Paulina",
      status: "ready",
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      files: [
        {
          path: "frontend/src/app/page.tsx",
          category: "frontend",
          language: "typescript",
          content: `// Percepcio Neuro-Soma OS Hub
import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 mb-4">
        💜 INCANTO NEURO-SOMA OS
      </h1>
      <p className="text-slate-400 max-w-md text-center mb-6">
        Autonomous AI Core & Quantum Telemetry Dashboard for Commander Paulina Jakubowska.
      </p>
      <div className="flex gap-4">
        <button className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold shadow-lg shadow-purple-600/30 transition">
          Launch Nexus Telemetry
        </button>
      </div>
    </div>
  );
}`
        },
        {
          path: "backend/app/main.py",
          category: "backend",
          language: "python",
          content: `# Percepcio Neuro Labs API
from fastapi import FastAPI

app = FastAPI(title="Incanto Neuro-Soma Core")

@app.get("/health")
def health():
    return {"status": "quantum_ready", "commander": "Paulina Jakubowska", "efficiency": "99.4%"}
`
        },
        {
          path: "database/schema.sql",
          category: "database",
          language: "sql",
          content: `-- Database Schema for Telemetry & Creators
CREATE TABLE projects (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`
        }
      ]
    }
  ];
  localStorage.setItem(LOCAL_STORAGE_KEY_PROJECTS, JSON.stringify(defaultProjects));
  return defaultProjects;
}

function saveLocalProjects(projects: any[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_KEY_PROJECTS, JSON.stringify(projects));
}

function getLocalCredits(): number {
  if (typeof window === "undefined") return 100;
  const c = localStorage.getItem(LOCAL_STORAGE_KEY_CREDITS);
  if (c !== null) return parseInt(c, 10);
  localStorage.setItem(LOCAL_STORAGE_KEY_CREDITS, "100");
  return 100;
}

function deductLocalCredits(amount: number = 5): number {
  const current = getLocalCredits();
  const next = Math.max(0, current - amount);
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY_CREDITS, next.toString());
  }
  return next;
}

// Client-side fallback handler
function handleLocalFallback(path: string, options: RequestInit = {}): any {
  const method = (options.method || "GET").toUpperCase();

  // /api/stats
  if (path === "/api/stats") {
    return {
      projects_generated: 14820,
      active_builders: 3240,
      lines_of_code: 890420,
    };
  }

  // /api/credits
  if (path === "/api/credits") {
    return { balance: getLocalCredits() };
  }

  // /api/auth/me
  if (path === "/api/auth/me") {
    return {
      id: "user_commander",
      email: "ip@ojjja.site",
      credits: getLocalCredits(),
    };
  }

  // /api/auth/login or /api/auth/register
  if (path.startsWith("/api/auth/")) {
    return {
      access_token: "demo-token-commander-paulina",
      token_type: "bearer",
    };
  }

  // /api/projects
  if (path === "/api/projects") {
    const projects = getLocalProjects();
    if (method === "GET") {
      return projects.map((p) => ({
        id: p.id,
        name: p.name,
        prompt: p.prompt,
        status: p.status,
        version: p.version,
        created_at: p.created_at,
        updated_at: p.updated_at,
        files_count: (p.files || []).length,
      }));
    }
    if (method === "POST") {
      const body = options.body ? JSON.parse(options.body as string) : {};
      const newProj = {
        id: `proj_${Date.now()}`,
        name: body.name || "New Autonomous Project",
        prompt: body.prompt || "",
        status: "ready",
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        files: [
          {
            path: "frontend/src/app/page.tsx",
            category: "frontend",
            language: "typescript",
            content: `// Autonomous React Page for ${body.name || "AI App"}
import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-3">${body.name || "AI App"}</h1>
      <p className="text-slate-400">Generated successfully by Emergent Studio 5-Agent Pipeline.</p>
    </div>
  );
}`
          }
        ]
      };
      projects.unshift(newProj);
      saveLocalProjects(projects);
      return newProj;
    }
  }

  // /api/generate-blueprint
  if (path === "/api/generate-blueprint") {
    const body = options.body ? JSON.parse(options.body as string) : {};
    const prompt = (body.prompt || "").trim();
    deductLocalCredits(5);

    if (prompt.split(/\s+/).length < 3 && !prompt.toLowerCase().includes("landing")) {
      return {
        needs_clarification: true,
        questions: [
          "Target users are fitness enthusiasts, core models are Workouts and Sets, with Stripe membership and email login.",
          "Target users are B2B businesses in NRW, core models are Workflows and Leads, with automated CRM integration.",
          "Target users are YouTube creators, core models are Hooks and Video Analytics, with high-CTR generator."
        ]
      };
    }

    return {
      needs_clarification: false,
      pages: [
        { name: "Dashboard", route: "/", description: "Real-time metrics and operations" },
        { name: "Analytics", route: "/analytics", description: "Performance tracking and logs" }
      ],
      data_models: [
        { name: "User", fields: ["id", "email", "role"] },
        { name: "Project", fields: ["id", "title", "status"] }
      ],
      features: ["Authentication", "Real-time sync", "Stripe billing"]
    };
  }

  // /api/generate-code
  if (path === "/api/generate-code") {
    const body = options.body ? JSON.parse(options.body as string) : {};
    const prompt = (body.prompt || "").trim();
    const projId = body.project_id;
    const projects = getLocalProjects();
    const idx = projects.findIndex((p) => p.id === projId);

    const generatedFiles = [
      {
        path: "frontend/src/app/page.tsx",
        category: "frontend",
        language: "typescript",
        content: `// Generated for Commander Paulina Jakubowska: ${prompt.slice(0, 40)}
import React, { useState } from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#08080c] text-white flex flex-col font-sans">
      <header className="border-b border-zinc-800 px-8 py-5 flex items-center justify-between bg-zinc-950/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold">
            ⚡
          </div>
          <span className="font-bold text-lg tracking-wide">Emergent Studio Suite</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-zinc-400">Commander: Paulina Jakubowska</span>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
            ● Active
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-8">
        <div className="p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 shadow-2xl">
          <h2 className="text-2xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-indigo-300">
            ${prompt}
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            Autonomous module synthesized by 5-Agent AI pipeline. Optimized for production deployment.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Architecture</div>
              <div className="text-base font-semibold text-indigo-400">Next.js 14 + FastAPI</div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Status</div>
              <div className="text-base font-semibold text-emerald-400">Ready to Deploy</div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Owner</div>
              <div className="text-base font-semibold text-purple-400">ip@ojjja.site</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}`
      },
      {
        path: "backend/app/main.py",
        category: "backend",
        language: "python",
        content: `# FastAPI Engine for: ${prompt.slice(0, 40)}
from fastapi import FastAPI

app = FastAPI(title="Synthesized Service", version="1.0.0")

@app.get("/api/health")
def health():
    return {"status": "healthy", "service": "Autonomous Emergent Micro-SaaS"}
`
      },
      {
        path: "database/schema.sql",
        category: "database",
        language: "sql",
        content: `-- Database Schema
CREATE TABLE records (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`
      }
    ];

    const newVer = idx !== -1 ? (projects[idx].version || 1) + 1 : 2;
    if (idx !== -1) {
      projects[idx].files = generatedFiles;
      projects[idx].version = newVer;
      projects[idx].current_version = newVer;
      projects[idx].updated_at = new Date().toISOString();
      saveLocalProjects(projects);
    }

    return {
      version_number: newVer,
      files: generatedFiles,
      agent_logs: [
        { agent: "Architect Agent", message: "Designing modular application structure...", level: "info" },
        { agent: "Designer Agent", message: "Crafting modern Tailwind dark UI...", level: "info" },
        { agent: "Developer Agent", message: "Writing clean React and Python code...", level: "success" },
        { agent: "Integration Agent", message: "Verifying API contracts and state...", level: "info" },
        { agent: "Release PM", message: "Build complete. Ready for live preview.", level: "success" }
      ]
    };
  }

  // /api/projects/:id
  const singleProjMatch = path.match(/^\/api\/projects\/([^\/]+)$/);
  if (singleProjMatch) {
    const projId = singleProjMatch[1];
    const projects = getLocalProjects();
    const found = projects.find((p) => p.id === projId) || projects[0];
    return found;
  }

  // /api/projects/:id/generate
  const genMatch = path.match(/^\/api\/projects\/([^\/]+)\/generate$/);
  if (genMatch) {
    const projId = genMatch[1];
    const body = options.body ? JSON.parse(options.body as string) : {};
    const prompt = (body.prompt || "").trim();

    deductLocalCredits(5);
    const projects = getLocalProjects();
    const idx = projects.findIndex((p) => p.id === projId);

    // Check for vague prompt
    if (prompt.split(/\s+/).length < 3 && !prompt.toLowerCase().includes("landing")) {
      return {
        clarification_needed: true,
        question: "Would you like this configured as a creator tool or an AI automation dashboard?",
        options: [
          "YouTube Creator Tool (Hook Machine / SEO Pack)",
          "B2B Automation Hub (NRW Mittelstand)",
          "Full-Stack NeuroTech App"
        ],
        logs: [
          { agent: "Architect", message: "Analyzing prompt clarity...", severity: "info", timestamp: new Date().toISOString() },
          { agent: "Architect", message: "Prompt requires specification before code generation.", severity: "warn", timestamp: new Date().toISOString() }
        ]
      };
    }

    const generatedFiles = [
      {
        path: "frontend/src/app/page.tsx",
        category: "frontend",
        language: "typescript",
        content: `// Generated for Commander Paulina Jakubowska: ${prompt.slice(0, 40)}
import React, { useState } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-[#08080c] text-white flex flex-col font-sans">
      <header className="border-b border-zinc-800 px-8 py-5 flex items-center justify-between bg-zinc-950/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold">
            ⚡
          </div>
          <span className="font-bold text-lg tracking-wide">Emergent Studio Suite</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-zinc-400">Commander: Paulina Jakubowska</span>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
            ● Active
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-8">
        <div className="p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 shadow-2xl">
          <h2 className="text-2xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-indigo-300">
            ${prompt}
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            Autonomous module synthesized by 5-Agent AI pipeline. Optimized for production deployment.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Architecture</div>
              <div className="text-base font-semibold text-indigo-400">Next.js 14 + FastAPI</div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Status</div>
              <div className="text-base font-semibold text-emerald-400">Ready to Deploy</div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Owner</div>
              <div className="text-base font-semibold text-purple-400">ip@ojjja.site</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}`
      },
      {
        path: "backend/app/main.py",
        category: "backend",
        language: "python",
        content: `# FastAPI Engine for: ${prompt.slice(0, 40)}
from fastapi import FastAPI

app = FastAPI(title="Synthesized Service", version="1.0.0")

@app.get("/api/health")
def health():
    return {"status": "healthy", "service": "Autonomous Emergent Micro-SaaS"}
`
      },
      {
        path: "database/schema.sql",
        category: "database",
        language: "sql",
        content: `-- Database Schema
CREATE TABLE records (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`
      }
    ];

    if (idx !== -1) {
      projects[idx].files = generatedFiles;
      projects[idx].version = (projects[idx].version || 1) + 1;
      projects[idx].updated_at = new Date().toISOString();
      saveLocalProjects(projects);
    }

    return {
      success: true,
      blueprint: `Synthesized full architecture for: ${prompt}`,
      files: generatedFiles,
      version: idx !== -1 ? projects[idx].version : 2,
      credits_remaining: getLocalCredits(),
      logs: [
        { agent: "Architect", message: "Designing modular application structure...", severity: "info", timestamp: new Date().toISOString() },
        { agent: "Designer", message: "Crafting modern Tailwind dark UI...", severity: "info", timestamp: new Date().toISOString() },
        { agent: "Developer", message: "Writing clean React and Python code...", severity: "success", timestamp: new Date().toISOString() },
        { agent: "Integration", message: "Verifying API contracts and state...", severity: "info", timestamp: new Date().toISOString() },
        { agent: "Release PM", message: "Build complete. Ready for live preview.", severity: "success", timestamp: new Date().toISOString() }
      ]
    };
  }

  // /api/projects/:id/fork
  const forkMatch = path.match(/^\/api\/projects\/([^\/]+)\/fork$/);
  if (forkMatch) {
    const projId = forkMatch[1];
    const projects = getLocalProjects();
    const original = projects.find((p) => p.id === projId) || projects[0];
    const forked = {
      ...original,
      id: `proj_fork_${Date.now()}`,
      name: `${original.name} (Fork)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    projects.unshift(forked);
    saveLocalProjects(projects);
    return forked;
  }

  // /api/projects/:id/rollback
  const rollbackMatch = path.match(/^\/api\/projects\/([^\/]+)\/rollback$/);
  if (rollbackMatch) {
    const projId = rollbackMatch[1];
    const projects = getLocalProjects();
    const found = projects.find((p) => p.id === projId);
    return found || { success: true };
  }

  // /api/projects/:id/deploy
  const deployMatch = path.match(/^\/api\/projects\/([^\/]+)\/deploy$/);
  if (deployMatch) {
    const projId = deployMatch[1];
    return {
      deployment_id: `dep_${Date.now()}`,
      url: `https://${projId}.emergent.live`,
      status: "live",
      logs: [
        { agent: "Deploy", message: "Building production container image...", severity: "info", timestamp: new Date().toISOString() },
        { agent: "Deploy", message: "Routing public DNS and issuing SSL...", severity: "info", timestamp: new Date().toISOString() },
        { agent: "Deploy", message: `Application live at https://${projId}.emergent.live`, severity: "success", timestamp: new Date().toISOString() }
      ]
    };
  }

  // /api/projects/:id/export
  if (path.includes("/export")) {
    return {
      github_repo: "https://github.com/emergent-agent/project-export",
      zip_url: "https://emergent.live/exports/project-bundle.zip"
    };
  }

  return {};
}

export async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      // If 401 and we have no valid backend, use local demo fallback
      if (res.status === 401) {
        return handleLocalFallback(path, options) as T;
      }
      let errorDetail = "An unexpected error occurred";
      try {
        const errJson = await res.json();
        errorDetail = errJson.detail || errJson.message || JSON.stringify(errJson);
      } catch {
        errorDetail = await res.text() || res.statusText;
      }
      const error = new Error(errorDetail);
      (error as any).status = res.status;
      throw error;
    }

    if (res.status === 204) {
      return {} as T;
    }

    return res.json();
  } catch (err: any) {
    // If backend is unreachable (e.g. on public Vercel deployment where localhost:8000 is blocked),
    // fallback seamlessly to client-side offline mock engine.
    console.warn(`[Emergent Engine] Backend unreachable at ${API_BASE_URL}. Switching to client-side engine for: ${path}`);
    return handleLocalFallback(path, options) as T;
  }
}
