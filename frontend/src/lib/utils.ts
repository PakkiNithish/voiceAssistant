import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const LANGUAGE_OPTIONS = [
  { code: "en-US", label: "English (US)", native: "English", flag: "🇺🇸" },
  { code: "te-IN", label: "Telugu (India)", native: "తెలుగు", flag: "🇮🇳" },
  { code: "hi-IN", label: "Hindi (India)", native: "हिंदी", flag: "🇮🇳" },
  { code: "es-ES", label: "Spanish", native: "Español", flag: "🇪🇸" },
  { code: "fr-FR", label: "French", native: "Français", flag: "🇫🇷" },
  { code: "de-DE", label: "German", native: "Deutsch", flag: "🇩🇪" },
  { code: "ta-IN", label: "Tamil (India)", native: "தமிழ்", flag: "🇮🇳" },
  { code: "kn-IN", label: "Kannada (India)", native: "ಕನ್ನಡ", flag: "🇮🇳" },
];

export function getLanguageName(code: string): string {
  const match = LANGUAGE_OPTIONS.find((l) => l.code === code || l.code.startsWith(code));
  return match ? `${match.flag} ${match.label}` : code;
}

