"use client";

import React, { useState } from "react";
import {
  History,
  Search,
  Mic,
  MessageSquare,
  Sparkles,
  Calendar,
  Clock,
  Eye,
  Trash2,
  Download,
  Filter,
  Volume2,
  User,
  Bot,
} from "lucide-react";
import { useAgentStore } from "@/hooks/useAgentStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatDuration, formatRelativeTime, getLanguageName } from "@/lib/utils";
import { ConversationSession, DomainType, InteractionType } from "@/types";
import { DOMAINS } from "@/lib/mock-data";

export default function ConversationsPage() {
  const { conversations, deleteConversation, clearAllConversations } = useAgentStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedSession, setSelectedSession] = useState<ConversationSession | null>(null);

  // Filter conversations
  const filteredSessions = conversations.filter((conv) => {
    const matchesSearch =
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDomain = domainFilter === "all" || conv.domain === domainFilter;
    const matchesType = typeFilter === "all" || conv.type === typeFilter;

    return matchesSearch && matchesDomain && matchesType;
  });

  const exportSessionAsJson = (session: ConversationSession) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(session, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `conversation-${session.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportSessionAsTxt = (session: ConversationSession) => {
    let transcript = `Conversation Session: ${session.title}\n`;
    transcript += `ID: ${session.id}\nDate: ${session.createdAt}\nDomain: ${session.domain}\nLanguage: ${session.language}\n`;
    transcript += `------------------------------------------------------------\n\n`;

    session.messages.forEach((msg) => {
      transcript += `[${msg.role.toUpperCase()}] (${msg.type}) - ${msg.timestamp}:\n${msg.content}\n\n`;
    });

    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(transcript);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `transcript-${session.id}.txt`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="indigo" size="sm">
              <History className="h-3 w-3" />
              Dialogue Archive
            </Badge>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Conversation History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Review past voice dialogues and text chats. Inspect transcripts, speech duration,
            accuracy confidence scores, and tool executions across domains.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700">
            <span>Total Logged:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {conversations.length} Sessions
            </span>
          </div>
          {conversations.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllConversations}
              className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950 border-rose-200 dark:border-rose-900"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transcripts by keyword..."
                icon={<Search className="h-4 w-4" />}
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <select
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                <option value="all">All Domains</option>
                {Object.values(DOMAINS).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                <option value="all">All Modalities</option>
                <option value="voice">Voice Only</option>
                <option value="text">Text Only</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSessions.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
            <History className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No conversations found
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search query or domain filters.
            </p>
          </div>
        ) : (
          filteredSessions.map((session) => {
            const domainInfo = DOMAINS[session.domain] || DOMAINS.academic;

            return (
              <div
                key={session.id}
                className="group relative flex flex-col justify-between p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900 shadow-xs hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider font-mono">
                      {domainInfo.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" size="sm" className="text-[10px] gap-1 font-mono">
                        {session.type === "voice" ? <Mic className="h-2.5 w-2.5" /> : <MessageSquare className="h-2.5 w-2.5" />}
                        {session.type}
                      </Badge>
                      <Badge variant="outline" size="sm" className="text-[10px]">
                        {getLanguageName(session.language)}
                      </Badge>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {session.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {session.preview}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(session.createdAt)}
                    </span>
                    <span>·</span>
                    <span>{formatDuration(session.durationSec)}</span>
                    <span>·</span>
                    <span>{session.messages.length} messages</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedSession(session)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteConversation(session.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                      title="Delete conversation"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Conversation Details Modal */}
      {selectedSession && (
        <Modal
          isOpen={!!selectedSession}
          onClose={() => setSelectedSession(null)}
          title={selectedSession.title}
          description={`Session ID: ${selectedSession.id} · Recorded ${formatRelativeTime(selectedSession.createdAt)}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {/* Session Metadata Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Domain: {selectedSession.domain}
                </span>
                <span>·</span>
                <span>Language: {selectedSession.language}</span>
                <span>·</span>
                <span>Duration: {formatDuration(selectedSession.durationSec)}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => exportSessionAsTxt(selectedSession)}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-blue-600 dark:text-slate-400 cursor-pointer"
                >
                  <Download className="h-3 w-3" /> TXT
                </button>
                <button
                  type="button"
                  onClick={() => exportSessionAsJson(selectedSession)}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-blue-600 dark:text-slate-400 cursor-pointer"
                >
                  <Download className="h-3 w-3" /> JSON
                </button>
              </div>
            </div>

            {/* Turn by turn transcript */}
            <div className="space-y-3.5">
              {selectedSession.messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-blue-50/60 border-blue-200/60 text-slate-900 dark:bg-blue-950/40 dark:border-blue-900 dark:text-slate-100"
                      : "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-800 dark:text-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 text-[10px] text-slate-400 font-mono">
                    <span className="font-bold uppercase flex items-center gap-1 text-slate-600 dark:text-slate-300">
                      {m.role === "user" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                      {m.role} ({m.type})
                    </span>
                    <span>{formatRelativeTime(m.timestamp)}</span>
                  </div>

                  <div>{m.content}</div>

                  {m.toolsUsed && m.toolsUsed.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-[10px] text-blue-600 dark:text-blue-400">
                      <Sparkles className="h-3 w-3 shrink-0" />
                      <span>Tools executed: {m.toolsUsed.join(", ")}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

