"use client";

import React, { useState } from "react";
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
  } = useAgentStore();

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isDomainOpen, setIsDomainOpen] = useState(false);

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
        {/* Agent Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
            Core Engine Online
          </span>
          <span className="text-[10px] text-slate-400 font-mono">295ms</span>
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

