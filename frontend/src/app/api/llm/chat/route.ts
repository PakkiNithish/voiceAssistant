import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const {
      message,
      domain = "general",
      language = "en-US",
      config = {},
      provider = "auto",
      model,
      apiKey,
    } = body;

    const style = config.responseStyle || "conversational";
    const role = config.role || "AI Specialist";
    const agentName = config.name || "VoxCore Assistant";
    const systemInstructions = config.systemInstructions || "";
    const allowedTopics = Array.isArray(config.allowedTopics) ? config.allowedTopics.join(", ") : "";

    const langDirective = language.startsWith("te")
      ? "Respond entirely in fluent Telugu (తెలుగు)."
      : language.startsWith("hi")
      ? "Respond entirely in fluent Hindi (हिन्दी)."
      : "Respond in English.";

    const systemPrompt = `You are ${agentName}, operating with the role: ${role}.
Active Domain: ${domain}.
Specialized Instructions: ${systemInstructions}
Permitted Scope: ${allowedTopics}
Response Style: ${style}.
Language Directive: ${langDirective}
IMPORTANT GUIDELINE: Provide a helpful, direct, articulate, and factual answer based on the user's exact input. Your response will be synthesized into spoken voice so do not use markdown tables or emojis excessively.`;

    // 1. If provider is Ollama OR provider is auto (and no cloud key is given)
    const effectiveProvider = provider || "auto";

    if (effectiveProvider === "ollama" || (!apiKey && (effectiveProvider === "auto" || effectiveProvider === "ollama"))) {
      let chosenModel = model || "llama3.2:latest";

      // Probe Ollama to get installed models list if requested model isn't specific
      try {
        const tagsRes = await fetch("http://localhost:11434/api/tags", {
          signal: AbortSignal.timeout(2000),
        });
        if (tagsRes.ok) {
          const tagsData = await tagsRes.json();
          const installed = (tagsData.models || [])
            .map((m: any) => m.name || m.model || "")
            .filter((n: string) => n && !n.includes("embed"));

          if (installed.length > 0 && !installed.includes(chosenModel)) {
            if (installed.includes("llama3.2:latest")) {
              chosenModel = "llama3.2:latest";
            } else if (installed.includes("nemotron-3.5-bolt:e4b")) {
              chosenModel = "nemotron-3.5-bolt:e4b";
            } else {
              chosenModel = installed[0];
            }
          }
        }
      } catch {
        // Continue with chosenModel
      }

      // Query Ollama /api/chat
      try {
        const ollamaRes = await fetch("http://localhost:11434/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: chosenModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: message },
            ],
            stream: false,
            options: {
              temperature: config.temperature ?? 0.4,
              num_predict: config.maxTokens ?? 512,
            },
          }),
          signal: AbortSignal.timeout(90000),
        });

        if (ollamaRes.ok) {
          const ollamaData = await ollamaRes.json();
          const reply = ollamaData.message?.content?.trim();
          if (reply) {
            const latencyMs = Date.now() - startTime;
            return NextResponse.json({
              status: "success",
              content: reply,
              latencyMs,
              confidenceScore: 0.995,
              toolsUsed: ["ollama-local-llm"],
              modelUsed: `Ollama (${chosenModel})`,
              isLiveAi: true,
            });
          }
        }
      } catch (err: any) {
        console.warn("Ollama local query failed:", err?.message);
      }
    }

    // 2. Groq Cloud Fallback
    if (apiKey && (effectiveProvider === "groq" || apiKey.startsWith("gsk_"))) {
      const groqModel = model || "llama-3.3-70b-versatile";
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: groqModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          temperature: config.temperature ?? 0.4,
          max_tokens: config.maxTokens ?? 600,
        }),
      });

      if (groqRes.ok) {
        const gData = await groqRes.json();
        const text = gData.choices?.[0]?.message?.content?.trim();
        if (text) {
          return NextResponse.json({
            status: "success",
            content: text,
            latencyMs: Date.now() - startTime,
            confidenceScore: 0.998,
            toolsUsed: ["groq-cloud-llm"],
            modelUsed: `Groq (${groqModel})`,
            isLiveAi: true,
          });
        }
      }
    }

    // 3. Google Gemini Fallback
    if (apiKey && (effectiveProvider === "gemini" || apiKey.startsWith("AIza"))) {
      const gemModel = model || "gemini-1.5-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${gemModel}:generateContent?key=${apiKey}`;
      const gemRes = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }] }],
          generationConfig: {
            temperature: config.temperature ?? 0.4,
            maxOutputTokens: config.maxTokens ?? 600,
          },
        }),
      });

      if (gemRes.ok) {
        const gemData = await gemRes.json();
        const text = gemData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) {
          return NextResponse.json({
            status: "success",
            content: text,
            latencyMs: Date.now() - startTime,
            confidenceScore: 0.996,
            toolsUsed: ["gemini-cloud-llm"],
            modelUsed: `Google Gemini (${gemModel})`,
            isLiveAi: true,
          });
        }
      }
    }

    // 4. OpenAI Fallback
    if (apiKey && (effectiveProvider === "openai" || apiKey.startsWith("sk-"))) {
      const oaiModel = model || "gpt-4o-mini";
      const oaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: oaiModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          temperature: config.temperature ?? 0.4,
          max_tokens: config.maxTokens ?? 600,
        }),
      });

      if (oaiRes.ok) {
        const oData = await oaiRes.json();
        const text = oData.choices?.[0]?.message?.content?.trim();
        if (text) {
          return NextResponse.json({
            status: "success",
            content: text,
            latencyMs: Date.now() - startTime,
            confidenceScore: 0.994,
            toolsUsed: ["openai-cloud-llm"],
            modelUsed: `OpenAI (${oaiModel})`,
            isLiveAi: true,
          });
        }
      }
    }

    return NextResponse.json(
      {
        status: "offline_fallback",
        error: "No active model responded",
      },
      { status: 503 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", error: err?.message || "Internal inference error" },
      { status: 500 }
    );
  }
}
