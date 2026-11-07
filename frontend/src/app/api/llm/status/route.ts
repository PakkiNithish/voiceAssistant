import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  let ollamaRunning = false;
  let installedOllamaModels: string[] = [];
  let fastApiRunning = false;
  let fastApiModel = "";

  // 1. Probe local Ollama instance on http://localhost:11434
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch("http://localhost:11434/api/tags", {
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      ollamaRunning = true;
      if (Array.isArray(data.models)) {
        installedOllamaModels = data.models
          .map((m: any) => m.name || m.model || "")
          .filter((name: string) => name && !name.toLowerCase().includes("embed"));
      }
    }
  } catch {
    ollamaRunning = false;
  }

  // 2. Probe local FastAPI server on http://localhost:8000
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    const res = await fetch("http://localhost:8000/api/v1/health", {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      fastApiRunning = true;
      fastApiModel = data.activeProvider || "";
    }
  } catch {
    fastApiRunning = false;
  }

  // Determine recommended Ollama model
  let recommendedModel = "";
  if (installedOllamaModels.length > 0) {
    if (installedOllamaModels.includes("llama3.2:latest")) {
      recommendedModel = "llama3.2:latest";
    } else if (installedOllamaModels.includes("llama3:latest") || installedOllamaModels.includes("llama3")) {
      recommendedModel = "llama3:latest";
    } else {
      recommendedModel = installedOllamaModels[0];
    }
  }

  return NextResponse.json({
    status: "ok",
    ollama: {
      running: ollamaRunning,
      installedModels: installedOllamaModels,
      recommendedModel,
      url: "http://localhost:11434",
    },
    fastApi: {
      running: fastApiRunning,
      activeProvider: fastApiModel,
      url: "http://localhost:8000",
    },
  });
}

