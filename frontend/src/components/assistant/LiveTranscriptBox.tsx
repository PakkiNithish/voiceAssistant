"use client";

import React from "react";
import { Mic, Activity } from "lucide-react";

interface LiveTranscriptBoxProps {
  transcript: string;
  interimTranscript: string;
  isRecording: boolean;
}

export function LiveTranscriptBox({
  transcript,
  interimTranscript,
  isRecording,
}: LiveTranscriptBoxProps) {
  const hasText = transcript || interimTranscript;

  if (!isRecording && !hasText) return null;

  return (
    <div className="w-full max-w-xl mx-auto my-2 rounded-xl border border-blue-200/80 bg-blue-50/60 p-3.5 shadow-xs dark:border-blue-900/60 dark:bg-blue-950/30 transition-all animate-in fade-in">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
          <Mic className="h-3.5 w-3.5 animate-pulse" />
          <span>Live Speech Transcription (ASR)</span>
        </div>
        {isRecording && (
          <div className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-mono">
            <Activity className="h-3 w-3 animate-pulse" />
            <span>Streaming frames...</span>
          </div>
        )}
      </div>

      <div className="text-sm text-slate-800 dark:text-slate-100 min-h-[24px]">
        {transcript}
        {interimTranscript && (
          <span className="text-slate-400 dark:text-slate-500 italic ml-1">
            {interimTranscript}
            <span className="inline-block w-1.5 h-3.5 bg-blue-500 ml-0.5 animate-pulse" />
          </span>
        )}
        {!hasText && isRecording && (
          <span className="text-xs text-slate-400 italic">Listening for voice input...</span>
        )}
      </div>
    </div>
  );
}

