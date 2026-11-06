"use client";

import React from "react";
import { formatDuration } from "@/lib/utils";

interface AudioVisualizerProps {
  bars: number[];
  duration: number;
  isRecording: boolean;
}

export function AudioVisualizer({ bars, duration, isRecording }: AudioVisualizerProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg py-2">
      {/* Bars Container */}
      <div className="flex items-center justify-center gap-1.5 h-16 w-full px-4">
        {bars.map((amplitude, i) => {
          // Calculate height with minimum height of 6px and max of 56px
          const barHeight = isRecording
            ? Math.max(6, Math.min(56, Math.round((amplitude / 100) * 56)))
            : 6;

          return (
            <div
              key={i}
              className="w-1.5 rounded-full transition-all duration-75 ease-out"
              style={{
                height: `${barHeight}px`,
                backgroundColor: isRecording
                  ? i % 2 === 0
                    ? "#2563eb"
                    : "#6366f1"
                  : "#cbd5e1",
                opacity: isRecording ? Math.max(0.4, amplitude / 100) : 0.4,
              }}
            />
          );
        })}
      </div>

      {/* Recording Duration Pill */}
      {isRecording && (
        <div className="flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900 text-xs font-mono font-medium animate-pulse">
          <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
          <span>Recording: {formatDuration(duration)}</span>
        </div>
      )}
    </div>
  );
}

