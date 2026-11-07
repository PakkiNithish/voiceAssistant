"use client";

import React from "react";
import Link from "next/link";
import {
  Mic,
  MessageSquare,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Sliders,
  Code2,
  Sparkles,
  Globe2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useAgentStore } from "@/hooks/useAgentStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DOMAINS } from "@/lib/mock-data";
import { formatDuration, formatRelativeTime } from "@/lib/utils";

export default function DashboardPage() {
  const { config, activeDomain, conversations, apiKeys, connectedModel } = useAgentStore();
  const domainInfo = DOMAINS[activeDomain] || DOMAINS.academic;

  // Dynamic calculations from real state
  const totalConversations = conversations.length;
  const voiceConversations = conversations.filter((c) => c.type === "voice");
  const totalVoiceInteractions = voiceConversations.length;
  const totalVoiceSeconds = conversations.reduce((sum, c) => sum + (c.durationSec || 0), 0);
  const voiceMins = Math.round(totalVoiceSeconds / 60);
  const voiceRatioPercent =
    totalConversations > 0 ? Math.round((totalVoiceInteractions / totalConversations) * 100) : 100;

  const totalApiCalls = apiKeys.reduce((sum, k) => sum + (k.requestsCount || 0), 0);
  const activeKeysCount = apiKeys.filter((k) => k.status === "active").length;

  const statCards = [
    {
      title: "Active AI Agent Status",
      value: connectedModel.isConnected ? connectedModel.displayName : "Online · v2.4",
      subtext: `${config.name} (${domainInfo.name})`,
      icon: Activity,
      badge: connectedModel.isConnected ? "Live LLM" : "Offline",
      badgeVariant: (connectedModel.isConnected ? "success" : "secondary") as any,
      color: "text-emerald-500",
      bgGradient: "from-emerald-500/10 to-transparent",
    },
    {
      title: "Total Conversations",
      value: `${totalConversations.toLocaleString()}`,
      subtext: `${conversations.filter((c) => c.domain === activeDomain).length} in ${domainInfo.name}`,
      icon: MessageSquare,
      badge: "Real-time",
      badgeVariant: "default" as const,
      color: "text-blue-500",
      bgGradient: "from-blue-500/10 to-transparent",
    },
    {
      title: "Voice Interactions",
      value: `${totalVoiceInteractions.toLocaleString()}`,
      subtext: `${voiceMins} mins total recorded`,
      icon: Mic,
      badge: `${voiceRatioPercent}% Voice Ratio`,
      badgeVariant: "indigo" as const,
      color: "text-indigo-500",
      bgGradient: "from-indigo-500/10 to-transparent",
    },
    {
      title: "External API Calls",
      value: `${totalApiCalls.toLocaleString()}`,
      subtext: `${activeKeysCount} active application keys`,
      icon: Code2,
      badge: "REST Live",
      badgeVariant: "secondary" as const,
      color: "text-amber-500",
      bgGradient: "from-amber-500/10 to-transparent",
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="default" size="sm">
                <Sparkles className="h-3 w-3" />
                AI Voice Platform
              </Badge>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Dynamic Engine Running
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Design & Development of AI Voice Assistant
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Unified speech recognition and natural language processing platform. Seamlessly adapt
              a common AI core to specialized domains using tailored system instructions, rules, and tools,
              and expose them as secure APIs for your external web and mobile applications.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link href="/assistant">
              <Button size="lg" className="rounded-xl shadow-md gap-2">
                <Mic className="h-4 w-4" />
                Start Voice Assistant
              </Button>
            </Link>
            <Link href="/configuration">
              <Button variant="outline" size="lg" className="rounded-xl gap-2">
                <Sliders className="h-4 w-4" />
                Configure Engine
              </Button>
            </Link>
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Dynamic Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Card
              key={i}
              className="relative overflow-hidden border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-shadow"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {card.title}
                  </span>
                  <Badge variant={card.badgeVariant} size="sm">
                    {card.badge}
                  </Badge>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
                    {card.value}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="truncate max-w-[190px]">{card.subtext}</span>
                  <Icon className={`h-4 w-4 ${card.color} shrink-0`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/assistant" className="group">
          <div className="h-full p-5 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xs hover:border-blue-400 dark:hover:border-blue-600 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs group-hover:scale-105 transition-transform">
                <Mic className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Launch Voice Assistant
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Test real-time speech recognition, live audio visualizer, and multilingual natural voice responses
              driven dynamically by your active domain configuration.
            </p>
          </div>
        </Link>

        <Link href="/configuration" className="group">
          <div className="h-full p-5 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs group-hover:scale-105 transition-transform">
                <Sliders className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Configure Domain Rules
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Fine-tune system instructions, allowed and restricted topics, enabled tools, response styles, and speech rate.
              Changes take effect immediately across voice and API.
            </p>
          </div>
        </Link>

        <Link href="/integrations" className="group">
          <div className="h-full p-5 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xs hover:border-amber-400 dark:hover:border-amber-600 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white shadow-xs group-hover:scale-105 transition-transform">
                <Code2 className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              External Application APIs
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Generate API keys and integrate any domain-specialized agent into your external apps with cURL, Python, Flutter, or JavaScript.
            </p>
          </div>
        </Link>
      </div>

      {/* Two Column Layout: Performance Overview & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Performance Metrics */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Engine Performance Overview</CardTitle>
                  <CardDescription>
                    End-to-end latency benchmarks across speech recognition, NLP reasoning, and voice synthesis
                  </CardDescription>
                </div>
                <Badge variant="outline" size="sm" className="font-mono">
                  Live Status
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Latency Pipeline Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Voice Pipeline Latency Breakdown
                  </span>
                  <span className="text-slate-500 font-mono">
                    Total: ~295ms (Real-time conversational response)
                  </span>
                </div>

                {/* Multi-segmented Progress Bar */}
                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex dark:bg-slate-800">
                  <div
                    style={{ width: "28%" }}
                    className="bg-blue-500 h-full"
                    title="ASR Speech Recognition: 85ms"
                  />
                  <div
                    style={{ width: "45%" }}
                    className="bg-indigo-500 h-full"
                    title="NLP Domain Processing: 135ms"
                  />
                  <div
                    style={{ width: "27%" }}
                    className="bg-emerald-500 h-full"
                    title="TTS Synthesis: 75ms"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-slate-600 dark:text-slate-400">1. ASR Capture (85ms)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    <span className="text-slate-600 dark:text-slate-400">2. LLM Reasoning (135ms)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-slate-600 dark:text-slate-400">3. TTS Playback (75ms)</span>
                  </div>
                </div>
              </div>

              {/* Accuracy & Efficiency Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                    ASR Accuracy
                  </span>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100 font-mono mt-0.5">
                    98.5%
                  </p>
                  <span className="text-[10px] text-emerald-600 flex items-center gap-0.5">
                    <TrendingUp className="h-2.5 w-2.5" /> High word fidelity
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                    Uptime SLA
                  </span>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100 font-mono mt-0.5">
                    99.98%
                  </p>
                  <span className="text-[10px] text-slate-400">Production ready</span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                    Active Config
                  </span>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100 font-mono mt-0.5 capitalize truncate">
                    {config.responseStyle}
                  </p>
                  <span className="text-[10px] text-slate-400">Response style</span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                    External API Calls
                  </span>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100 font-mono mt-0.5">
                    {totalApiCalls.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-emerald-600">Cross-app integration</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Recent Conversations List */}
        <div>
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest voice sessions</CardDescription>
              </div>
              <Link
                href="/conversations"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all ({totalConversations})
              </Link>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  <MessageSquare className="h-6 w-6 mx-auto mb-2 text-slate-300" />
                  No conversations recorded yet. Start by speaking with the Voice Assistant!
                </div>
              ) : (
                conversations.slice(0, 4).map((conv) => (
                  <div
                    key={conv.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800/60 dark:bg-slate-900/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {conv.title}
                      </span>
                      <Badge variant="secondary" size="sm" className="text-[10px] shrink-0 font-mono">
                        {conv.type === "voice" ? <Mic className="h-2.5 w-2.5" /> : null}
                        {conv.type}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      {conv.preview}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
                      <span>{formatRelativeTime(conv.createdAt)}</span>
                      <span>{formatDuration(conv.durationSec)}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
