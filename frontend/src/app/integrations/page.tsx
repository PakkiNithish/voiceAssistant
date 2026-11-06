"use client";

import React, { useState } from "react";
import {
  Code2,
  Key,
  Copy,
  Check,
  Plus,
  Trash2,
  Play,
  Terminal,
  Sparkles,
  ExternalLink,
  Shield,
  Layers,
} from "lucide-react";
import { useAgentStore } from "@/hooks/useAgentStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { DOMAINS } from "@/lib/mock-data";
import { DomainType } from "@/types";
import { formatRelativeTime } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

export default function IntegrationsPage() {
  const { apiKeys, createApiKey, deleteApiKey, incrementApiKeyUsage, activeDomain, settings } = useAgentStore();

  const [newKeyName, setNewKeyName] = useState("");
  const [selectedDomains, setSelectedDomains] = useState<string[]>(["all"]);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [selectedLanguageTab, setSelectedLanguageTab] = useState<"curl" | "python" | "javascript">("curl");
  const [activeCodeDomain, setActiveCodeDomain] = useState<DomainType>(activeDomain);

  // Live Playground State
  const [testDomain, setTestDomain] = useState<DomainType>(activeDomain);
  const [testMessage, setTestMessage] = useState("What are the prerequisite credits for this semester?");
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const baseUrl = settings.fastApi.baseUrl || "http://localhost:8000/api/v1";
  const primaryApiKey = apiKeys[0]?.key || "vx_live_your_api_key_here";

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    await createApiKey(newKeyName.trim(), selectedDomains);
    setNewKeyName("");
  };

  const handleCopyKey = (id: string, keyVal: string) => {
    navigator.clipboard.writeText(keyVal);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleRunTest = async () => {
    setIsTesting(true);
    setTestResponse(null);

    try {
      const res = await apiClient.sendChatMessage({
        message: testMessage,
        domain: testDomain,
        language: "en-US",
        config: {
          ...DOMAINS[testDomain],
          id: `agent-${testDomain}`,
          description: DOMAINS[testDomain].tagline,
          role: DOMAINS[testDomain].defaultRole,
          domain: testDomain,
          systemInstructions: DOMAINS[testDomain].defaultInstructions,
          defaultLanguage: "en-US",
          supportedLanguages: ["en-US"],
          responseStyle: "conversational",
          temperature: 0.4,
          maxTokens: 512,
          allowedTopics: ["general"],
          restrictedTopics: ["restricted"],
          enabledTools: {
            webSearch: false,
            calculator: true,
            appointmentBooking: true,
            databaseLookup: true,
            codeExecution: false,
          },
          speechRate: 1.0,
          voiceGender: "female",
          voiceModel: "Neural-Voice-Clarion-v2",
          updatedAt: new Date().toISOString(),
        },
        conversationHistory: [],
      });

      // Increment usage count for the key dynamically
      incrementApiKeyUsage(primaryApiKey);

      const sampleJson = {
        domain: testDomain,
        response: {
          content: res.content,
          latency_ms: res.latencyMs,
          confidence_score: res.confidenceScore,
          tools_executed: res.toolsUsed,
          timestamp: new Date().toISOString(),
        },
      };

      setTestResponse(JSON.stringify(sampleJson, null, 2));
    } catch {
      setTestResponse(
        JSON.stringify(
          {
            status: "error",
            message: "Failed to query domain agent API endpoint.",
          },
          null,
          2
        )
      );
    } finally {
      setIsTesting(false);
    }
  };

  // Code Snippets
  const curlCode = `curl -X POST "${baseUrl}/domains/${activeCodeDomain}/chat" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${primaryApiKey}" \\
  -d '{
    "message": "What are the prerequisite credits?",
    "language": "en-US"
  }'`;

  const pythonCode = `import requests

url = "${baseUrl}/domains/${activeCodeDomain}/chat"
headers = {
    "Content-Type": "application/json",
    "X-API-Key": "${primaryApiKey}"
}
payload = {
    "message": "What are the prerequisite credits?",
    "language": "en-US"
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()
print("Agent Response:", data["content"])
print("Latency:", data["latency_ms"], "ms")`;

  const jsCode = `const response = await fetch("${baseUrl}/domains/${activeCodeDomain}/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": "${primaryApiKey}"
  },
  body: JSON.stringify({
    message: "What are the prerequisite credits?",
    language: "en-US"
  })
});

const data = await response.json();
console.log(data.content);`;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="indigo" size="sm">
              <Code2 className="h-3 w-3" />
              REST API & Integration Center
            </Badge>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            External Application APIs
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Integrate your configured AI Voice Agent into external mobile apps, websites, customer
            portals, or backend services using standard REST endpoints and authenticated API keys.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700">
          <span>Active Endpoints:</span>
          <span className="font-bold text-slate-900 dark:text-white">6 Domains Live</span>
        </div>
      </div>

      {/* Section 1: API Key Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Key className="h-4 w-4 text-blue-500" />
            API Keys for External Apps
          </CardTitle>
          <CardDescription>
            Generate scoped bearer keys to authenticate requests from your client applications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleCreateKey} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Key label (e.g. Flutter Mobile App, Web Widget, Customer Portal)..."
              />
            </div>
            <Button type="submit" disabled={!newKeyName.trim()} className="gap-2 shrink-0">
              <Plus className="h-4 w-4" />
              Generate API Key
            </Button>
          </form>

          {/* Keys List */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800 border rounded-xl overflow-hidden">
            {apiKeys.map((k) => (
              <div
                key={k.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white dark:bg-slate-900 gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {k.name}
                    </span>
                    <Badge variant="success" size="sm">
                      {k.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs text-slate-600 dark:text-slate-400">
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {k.key}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyKey(k.id, k.key)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      title="Copy Key"
                    >
                      {copiedKeyId === k.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                  <span>{k.requestsCount.toLocaleString()} calls</span>
                  <span>·</span>
                  <span>Created {formatRelativeTime(k.createdAt)}</span>
                  <button
                    type="button"
                    onClick={() => deleteApiKey(k.id)}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                    title="Revoke Key"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Integration Code Snippets */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                <Terminal className="h-4 w-4 text-indigo-500" />
                Integration Code Snippets
              </CardTitle>
              <CardDescription>
                Copy ready-to-run request examples to call any domain agent from your code
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Domain:</span>
              <select
                value={activeCodeDomain}
                onChange={(e) => setActiveCodeDomain(e.target.value as DomainType)}
                className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                {Object.values(DOMAINS).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Language Tabs */}
          <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-2">
            {(["curl", "python", "javascript"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedLanguageTab(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${
                  selectedLanguageTab === tab
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Code Box */}
          <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs font-mono text-slate-100 overflow-x-auto">
            <button
              type="button"
              onClick={() => {
                const code =
                  selectedLanguageTab === "curl"
                    ? curlCode
                    : selectedLanguageTab === "python"
                    ? pythonCode
                    : jsCode;
                navigator.clipboard.writeText(code);
                setCopiedKeyId("code");
                setTimeout(() => setCopiedKeyId(null), 2000);
              }}
              className="absolute right-3 top-3 p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              title="Copy code"
            >
              {copiedKeyId === "code" ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
            <pre className="pr-10 leading-relaxed">
              {selectedLanguageTab === "curl" && curlCode}
              {selectedLanguageTab === "python" && pythonCode}
              {selectedLanguageTab === "javascript" && jsCode}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Live Interactive API Tester */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Play className="h-4 w-4 text-emerald-500" />
            Live API Playground
          </CardTitle>
          <CardDescription>
            Simulate a real external app call to any domain agent and inspect the raw JSON response
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Target Domain
              </label>
              <select
                value={testDomain}
                onChange={(e) => setTestDomain(e.target.value as DomainType)}
                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                {Object.values(DOMAINS).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Test Query Payload
              </label>
              <div className="flex gap-2">
                <Input
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Query to send to domain agent API..."
                />
                <Button
                  onClick={handleRunTest}
                  disabled={isTesting || !testMessage.trim()}
                  className="shrink-0 gap-1.5"
                >
                  <Play className="h-3.5 w-3.5" />
                  {isTesting ? "Executing..." : "Send Request"}
                </Button>
              </div>
            </div>
          </div>

          {/* Response Box */}
          {testResponse && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Response (application/json):</span>
                <span className="font-mono text-emerald-600">200 OK</span>
              </div>
              <pre className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-slate-200 overflow-x-auto leading-relaxed">
                {testResponse}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
