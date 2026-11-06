"use client";

import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  User,
  Volume2,
  Cpu,
  Activity,
  Palette,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sun,
  Moon,
  Laptop,
  Sparkles,
  Key,
  ExternalLink,
} from "lucide-react";
import { useAgentStore } from "@/hooks/useAgentStore";
import { useTheme } from "@/hooks/useTheme";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Slider } from "@/components/ui/Slider";
import { Badge } from "@/components/ui/Badge";
import { AppSettings } from "@/types";
import { LANGUAGE_OPTIONS } from "@/lib/utils";

export default function SettingsPage() {
  const { settings, updateSettings } = useAgentStore();
  const { theme, setTheme } = useTheme();

  const [formData, setFormData] = useState<AppSettings>(settings);
  const [pingStatus, setPingStatus] = useState<"idle" | "testing" | "success" | "offline">("idle");
  const [pingMessage, setPingMessage] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    apiClient.setBaseUrl(formData.fastApi.baseUrl);
    apiClient.setApiKey(formData.fastApi.apiKey);

    // Sync LLM key to FastAPI backend if reachable
    try {
      fetch(`${formData.fastApi.baseUrl}/llm/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: formData.llm.provider,
          groqApiKey: formData.llm.apiKey.startsWith("gsk_") || formData.llm.provider === "groq" ? formData.llm.apiKey : undefined,
          openaiApiKey: formData.llm.apiKey.startsWith("sk-") || formData.llm.provider === "openai" ? formData.llm.apiKey : undefined,
          geminiApiKey: formData.llm.apiKey.startsWith("AIza") || formData.llm.provider === "gemini" ? formData.llm.apiKey : undefined,
          ollamaModel: formData.llm.modelName,
        }),
      }).catch(() => {});
    } catch {}
  };

  const handleTestBackendConnection = async () => {
    setPingStatus("testing");
    apiClient.setBaseUrl(formData.fastApi.baseUrl);
    apiClient.setApiKey(formData.fastApi.apiKey);

    const result = await apiClient.checkHealth();
    if (result.status === "connected") {
      setPingStatus("success");
      setPingMessage("FastAPI backend connected successfully on " + formData.fastApi.baseUrl);
    } else {
      setPingStatus("offline");
      setPingMessage(result.message);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="indigo" size="sm">
              <SettingsIcon className="h-3 w-3" />
              Platform Configuration
            </Badge>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            System & Engine Settings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Configure user credentials, voice synthesis rates, audio noise cancellation,
            AI inference parameters, and Python FastAPI server connectivity.
          </p>
        </div>

        <Button onClick={handleSave} className="gap-2 shrink-0 rounded-xl">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: User Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" />
              User Profile
            </CardTitle>
            <CardDescription>Academic and organizational user information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <Input
                  value={formData.profile.fullName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: { ...formData.profile, fullName: e.target.value },
                    })
                  }
                  placeholder="e.g. Nithish Kumar"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={formData.profile.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: { ...formData.profile, email: e.target.value },
                    })
                  }
                  placeholder="nithish@univ.edu"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Department / Institution
              </label>
              <Input
                value={formData.profile.organization}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    profile: { ...formData.profile, organization: e.target.value },
                  })
                }
                placeholder="School of Computing & AI Research"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Speech & Voice Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-indigo-500" />
              Speech & Audio Settings
            </CardTitle>
            <CardDescription>
              Acoustic capture, noise suppression, and speech synthesis tempo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Speech Delivery Rate (TTS)
                  </span>
                  <span className="font-mono text-blue-600 font-semibold">
                    {formData.voice.speechRate}x
                  </span>
                </div>
                <Slider
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  value={formData.voice.speechRate}
                  onChange={(v) =>
                    setFormData({
                      ...formData,
                      voice: { ...formData.voice, speechRate: v },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Voice Pitch Frequency
                  </span>
                  <span className="font-mono text-blue-600 font-semibold">
                    {formData.voice.pitch}x
                  </span>
                </div>
                <Slider
                  min={0.8}
                  max={1.4}
                  step={0.05}
                  value={formData.voice.pitch}
                  onChange={(v) =>
                    setFormData({
                      ...formData,
                      voice: { ...formData.voice, pitch: v },
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Auto-Play Voice
                  </span>
                  <p className="text-[10px] text-slate-400">Speak replies automatically</p>
                </div>
                <Switch
                  checked={formData.voice.autoPlayResponse}
                  onCheckedChange={(val) =>
                    setFormData({
                      ...formData,
                      voice: { ...formData.voice, autoPlayResponse: val },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Noise Suppression
                  </span>
                  <p className="text-[10px] text-slate-400">Filter background hum</p>
                </div>
                <Switch
                  checked={formData.voice.noiseSuppression}
                  onCheckedChange={(val) =>
                    setFormData({
                      ...formData,
                      voice: { ...formData.voice, noiseSuppression: val },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Echo Cancellation
                  </span>
                  <p className="text-[10px] text-slate-400">Reduce speaker feedback</p>
                </div>
                <Switch
                  checked={formData.voice.echoCancellation}
                  onCheckedChange={(val) =>
                    setFormData({
                      ...formData,
                      voice: { ...formData.voice, echoCancellation: val },
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Generative AI Model Connection */}
        <Card className="border-blue-200/80 dark:border-blue-900/60 shadow-xs">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Generative AI Model Connection (LLM Engine)
                </CardTitle>
                <CardDescription>
                  Connect your voice assistant to live AI models (Groq Llama 3, OpenAI GPT-4o, Google Gemini, or Ollama)
                </CardDescription>
              </div>
              <Badge variant={formData.llm.apiKey ? "success" : "secondary"} size="sm" className="font-mono">
                {formData.llm.apiKey ? "Key Configured" : "Offline / Built-in"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Provider Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  AI Model Provider
                </label>
                <select
                  value={formData.llm.provider}
                  onChange={(e) => {
                    const p = e.target.value as any;
                    let defaultModel = "llama-3.3-70b-versatile";
                    if (p === "openai") defaultModel = "gpt-4o-mini";
                    else if (p === "gemini") defaultModel = "gemini-1.5-flash";
                    else if (p === "ollama") defaultModel = "llama3";
                    setFormData({
                      ...formData,
                      llm: { ...formData.llm, provider: p, modelName: defaultModel },
                    });
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                >
                  <option value="auto">Auto-Detect from API Key</option>
                  <option value="groq">Groq (Recommended - Free & 300 tps Fast)</option>
                  <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
                  <option value="gemini">Google Gemini (Gemini 1.5 Flash)</option>
                  <option value="ollama">Ollama Local (Offline & Free)</option>
                </select>
              </div>

              {/* Model Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Model Identifier
                </label>
                <Input
                  value={formData.llm.modelName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      llm: { ...formData.llm, modelName: e.target.value },
                    })
                  }
                  placeholder="e.g. llama-3.3-70b-versatile or gpt-4o-mini"
                />
              </div>
            </div>

            {/* API Key Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-slate-400" />
                  Provider API Key
                </label>
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  Get free Groq key <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
              <Input
                type="password"
                value={formData.llm.apiKey}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    llm: { ...formData.llm, apiKey: e.target.value },
                  })
                }
                placeholder="Paste your Groq (gsk_...), OpenAI (sk-...), or Gemini (AIza...) key"
              />
              <p className="text-[11px] text-slate-400">
                You can also paste this key directly into <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">backend/.env</code>.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Python FastAPI Integration */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  Python FastAPI Backend Integration
                </CardTitle>
                <CardDescription>
                  Configure connection to the Python NLP and speech recognition backend server
                </CardDescription>
              </div>
              <Badge variant="outline" size="sm" className="font-mono">
                FastAPI:8000
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  FastAPI Base URL
                </label>
                <Input
                  value={formData.fastApi.baseUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fastApi: { ...formData.fastApi, baseUrl: e.target.value },
                    })
                  }
                  placeholder="http://localhost:8000/api/v1"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  API Key / Token (Optional)
                </label>
                <Input
                  type="password"
                  value={formData.fastApi.apiKey}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fastApi: { ...formData.fastApi, apiKey: e.target.value },
                    })
                  }
                  placeholder="vx_live_xxxxxxxxxxxxxxxx"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Backend Status Check
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  When offline, the frontend operates seamlessly via the built-in intelligent simulated engine.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestBackendConnection}
                disabled={pingStatus === "testing"}
                className="shrink-0 gap-1.5"
              >
                {pingStatus === "testing" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Activity className="h-3.5 w-3.5 text-blue-500" />
                )}
                Test Connection
              </Button>
            </div>

            {/* Test result message */}
            {pingStatus !== "idle" && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                  pingStatus === "success"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-900"
                    : pingStatus === "offline"
                    ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-900"
                    : "bg-slate-50 text-slate-700 border-slate-200"
                }`}
              >
                {pingStatus === "success" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : pingStatus === "offline" ? (
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                ) : null}
                <span>{pingMessage}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 4: Theme & Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Palette className="h-4 w-4 text-amber-500" />
              Theme & Appearance
            </CardTitle>
            <CardDescription>
              Light theme is the default per design guidelines; dark mode is available
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "light" as const, label: "Light Theme", icon: Sun, desc: "Clean white & neutrals" },
                { id: "dark" as const, label: "Dark Mode", icon: Moon, desc: "Low-light dark slate" },
                { id: "system" as const, label: "System Default", icon: Laptop, desc: "Syncs with OS" },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = theme === opt.id;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTheme(opt.id)}
                    className={`flex flex-col items-center text-center p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20 dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-100"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    <Icon className="h-5 w-5 mb-1.5 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-xs">{opt.label}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-end p-4 rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
          <Button type="submit" className="gap-2 rounded-xl">
            <Save className="h-4 w-4" />
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
}

