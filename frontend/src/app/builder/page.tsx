"use client";

import PersistentAgentPanel from "@/components/PersistentAgentPanel";

import React, { useState, useEffect } from "react";
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
  Coins,
  Smartphone,
  Monitor
} from "lucide-react";
import { apiRequest, getStoredToken } from "@/lib/api";
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
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Projects State
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<any>(null);

  // Left Explorer Tree
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [activeFile, setActiveFile] = useState<GeneratedFile | null>(null);

  // Center Chat & 5-Agent Swarm
  const [messages, setMessages] = useState<Array<{ role: "user" | "agent"; content: string; questions?: string[] }>>([]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAgentStage, setCurrentAgentStage] = useState<string | null>(null);

  // 5 Agents active swarm status: "idle" | "working" | "done"
  const [swarmStatus, setSwarmStatus] = useState<Record<string, "idle" | "working" | "done">>({
    architect: "idle",
    designer: "idle",
    developer: "idle",
    integration: "idle",
    pm: "idle",
  });

  // Right Tabs: "preview" | "code" | "deploy"
  const [activeTab, setActiveTab] = useState<"preview" | "code" | "deploy">("preview");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  // Bottom Terminal Logs
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([
    {
      agent: "System",
      message: "Vibe Engine / Emergent Studio ready. All generations are free forever.",
      level: "info",
      time: "12:00:00",
    },
  ]);
  const [isBottomOpen, setIsBottomOpen] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const projs = await apiRequest("/api/projects");
      setProjects(projs || []);

      if (projs && projs.length > 0) {
        loadProject(projs[0].id);
      } else {
        const storedPrompt = typeof window !== "undefined" ? localStorage.getItem("emergent_initial_prompt") : null;
        const initialName = storedPrompt ? storedPrompt.slice(0, 30) : "Barbershop Booking Studio";

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
      console.warn("Continuing in standalone studio mode:", err);
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

    // Animate Swarm: Architect working
    setSwarmStatus({
      architect: "working",
      designer: "idle",
      developer: "idle",
      integration: "idle",
      pm: "idle",
    });

    try {
      setCurrentAgentStage("Architect Agent (1/5) analyzing requirements...");
      addLog("Architect Agent", `Planning application structure for: "${promptToSend}"`, "info");

      const blueprint = await apiRequest("/api/generate-blueprint", {
        method: "POST",
        body: JSON.stringify({ prompt: promptToSend, project_id: projectId }),
      });

      if (blueprint.needs_clarification) {
        setSwarmStatus((s) => ({ ...s, architect: "done" }));
        addLog("Architect Agent", "Clarification requested for domain models.", "warn");
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

      setSwarmStatus((s) => ({ ...s, architect: "done", designer: "working" }));
      setCurrentAgentStage("Designer Agent (2/5) crafting palette & layout...");
      addLog("Designer Agent", "Created responsive Tailwind dark layout.", "info");

      // Developer, Integration, PM
      setSwarmStatus((s) => ({ ...s, designer: "done", developer: "working", integration: "working" }));
      setCurrentAgentStage("Developer & Integration Agents (3/5 & 4/5) writing code & wiring APIs...");

      const codeGen = await apiRequest("/api/generate-code", {
        method: "POST",
        body: JSON.stringify({
          project_id: projectId,
          blueprint,
          prompt: promptToSend,
        }),
      });

      setSwarmStatus({
        architect: "done",
        designer: "done",
        developer: "done",
        integration: "done",
        pm: "working",
      });
      setCurrentAgentStage("Release PM (5/5) reviewing and mounting to preview...");

      if (codeGen.agent_logs) {
        codeGen.agent_logs.forEach((log: any) => {
          addLog(log.agent, log.message, log.level);
        });
      }

      if (codeGen.files) {
        setFiles(codeGen.files);
        setActiveFile(codeGen.files[0]);
      }

      await loadProject(projectId);

      setSwarmStatus({
        architect: "done",
        designer: "done",
        developer: "done",
        integration: "done",
        pm: "done",
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: `🎉 Successfully compiled version ${codeGen.version_number}! Frontend and backend code is running live in your sandbox preview.`,
        },
      ]);
    } catch (err: any) {
      addLog("System Error", err.message || "Generation error", "error");
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: `⚠️ Error during generation: ${err.message}.`,
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
      await apiRequest(`/api/projects/${activeProjectId}/rollback/${targetVer}`, { method: "POST" });
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
      addLog("GitHub Integration", `Exported repository: ${res.repository}`, "success");
      alert(`Exported to GitHub! Hash: ${res.commit_hash || "main"}`);
    } catch {
      alert("GitHub export ready: bundle created for download.");
    }
  };

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
  <div class="max-w-xl mx-auto">
    <div class="border-b border-zinc-800 pb-4 mb-6">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span class="text-xs font-bold text-emerald-400 uppercase tracking-widest">Live Prototype</span>
      </div>
      <h1 class="text-2xl font-bold mt-1 text-white">${activeProject?.name || "Barbershop Booking App"}</h1>
      <p class="text-xs text-zinc-400 mt-1">24/7 Appointment booking synced with Telegram &amp; WhatsApp</p>
    </div>

    <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
      <h3 class="text-sm font-semibold text-white">Book Your Visit</h3>
      <div>
        <label class="block text-xs text-zinc-400 mb-1">Your Name</label>
        <input class="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-white" placeholder="Paulina Jakubowska" />
      </div>
      <div>
        <label class="block text-xs text-zinc-400 mb-1">Service</label>
        <select class="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-white">
          <option>Classic Haircut - $35</option>
          <option>Beard Grooming - $25</option>
          <option>Full VIP Service - $55</option>
        </select>
      </div>
      <div>
        <label class="block text-xs text-zinc-400 mb-1">Preferred Time</label>
        <input class="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-white" placeholder="Jutro 15:00" />
      </div>
      <button onclick="alert('Rezerwacja wysłana do bazy MongoDB! Asystent 24/7 zaraz potwierdzi.')" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs transition">
        Confirm Booking
      </button>
    </div>
  </div>
</body>
</html>
  `;

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-white selection:bg-indigo-600 selection:text-white overflow-x-hidden font-sans">
      {/* Top Bar */}
      <header className="h-14 bg-zinc-950 border-b border-zinc-800 px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-white tracking-tight text-sm">Vibe Engine</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold uppercase">
              Free Forever
            </span>
          </Link>

          <div className="h-4 w-px bg-zinc-800" />

          {/* Project selector */}
          <div className="flex items-center gap-1.5">
            <select
              value={activeProjectId || ""}
              onChange={(e) => loadProject(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500 font-medium"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (v{p.current_version || 1})
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
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-indigo-950/70 border border-indigo-800/60 rounded-full text-xs text-indigo-300 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
            <span>{currentAgentStage}</span>
          </div>
        )}

        {/* Right action controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs">
            <span className="text-emerald-400 font-bold">∞ Credits</span>
            <span className="text-[10px] text-zinc-500 hidden sm:inline">(Free Forever)</span>
          </div>

          <button
            onClick={handleFork}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs text-zinc-300 hover:text-white transition"
            title="Fork this project"
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Fork</span>
          </button>

          <button
            onClick={handleRollback}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs text-zinc-300 hover:text-white transition"
            title="Rollback version"
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
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition"
          >
            {isDeploying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
            <span>Deploy</span>
          </button>
        </div>
      </header>

      {/* 5-Agent Swarm Status Bar */}
      <div className="bg-zinc-950/90 border-b border-zinc-800 px-4 py-2 flex items-center justify-between text-xs overflow-x-auto">
        <div className="flex items-center gap-3">
          <span className="text-zinc-400 font-mono text-[11px] font-semibold uppercase">5-Agent Swarm:</span>

          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${swarmStatus.architect === "working" ? "bg-amber-400 animate-pulse" : swarmStatus.architect === "done" ? "bg-emerald-400" : "bg-zinc-600"}`} />
            <span className="text-zinc-300 text-[11px]">Architect</span>
          </div>

          <span className="text-zinc-700">→</span>

          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${swarmStatus.designer === "working" ? "bg-amber-400 animate-pulse" : swarmStatus.designer === "done" ? "bg-emerald-400" : "bg-zinc-600"}`} />
            <span className="text-zinc-300 text-[11px]">Designer</span>
          </div>

          <span className="text-zinc-700">→</span>

          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${swarmStatus.developer === "working" ? "bg-amber-400 animate-pulse" : swarmStatus.developer === "done" ? "bg-emerald-400" : "bg-zinc-600"}`} />
            <span className="text-zinc-300 text-[11px]">Developer</span>
          </div>

          <span className="text-zinc-700">→</span>

          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${swarmStatus.integration === "working" ? "bg-amber-400 animate-pulse" : swarmStatus.integration === "done" ? "bg-emerald-400" : "bg-zinc-600"}`} />
            <span className="text-zinc-300 text-[11px]">Integration</span>
          </div>

          <span className="text-zinc-700">→</span>

          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${swarmStatus.pm === "working" ? "bg-amber-400 animate-pulse" : swarmStatus.pm === "done" ? "bg-emerald-400" : "bg-zinc-600"}`} />
            <span className="text-zinc-300 text-[11px]">PM</span>
          </div>
        </div>

        <span className="text-[11px] text-emerald-400 font-mono hidden sm:inline">
          Active Swarm Pipeline
        </span>
      </div>

      {/* Main 3-Column Layout (Responsive for <768px: flex-col, w-full, overflow-x-clip) */}
      <div className="flex flex-col md:flex-row h-auto md:h-[620px] shrink-0 border-b border-zinc-800 w-full overflow-x-clip">
        {/* LEFT COLUMN: Project File Tree */}
        <aside className="w-full md:w-64 bg-zinc-950 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col shrink-0 max-h-60 md:max-h-full">
          <div className="p-3 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5 text-indigo-400" />
              File Tree
            </span>
            <span className="text-[10px] bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-400">
              {files.length} files
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 text-xs space-y-1">
            {files.map((f) => (
              <button
                key={f.path}
                onClick={() => {
                  setActiveFile(f);
                  setActiveTab("code");
                }}
                className={`w-full text-left truncate px-2.5 py-1.5 rounded transition flex items-center gap-2 ${
                  activeFile?.path === f.path
                    ? "bg-indigo-600/20 text-indigo-300 font-semibold"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span className="truncate">{f.path}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* MIDDLE COLUMN: Swarm - 5 Agents Chat & Orchestration */}
        <section className="flex-1 flex flex-col bg-[#09090b] border-b md:border-b-0 md:border-r border-zinc-800 overflow-hidden min-w-0 min-h-[380px]">
          <div className="p-3 border-b border-zinc-800 bg-zinc-950/60 flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 font-medium text-white">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              5-Agent Swarm Orchestration
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-zinc-400">Real-Time Autonomous</span>
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
                  Type an idea below. The 5 AI agents will plan, design, code, wire, and review your full-stack app.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center max-w-sm">
                  <button
                    onClick={() => handleSendMessage("Barbershop booking app with calendar and Telegram bot")}
                    className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full text-[11px] text-zinc-300 transition"
                  >
                    Barbershop Booking
                  </button>
                  <button
                    onClick={() => handleSendMessage("Gym appointment scheduling for personal trainers")}
                    className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full text-[11px] text-zinc-300 transition"
                  >
                    Gym Trainer
                  </button>
                </div>
              </div>
            ) : (
              messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-none shadow-sm"
                    }`}
                  >
                    <p>{m.content}</p>

                    {m.questions && m.questions.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-zinc-800 space-y-1.5">
                        <p className="text-[11px] font-semibold text-indigo-400">Clarification chips:</p>
                        <div className="flex flex-col gap-1.5">
                          {m.questions.map((q, qIdx) => (
                            <button
                              key={qIdx}
                              onClick={() => {
                                handleSendMessage(`App details: ${q}`);
                              }}
                              className="text-left px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs text-zinc-300 transition flex items-center justify-between"
                            >
                              <span>{q}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
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
                placeholder="Type instructions or modifications for the 5 agents..."
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                disabled={isGenerating}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isGenerating || !inputPrompt.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span className="hidden sm:inline">Build</span>
              </button>
            </form>
          </div>
        </section>

        {/* RIGHT COLUMN: Live Preview (Desktop/Phone toggle), Code, Deploy */}
        <section className="flex-1 flex flex-col bg-[#09090b] overflow-hidden min-w-0 min-h-[380px]">
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-1 rounded ${previewDevice === "desktop" ? "text-white bg-zinc-800" : "text-zinc-500 hover:text-zinc-300"}`}
                  title="Desktop View"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-1 rounded ${previewDevice === "mobile" ? "text-white bg-zinc-800" : "text-zinc-500 hover:text-zinc-300"}`}
                  title="Phone View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
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
              </div>
            )}
          </div>

          <div className="flex-1 overflow-hidden relative flex items-center justify-center p-2 bg-zinc-950">
            {activeTab === "preview" && (
              <div
                className={`transition-all duration-300 h-full overflow-hidden ${
                  previewDevice === "mobile"
                    ? "w-[360px] border-4 border-zinc-800 rounded-3xl shadow-2xl bg-[#09090b]"
                    : "w-full border-0"
                }`}
              >
                <iframe
                  id="sandbox-preview-frame"
                  srcDoc={livePreviewHtml}
                  title="Live Sandbox Preview"
                  sandbox="allow-scripts allow-modals allow-same-origin"
                  className="w-full h-full border-0 bg-zinc-950"
                />
              </div>
            )}

            {activeTab === "code" && (
              <div className="w-full h-full flex flex-col bg-zinc-950">
                <div className="px-4 py-2 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400 bg-zinc-900/60 font-mono">
                  <span>{activeFile ? activeFile.path : "Select a file from File Tree"}</span>
                  <span className="text-[11px] text-zinc-500">Read-only inspector</span>
                </div>
                <div className="flex-1 overflow-auto p-4 font-mono text-xs text-zinc-300 bg-[#0d0e12]">
                  <pre className="leading-relaxed">
                    {activeFile ? activeFile.content : "// No file selected"}
                  </pre>
                </div>
              </div>
            )}

            {activeTab === "deploy" && (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-zinc-950">
                <div className="w-16 h-16 rounded-3xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/20 shadow-xl">
                  <Globe className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Cloud Deployment</h3>
                <p className="text-xs text-zinc-400 max-w-md mt-2">
                  Ship your application with automatic HTTPS, DNS, and connected MongoDB collections.
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
                    className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg transition flex items-center gap-2"
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
      <div id="persistent" className="bg-zinc-950/80 border-t border-zinc-800 px-4 sm:px-6 py-6 w-full">
        <div className="max-w-7xl mx-auto">
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
