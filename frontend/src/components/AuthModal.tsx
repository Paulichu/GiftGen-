"use client";

import React, { useState } from "react";
import { X, Sparkles, Lock, Mail, ArrowRight, Loader2, Check } from "lucide-react";
import { apiRequest, setStoredToken } from "@/lib/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  initialMode?: "login" | "register";
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialMode = "login" }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(initialMode === "register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const payload: any = { email, password };
      if (isRegister && name) payload.name = name;

      const data = await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (data.access_token) {
        setStoredToken(data.access_token);
        onSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Failed to authenticate. Please verify your details.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      // Demo credentials auto-login
      const demoEmail = "builder@emergent.sh";
      const demoPassword = "Password123!";
      try {
        const loginData = await apiRequest("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: demoEmail, password: demoPassword }),
        });
        setStoredToken(loginData.access_token);
        onSuccess(loginData.user);
        onClose();
      } catch {
        // Register demo user if not existing
        const regData = await apiRequest("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ email: demoEmail, password: demoPassword, name: "Emergent Creator" }),
        });
        setStoredToken(regData.access_token);
        onSuccess(regData.user);
        onClose();
      }
    } catch (err: any) {
      setError("Demo access initialization failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl text-left">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-zinc-400 hover:text-white transition p-1 rounded-full hover:bg-zinc-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Icon */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">emergent</span>
        </div>

        <h3 className="text-2xl font-bold tracking-tight text-white">
          {isRegister ? "Create your builder account" : "Log in to Emergent"}
        </h3>
        <p className="text-zinc-400 text-sm mt-1">
          {isRegister
            ? "Start with 100 free generation credits today."
            : "Continue building full-stack web and mobile apps with AI."}
        </p>

        {error && (
          <div className="mt-4 p-3 bg-red-950/50 border border-red-800/60 rounded-xl text-red-200 text-xs">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-3">
          {/* Quick 1-click Demo */}
          <button
            onClick={handleQuickDemoLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-zinc-100 text-zinc-950 font-medium text-sm rounded-xl transition shadow-md"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-indigo-600" />}
            Instant 1-Click Builder Demo
          </button>

          <div className="relative my-4 flex items-center justify-center">
            <div className="border-t border-zinc-800 w-full"></div>
            <span className="bg-zinc-950 px-3 text-xs text-zinc-500 uppercase">or with email</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {isRegister && (
              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            )}
            <div>
              <label className="text-xs text-zinc-400 font-medium block mb-1">Email address</label>
              <input
                type="email"
                required
                placeholder="builder@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 font-medium block mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition shadow-lg shadow-indigo-600/30"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {isRegister ? "Create Free Account" : "Log In"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center text-xs text-zinc-400">
          {isRegister ? (
            <span>
              Already have an account?{" "}
              <button
                onClick={() => setIsRegister(false)}
                className="text-indigo-400 hover:underline font-medium"
              >
                Log in
              </button>
            </span>
          ) : (
            <span>
              Don't have an account yet?{" "}
              <button
                onClick={() => setIsRegister(true)}
                className="text-indigo-400 hover:underline font-medium"
              >
                Sign up for free
              </button>
            </span>
          )}
        </div>

        <p className="mt-6 text-center text-[10px] text-zinc-500">
          By continuing, you agree to Emergent's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
