export type InteractionState =
  | "ready"
  | "listening"
  | "processing"
  | "generating"
  | "speaking"
  | "completed"
  | "error";

export type InteractionType = "voice" | "text" | "mixed";

export type DomainType =
  | "academic"
  | "healthcare"
  | "legal"
  | "customer-support"
  | "it-helpdesk"
  | "general";

export interface DomainInfo {
  id: DomainType;
  name: string;
  tagline: string;
  icon: string;
  color: string;
  accentBg: string;
  defaultRole: string;
  defaultInstructions: string;
  samplePrompts: string[];
  suggestedTools: string[];
}

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  role: string;
  domain: DomainType;
  systemInstructions: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  responseStyle: "concise" | "detailed" | "empathetic" | "technical" | "conversational";
  temperature: number;
  maxTokens: number;
  allowedTopics: string[];
  restrictedTopics: string[];
  enabledTools: {
    webSearch: boolean;
    calculator: boolean;
    appointmentBooking: boolean;
    databaseLookup: boolean;
    codeExecution: boolean;
  };
  speechRate: number;
  voiceGender: "female" | "male" | "neutral";
  voiceModel: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  type: "voice" | "text";
  audioDurationSec?: number;
  audioBlobUrl?: string;
  latencyMs?: number;
  confidenceScore?: number;
  toolsUsed?: string[];
  domain?: DomainType;
}

export interface ConversationSession {
  id: string;
  title: string;
  preview: string;
  domain: DomainType;
  language: string;
  type: InteractionType;
  createdAt: string;
  durationSec: number;
  messageCount: number;
  messages: ChatMessage[];
  sentiment?: "positive" | "neutral" | "concerned";
  satisfactionScore?: number;
}

export interface ApiKeyRecord {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsedAt?: string;
  domainsAllowed: string[];
  requestsCount: number;
  status: "active" | "revoked";
}

export interface OverviewMetrics {
  activeAgent: {
    name: string;
    domain: string;
    version: string;
    status: "online" | "idle" | "configuring";
    uptimePercent: number;
  };
  totalConversations: number;
  totalVoiceInteractions: number;
  voiceInteractionMins: number;
  supportedLanguagesCount: number;
  totalApiCalls: number;
  averageLatencyMs: number;
  asrAccuracyPercent: number;
  ttsSpeedFactor: number;
}

export interface AppSettings {
  profile: {
    fullName: string;
    email: string;
    organization: string;
    avatarUrl: string;
  };
  voice: {
    voiceModel: string;
    speechRate: number;
    pitch: number;
    volume: number;
    noiseSuppression: boolean;
    echoCancellation: boolean;
    autoPlayResponse: boolean;
  };
  llm: {
    provider: "groq" | "openai" | "gemini" | "ollama" | "auto";
    apiKey: string;
    modelName: string;
    temperature: number;
    streamResponses: boolean;
    maxContextMessages: number;
  };
  fastApi: {
    baseUrl: string;
    apiKey: string;
    connectMode: "hybrid" | "fastapi" | "mock";
    timeoutMs: number;
  };
  theme: "light" | "dark" | "system";
  compactMode: boolean;
}
