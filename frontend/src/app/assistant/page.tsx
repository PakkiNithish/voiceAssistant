"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Trash2,
  AlertCircle,
  Sparkles,
  Info,
  CornerDownLeft,
} from "lucide-react";
import { useAgentStore } from "@/hooks/useAgentStore";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { apiClient } from "@/lib/api-client";
import { DOMAINS } from "@/lib/mock-data";
import { InteractionState } from "@/types";
import { VoiceMicButton } from "@/components/assistant/VoiceMicButton";
import { AudioVisualizer } from "@/components/assistant/AudioVisualizer";
import { StateIndicator } from "@/components/assistant/StateIndicator";
import { ChatMessageItem } from "@/components/assistant/ChatMessageItem";
import { LiveTranscriptBox } from "@/components/assistant/LiveTranscriptBox";
import { Button } from "@/components/ui/Button";

export default function AssistantPage() {
  const {
    config,
    activeDomain,
    currentLanguage,
    currentMessages,
    addMessage,
    clearCurrentMessages,
    settings,
  } = useAgentStore();

  const [interactionState, setInteractionState] = useState<InteractionState>("ready");
  const [textInput, setTextInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Audio Hooks
  const {
    isRecording,
    recordingDuration,
    visualizerData,
    permissionStatus,
    startRecording,
    stopRecording,
  } = useAudioRecorder();

  const {
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    language: currentLanguage,
    domain: activeDomain,
  });

  const { isSpeaking, speak, stop: stopSpeech } = useSpeechSynthesis();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, interimTranscript]);

  // Handle toggling microphone recording
  const handleToggleVoice = async () => {
    if (isRecording) {
      // User clicked stop recording
      setInteractionState("processing");
      const transcribedSpeech = stopListening();
      const { duration } = await stopRecording();

      const finalQuery = transcribedSpeech.trim() || transcript.trim() || interimTranscript.trim();

      if (!finalQuery) {
        setInteractionState("ready");
        resetTranscript();
        return;
      }

      // Add user voice message
      addMessage({
        role: "user",
        content: finalQuery,
        type: "voice",
        audioDurationSec: duration || 4,
      });

      resetTranscript();
      executeAgentInference(finalQuery, true);
    } else {
      // User started recording
      setErrorMessage(null);
      stopSpeech();
      setInteractionState("listening");
      resetTranscript();
      startListening();
      await startRecording();
    }
  };

  // Execute Agent Reasoning via API Client
  const executeAgentInference = async (queryText: string, fromVoice = false) => {
    setInteractionState("generating");

    try {
      const response = await apiClient.sendChatMessage({
        message: queryText,
        domain: activeDomain,
        language: currentLanguage,
        config,
        conversationHistory: currentMessages,
        isVoice: fromVoice,
      });

      // Add assistant response to history
      addMessage({
        role: "assistant",
        content: response.content,
        type: fromVoice ? "voice" : "text",
        latencyMs: response.latencyMs,
        confidenceScore: response.confidenceScore,
        toolsUsed: response.toolsUsed,
      });

      setInteractionState("completed");

      // Auto-vocalize response if user spoke or if enabled in settings
      if (fromVoice || settings.voice.autoPlayResponse) {
        setInteractionState("speaking");
        speak(response.content, {
          language: currentLanguage,
          rate: config.speechRate || settings.voice.speechRate || 1.0,
          onEnd: () => {
            setInteractionState("ready");
          },
        });
      } else {
        setTimeout(() => setInteractionState("ready"), 1500);
      }
    } catch (err) {
      console.error("Agent execution error:", err);
      setErrorMessage("Failed to process conversation with AI Engine.");
      setInteractionState("error");
    }
  };

  // Handle text input submission
  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = textInput.trim();
    if (!query || interactionState === "processing" || interactionState === "generating") return;

    stopSpeech();
    addMessage({
      role: "user",
      content: query,
      type: "text",
    });
    setTextInput("");
    executeAgentInference(query, false);
  };

  const domainInfo = DOMAINS[activeDomain] || DOMAINS.academic;

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950">
      {/* Top Domain Info Bar */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Active Agent:
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900">
              {config.name}
            </span>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline-block">·</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline-block truncate max-w-sm">
            {domainInfo.tagline}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCurrentMessages}
            className="text-xs text-slate-500 hover:text-rose-600 gap-1.5"
            title="Reset conversation state"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Clear Chat</span>
          </Button>
        </div>
      </div>

      {/* Microphone Permission Warning if denied */}
      {permissionStatus === "denied" && (
        <div className="flex items-center justify-between px-6 py-2 bg-amber-50 border-b border-amber-200 dark:bg-amber-950/50 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              Microphone access is blocked by your browser. Running in interactive simulated audio stream mode.
            </span>
          </div>
          <button
            onClick={() => handleToggleVoice()}
            className="font-semibold underline hover:text-amber-950"
          >
            Retry Permission
          </button>
        </div>
      )}

      {/* Main Conversation Chat Stream */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-5">
        <div className="max-w-3xl mx-auto space-y-4">
          {currentMessages.map((msg) => (
            <ChatMessageItem
              key={msg.id}
              message={msg}
              onSpeak={(text) =>
                speak(text, {
                  language: currentLanguage,
                  rate: config.speechRate || 1.0,
                })
              }
              isSpeakingThis={isSpeaking}
              onStopSpeak={stopSpeech}
            />
          ))}

          {/* Live Transcript Stream while recording */}
          <LiveTranscriptBox
            transcript={transcript}
            interimTranscript={interimTranscript}
            isRecording={isRecording}
          />

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Voice Interaction & Input Control Center */}
      <div className="border-t border-slate-200/80 bg-white p-4 md:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-md">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          {/* Interaction State Pill */}
          <StateIndicator state={interactionState} errorMessage={errorMessage} />

          {/* Real-time Dynamic Audio Visualizer */}
          <AudioVisualizer
            bars={visualizerData}
            duration={recordingDuration}
            isRecording={isRecording}
          />

          {/* Central Microphone Button */}
          <div className="my-2">
            <VoiceMicButton
              state={interactionState}
              isRecording={isRecording}
              onToggleRecord={handleToggleVoice}
            />
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 mb-4 text-center">
            {isRecording
              ? "Speaking now... Click red stop button when done."
              : "Click the microphone to start voice interaction, or type below."}
          </p>

          {/* Alternative Text Input Form */}
          <form
            onSubmit={handleSendText}
            className="w-full flex items-center gap-2 relative"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={`Ask ${config.name} in ${currentLanguage}... (e.g. "${domainInfo.samplePrompts[0]}")`}
                disabled={isRecording || interactionState === "processing"}
                className="w-full h-11 pl-4 pr-10 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900 transition-all"
              />
              <span className="absolute right-3 top-3 text-[10px] font-mono text-slate-400 flex items-center gap-0.5">
                <CornerDownLeft className="h-3 w-3" />
              </span>
            </div>

            <Button
              type="submit"
              disabled={
                !textInput.trim() ||
                isRecording ||
                interactionState === "processing" ||
                interactionState === "generating"
              }
              className="h-11 px-5 rounded-xl gap-2 font-semibold shadow-xs"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </form>

          {/* Sample Prompts Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1 mr-1">
              <Sparkles className="h-3 w-3 text-blue-500" />
              Suggested:
            </span>
            {domainInfo.samplePrompts.slice(0, 2).map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setTextInput(prompt);
                  inputRef.current?.focus();
                }}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors line-clamp-1 max-w-[280px] text-left cursor-pointer"
              >
                &ldquo;{prompt}&rdquo;
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

