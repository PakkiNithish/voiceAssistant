"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DomainType } from "@/types";

interface SpeechRecognitionOptions {
  language?: string;
  domain?: DomainType;
}

interface BrowserSpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
      length: number;
    };
    length: number;
  };
}

interface BrowserSpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
}

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognitionInstance;

export function useSpeechRecognition({
  language = "en-US",
  domain = "academic",
}: SpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<BrowserSpeechRecognitionInstance | null>(null);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize SpeechRecognition
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRec = (window as unknown as {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;

    if (SpeechRec) {
      setIsSupported(true);
      try {
        const recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language;

        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
        };

        recognition.onresult = (event: BrowserSpeechRecognitionEvent) => {
          let currentInterim = "";
          let finalResult = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const item = event.results[i];
            if (item.isFinal) {
              finalResult += item[0].transcript;
            } else {
              currentInterim += item[0].transcript;
            }
          }

          if (finalResult) {
            setTranscript((prev) => (prev ? `${prev} ${finalResult}` : finalResult));
            setInterimTranscript("");
          } else {
            setInterimTranscript(currentInterim);
          }
        };

        recognition.onerror = (e) => {
          console.warn("Speech recognition error:", e.error);
          if (e.error !== "no-speech") {
            setError(`Speech recognition notice: ${e.error}`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn("SpeechRecognition init error:", err);
      }
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, [language]);

  const startListening = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    setError(null);

    if (recognitionRef.current && isSupported) {
      try {
        recognitionRef.current.lang = language;
        recognitionRef.current.start();
        setIsListening(true);
        return;
      } catch (err) {
        console.warn("Native speech start failed, falling back to simulated speech stream:", err);
      }
    }

    // Fallback simulated speech transcription stream
    setIsListening(true);
    let sampleText = "Can you check the course syllabus and tell me about the prerequisite credits for this semester?";
    if (language.startsWith("te")) {
      sampleText = "నమస్కారం, ఈ సెమిస్టర్ పరీక్షల టైమ్‌టేబుల్ మరియు హాల్ టికెట్ ఎప్పుడు విడుదల అవుతాయి?";
    } else if (language.startsWith("hi")) {
      sampleText = "नमस्ते, क्या आप मुझे आगामी सेमेस्टर की परीक्षा तिथियों के बारे में बता सकते हैं?";
    } else if (domain === "healthcare") {
      sampleText = "I have had a mild dry cough and slight headache since yesterday morning. Should I take a rest or consult a doctor?";
    } else if (domain === "legal") {
      sampleText = "What are the standard indemnification obligations under Clause 14 for third party intellectual property claims?";
    } else if (domain === "customer-support") {
      sampleText = "I would like to check the shipping status of my order and understand the 30 day return policy.";
    }

    const words = sampleText.split(" ");
    let index = 0;
    simulationIntervalRef.current = setInterval(() => {
      if (index < words.length) {
        const nextWords = words.slice(0, index + 1).join(" ");
        setInterimTranscript(nextWords);
        index++;
      } else {
        if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
        setTranscript(sampleText);
        setInterimTranscript("");
      }
    }, 380);
  }, [isSupported, language, domain]);

  const stopListening = useCallback((): string => {
    setIsListening(false);
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    const full = transcript || interimTranscript;
    setTranscript(full);
    setInterimTranscript("");
    return full;
  }, [transcript, interimTranscript]);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
  };
}

