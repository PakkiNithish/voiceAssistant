"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  recordingDuration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  permissionStatus: "prompt" | "granted" | "denied" | "unsupported";
  permissionError: string | null;
  visualizerData: number[]; // 32 frequency / amplitude levels from 0 to 100
}

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<
    "prompt" | "granted" | "denied" | "unsupported"
  >("prompt");
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [visualizerData, setVisualizerData] = useState<number[]>(
    () => new Array(32).fill(6)
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Check initial support
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionStatus("unsupported");
        setPermissionError("Audio recording is not supported in this browser environment.");
      }
    }
  }, []);

  const updateVisualizer = useCallback(() => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Downsample to 32 bars
    const barsCount = 32;
    const step = Math.floor(bufferLength / barsCount);
    const newBars: number[] = [];

    for (let i = 0; i < barsCount; i++) {
      let sum = 0;
      for (let j = 0; j < step; j++) {
        sum += dataArray[i * step + j] || 0;
      }
      const avg = sum / (step || 1);
      // Map 0-255 to 10-100 with dynamic responsiveness
      const normalized = Math.min(100, Math.max(8, Math.round((avg / 255) * 100)));
      newBars.push(normalized);
    }

    setVisualizerData(newBars);
    animationFrameRef.current = requestAnimationFrame(updateVisualizer);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setPermissionError(null);

      // Clean up previous recordings
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      setAudioBlob(null);
      audioChunksRef.current = [];

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        setPermissionStatus("granted");
      } catch (err: unknown) {
        setPermissionStatus("denied");
        const errMsg = err instanceof Error ? err.message : "Microphone access denied.";
        setPermissionError(errMsg);
        // Start simulated visualizer animation so the user can still test voice experience
        simulateVisualizer();
        setIsRecording(true);
        startTimer();
        return;
      }

      mediaStreamRef.current = stream;

      // Setup Web Audio API Analyser for real visualizer
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        source.connect(analyser);
        analyserRef.current = analyser;

        animationFrameRef.current = requestAnimationFrame(updateVisualizer);
      } catch (err) {
        console.warn("Could not setup audio context analyser:", err);
      }

      // Setup MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "";

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: mimeType || "audio/webm",
        });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setIsPaused(false);
      startTimer();
    } catch (err) {
      console.error("Failed to start recording:", err);
      setPermissionError(err instanceof Error ? err.message : "Could not start audio recorder.");
    }
  }, [audioUrl, updateVisualizer]);

  const simulateVisualizer = useCallback(() => {
    let phase = 0;
    const interval = setInterval(() => {
      phase += 0.2;
      const simulatedBars = Array.from({ length: 32 }, (_, i) => {
        const val = Math.sin(phase + i * 0.3) * 35 + Math.random() * 25 + 25;
        return Math.min(100, Math.max(10, Math.round(val)));
      });
      setVisualizerData(simulatedBars);
    }, 70);

    // Store in animationFrameRef as numeric id
    animationFrameRef.current = interval as unknown as number;
  }, []);

  const startTimer = () => {
    setRecordingDuration(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRecordingDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = useCallback((): Promise<{ blob: Blob | null; duration: number }> => {
    return new Promise((resolve) => {
      const duration = recordingDuration;

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (animationFrameRef.current) {
        if (typeof animationFrameRef.current === "number") {
          cancelAnimationFrame(animationFrameRef.current);
          clearInterval(animationFrameRef.current);
        }
        animationFrameRef.current = null;
      }

      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.onstop = () => {
          const mimeType = mediaRecorderRef.current?.mimeType || "audio/webm";
          const blob = new Blob(audioChunksRef.current, { type: mimeType });
          setAudioBlob(blob);
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          setIsRecording(false);
          setIsPaused(false);
          setVisualizerData(new Array(32).fill(6));
          resolve({ blob, duration });
        };
        mediaRecorderRef.current.stop();
      } else {
        setIsRecording(false);
        setIsPaused(false);
        setVisualizerData(new Array(32).fill(6));
        resolve({ blob: audioBlob, duration });
      }
    });
  }, [audioBlob, recordingDuration]);

  const resetRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setAudioBlob(null);
    setRecordingDuration(0);
    setVisualizerData(new Array(32).fill(6));
  }, [audioUrl]);

  return {
    isRecording,
    isPaused,
    recordingDuration,
    audioBlob,
    audioUrl,
    permissionStatus,
    permissionError,
    visualizerData,
    startRecording,
    stopRecording,
    resetRecording,
  };
}

