"use client";

import React from "react";
import {
  Mic,
  Activity,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Volume2,
} from "lucide-react";
import { InteractionState } from "@/types";
import { cn } from "@/lib/utils";

interface StateIndicatorProps {
  state: InteractionState;
  errorMessage?: string | null;
}

export function StateIndicator({ state, errorMessage }: StateIndicatorProps) {
  const stateConfigs: Record<
    InteractionState,
    {
      label: string;
      desc: string;
      icon: React.ComponentType<{ className?: string }>;
      colorClass: string;
      bgClass: string;
    }
  > = {
    ready: {
      label: "Ready to Listen",
      desc: "Tap the microphone or type below to speak with the agent.",
      icon: Mic,
      colorClass: "text-slate-600 dark:text-slate-300",
      bgClass: "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
    },
    listening: {
      label: "Listening to Voice...",
      desc: "Speak naturally. Web Audio is recording and streaming live audio frames.",
      icon: Activity,
      colorClass: "text-rose-600 dark:text-rose-400 animate-pulse",
      bgClass: "bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900",
    },
    processing: {
      label: "Processing Audio (ASR)",
      desc: "Transcribing speech and extracting acoustic domain features...",
      icon: Cpu,
      colorClass: "text-indigo-600 dark:text-indigo-400 animate-spin",
      bgClass: "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-900",
    },
    generating: {
      label: "Generating Domain Response",
      desc: "Grounding with indexed knowledge base and synthesizing reply...",
      icon: Cpu,
      colorClass: "text-blue-600 dark:text-blue-400",
      bgClass: "bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900",
    },
    speaking: {
      label: "Speaking Response",
      desc: "Vocalizing answer using text-to-speech audio synthesis.",
      icon: Volume2,
      colorClass: "text-emerald-600 dark:text-emerald-400 animate-pulse",
      bgClass: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900",
    },
    completed: {
      label: "Response Completed",
      desc: "Interaction finished. Spoken answer is ready.",
      icon: CheckCircle2,
      colorClass: "text-emerald-600 dark:text-emerald-400",
      bgClass: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900",
    },
    error: {
      label: "Error State",
      desc: errorMessage || "An error occurred during audio capture or transcription.",
      icon: AlertCircle,
      colorClass: "text-rose-600 dark:text-rose-400",
      bgClass: "bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900",
    },
  };

  const current = stateConfigs[state] || stateConfigs.ready;
  const Icon = current.icon;

  return (
    <div className="flex flex-col items-center text-center max-w-md mx-auto">
      <div
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold shadow-2xs transition-all",
          current.bgClass
        )}
      >
        <Icon className={cn("h-3.5 w-3.5", current.colorClass)} />
        <span className={current.colorClass}>{current.label}</span>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {current.desc}
      </p>
    </div>
  );
}

