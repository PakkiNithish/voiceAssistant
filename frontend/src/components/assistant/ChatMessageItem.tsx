"use client";

import React, { useState } from "react";
import {
  Volume2,
  VolumeX,
  Copy,
  Check,
  Mic,
  MessageSquare,
  Sparkles,
  Database,
  Search,
  Calendar,
  Clock,
} from "lucide-react";
import { ChatMessage } from "@/types";
import { formatDuration, formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ChatMessageItemProps {
  message: ChatMessage;
  onSpeak: (text: string) => void;
  isSpeakingThis: boolean;
  onStopSpeak: () => void;
}

export function ChatMessageItem({
  message,
  onSpeak,
  isSpeakingThis,
  onStopSpeak,
}: ChatMessageItemProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toolIcon = (toolName: string) => {
    switch (toolName) {
      case "databaseLookup":
        return <Database className="h-3 w-3" />;
      case "webSearch":
        return <Search className="h-3 w-3" />;
      case "appointmentBooking":
        return <Calendar className="h-3 w-3" />;
      default:
        return <Sparkles className="h-3 w-3" />;
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end gap-3 max-w-2xl ml-auto">
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
              {formatRelativeTime(message.timestamp)}
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-medium border border-blue-200/60 dark:border-blue-900">
              {message.type === "voice" ? (
                <>
                  <Mic className="h-2.5 w-2.5" />
                  Voice {message.audioDurationSec ? `(${formatDuration(message.audioDurationSec)})` : ""}
                </>
              ) : (
                <>
                  <MessageSquare className="h-2.5 w-2.5" />
                  Text
                </>
              )}
            </span>
          </div>

          <div className="rounded-2xl rounded-tr-xs bg-blue-600 px-4 py-2.5 text-white shadow-xs text-sm leading-relaxed max-w-xl">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start gap-3 max-w-2xl">
      {/* Assistant Avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs text-xs font-bold mt-1">
        AI
      </div>

      <div className="flex flex-col items-start w-full">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            VoxCore Agent
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            {formatRelativeTime(message.timestamp)}
          </span>
          {message.latencyMs && (
            <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              <Clock className="h-2.5 w-2.5" />
              {message.latencyMs}ms
            </span>
          )}
          {message.confidenceScore && (
            <span className="text-[10px] font-mono px-1 py-0.2 rounded-sm bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900">
              {Math.round(message.confidenceScore * 100)}% conf
            </span>
          )}
          {message.modelUsed && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded-sm border",
                message.isLiveAi
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 font-semibold"
                  : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  message.isLiveAi ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                )}
              />
              {message.modelUsed}
            </span>
          )}
        </div>

        {/* Message Bubble */}
        <div
          className={cn(
            "relative rounded-2xl rounded-tl-xs border bg-white px-4 py-3 text-slate-800 shadow-2xs text-sm leading-relaxed dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 w-full transition-all",
            isSpeakingThis && "border-blue-400 ring-2 ring-blue-500/20"
          )}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>

          {/* Enabled Tools Executed */}
          {message.toolsUsed && message.toolsUsed.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-2">
              {message.toolsUsed.map((tool) => (
                <span
                  key={tool}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium"
                >
                  {toolIcon(tool)}
                  {tool}
                </span>
              ))}
            </div>
          )}

          {/* Action buttons (TTS Speaker + Copy) */}
          <div className="mt-2.5 flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  if (isSpeakingThis) {
                    onStopSpeak();
                  } else {
                    onSpeak(message.content);
                  }
                }}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer",
                  isSpeakingThis
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                )}
                title={isSpeakingThis ? "Stop Reading Aloud" : "Read Response Aloud (TTS)"}
              >
                {isSpeakingThis ? (
                  <>
                    <VolumeX className="h-3.5 w-3.5" />
                    <span className="flex gap-0.5 items-center">
                      <span className="h-1.5 w-0.5 bg-current animate-pulse" />
                      <span className="h-2.5 w-0.5 bg-current animate-pulse delay-75" />
                      <span className="h-1.5 w-0.5 bg-current animate-pulse delay-150" />
                    </span>
                    <span className="text-[11px]">Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5" />
                    <span className="text-[11px]">Speak</span>
                  </>
                )}
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title="Copy response text"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-500" />
                  <span className="text-[10px] text-emerald-600">Copied</span>
                </>
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

