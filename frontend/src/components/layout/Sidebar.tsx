"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Mic,
  Sliders,
  Code2,
  History,
  Settings,
  Sparkles,
  Radio,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAgentStore } from "@/hooks/useAgentStore";
import { DOMAINS } from "@/lib/mock-data";

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { activeDomain, settings } = useAgentStore();
  const currentDomainInfo = DOMAINS[activeDomain] || DOMAINS.academic;

  const navItems = [
    {
      title: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      title: "AI Assistant",
      href: "/assistant",
      icon: Mic,
      badge: "Voice Live",
      highlight: true,
    },
    {
      title: "Agent Configuration",
      href: "/configuration",
      icon: Sliders,
      badge: undefined,
    },
    {
      title: "API & Integrations",
      href: "/integrations",
      icon: Code2,
      badge: "REST",
    },
    {
      title: "Conversation History",
      href: "/conversations",
      icon: History,
      badge: undefined,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
      badge: undefined,
    },
  ];

  const isCurrentRoute = (href: string) => {
    if (href === "/dashboard" && (pathname === "/" || pathname === "/dashboard")) {
      return true;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="flex flex-col h-full w-64 border-r border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-950 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 py-4.5 border-b border-slate-100 dark:border-slate-800/60">
        <div className="relative flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
          <Mic className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              VoxCore AI
            </span>
            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              v2.4
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[145px]">
            AI Voice Assistant Platform
          </span>
        </div>
      </div>

      {/* Domain Badge Indicator */}
      <div className="px-3.5 pt-3 pb-1">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                Active Domain
              </span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {currentDomainInfo.name}
              </span>
            </div>
          </div>
          <Radio className="h-3.5 w-3.5 text-emerald-500 animate-pulse shrink-0 ml-1" />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Menu
        </div>
        {navItems.map((item) => {
          const active = isCurrentRoute(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                "group flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all",
                active
                  ? "bg-blue-600 text-white shadow-xs font-semibold dark:bg-blue-600"
                  : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={cn(
                    "h-4 w-4 transition-transform group-hover:scale-105",
                    active ? "text-white" : "text-slate-400 dark:text-slate-500"
                  )}
                />
                <span>{item.title}</span>
              </div>

              {item.badge && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 text-[10px] font-semibold rounded-md uppercase tracking-wide",
                    active
                      ? "bg-blue-700/80 text-blue-100"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Engine Architecture Callout */}
      <div className="px-3 py-2.5 mx-3 mb-2 rounded-xl border border-slate-200/60 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 dark:border-slate-800/60">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Common Engine
          </span>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">ASR + NLP + TTS</span>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
          Multi-domain configurable engine ready to be exposed as external API endpoints.
        </p>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/60">
        <Link
          href="/settings"
          onClick={onCloseMobile}
          className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100/80 dark:hover:bg-slate-900 transition-colors"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-slate-800 to-slate-900 text-white font-semibold text-xs border border-slate-300 dark:border-slate-700 shadow-xs">
              NK
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">
                {settings.profile.fullName}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                {settings.profile.email}
              </span>
            </div>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        </Link>
      </div>
    </aside>
  );
}
