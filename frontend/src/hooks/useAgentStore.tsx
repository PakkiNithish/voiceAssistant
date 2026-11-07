"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  AgentConfig,
  ApiKeyRecord,
  AppSettings,
  ChatMessage,
  ConversationSession,
  DomainType,
} from "@/types";
import {
  DEFAULT_AGENT_CONFIG,
  DOMAINS,
  INITIAL_API_KEYS,
  INITIAL_CONVERSATIONS,
} from "@/lib/mock-data";
import { apiClient } from "@/lib/api-client";

interface ToastNotification {
  id: string;
  title: string;
  description?: string;
  type: "success" | "error" | "info";
}

export interface ConnectedModelInfo {
  isConnected: boolean;
  provider: "ollama" | "groq" | "gemini" | "openai" | "fastapi" | "offline";
  modelName: string;
  displayName: string;
  installedOllamaModels: string[];
  ollamaRunning: boolean;
  fastApiRunning: boolean;
}

interface AgentStoreContextType {
  config: AgentConfig;
  updateConfig: (updates: Partial<AgentConfig>) => void;
  resetConfig: () => void;
  activeDomain: DomainType;
  setActiveDomain: (domain: DomainType) => void;
  currentLanguage: string;
  setCurrentLanguage: (lang: string) => void;
  currentMessages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => ChatMessage;
  clearCurrentMessages: () => void;
  conversations: ConversationSession[];
  deleteConversation: (id: string) => void;
  clearAllConversations: () => void;
  apiKeys: ApiKeyRecord[];
  createApiKey: (name: string, domains: string[]) => Promise<ApiKeyRecord>;
  deleteApiKey: (id: string) => void;
  incrementApiKeyUsage: (keyId?: string) => void;
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  connectedModel: ConnectedModelInfo;
  refreshModelStatus: () => Promise<void>;
  switchActiveModel: (provider: string, modelName: string, apiKey?: string) => void;
  toasts: ToastNotification[];
  showToast: (title: string, description?: string, type?: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  profile: {
    fullName: "Nithish Kumar",
    email: "nithish.student@univ.edu",
    organization: "School of Computing & AI Research",
    avatarUrl: "",
  },
  voice: {
    voiceModel: "Neural-Voice-Clarion-v2",
    speechRate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    noiseSuppression: true,
    echoCancellation: true,
    autoPlayResponse: true,
  },
  llm: {
    provider: "auto",
    apiKey: "",
    modelName: "llama-3.3-70b-versatile",
    temperature: 0.4,
    streamResponses: true,
    maxContextMessages: 10,
  },
  fastApi: {
    baseUrl: "http://localhost:8000/api/v1",
    apiKey: "",
    connectMode: "hybrid",
    timeoutMs: 5000,
  },
  theme: "light",
  compactMode: false,
};

const AgentStoreContext = createContext<AgentStoreContextType | null>(null);

export function AgentStoreProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AgentConfig>(DEFAULT_AGENT_CONFIG);
  const [activeDomain, setActiveDomainState] = useState<DomainType>("academic");
  const [currentLanguage, setCurrentLanguage] = useState<string>("en-US");
  const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>(() => [
    {
      id: "init-welcome",
      role: "assistant",
      content:
        "Hello! I am your AI-powered Voice Assistant. I am specialized for campus academic advising and curriculum guidance. Click the microphone below or type to start our conversation.",
      timestamp: new Date().toISOString(),
      type: "text",
      confidenceScore: 0.99,
      latencyMs: 140,
    },
  ]);
  const [conversations, setConversations] = useState<ConversationSession[]>(INITIAL_CONVERSATIONS);
  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>(INITIAL_API_KEYS);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [connectedModel, setConnectedModel] = useState<ConnectedModelInfo>({
    isConnected: false,
    provider: "offline",
    modelName: "None",
    displayName: "Checking Models...",
    installedOllamaModels: [],
    ollamaRunning: false,
    fastApiRunning: false,
  });

  const refreshModelStatus = async () => {
    try {
      const status = await apiClient.checkModelStatus();

      let currentSettings = settings;
      try {
        const stored = localStorage.getItem("voxcore_app_settings");
        if (stored) currentSettings = JSON.parse(stored);
      } catch {}

      // If user has a cloud API key configured
      if (
        currentSettings.llm.apiKey &&
        (currentSettings.llm.provider === "groq" ||
          currentSettings.llm.provider === "gemini" ||
          currentSettings.llm.provider === "openai")
      ) {
        setConnectedModel({
          isConnected: true,
          provider: currentSettings.llm.provider,
          modelName: currentSettings.llm.modelName,
          displayName: `${currentSettings.llm.provider.toUpperCase()} (${currentSettings.llm.modelName})`,
          installedOllamaModels: status.installedOllamaModels,
          ollamaRunning: status.ollamaRunning,
          fastApiRunning: status.fastApiRunning,
        });
        return;
      }

      // If Ollama is running locally
      if (status.ollamaRunning && status.installedOllamaModels.length > 0) {
        const chosenModel =
          currentSettings.llm.provider === "ollama" &&
          currentSettings.llm.modelName &&
          status.installedOllamaModels.includes(currentSettings.llm.modelName)
            ? currentSettings.llm.modelName
            : (status.installedOllamaModels.includes("llama3.2:latest")
                ? "llama3.2:latest"
                : status.installedOllamaModels[0]);

        setConnectedModel({
          isConnected: true,
          provider: "ollama",
          modelName: chosenModel,
          displayName: `Ollama (${chosenModel})`,
          installedOllamaModels: status.installedOllamaModels,
          ollamaRunning: true,
          fastApiRunning: status.fastApiRunning,
        });

        // Set provider to ollama in settings
        if (!currentSettings.llm.apiKey && currentSettings.llm.provider !== "ollama") {
          const autoUpdated: AppSettings = {
            ...currentSettings,
            llm: {
              ...currentSettings.llm,
              provider: "ollama",
              modelName: chosenModel,
            },
          };
          setSettings(autoUpdated);
          try {
            localStorage.setItem("voxcore_app_settings", JSON.stringify(autoUpdated));
          } catch {}
        }
        return;
      }

      // Neither is available
      setConnectedModel({
        isConnected: false,
        provider: "offline",
        modelName: "None",
        displayName: "No Model Connected (Offline)",
        installedOllamaModels: [],
        ollamaRunning: false,
        fastApiRunning: status.fastApiRunning,
      });
    } catch {
      setConnectedModel({
        isConnected: false,
        provider: "offline",
        modelName: "None",
        displayName: "Offline Mode",
        installedOllamaModels: [],
        ollamaRunning: false,
        fastApiRunning: false,
      });
    }
  };

  const switchActiveModel = (provider: string, modelName: string, apiKey?: string) => {
    const updated: AppSettings = {
      ...settings,
      llm: {
        ...settings.llm,
        provider: provider as any,
        modelName,
        apiKey: apiKey !== undefined ? apiKey : (provider === "ollama" ? "" : settings.llm.apiKey),
      },
    };
    updateSettings(updated);
    setConnectedModel((prev) => ({
      ...prev,
      isConnected: provider !== "offline",
      provider: provider as any,
      modelName,
      displayName: provider === "ollama" ? `Ollama (${modelName})` : `${provider.toUpperCase()} (${modelName})`,
    }));
    showToast("Model Switched", `Connected to ${provider.toUpperCase()}: ${modelName}`);
  };

  // Load persisted config and settings on client mount
  useEffect(() => {
    try {
      const storedConfig = localStorage.getItem("voxcore_agent_config");
      if (storedConfig) {
        const parsed = JSON.parse(storedConfig);
        setConfig(parsed);
        if (parsed.domain) {
          setActiveDomainState(parsed.domain);
        }
      }
      const storedSettings = localStorage.getItem("voxcore_app_settings");
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings(parsedSettings);
        if (parsedSettings.fastApi?.baseUrl) {
          apiClient.setBaseUrl(parsedSettings.fastApi.baseUrl);
        }
      }
      const storedConversations = localStorage.getItem("voxcore_conversations");
      if (storedConversations) {
        setConversations(JSON.parse(storedConversations));
      }
      const storedKeys = localStorage.getItem("voxcore_api_keys");
      if (storedKeys) {
        setApiKeys(JSON.parse(storedKeys));
      }
    } catch (e) {
      console.warn("Could not load from localStorage:", e);
    }
    // Automatically detect Ollama and connected models
    refreshModelStatus();
  }, []);

  const showToast = (
    title: string,
    description?: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    const id = "toast-" + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const updateConfig = (updates: Partial<AgentConfig>) => {
    setConfig((prev) => {
      const updated = {
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem("voxcore_agent_config", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast("Configuration Saved", "Agent system instructions, tools, and rules updated dynamically.");
  };

  const resetConfig = () => {
    setConfig(DEFAULT_AGENT_CONFIG);
    setActiveDomainState(DEFAULT_AGENT_CONFIG.domain);
    try {
      localStorage.setItem("voxcore_agent_config", JSON.stringify(DEFAULT_AGENT_CONFIG));
    } catch {}
    showToast("Configuration Reset", "Restored default academic agent settings.", "info");
  };

  const setActiveDomain = (domain: DomainType) => {
    setActiveDomainState(domain);
    const domainInfo = DOMAINS[domain];
    if (domainInfo) {
      const updatedConfig: AgentConfig = {
        ...config,
        domain,
        name: `VoxCore ${domainInfo.name}`,
        role: domainInfo.defaultRole,
        systemInstructions: domainInfo.defaultInstructions,
        updatedAt: new Date().toISOString(),
      };
      setConfig(updatedConfig);
      try {
        localStorage.setItem("voxcore_agent_config", JSON.stringify(updatedConfig));
      } catch {}

      // Update welcome message for new domain
      setCurrentMessages([
        {
          id: "welcome-" + domain,
          role: "assistant",
          content: `Welcome to the ${domainInfo.name}! I am configured to assist with: ${domainInfo.tagline}. Ask me anything or press the microphone to speak.`,
          timestamp: new Date().toISOString(),
          type: "text",
          confidenceScore: 0.99,
          latencyMs: 120,
        },
      ]);

      showToast(`Domain Switched: ${domainInfo.name}`, domainInfo.tagline, "info");
    }
  };

  const addMessage = (messageData: Omit<ChatMessage, "id" | "timestamp">): ChatMessage => {
    const newMsg: ChatMessage = {
      ...messageData,
      id: "msg-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      domain: activeDomain,
    };
    setCurrentMessages((prev) => [...prev, newMsg]);

    // Save session dynamically into conversation history if user turn
    if (messageData.role === "user") {
      const newSession: ConversationSession = {
        id: "conv-" + Date.now(),
        title: messageData.content.slice(0, 48) + (messageData.content.length > 48 ? "..." : ""),
        preview: messageData.content,
        domain: activeDomain,
        language: currentLanguage,
        type: messageData.type,
        createdAt: new Date().toISOString(),
        durationSec: messageData.audioDurationSec || 6,
        messageCount: 2,
        messages: [newMsg],
      };
      setConversations((prev) => {
        const updated = [newSession, ...prev.slice(0, 19)];
        try {
          localStorage.setItem("voxcore_conversations", JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }

    return newMsg;
  };

  const clearCurrentMessages = () => {
    const domainInfo = DOMAINS[activeDomain];
    setCurrentMessages([
      {
        id: "cleared-welcome",
        role: "assistant",
        content: `Conversation reset. Ready for ${domainInfo.name}. Tap the microphone or write a message.`,
        timestamp: new Date().toISOString(),
        type: "text",
        confidenceScore: 0.99,
      },
    ]);
    showToast("Conversation Reset", "Chat session refreshed.", "info");
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      try {
        localStorage.setItem("voxcore_conversations", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast("Session Removed", "Conversation record deleted.", "info");
  };

  const clearAllConversations = () => {
    setConversations([]);
    try {
      localStorage.setItem("voxcore_conversations", JSON.stringify([]));
    } catch {}
    showToast("History Cleared", "All conversation records have been deleted.", "info");
  };

  const incrementApiKeyUsage = (keyId?: string) => {
    setApiKeys((prev) => {
      const updated = prev.map((k) => {
        if (!keyId || k.id === keyId || k.key === keyId) {
          return {
            ...k,
            requestsCount: (k.requestsCount || 0) + 1,
            lastUsedAt: new Date().toISOString(),
          };
        }
        return k;
      });
      try {
        localStorage.setItem("voxcore_api_keys", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const createApiKey = async (name: string, domains: string[]): Promise<ApiKeyRecord> => {
    const newKey = await apiClient.generateApiKey(name, domains);
    setApiKeys((prev) => {
      const updated = [newKey, ...prev];
      try {
        localStorage.setItem("voxcore_api_keys", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast("API Key Created", `Key created for ${name}. Ready for external application integration.`);
    return newKey;
  };

  const deleteApiKey = (id: string) => {
    setApiKeys((prev) => {
      const updated = prev.filter((k) => k.id !== id);
      try {
        localStorage.setItem("voxcore_api_keys", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast("API Key Revoked", "Key deleted and can no longer make API requests.", "info");
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem("voxcore_app_settings", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast("Settings Saved", "Preferences updated successfully.");
  };

  return (
    <AgentStoreContext.Provider
      value={{
        config,
        updateConfig,
        resetConfig,
        activeDomain,
        setActiveDomain,
        currentLanguage,
        setCurrentLanguage,
        currentMessages,
        addMessage,
        clearCurrentMessages,
        conversations,
        deleteConversation,
        clearAllConversations,
        apiKeys,
        createApiKey,
        deleteApiKey,
        incrementApiKeyUsage,
        settings,
        updateSettings,
        connectedModel,
        refreshModelStatus,
        switchActiveModel,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AgentStoreContext.Provider>
  );
}

export function useAgentStore() {
  const context = useContext(AgentStoreContext);
  if (!context) {
    throw new Error("useAgentStore must be used within an AgentStoreProvider");
  }
  return context;
}
