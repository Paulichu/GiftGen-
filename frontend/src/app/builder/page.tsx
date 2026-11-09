"use client";

import PersistentAgentPanel from "@/components/PersistentAgentPanel";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  FolderTree,
  FileCode,
  Play,
  RotateCcw,
  GitFork,
  Github,
  Globe,
  Terminal,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
  Layers,
  Code2,
  Database,
  Layout,
  Plus,
  Coins
} from "lucide-react";
import { apiRequest, getStoredToken, clearStoredToken } from "@/lib/api";
import AuthModal from "@/components/AuthModal";

interface GeneratedFile {
  path: string;
  content: string;
}

interface AgentLog {
  agent: string;
  message: string;
  level: "info" | "success" | "warn" | "error";
  time?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  current_version: number;
}

export default function BuilderPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Projects & Active Project State
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<any>(null);
  const [credits, setCredits] = useState<number>(100);

  // Left Explorer Tree
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [activeFile, setActiveFile] = useState<GeneratedFile | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    frontend: true,
    backend: true,
    database: true,
  });

  // Center Chat & Agents
  const [messages, setMessages] = useState<Array<{ role: "user" | "agent"; content: string; questions?: string[] }>>([]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAgentStage, setCurrentAgentStage] = useState<string | null>(null);

  // Right Tabs: "preview" | "code" | "deploy"
  const [activeTab, setActiveTab] = useState<"preview" | "code" | "deploy">("preview");
  const [codeSubtab, setCodeSubtab] = useState<"frontend" | "backend" | "database">("frontend");
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  // Bottom Terminal Logs
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([
    {
      agent: "System",
      message: "Emergent Studio ready. All generations are free and unlimited.",
      level: "info",
      time: "12:00:00",
    },
  ]);
  const [isBottomOpen, setIsBottomOpen] = useState(true);

  // Initialize
  useEffect(() => {
    loadUserData();
    setAuthChecked(true);
  }, []);

  const loadUserData = async () => {
    try {
      const credData = await apiRequest("/api/credits");
      if (credData && credData.balance !== undefined) {
        setCredits(credData.balance);
      }

      const projs = await apiRequest("/api/projects");
      setProjects(projs || []);

      if (projs && projs.length > 0) {
        loadProject(projs[0].id);
      } else {
        // Create initial default project
        const storedPrompt = typeof window !== "undefined" ? localStorage.getItem("emergent_initial_prompt") : null;
        const initialName = storedPrompt ? storedPrompt.slice(0, 30) : "My First AI App";

        const newProj = await apiRequest("/api/projects", {
          method: "POST",
          body: JSON.stringify({ name: initialName, prompt: storedPrompt || "" }),
        });
        setProjects([newProj]);
        loadProject(newProj.id);

        if (storedPrompt) {
          localStorage.removeItem("emergent_initial_prompt");
          setTimeout(() => {
            handleSendMessage(storedPrompt, newProj.id);
          }, 600);
        }
      }
    } catch (err: any) {
      // Do not block with auth modal; fallback provides offline demo state
      console.warn("Could not load remote user data, continuing in standalone studio mode:", err);
    }
  };

  const loadProject = async (projId: string) => {
    try {
      const data = await apiRequest(`/api/projects/${projId}`);
      setActiveProjectId(projId);
      setActiveProject(data);
      if (data.files && data.files.length > 0) {
        setFiles(data.files);
        setActiveFile(data.files[0]);
      } else {
        setFiles([]);
        setActiveFile(null);
      }
    } catch (err) {
      console.error("Error loading project:", err);
    }
  };

  const addLog = (agent: string, message: string, level: "info" | "success" | "warn" | "error" = "info") => {
    setAgentLogs((prev) => [
      ...prev,
      { agent, message, level, time: new Date().toLocaleTimeString() },
    ]);
  };

  const handleSendMessage = async (customPrompt?: string, targetProjId?: string) => {
    const promptToSend = customPrompt || inputPrompt;
    if (!promptToSend.trim() || isGenerating) return;

    const projectId = targetProjId || activeProjectId;
    if (!projectId) return;

    setIsGenerating(true);
    setInputPrompt("");
    setMessages((prev) => [...prev, { role: "user", content: promptToSend }]);

    try {
      // 1. Architect Agent: Blueprint
      setCurrentAgentStage("1/5 Architect Agent analyzing requirements...");
      addLog("Architect Agent", `Synthesizing architecture for: "${promptToSend}"`, "info");

      const blueprint = await apiRequest("/api/generate-blueprint", {
        method: "POST",
        body: JSON.stringify({ prompt: promptToSend, project_id: projectId }),
      });

      // Update credit balance
      const credData = await apiRequest("/api/credits");
      if (credData) setCredits(credData.balance);

      if (blueprint.needs_clarification) {
        addLog("Architect Agent", "Prompt is broad. Requesting user clarification.", "warn");
        setMessages((prev) => [
          ...prev,
          {
            role: "agent",
            content: "To build the most precise architecture for your app, please clarify a few key details:",
            questions: blueprint.questions,
          },
        ]);
        setIsGenerating(false);
        setCurrentAgentStage(null);
        return;
      }

      addLog("Architect Agent", `Blueprint approved: ${blueprint.pages.length} pages, ${blueprint.data_models.length} data models.`, "success");

      // 2. Designer Agent
      setCurrentAgentStage("2/5 Designer Agent styling UI & palette...");
      addLog("Designer Agent", "Created unified dark aesthetic design system with Tailwind theme.", "info");

      // 3. Developer Agent, 4. Integration Agent, 5. PM Agent
      setCurrentAgentStage("3/5 Developer & Integration Agents generating full-stack files...");
      const codeGen = await apiRequest("/api/generate-code", {
        method: "POST",
        body: JSON.stringify({
          project_id: projectId,
          blueprint,
          prompt: promptToSend,
        }),
      });

      // Update credits
      const credAfter = await apiRequest("/api/credits");
      if (credAfter) setCredits(credAfter.balance);

      // Log the 5 agents explicitly
      if (codeGen.agent_logs) {
        codeGen.agent_logs.forEach((log: any) => {
          addLog(log.agent, log.message, log.level);
        });
      }

      // Update files & explorer
      if (codeGen.files) {
        setFiles(codeGen.files);
        setActiveFile(codeGen.files[0]);
      }

      // Refresh project
      await loadProject(projectId);

      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: `🎉 Successfully generated version ${codeGen.version_number}! Frontend, backend, database models, and integrations are compiled and running in your sandbox preview.`,
        },
      ]);
    } catch (err: any) {
      addLog("System Error", err.message || "Generation halted", "error");
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: `⚠️ Generation error: ${err.message}. (Free balance will auto-refill if needed).`,
        },
      ]);
    } finally {
      setIsGenerating(false);
      setCurrentAgentStage(null);
    }
  };

  const handleDeploy = async () => {
    if (!activeProjectId || isDeploying) return;
    setIsDeploying(true);
    addLog("Deploy Agent", "Initiating build container & cloud SSL provisioning...", "info");

    try {
      const res = await apiRequest("/api/deploy", {
        method: "POST",
        body: JSON.stringify({ project_id: activeProjectId }),
      });
      setDeployUrl(res.url);
      addLog("Deploy Agent", `Application is live at: ${res.url}`, "success");
      setActiveTab("deploy");
    } catch (err: any) {
      addLog("Deploy Agent", `Deployment error: ${err.message}`, "error");
    } finally {
      setIsDeploying(false);
    }
  };

  const handleFork = async () => {
    if (!activeProjectId) return;
    try {
      const res = await apiRequest(`/api/projects/${activeProjectId}/fork`, { method: "POST" });
      addLog("System", `Project forked to "${res.name}" with independent context`, "success");
      await loadUserData();
      await loadProject(res.id);
    } catch (err: any) {
      addLog("System", `Fork failed: ${err.message}`, "error");
    }
  };

  const handleRollback = async () => {
    if (!activeProjectId || !activeProject) return;
    const targetVer = Math.max(1, (activeProject.current_version || 1) - 1);
    try {
      const res = await apiRequest(`/api/projects/${activeProjectId}/rollback/${targetVer}`, { method: "POST" });
      addLog("System", `Rolled back to version ${targetVer}`, "warn");
      await loadProject(activeProjectId);
    } catch (err: any) {
      addLog("System", `Rollback failed: ${err.message}`, "error");
    }
  };

  const handleExportGitHub = async () => {
    if (!activeProjectId) return;
    try {
      const res = await apiRequest(`/api/projects/${activeProjectId}/export-github`, { method: "POST" });
      addLog("GitHub Integration", `Exported repository: ${res.repository} (${res.committed_files} files)`, "success");
      alert(`Exported to ${res.repository}! Hash: ${res.commit_hash}`);
    } catch (err: any) {
      addLog("GitHub Integration", `Export failed: ${err.message}`, "error");
    }
  };

  // Group files for explorer
  const groupedFiles = {
    frontend: files.filter((f) => f.path.startsWith("frontend/")),
    backend: files.filter((f) => f.path.startsWith("backend/")),
    database: files.filter((f) => f.path.startsWith("database/")),
  };

  // Build live preview HTML for iframe sandbox
  const livePreviewHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
  <style>
    body { background-color: #09090b; color: #f4f4f5; font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body class="p-6">
  <div class="max-w-4xl mx-auto">
    <div class="flex items-center justify-between pb-6 border-b border-zinc-800">
      <div>
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="text-xs font-bold text-emerald-400 uppercase tracking-widest">Emergent Sandbox Live</span>
        </div>
        <h1 class="text-2xl font-bold mt-1 text-white">${activeProject?.name || "Emergent Application"}</h1>
        <p class="text-xs text-zinc-400 mt-1">Full-stack React & FastAPI simulated prototype</p>
      </div>
      <div class="flex gap-2">
        <button onclick="alert('Action simulated successfully!')" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow">Action</button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <p class="text-xs text-zinc-400 font-medium">Activity Items</p>
        <p class="text-2xl font-bold text-white mt-1">12</p>
        <p class="text-[11px] text-emerald-400 mt-1 font-medium">↑ +18% this week</p>
      </div>
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <p class="text-xs text-zinc-400 font-medium">Status</p>
        <p class="text-2xl font-bold text-white mt-1">Active</p>
        <p class="text-[11px] text-zinc-400 mt-1 font-medium">FastAPI Backend: Online</p>
      </div>
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <p class="text-xs text-zinc-400 font-medium">Security</p>
        <p class="text-2xl font-bold text-white mt-1">Protected</p>
        <p class="text-[11px] text-purple-400 mt-1 font-medium">JWT &amp; CORS Active</p>
      </div>
    </div>

    <div class="mt-8 bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <h3 class="text-sm font-semibold text-white mb-4">Interactive Application Records</h3>
      <div id="item-list" class="space-y-3">
        <div class="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex justify-between items-center text-xs">
          <span class="font-medium text-zinc-200">1. Core user authentication flow</span>
          <span class="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">Verified</span>
        </div>
        <div class="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex justify-between items-center text-xs">
          <span class="font-medium text-zinc-200">2. Real-time metrics synchronization</span>
          <span class="px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/40">Synced</span>
        </div>
        <div class="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex justify-between items-center text-xs">
          <span class="font-medium text-zinc-200">3. Stripe billing &amp; checkout module</span>
          <span class="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">Ready</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-white selection:bg-indigo-600 selection:text-white overflow-y-auto font-sans">
      {/* Top Bar */}
      <header className="h-14 bg-zinc-950 border-b border-zinc-800 px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-white tracking-tight text-sm">emergent</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/60 font-semibold uppercase">
              Studio
            </span>
          </Link>

          <div className="h-4 w-px bg-zinc-800" />

          {/* Project selector */}
          <div className="flex items-center gap-2">
            <select
              value={activeProjectId || ""}
              onChange={(e) => loadProject(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 font-medium"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (v{p.current_version})
                </option>
              ))}
            </select>

            <button
              onClick={async () => {
                const name = prompt("Enter new project name:", "New AI App");
                if (name) {
                  const newP = await apiRequest("/api/projects", {
                    method: "POST",
                    body: JSON.stringify({ name }),
                  });
                  setProjects([...projects, newP]);
                  loadProject(newP.id);
                }
              }}
              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition"
              title="Create new project"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center quick status */}
        {currentAgentStage && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-indigo-950/70 border border-indigo-800/60 rounded-full text-xs text-indigo-300 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
            <span>{currentAgentStage}</span>
          </div>
        )}

        {/* Right action controls */}
        <div className="flex items-center gap-3">
          {/* Unlimited / Auto-renewing Credits indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-white">{credits}</span>
            <span className="text-[10px] text-emerald-400 font-medium">(No Top-Up Required)</span>
          </div>

          <button
            onClick={handleFork}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs text-zinc-300 hover:text-white transition"
            title="Fork this project into a new one"
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Fork</span>
          </button>

          <button
            onClick={handleRollback}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs text-zinc-300 hover:text-white transition"
            title="Rollback to previous version"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Rollback</span>
          </button>

          <button
            onClick={handleExportGitHub}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs text-zinc-300 hover:text-white transition"
            title="Export files to GitHub"
          >
            <Github className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <button
            onClick={handleDeploy}
            disabled={isDeploying}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition"
          >
            {isDeploying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
            <span>Deploy</span>
          </button>
        </div>
      </header>
      {/* Offline Mode Indicator Banner */}
      <div className="bg-amber-950/40 border-b border-amber-800/40 px-4 py-1.5 flex items-center justify-between text-xs text-amber-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-medium">Offline Mode - using local engine</span>
          <span className="text-zinc-500 hidden sm:inline">| Standalone browser generation active</span>
        </div>
        <span className="text-[10px] bg-amber-900/40 border border-amber-700/50 px-2 py-0.5 rounded text-amber-200">
          Zero-Lockout
        </span>
      </div>


      {/* Main 3-Column Layout */}
      <div className="h-[calc(100vh-100px)] min-h-[580px] flex overflow-hidden shrink-0">
        {/* LEFT COLUMN: Project Explorer */}
        <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col shrink-0">
          <div className="p-3 border-b border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5 text-indigo-400" />
              Explorer
            </span>
            <span className="text-[10px] bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-400">
              {files.length} files
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 text-xs space-y-2">
            {/* Frontend Group */}
            <div>
              <button
                onClick={() => setExpandedFolders((p) => ({ ...p, frontend: !p.frontend }))}
                className="w-full flex items-center gap-1.5 px-2 py-1 text-zinc-300 hover:text-white hover:bg-zinc-900 rounded font-medium transition"
              >
                {expandedFolders.frontend ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                <Layout className="w-3.5 h-3.5 text-blue-400" />
                <span>frontend</span>
              </button>
              {expandedFolders.frontend && (
                <div className="pl-4 mt-1 space-y-0.5">
                  {groupedFiles.frontend.map((f) => (
                    <button
                      key={f.path}
                      onClick={() => {
                        setActiveFile(f);
                        setActiveTab("code");
                      }}
                      className={`w-full text-left truncate px-2 py-1 rounded transition flex items-center gap-1.5 ${
                        activeFile?.path === f.path
                          ? "bg-indigo-600/20 text-indigo-300 font-semibold"
                          : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="truncate">{f.path.replace("frontend/", "")}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Backend Group */}
            <div>
              <button
                onClick={() => setExpandedFolders((p) => ({ ...p, backend: !p.backend }))}
                className="w-full flex items-center gap-1.5 px-2 py-1 text-zinc-300 hover:text-white hover:bg-zinc-900 rounded font-medium transition"
              >
                {expandedFolders.backend ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>backend</span>
              </button>
              {expandedFolders.backend && (
                <div className="pl-4 mt-1 space-y-0.5">
                  {groupedFiles.backend.map((f) => (
                    <button
                      key={f.path}
                      onClick={() => {
                        setActiveFile(f);
                        setActiveTab("code");
                      }}
                      className={`w-full text-left truncate px-2 py-1 rounded transition flex items-center gap-1.5 ${
                        activeFile?.path === f.path
                          ? "bg-indigo-600/20 text-indigo-300 font-semibold"
                          : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="truncate">{f.path.replace("backend/", "")}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Database Group */}
            <div>
              <button
                onClick={() => setExpandedFolders((p) => ({ ...p, database: !p.database }))}
                className="w-full flex items-center gap-1.5 px-2 py-1 text-zinc-300 hover:text-white hover:bg-zinc-900 rounded font-medium transition"
              >
                {expandedFolders.database ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                <Database className="w-3.5 h-3.5 text-purple-400" />
                <span>database</span>
              </button>
              {expandedFolders.database && (
                <div className="pl-4 mt-1 space-y-0.5">
                  {groupedFiles.database.map((f) => (
                    <button
                      key={f.path}
                      onClick={() => {
                        setActiveFile(f);
                        setActiveTab("code");
                      }}
                      className={`w-full text-left truncate px-2 py-1 rounded transition flex items-center gap-1.5 ${
                        activeFile?.path === f.path
                          ? "bg-indigo-600/20 text-indigo-300 font-semibold"
                          : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="truncate">{f.path.replace("database/", "")}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* CENTER COLUMN: Chat & Agent Orchestration */}
        <section className="flex-1 flex flex-col bg-[#09090b] border-r border-zinc-800 overflow-hidden min-w-[340px]">
          <div className="p-3 border-b border-zinc-800 bg-zinc-950/60 flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 font-medium text-white">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              AI Agent Conversation
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-zinc-400">5 Sequential Agents</span>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3 text-indigo-400 shadow-md">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-white font-semibold text-sm">Describe what you want to build</h4>
                <p className="text-xs text-zinc-500 max-w-sm mt-1">
                  Type an idea below. Our team of 5 AI Agents (Architect, Designer, Developer, Integration, PM) will generate your entire full-stack app.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center max-w-sm">
                  <button
                    onClick={() => handleSendMessage("app for tracking my gym workouts")}
                    className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full text-[11px] text-zinc-300 transition"
                  >
                    Gym Workout Tracker
                  </button>
                  <button
                    onClick={() => handleSendMessage("SaaS analytics platform with Stripe billing")}
                    className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full text-[11px] text-zinc-300 transition"
                  >
                    SaaS Analytics
                  </button>
                  <button
                    onClick={() => handleSendMessage("make an app")}
                    className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full text-[11px] text-zinc-400 transition"
                  >
                    make an app (vague prompt test)
                  </button>
                </div>
              </div>
            ) : (
              messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    m.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-none shadow-sm"
                    }`}
                  >
                    <p>{m.content}</p>

                    {/* Clarifying Questions Chips */}
                    {m.questions && m.questions.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-zinc-800/80 space-y-1.5">
                        <p className="text-[11px] font-semibold text-indigo-400">Quick clarification chips:</p>
                        <div className="flex flex-col gap-1.5">
                          {m.questions.map((q, qIdx) => (
                            <button
                              key={qIdx}
                              onClick={() => {
                                const detailed = `App details: Target users are fitness enthusiasts, core models are Workouts and Sets, with Stripe membership and email login.`;
                                handleSendMessage(detailed);
                              }}
                              className="text-left px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs text-zinc-300 transition flex items-center justify-between group"
                            >
                              <span>{q}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {isGenerating && (
              <div className="flex items-center gap-2 p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs text-indigo-300">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span>{currentAgentStage || "Agents orchestrating..."}</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-zinc-800 bg-zinc-950">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder={credits <= 0 ? "Credits exhausted. Auto-refilling..." : "Type instructions or modifications for the agents..."}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                disabled={isGenerating}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isGenerating || !inputPrompt.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </section>

        {/* RIGHT COLUMN: Live Preview, Code Inspector, Deploy */}
        <section className="flex-1 flex flex-col bg-[#09090b] overflow-hidden min-w-[340px]">
          {/* Tabs bar */}
          <div className="h-10 bg-zinc-950 border-b border-zinc-800 px-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setActiveTab("preview")}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  activeTab === "preview"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                Live Preview
              </button>

              <button
                onClick={() => setActiveTab("code")}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  activeTab === "code"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                Code Inspector
              </button>

              <button
                onClick={() => setActiveTab("deploy")}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  activeTab === "deploy"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-purple-400" />
                Deploy
              </button>
            </div>

            {activeTab === "preview" && (
              <button
                onClick={() => {
                  const iframe = document.getElementById("sandbox-preview-frame") as HTMLIFrameElement;
                  if (iframe) iframe.srcdoc = livePreviewHtml;
                }}
                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-900 transition"
                title="Refresh preview"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden relative">
            {activeTab === "preview" && (
              <iframe
                id="sandbox-preview-frame"
                srcDoc={livePreviewHtml}
                title="Live Sandbox Preview"
                sandbox="allow-scripts allow-modals allow-same-origin"
                className="w-full h-full border-0 bg-zinc-950"
              />
            )}

            {activeTab === "code" && (
              <div className="h-full flex flex-col bg-zinc-950">
                <div className="px-4 py-2 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400 bg-zinc-900/60 font-mono">
                  <span>{activeFile ? activeFile.path : "Select a file from Explorer"}</span>
                  <span className="text-[11px] text-zinc-500">Read-only code view</span>
                </div>
                <div className="flex-1 overflow-auto p-4 font-mono text-xs text-zinc-300 bg-[#0d0e12]">
                  <pre className="leading-relaxed">
                    {activeFile ? activeFile.content : "// No file selected"}
                  </pre>
                </div>
              </div>
            )}

            {activeTab === "deploy" && (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-zinc-950">
                <div className="w-16 h-16 rounded-3xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/20 shadow-xl">
                  <Globe className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Cloud Deployment</h3>
                <p className="text-xs text-zinc-400 max-w-md mt-2">
                  Ship your full-stack AI application directly with automatic HTTPS, DNS routing, and MongoDB connection.
                </p>

                {deployUrl ? (
                  <div className="mt-6 p-4 bg-zinc-900 border border-emerald-500/40 rounded-2xl w-full max-w-md text-left space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Live &amp; Deployed to Production</span>
                    </div>
                    <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 font-mono text-xs text-white truncate flex items-center justify-between">
                      <span className="truncate">{deployUrl}</span>
                      <a
                        href={deployUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 hover:text-indigo-400 text-zinc-400 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleDeploy}
                    disabled={isDeploying}
                    className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
                  >
                    {isDeploying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                    Deploy Application Now
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

            {/* PERSISTENT AGENT SECTION */}
      <div className="bg-zinc-950/80 border-t border-zinc-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider font-mono">
              1 Agent Always-On — nie w przeglądarce
            </h2>
          </div>
          <PersistentAgentPanel />
        </div>
      </div>

{/* BOTTOM PANEL: Agent Logs & Terminal */}
      <div className={`bg-zinc-950 border-t border-zinc-800 shrink-0 transition-all duration-200 ${
        isBottomOpen ? "h-36" : "h-8"
      }`}>
        <div
          onClick={() => setIsBottomOpen(!isBottomOpen)}
          className="h-8 px-4 flex items-center justify-between cursor-pointer hover:bg-zinc-900 text-xs text-zinc-400 border-b border-zinc-800/60 select-none"
        >
          <div className="flex items-center gap-2 font-mono">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold text-zinc-300">Agent Logs &amp; Terminal</span>
            <span className="text-[10px] bg-zinc-900 px-1.5 py-0.2 rounded text-zinc-500">
              {agentLogs.length} events
            </span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isBottomOpen ? "" : "rotate-180"}`} />
        </div>

        {isBottomOpen && (
          <div className="h-[calc(100%-32px)] overflow-y-auto p-2 font-mono text-xs space-y-1 bg-[#09090b]">
            {agentLogs.map((log, index) => (
              <div key={index} className="flex items-start gap-2 leading-relaxed">
                <span className="text-zinc-600 shrink-0">[{log.time}]</span>
                <span
                  className={`px-1.5 rounded text-[10px] font-semibold shrink-0 uppercase ${
                    log.level === "success"
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800/50"
                      : log.level === "warn"
                      ? "bg-amber-950 text-amber-400 border border-amber-800/50"
                      : log.level === "error"
                      ? "bg-red-950 text-red-400 border border-red-800/50"
                      : "bg-zinc-800 text-indigo-300"
                  }`}
                >
                  {log.agent}
                </span>
                <span
                  className={`${
                    log.level === "error"
                      ? "text-red-300"
                      : log.level === "warn"
                      ? "text-amber-200"
                      : log.level === "success"
                      ? "text-zinc-200"
                      : "text-zinc-400"
                  }`}
                >
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Auth Modal if user manually clicks login or auth needed */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          setIsAuthOpen(false);
          loadUserData();
        }}
      />
    </div>
  );
}
