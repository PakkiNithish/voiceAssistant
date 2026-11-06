"use client";

import React, { useState } from "react";
import {
  Sliders,
  RotateCcw,
  Save,
  Sparkles,
  Plus,
  X,
  Check,
  Cpu,
  Search,
  Database,
  Calculator,
  Calendar,
  Terminal,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useAgentStore } from "@/hooks/useAgentStore";
import { DOMAINS } from "@/lib/mock-data";
import { AgentConfig, DomainType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Slider } from "@/components/ui/Slider";
import { Badge } from "@/components/ui/Badge";
import { LANGUAGE_OPTIONS } from "@/lib/utils";

export default function ConfigurationPage() {
  const { config, updateConfig, resetConfig } = useAgentStore();

  // Form state initialized from current store config
  const [formData, setFormData] = useState<AgentConfig>(config);
  const [newAllowedTopic, setNewAllowedTopic] = useState("");
  const [newRestrictedTopic, setNewRestrictedTopic] = useState("");

  const handleDomainChange = (domain: DomainType) => {
    const info = DOMAINS[domain];
    setFormData((prev) => ({
      ...prev,
      domain,
      name: `VoxCore ${info.name}`,
      role: info.defaultRole,
      systemInstructions: info.defaultInstructions,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formData);
  };

  const handleReset = () => {
    resetConfig();
    setFormData(config);
  };

  const addAllowedTopic = () => {
    if (newAllowedTopic.trim() && !formData.allowedTopics.includes(newAllowedTopic.trim())) {
      setFormData((prev) => ({
        ...prev,
        allowedTopics: [...prev.allowedTopics, newAllowedTopic.trim()],
      }));
      setNewAllowedTopic("");
    }
  };

  const removeAllowedTopic = (topic: string) => {
    setFormData((prev) => ({
      ...prev,
      allowedTopics: prev.allowedTopics.filter((t) => t !== topic),
    }));
  };

  const addRestrictedTopic = () => {
    if (newRestrictedTopic.trim() && !formData.restrictedTopics.includes(newRestrictedTopic.trim())) {
      setFormData((prev) => ({
        ...prev,
        restrictedTopics: [...prev.restrictedTopics, newRestrictedTopic.trim()],
      }));
      setNewRestrictedTopic("");
    }
  };

  const removeRestrictedTopic = (topic: string) => {
    setFormData((prev) => ({
      ...prev,
      restrictedTopics: prev.restrictedTopics.filter((t) => t !== topic),
    }));
  };

  const toggleLanguage = (langCode: string) => {
    setFormData((prev) => {
      const exists = prev.supportedLanguages.includes(langCode);
      if (exists) {
        if (prev.supportedLanguages.length === 1) return prev; // Keep at least one
        return {
          ...prev,
          supportedLanguages: prev.supportedLanguages.filter((l) => l !== langCode),
        };
      } else {
        return {
          ...prev,
          supportedLanguages: [...prev.supportedLanguages, langCode],
        };
      }
    });
  };

  const estimatedTokens = Math.round(formData.systemInstructions.length / 4);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="indigo" size="sm">
              <Cpu className="h-3 w-3" />
              Dynamic Agent Specialization
            </Badge>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
              Live Configuration Active
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Agent Domain Configuration
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
            Configure system behavior, speech parameters, safety boundaries, and tools.
            The core AI engine dynamically applies these parameters in the voice assistant and across external APIs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
          <Button size="sm" onClick={handleSave} className="gap-1.5">
            <Save className="h-3.5 w-3.5" />
            Save Configuration
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Preset Domain Specialization Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-500" />
              Domain Specialization Preset
            </CardTitle>
            <CardDescription>
              Select a domain preset to load optimized system instructions, tools, and safety boundaries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {Object.values(DOMAINS).map((dom) => {
                const isSelected = formData.domain === dom.id;
                return (
                  <button
                    key={dom.id}
                    type="button"
                    onClick={() => handleDomainChange(dom.id as DomainType)}
                    className={`flex flex-col items-center text-center p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/70 text-blue-900 font-semibold ring-2 ring-blue-500/20 dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-100"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    <span className="font-semibold text-xs line-clamp-1">{dom.name}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Section 1: Basic Identity & Role */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Agent Identity & Role Definition</CardTitle>
            <CardDescription>
              Define how the agent identifies itself and speaks during interaction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Agent Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. VoxCore Campus Advisor"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Agent Role / Persona
                </label>
                <Input
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Senior Academic Counselor"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Agent Description
              </label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief summary of the agent's capabilities"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: System Instructions (Prompt Engineering) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">System Instructions & Prompt</CardTitle>
                <CardDescription>
                  Core guidelines dictating reasoning, tone, speech conciseness, and guardrails
                </CardDescription>
              </div>
              <Badge variant="outline" size="sm" className="font-mono text-[11px]">
                ~{estimatedTokens} tokens
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <textarea
              rows={7}
              value={formData.systemInstructions}
              onChange={(e) =>
                setFormData({ ...formData, systemInstructions: e.target.value })
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs font-mono text-slate-900 leading-relaxed placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              placeholder="Enter system prompt instructions..."
            />
            <p className="text-[11px] text-slate-400">
              Tip: Instruct the model to keep voice responses concise for optimal text-to-speech listening.
            </p>
          </CardContent>
        </Card>

        {/* Section 3: Language & Response Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Languages & Locales</CardTitle>
              <CardDescription>Configure supported speech recognition & NLP languages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Default Language
                </label>
                <select
                  value={formData.defaultLanguage}
                  onChange={(e) => setFormData({ ...formData, defaultLanguage: e.target.value })}
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {LANGUAGE_OPTIONS.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {l.label} ({l.native})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Enabled Languages (Multi-select)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {LANGUAGE_OPTIONS.map((l) => {
                    const isEnabled = formData.supportedLanguages.includes(l.code);
                    return (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => toggleLanguage(l.code)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                          isEnabled
                            ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                        }`}
                      >
                        <span>{l.flag}</span>
                        <span>{l.native}</span>
                        {isEnabled && <Check className="h-3 w-3 text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Response Style & Voice Speed</CardTitle>
              <CardDescription>Tailor conversational tone and speech delivery tempo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Response Tone & Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["concise", "conversational", "detailed", "empathetic", "technical"] as const).map(
                    (style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setFormData({ ...formData, responseStyle: style })}
                        className={`px-3 py-1.5 text-xs rounded-lg border capitalize text-left cursor-pointer transition-colors ${
                          formData.responseStyle === style
                            ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold dark:bg-blue-950 dark:text-blue-300"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                        }`}
                      >
                        {style}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Speech Delivery Rate (TTS)
                  </span>
                  <span className="font-mono text-blue-600 font-semibold">{formData.speechRate}x</span>
                </div>
                <Slider
                  min={0.7}
                  max={1.5}
                  step={0.1}
                  value={formData.speechRate}
                  onChange={(v) => setFormData({ ...formData, speechRate: v })}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section 4: Enabled Tools & Integrations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Enabled Tools & Autonomous Capabilities</CardTitle>
            <CardDescription>
              Grant the agent autonomous capability to invoke tools during reasoning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  key: "databaseLookup" as const,
                  label: "Database / Records Query",
                  desc: "Query student or customer records and catalog data.",
                  icon: Database,
                },
                {
                  key: "appointmentBooking" as const,
                  label: "Appointment Booking",
                  desc: "Schedule advisor or clinic consultations automatically.",
                  icon: Calendar,
                },
                {
                  key: "calculator" as const,
                  label: "Calculator & Math Engine",
                  desc: "Calculate GPA, semester credits, fees, and arithmetic.",
                  icon: Calculator,
                },
                {
                  key: "webSearch" as const,
                  label: "Live Web Search",
                  desc: "Search external web sources for real-time information.",
                  icon: Search,
                },
                {
                  key: "codeExecution" as const,
                  label: "Code Execution Sandbox",
                  desc: "Safely execute code snippets and diagnostics.",
                  icon: Terminal,
                },
              ].map((tool) => {
                const Icon = tool.icon;
                const isChecked = formData.enabledTools[tool.key];

                return (
                  <div
                    key={tool.key}
                    className="flex items-start justify-between p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40"
                  >
                    <div className="flex gap-2.5">
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                          {tool.label}
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                          {tool.desc}
                        </p>
                      </div>
                    </div>

                    <Switch
                      checked={isChecked}
                      onCheckedChange={(val) =>
                        setFormData({
                          ...formData,
                          enabledTools: {
                            ...formData.enabledTools,
                            [tool.key]: val,
                          },
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Allowed vs Restricted Topics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                Allowed & Focus Topics
              </CardTitle>
              <CardDescription>Topics the agent is authorized to discuss</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newAllowedTopic}
                  onChange={(e) => setNewAllowedTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAllowedTopic())}
                  placeholder="Add permitted topic (Press Enter)..."
                />
                <Button type="button" size="sm" onClick={addAllowedTopic}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5 min-h-[60px] p-2 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                {formData.allowedTopics.map((topic) => (
                  <span
                    key={topic}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-medium border border-emerald-200/60 dark:border-emerald-900"
                  >
                    {topic}
                    <button
                      type="button"
                      onClick={() => removeAllowedTopic(topic)}
                      className="hover:text-emerald-900 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-500" />
                Restricted Topics (Active Guardrails)
              </CardTitle>
              <CardDescription>Topics the agent will strictly refuse to answer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newRestrictedTopic}
                  onChange={(e) => setNewRestrictedTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRestrictedTopic())}
                  placeholder="Add restricted topic (Press Enter)..."
                />
                <Button type="button" size="sm" variant="danger" onClick={addRestrictedTopic}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5 min-h-[60px] p-2 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                {formData.restrictedTopics.map((topic) => (
                  <span
                    key={topic}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-medium border border-rose-200/60 dark:border-rose-900"
                  >
                    {topic}
                    <button
                      type="button"
                      onClick={() => removeRestrictedTopic(topic)}
                      className="hover:text-rose-900 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
          <Link
            href="/integrations"
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Need to call this configured agent from another app? View API Docs</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" size="sm" onClick={handleReset}>
              Reset
            </Button>
            <Button type="submit" size="sm" className="gap-2">
              <Save className="h-4 w-4" />
              Save Configuration
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
