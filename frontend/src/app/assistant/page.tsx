"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Trash2,
  AlertCircle,
  Sparkles,
  Info,
  CornerDownLeft,
  CheckCircle2,
  Key,
  ExternalLink,
  Loader2,
  Zap,
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
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

export default function AssistantPage() {
  const {
    config,
    activeDomain,
    currentLanguage,
    currentMessages,
    addMessage,
    clearCurrentMessages,
    settings,
    updateSettings,
  } = useAgentStore();

  const [interactionState, setInteractionState] = useState<InteractionState>("ready");
  const [textInput, setTextInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live AI Connection Modal State
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [modalProvider, setModalProvider] = useState<"gemini" | "groq" | "openai">(
    settings.llm.provider === "gemini" || settings.llm.provider === "groq" || settings.llm.provider === "openai"
      ? settings.llm.provider
      : "gemini"
  );
  const [modalApiKey, setModalApiKey] = useState(settings.llm.apiKey || "");
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyTestResult, setKeyTestResult] = useState<{ success?: boolean; message?: string } | null>(null);

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
        llmProvider: settings.llm.provider,
        llmApiKey: settings.llm.apiKey,
        llmModel: settings.llm.modelName,
      });

      // Add assistant response to history
      addMessage({
        role: "assistant",
        content: response.content,
        type: fromVoice ? "voice" : "text",
        latencyMs: response.latencyMs,
        confidenceScore: response.confidenceScore,
        toolsUsed: response.toolsUsed,
        modelUsed: response.modelUsed,
        isLiveAi: response.isLiveAi,
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

  const handleTestAndSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalApiKey.trim()) return;
    setIsTestingKey(true);
    setKeyTestResult(null);

    const test = await apiClient.testLlmKey(
      modalProvider,
      modalApiKey.trim(),
      modalProvider === "gemini" ? "gemini-1.5-flash" : modalProvider === "groq" ? "llama-3.3-70b-versatile" : "gpt-4o-mini"
    );

    setIsTestingKey(false);
    if (test.success) {
      setKeyTestResult({ success: true, message: `Connected to ${test.modelName}! Real-time dynamic responses are now active.` });
      const defaultModel = modalProvider === "gemini" ? "gemini-1.5-flash" : modalProvider === "groq" ? "llama-3.3-70b-versatile" : "gpt-4o-mini";
      updateSettings({
        llm: {
          ...settings.llm,
          provider: modalProvider,
          apiKey: modalApiKey.trim(),
          modelName: defaultModel,
        },
      });
      setTimeout(() => {
        setIsConnectModalOpen(false);
        setKeyTestResult(null);
      }, 1400);
    } else {
      setKeyTestResult({ success: false, message: test.error || "Failed to connect. Please verify your API key." });
    }
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
          {settings.llm.apiKey ? (
            <button
              onClick={() => {
                setModalApiKey(settings.llm.apiKey || "");
                setIsConnectModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>AI Connected</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setModalApiKey(settings.llm.apiKey || "");
                setIsConnectModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-800 text-xs font-semibold hover:bg-amber-200 transition-colors cursor-pointer animate-pulse"
            >
              <Zap className="h-3 w-3 text-amber-600 dark:text-amber-400" />
              <span>Connect AI Model</span>
            </button>
          )}

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

      {/* AI Connection Status Banner */}
      {!settings.llm.apiKey ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-6 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 dark:from-amber-950/40 dark:to-orange-950/30 dark:border-amber-900 text-xs">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 shrink-0" />
            <span>
              <strong>Generative AI Not Connected:</strong> Operating in offline template fallback. Connect a free Google Gemini or Groq key to enable dynamic responses for every question.
            </span>
          </div>
          <button
            onClick={() => {
              setModalApiKey(settings.llm.apiKey || "");
              setIsConnectModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-xs transition-colors cursor-pointer shrink-0 text-xs"
          >
            <Zap className="h-3.5 w-3.5" />
            Connect Free AI (30s)
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between px-6 py-1.5 bg-emerald-50/60 border-b border-emerald-200/80 dark:bg-emerald-950/30 dark:border-emerald-900/60 text-[11px] text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              <strong>Live AI Active:</strong> Connected to {settings.llm.modelName || settings.llm.provider}. Responses are generated in real-time based on your exact input.
            </span>
          </div>
          <button
            onClick={() => {
              setModalApiKey(settings.llm.apiKey || "");
              setIsConnectModalOpen(true);
            }}
            className="text-[11px] font-medium text-emerald-700 hover:underline dark:text-emerald-400 cursor-pointer"
          >
            Manage Key
          </button>
        </div>
      )}

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

      {/* Quick Connect AI Modal */}
      <Modal
        isOpen={isConnectModalOpen}
        onClose={() => {
          setIsConnectModalOpen(false);
          setKeyTestResult(null);
        }}
        title="Connect Generative AI Model"
        description="Enable live, real-time dynamic AI responses for any question using your free Google Gemini or Groq API key."
        maxWidth="lg"
      >
        <form onSubmit={handleTestAndSaveKey} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select AI Model Provider
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "gemini" as const, name: "Google Gemini", badge: "Free Tier", desc: "gemini-1.5-flash" },
                { id: "groq" as const, name: "Groq", badge: "Fastest / Free", desc: "llama-3.3-70b" },
                { id: "openai" as const, name: "OpenAI", badge: "GPT-4o", desc: "gpt-4o-mini" },
              ].map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setModalProvider(p.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    modalProvider === p.id
                      ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 dark:border-blue-500 ring-2 ring-blue-500/20"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                    <span>{p.name}</span>
                    {modalProvider === p.id && <CheckCircle2 className="h-3 w-3 text-blue-600" />}
                  </div>
                  <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mt-0.5">{p.badge}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-slate-400" />
                Paste {modalProvider === "gemini" ? "Gemini" : modalProvider === "groq" ? "Groq" : "OpenAI"} API Key:
              </label>
              {modalProvider === "gemini" && (
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  Get free Gemini key <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
              {modalProvider === "groq" && (
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  Get free Groq key <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
              {modalProvider === "openai" && (
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  Get OpenAI key <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
            </div>
            <Input
              type="password"
              value={modalApiKey}
              onChange={(e) => setModalApiKey(e.target.value)}
              placeholder={
                modalProvider === "gemini"
                  ? "AIzaSy..."
                  : modalProvider === "groq"
                  ? "gsk_..."
                  : "sk-..."
              }
              className="font-mono text-xs"
              required
            />
          </div>

          {keyTestResult && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
                keyTestResult.success
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-900"
                  : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-900"
              }`}
            >
              {keyTestResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{keyTestResult.message}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsConnectModalOpen(false);
                setKeyTestResult(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!modalApiKey.trim() || isTestingKey}
              className="gap-1.5"
            >
              {isTestingKey ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Verifying Key...
                </>
              ) : (
                <>
                  <Zap className="h-3.5 w-3.5" />
                  Test & Connect Model
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

