"use client";

import React from "react";
import { Mic, Square, Loader2, Sparkles } from "lucide-react";
import { InteractionState } from "@/types";
import { cn } from "@/lib/utils";

interface VoiceMicButtonProps {
  state: InteractionState;
  isRecording: boolean;
  onToggleRecord: () => void;
  disabled?: boolean;
}

export function VoiceMicButton({
  state,
  isRecording,
  onToggleRecord,
  disabled = false,
}: VoiceMicButtonProps) {
  const isProcessing = state === "processing" || state === "generating";

  return (
    <div className="relative flex items-center justify-center select-none">
      {/* Concentric Pulse Rings when recording */}
      {isRecording && (
        <>
          <span className="absolute h-28 w-28 rounded-full bg-blue-500/20 animate-ping duration-1000" />
          <span className="absolute h-24 w-24 rounded-full bg-blue-500/30 animate-pulse duration-700" />
        </>
      )}

      {/* Main Action Button */}
      <button
        type="button"
        onClick={onToggleRecord}
        disabled={disabled || isProcessing}
        className={cn(
          "relative z-10 flex h-20 w-20 items-center justify-center rounded-full shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
          isRecording
            ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/30 scale-105"
            : isProcessing
            ? "bg-indigo-600 text-white shadow-indigo-500/20"
            : "bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/30 hover:scale-105 active:scale-95"
        )}
        title={
          isRecording
            ? "Click to Stop Listening & Transcribe"
            : isProcessing
            ? "AI Processing..."
            : "Click to Start Voice Input"
        }
      >
        {isRecording ? (
          <Square className="h-7 w-7 fill-white text-white transition-transform animate-pulse" />
        ) : isProcessing ? (
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        ) : (
          <Mic className="h-8 w-8 text-white transition-transform hover:scale-110" />
        )}
      </button>

      {/* Domain Sparkle Indicator */}
      <div className="absolute -bottom-1 -right-1 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xs">
        <Sparkles className="h-3.5 w-3.5 text-blue-500" />
      </div>
    </div>
  );
}

