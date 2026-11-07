"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sun,
  Moon,
  Globe,
  Menu,
  Activity,
  ChevronDown,
  Check,
  Sparkles,
  Cpu,
  RefreshCw,
  Zap,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useAgentStore } from "@/hooks/useAgentStore";
import { LANGUAGE_OPTIONS } from "@/lib/utils";
import { DOMAINS } from "@/lib/mock-data";
import { DomainType } from "@/types";

interface TopNavProps {
  onToggleMobileMenu: () => void;
}

export function TopNav({ onToggleMobileMenu }: TopNavProps) {
  const pathname = usePathname();
  const { toggleTheme, isDark } = useTheme();
  const {
    currentLanguage,
    setCurrentLanguage,
    activeDomain,
    setActiveDomain,
    settings,
    connectedModel,
    switchActiveModel,
    refreshModelStatus,
  } = useAgentStore();

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isDomainOpen, setIsDomainOpen] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Derive title from pathname
  const getPageTitle = () => {
    if (pathname === "/" || pathname === "/dashboard") return "Overview Dashboard";
    if (pathname.startsWith("/assistant")) return "AI Voice Assistant";
    if (pathname.startsWith("/configuration")) return "Agent Configuration";
    if (pathname.startsWith("/knowledge-base")) return "Knowledge Base";
    if (pathname.startsWith("/conversations")) return "Conversation History";
    if (pathname.startsWith("/settings")) return "Platform Settings";
    return "AI Voice Platform";
  };

  const currentLangObj =
    LANGUAGE_OPTIONS.find((l) => l.code === currentLanguage) || LANGUAGE_OPTIONS[0];

  const currentDomainObj = DOMAINS[activeDomain] || DOMAINS.academic;

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 md:px-6 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/90 transition-colors">
      {/* Left: Mobile hamburger + Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
          aria-label="Toggle menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="flex flex-col">
          <h1 className="text-sm md:text-base font-semibold text-slate-900 dark:text-white tracking-tight">
            {getPageTitle()}
          </h1>
          <span className="hidden sm:inline-block text-[10px] text-slate-400 dark:text-slate-500">
            Speech Recognition & NLP System
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Live Connected AI Model Indicator & Quick Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setIsModelOpen(!isModelOpen);
              setIsDomainOpen(false);
              setIsLangOpen(false);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all shadow-2xs cursor-pointer border ${
              connectedModel.isConnected
                ? "bg-emerald-50/90 border-emerald-300 text-emerald-800 dark:bg-emerald-950/70 dark:border-emerald-800 dark:text-emerald-200 hover:bg-emerald-100"
                : "bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/70 dark:border-amber-800 dark:text-amber-200 hover:bg-amber-100"
            }`}
            title="Click to view or switch connected AI model"
          >
            {connectedModel.isConnected ? (
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            ) : (
              <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
            )}

            <Cpu className="h-3 w-3 shrink-0" />
            <span className="text-[11px] font-semibold max-w-[150px] truncate">
              {connectedModel.isConnected
                ? connectedModel.displayName
                : "No Model Connected"}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {isModelOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsModelOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 z-50 w-72 rounded-xl border border-slate-200 bg-white p-2.5 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Connected AI Model
                    </span>
                  </div>
                  <button
                    onClick={async () => {
                      setIsRefreshing(true);
                      await refreshModelStatus();
                      setTimeout(() => setIsRefreshing(false), 500);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Re-detect models"
                  >
                    <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
                  </button>
                </div>

                {/* Active Model Summary Card */}
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 mb-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Engine</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                        connectedModel.isConnected
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      {connectedModel.isConnected ? "🟢 Online" : "🟡 Offline"}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {connectedModel.displayName}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {connectedModel.provider === "ollama"
                      ? "Running locally on http://localhost:11434 (0ms network cost, 100% private)"
                      : connectedModel.isConnected
                      ? "Connected via Cloud Provider API"
                      : "Operating in rule-based offline fallback"}
                  </div>
                </div>

                {/* Local Ollama Models List if available */}
                {connectedModel.installedOllamaModels && connectedModel.installedOllamaModels.length > 0 && (
                  <div className="mb-2.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-1">
                      Local Ollama Models
                    </div>
                    <div className="space-y-1">
                      {connectedModel.installedOllamaModels.map((m) => {
                        const isActive =
                          connectedModel.provider === "ollama" && connectedModel.modelName === m;
                        return (
                          <button
                            key={m}
                            onClick={() => {
                              switchActiveModel("ollama", m);
                              setIsModelOpen(false);
                            }}
                            className={`flex w-full items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors text-left ${
                              isActive
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold border border-blue-200/60 dark:border-blue-900"
                                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              <span className="font-mono text-[11px] truncate">{m}</span>
                            </span>
                            {isActive && <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Cloud Providers Options */}
                <div className="mb-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-1">
                    Cloud Providers
                  </div>
                  <div className="space-y-1">
                    {[
                      { id: "groq", name: "Groq (Llama-3.3-70B)", model: "llama-3.3-70b-versatile" },
                      { id: "gemini", name: "Google Gemini (1.5 Flash)", model: "gemini-1.5-flash" },
                      { id: "openai", name: "OpenAI (GPT-4o-mini)", model: "gpt-4o-mini" },
                    ].map((cp) => {
                      const isActive =
                        connectedModel.provider === cp.id &&
                        Boolean(settings.llm.apiKey);
                      return (
                        <button
                          key={cp.id}
                          onClick={() => {
                            if (settings.llm.apiKey) {
                              switchActiveModel(cp.id, cp.model, settings.llm.apiKey);
                              setIsModelOpen(false);
                            } else {
                              setIsModelOpen(false);
                              window.location.href = "/settings";
                            }
                          }}
                          className={`flex w-full items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors text-left ${
                            isActive
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold border border-blue-200/60 dark:border-blue-900"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <Zap className="h-3 w-3 text-amber-500" />
                            <span className="text-[11px] truncate">{cp.name}</span>
                          </span>
                          {isActive ? (
                            <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                          ) : !settings.llm.apiKey ? (
                            <span className="text-[9px] text-amber-600 dark:text-amber-400">Needs key</span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Footer link to Settings */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <Link
                    href="/settings"
                    onClick={() => setIsModelOpen(false)}
                    className="text-[11px] font-semibold text-blue-600 hover:underline dark:text-blue-400 flex items-center gap-1"
                  >
                    <span>Configure API Keys & Endpoints</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Domain Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsDomainOpen(!isDomainOpen);
              setIsLangOpen(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 transition-colors shadow-2xs"
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            <span className="hidden sm:inline-block max-w-[110px] truncate">
              {currentDomainObj.name}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {isDomainOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDomainOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 z-50 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Agent Domain
                </div>
                {Object.values(DOMAINS).map((dom) => (
                  <button
                    key={dom.id}
                    onClick={() => {
                      setActiveDomain(dom.id as DomainType);
                      setIsDomainOpen(false);
                    }}
                    className="flex w-full items-start justify-between p-2 rounded-lg text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {dom.name}
                      </span>
                      <span className="text-[10px] text-slate-400 line-clamp-1">
                        {dom.tagline}
                      </span>
                    </div>
                    {activeDomain === dom.id && (
                      <Check className="h-4 w-4 text-blue-600 shrink-0 ml-1.5" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Language Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsLangOpen(!isLangOpen);
              setIsDomainOpen(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 transition-colors shadow-2xs"
            title="Choose conversation language"
          >
            <Globe className="h-3.5 w-3.5 text-slate-500" />
            <span className="font-medium text-xs">{currentLangObj.native}</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {isLangOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsLangOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 z-50 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select Voice & NLP Language
                </div>
                {LANGUAGE_OPTIONS.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setCurrentLanguage(lang.code);
                      setIsLangOpen(false);
                    }}
                    className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <span>{lang.flag}</span>
                      <span className="font-medium">{lang.label}</span>
                    </span>
                    {currentLanguage === lang.code && (
                      <Check className="h-3.5 w-3.5 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
          aria-label="Toggle color theme"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            <Sun className="h-4 w-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
          ) : (
            <Moon className="h-4 w-4 text-slate-600 transition-transform -rotate-12 hover:rotate-0" />
          )}
        </button>

        {/* FastAPI Link Pill */}
        <div
          className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50/70 border border-blue-100 dark:bg-blue-950/40 dark:border-blue-900 text-[11px] text-blue-700 dark:text-blue-300 font-mono"
          title="Python FastAPI Backend Integration Port"
        >
          <Activity className="h-3 w-3 text-blue-500" />
          FastAPI:8000
        </div>
      </div>
    </header>
  );
}

