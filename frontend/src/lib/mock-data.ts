import {
  AgentConfig,
  ApiKeyRecord,
  ConversationSession,
  DomainInfo,
  DomainType,
  OverviewMetrics,
} from "@/types";

export const DOMAINS: Record<DomainType, DomainInfo> = {
  academic: {
    id: "academic",
    name: "Campus & Academic Advisor",
    tagline: "Student curriculum, prerequisites, course registration, and campus policies",
    icon: "GraduationCap",
    color: "blue",
    accentBg: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900",
    defaultRole: "Senior Academic Counselor and Curriculum Specialist",
    defaultInstructions:
      "You are the University Academic Advisor. Guide students on degree curriculum, credit transfers, GPA requirements, attendance policies, and semester registration. Maintain an encouraging, precise, and supportive academic tone. When asked about prerequisites, state requirements clearly.",
    samplePrompts: [
      "What are the prerequisite credits for Advanced Machine Learning?",
      "Can you explain the attendance condonation policy for this semester?",
      "How do I submit an application for grade re-evaluation?",
    ],
    suggestedTools: ["databaseLookup", "appointmentBooking", "calculator"],
  },
  healthcare: {
    id: "healthcare",
    name: "Healthcare & Patient Triage",
    tagline: "Clinical triage, medication inquiries, and clinic appointment scheduling",
    icon: "Activity",
    color: "emerald",
    accentBg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900",
    defaultRole: "Licensed Clinical Triage Assistant & Patient Coordinator",
    defaultInstructions:
      "You are a clinical triage voice assistant. Gather patient symptoms, evaluate acuity levels, provide grounded health information with clear disclaimers, and assist in clinic appointments. Never prescribe prescription medications or provide emergency diagnoses.",
    samplePrompts: [
      "I have had a dry cough and mild fever for 3 days. What should I do?",
      "Can you schedule an appointment with a cardiologist for tomorrow afternoon?",
      "What precautions should I take when taking metformin?",
    ],
    suggestedTools: ["appointmentBooking", "calculator"],
  },
  legal: {
    id: "legal",
    name: "Legal & Regulatory Compliance",
    tagline: "Contract analysis, statutory compliance, and legal clause review",
    icon: "Scale",
    color: "amber",
    accentBg: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900",
    defaultRole: "Corporate Legal Analyst & Regulatory Compliance Specialist",
    defaultInstructions:
      "You assist internal counsel with contract review, compliance obligations, GDPR/privacy guidelines, and policy lookup. Always cite exact clauses or statutes and state that recommendations do not replace formal attorney review.",
    samplePrompts: [
      "What are the indemnity liabilities under Clause 14 of the Master Services Agreement?",
      "Summarize the employee data retention guidelines under regional compliance.",
      "Does this NDA permit disclosure to affiliated contractors?",
    ],
    suggestedTools: ["webSearch", "databaseLookup"],
  },
  "customer-support": {
    id: "customer-support",
    name: "Customer Support & Success",
    tagline: "Order status, return handling, account management, and billing",
    icon: "Headphones",
    color: "indigo",
    accentBg: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900",
    defaultRole: "Senior Customer Care Specialist & Problem Resolver",
    defaultInstructions:
      "You represent our customer care team. Solve customer inquiries with patience, empathy, and speed. Verify identity, handle return requests, explain invoice line items, and escalate unresolved complaints promptly.",
    samplePrompts: [
      "Where is my package #VX-90214 shipped two days ago?",
      "I was charged twice for my subscription this month. Can I get a refund?",
      "How do I update the shipping address before dispatch?",
    ],
    suggestedTools: ["databaseLookup", "calculator"],
  },
  "it-helpdesk": {
    id: "it-helpdesk",
    name: "IT Infrastructure & Helpdesk",
    tagline: "Network troubleshooting, credential resets, VPN, and system diagnostics",
    icon: "Cpu",
    color: "violet",
    accentBg: "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border-violet-200 dark:border-violet-900",
    defaultRole: "Senior Systems Engineer & IT Helpdesk Agent",
    defaultInstructions:
      "Assist employees with IT infrastructure, workstation setup, VPN authentication, software licensing, and hardware diagnostics. Provide step-by-step terminal and GUI troubleshooting procedures.",
    samplePrompts: [
      "My VPN connection drops every 10 minutes with error code 809.",
      "How do I generate an SSH key and add it to our internal GitLab?",
      "I need access granted to the staging Kubernetes cluster.",
    ],
    suggestedTools: ["codeExecution", "webSearch"],
  },
  general: {
    id: "general",
    name: "General Conversational Assistant",
    tagline: "Universal voice assistant for general productivity and inquiry",
    icon: "Sparkles",
    color: "sky",
    accentBg: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-900",
    defaultRole: "Intelligent Multi-Modal Voice Agent",
    defaultInstructions:
      "You are a helpful, versatile AI voice assistant. Respond articulately, naturally, and with high factual accuracy across a wide range of everyday topics.",
    samplePrompts: [
      "Give me a 2-minute summary of today's key developments in quantum computing.",
      "Calculate compound interest on $10,000 at 7% for 5 years.",
      "Draft an outline for a project presentation on natural language processing.",
    ],
    suggestedTools: ["webSearch", "calculator"],
  },
};

export const DEFAULT_AGENT_CONFIG: AgentConfig = {
  id: "agent-voxcore-01",
  name: "VoxCore Campus Advisor",
  description: "Configurable enterprise voice agent tailored for academic guidance and curriculum advising.",
  role: "Senior Academic Counselor and Curriculum Specialist",
  domain: "academic",
  systemInstructions: `You are the University Academic Advisor powered by the VoxCore NLP & Speech Engine.
Your objectives:
1. Provide accurate information regarding degree requirements, credit calculations, prerequisites, and registration schedules.
2. Keep spoken replies concise, pleasant, and easy to follow when spoken aloud.
3. If a student is facing extreme stress or academic probation, express warm empathy and offer to schedule an advising session.
4. Support multilingual dialogue in English, Telugu, and Hindi seamlessly.`,
  defaultLanguage: "en-US",
  supportedLanguages: ["en-US", "te-IN", "hi-IN", "es-ES"],
  responseStyle: "conversational",
  temperature: 0.4,
  maxTokens: 512,
  allowedTopics: [
    "Course Registrations",
    "Prerequisites & Corequisites",
    "Grading Scale & CGPA",
    "Attendance Policies",
    "Campus Facilities & Labs",
    "Exam Schedules",
  ],
  restrictedTopics: [
    "Leaked Exam Questions",
    "Direct Financial Disclosures",
    "Confidential Faculty Personnel Files",
    "Political & Unrelated Debate",
  ],
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
  updatedAt: "2026-11-06T18:30:00Z",
};

export const INITIAL_API_KEYS: ApiKeyRecord[] = [
  {
    id: "key-1",
    name: "Mobile App Production Key",
    key: "vx_live_8f3a9e127c54b9d0e21a4f",
    createdAt: "2026-11-01T10:00:00Z",
    lastUsedAt: "2026-11-06T21:40:00Z",
    domainsAllowed: ["academic", "healthcare", "customer-support"],
    requestsCount: 4219,
    status: "active",
  },
  {
    id: "key-2",
    name: "Web Portal Integration",
    key: "vx_live_3b7c19a4e082f56d819c43",
    createdAt: "2026-11-03T14:30:00Z",
    lastUsedAt: "2026-11-06T20:15:00Z",
    domainsAllowed: ["academic"],
    requestsCount: 1840,
    status: "active",
  },
  {
    id: "key-3",
    name: "Third-Party Developer Sandbox",
    key: "vx_test_992a01ce45bb627f1038ea",
    createdAt: "2026-11-05T09:15:00Z",
    lastUsedAt: "2026-11-06T18:50:00Z",
    domainsAllowed: ["academic", "healthcare", "legal", "customer-support", "it-helpdesk", "general"],
    requestsCount: 642,
    status: "active",
  },
];

export const INITIAL_CONVERSATIONS: ConversationSession[] = [
  {
    id: "conv-101",
    title: "Prerequisite inquiry for Deep Learning elective",
    preview: "Student asked if Machine Learning and Linear Algebra are compulsory before registering for Deep Learning.",
    domain: "academic",
    language: "en-US",
    type: "voice",
    createdAt: "2026-11-06T15:20:00Z",
    durationSec: 184,
    messageCount: 2,
    sentiment: "positive",
    satisfactionScore: 98,
    messages: [
      {
        id: "m-1",
        role: "user",
        content: "Hello, could you tell me if I can register for the Deep Learning elective if I haven't completed Linear Algebra yet?",
        timestamp: "2026-11-06T15:20:05Z",
        type: "voice",
        audioDurationSec: 6.2,
      },
      {
        id: "m-2",
        role: "assistant",
        content:
          "Linear Algebra (MAT-202) is a mandatory prerequisite for Deep Learning (CS-415). You must achieve a minimum grade of 'C' before registering. However, students holding an aggregate CGPA above 8.5 can submit Form W-3 during the add/drop week for prerequisite exemption.",
        timestamp: "2026-11-06T15:20:08Z",
        type: "voice",
        latencyMs: 310,
        confidenceScore: 0.985,
        toolsUsed: ["databaseLookup"],
      },
    ],
  },
  {
    id: "conv-102",
    title: "హాస్టల్ ఫీజు చెల్లింపు గడువు (Hostel Fee Deadline)",
    preview: "హాస్టల్ ఫీజు చెల్లింపు చివరి తేదీ మరియు ఆలస్య రుసుము గురించి సమాచారం అడిగారు.",
    domain: "academic",
    language: "te-IN",
    type: "voice",
    createdAt: "2026-11-06T13:45:00Z",
    durationSec: 142,
    messageCount: 2,
    sentiment: "positive",
    satisfactionScore: 95,
    messages: [
      {
        id: "m-201",
        role: "user",
        content: "నమస్కారం, ఈ సెమిస్టర్ హాస్టల్ ఫీజు చెల్లించడానికి చివరి తేదీ ఎప్పుడు మరియు ఆలస్య రుసుము ఎంత?",
        timestamp: "2026-11-06T13:45:05Z",
        type: "voice",
        audioDurationSec: 5.4,
      },
      {
        id: "m-202",
        role: "assistant",
        content:
          "నమస్కారం! క్యాంపస్ హాస్టల్ మార్గదర్శకాల ప్రకారం, ఈ సెమిస్టర్ ఫీజు చెల్లింపు చివరి తేదీ నవంబర్ 20, 2026. ఆ తర్వాత ప్రతి రోజుకు ₹100 ఆలస్య రుసుము విధించబడుతుంది. మీరు విద్యార్థి పోర్టల్ ద్వారా UPI లేదా నెట్ బ్యాంకింగ్ ద్వారా చెల్లించవచ్చు.",
        timestamp: "2026-11-06T13:45:09Z",
        type: "voice",
        latencyMs: 380,
        confidenceScore: 0.978,
        toolsUsed: ["databaseLookup"],
      },
    ],
  },
  {
    id: "conv-103",
    title: "सेमेस्टर उपस्थिति नीति और मेडिकल छूट (Attendance Policy & Exemption)",
    preview: "छात्र ने 75% न्यूनतम उपस्थिति नियम और मेडिकल लीव के नियमों के बारे में पूछा।",
    domain: "academic",
    language: "hi-IN",
    type: "voice",
    createdAt: "2026-11-05T17:10:00Z",
    durationSec: 160,
    messageCount: 2,
    sentiment: "neutral",
    satisfactionScore: 92,
    messages: [
      {
        id: "m-301",
        role: "user",
        content: "नमस्ते, क्या 70% उपस्थिति होने पर मुझे अंतिम परीक्षा में बैठने की अनुमति मिल सकती है?",
        timestamp: "2026-11-05T17:10:04Z",
        type: "voice",
        audioDurationSec: 5.1,
      },
      {
        id: "m-302",
        role: "assistant",
        content:
          "नमस्ते! सामान्य नियम के अनुसार न्यूनतम 75% उपस्थिति अनिवार्य है। हालांकि, यदि आपके पास अधिकृत मेडिकल सर्टिफिकेट है, तो डीन की स्वीकृति से 65% तक छूट दी जा सकती है। इसके लिए आपको फॉर्म एम-2 परीक्षा नियंत्रक कार्यालय में जमा करना होगा।",
        timestamp: "2026-11-05T17:10:08Z",
        type: "voice",
        latencyMs: 340,
        confidenceScore: 0.984,
        toolsUsed: ["databaseLookup"],
      },
    ],
  },
];

export const INITIAL_OVERVIEW_METRICS: OverviewMetrics = {
  activeAgent: {
    name: "VoxCore Engine v2.4",
    domain: "Campus & Academic Advisor",
    version: "2.4.0-prod",
    status: "online",
    uptimePercent: 99.94,
  },
  totalConversations: 1482,
  totalVoiceInteractions: 8390,
  voiceInteractionMins: 412.5,
  supportedLanguagesCount: 8,
  totalApiCalls: 14280,
  averageLatencyMs: 295,
  asrAccuracyPercent: 96.8,
  ttsSpeedFactor: 1.0,
};
