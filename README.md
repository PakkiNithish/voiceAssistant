# Design and Development of an AI-Powered Voice Assistant Using Speech Recognition and Natural Language Processing

A modern, configurable, domain-specialized AI voice assistant platform with decoupled **Frontend** (Next.js 16 App Router, TypeScript, Tailwind CSS, Web Audio & Web Speech APIs) and **Backend** (Python FastAPI, Uvicorn, REST Multi-Domain API).

---

## 1. Project Concept & Architecture

The core objective of this project is to develop a **reusable, configurable, domain-specialized AI voice assistant**.

Rather than creating single-purpose chatbots for every vertical, the platform implements **one common AI reasoning, speech recognition, and natural language engine** that dynamically specializes for different domains through:
- **Domain-Specific Instructions & Personas**: Academic Advising, Healthcare Triage, Legal Compliance, Customer Support, IT Helpdesk, and General Assistant.
- **Dynamic Safety Guardrails**: Real-time evaluation of Allowed vs. Restricted topics.
- **Autonomous Tool Bindings**: Math/Calculator Engine, Appointment Booking, Database Lookup, Web Search, and Code Execution.
- **Multilingual Dialogue**: Real-time speech recognition and text-to-speech across English, Telugu (తెలుగు), Hindi (हिन्दी), Spanish, and more.
- **Universal External APIs**: Secure API key generation allowing external mobile apps (Flutter, React Native), web applications, and backend services to interact with any domain agent.

```
┌────────────────────────────────────────────────────────┐
│                   Next.js Web Frontend                 │
│  (Overview · Assistant · Config · API Integration · History)│
└──────────────▲───────────────────────────▲─────────────┘
               │ Web Audio / MediaRecorder │ REST API / JSON
               ▼                           ▼
┌────────────────────────────────────────────────────────┐
│                Speech & Audio Layer                    │
│  - MediaRecorder API (Real-time voice capture)         │
│  - Web Audio Analyser (Real-time 32-bar visualizer)    │
│  - Web Speech API / Whisper ASR Speech Recognition     │
│  - SpeechSynthesis Utterance / Neural TTS Engine       │
└──────────────────────────────┬─────────────────────────┘
                               │
┌──────────────────────────────▼─────────────────────────┐
│               Common Core NLP Engine                   │
│  - Dynamic System Instructions & Domain Personas       │
│  - Response Style Modulation (Concise / Technical / etc.)
│  - Restricted Topics Safety Guardrails                 │
│  - Tool Invocation (Calculator / Booking / DB Lookup)  │
└──────────────────────────────┬─────────────────────────┘
                               │
┌──────────────────────────────▼─────────────────────────┐
│              Python FastAPI Backend                    │
│  - POST /api/v1/chat (Universal API for External Apps) │
│  - POST /api/v1/domains/{domain_id}/chat               │
│  - GET/POST/DELETE /api/v1/keys (API Key Management)   │
│  - GET/PUT /api/v1/domains/{domain_id}/config          │
│  - POST /api/v1/audio/transcribe (ASR Speech-to-Text)  │
│  - GET  /api/v1/health & GET /api/v1/stats             │
└────────────────────────────────────────────────────────┘
```

---

## 2. Project Directory Structure

The project is cleanly decoupled into two distinct directories:

```
Project clg/
├── frontend/                     # Next.js 16 + React 19 + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/        # Dynamic metrics & recent activity
│   │   │   ├── assistant/        # Live voice assistant with mic & visualizer
│   │   │   ├── configuration/    # Dynamic domain instructions, tools, & styles
│   │   │   ├── integrations/     # API Key generation, tester, & client snippets
│   │   │   ├── conversations/    # Searchable transcript history & export
│   │   │   └── settings/         # Profile, voice pitch/rate, & system settings
│   │   ├── components/
│   │   │   ├── assistant/        # VoiceMicButton, AudioVisualizer, ChatMessageItem
│   │   │   ├── layout/           # AppLayout, Sidebar, TopNav
│   │   │   └── ui/               # Reusable Button, Card, Input, Modal, Badge
│   │   ├── hooks/                # useAgentStore, useAudioRecorder, useSpeechRecognition
│   │   ├── lib/                  # api-client, mock-data, utils
│   │   └── types/                # Strict TypeScript interfaces
│   ├── package.json
│   ├── postcss.config.mjs
│   └── tsconfig.json
│
└── backend/                      # Python FastAPI REST Backend
    ├── main.py                   # FastAPI app with Multi-Domain & External API
    └── requirements.txt          # fastapi, uvicorn, pydantic, python-multipart
```

---

## 3. Dynamic Agent Configuration & Verification

### How It Works:
1. Navigate to **Agent Configuration** (`/configuration`).
2. Select any Domain (e.g., *Campus & Academic Advisor*, *Healthcare & Patient Triage*, *Legal & Regulatory*, *IT Helpdesk*).
3. Customize:
   - **System Instructions**: Define exact persona, duties, and conversational context.
   - **Response Style**:
     - `conversational`: Natural, balanced, spoken-friendly answers.
     - `concise`: Short, immediate answers limited to 1-2 core sentences.
     - `empathetic`: Reassuring, supportive tone with emotional acknowledgment.
     - `technical`: Formatted with technical parameters, protocol headers, and precise syntax.
     - `detailed`: Multi-point breakdown with next steps.
   - **Safety Guardrails**: Add keywords to `Restricted Topics`. When a user or external app mentions a restricted topic, the assistant immediately declines with a domain safety notice.
   - **Enabled Tools**: Toggle `Calculator`, `Appointment Booking`, or `Database Lookup`.
   - **Speech Rate & Voice**: Dynamically controls the browser's speech synthesis output rate.
4. Click **Save Configuration**. The changes take effect immediately in both the Voice Assistant and external API calls.

---

## 4. External Application REST API (Integrations)

External applications (mobile apps, web apps, microservices) can call the VoxCore API using generated API keys.

### Authentication
Pass your API key using the `X-API-Key` header or `Authorization: Bearer <key>` header:
```bash
-H "X-API-Key: vx_live_8f3a9e127c54b9d0e21a4f"
```

### Endpoints
- **Universal Domain Chat**: `POST /api/v1/domains/{domain_id}/chat` or `POST /api/v1/chat`
- **Key Management**: `GET /api/v1/keys`, `POST /api/v1/keys`, `DELETE /api/v1/keys/{key_id}`
- **Domain Configurations**: `GET /api/v1/domains`, `PUT /api/v1/domains/{domain_id}/config`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`

#### Example cURL Request:
```bash
curl -X POST "http://localhost:8000/api/v1/domains/academic/chat" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: vx_live_8f3a9e127c54b9d0e21a4f" \
  -d '{
    "message": "What are the prerequisite credits for Machine Learning?",
    "language": "en-US"
  }'
```

#### Example Python Request:
```python
import requests

url = "http://localhost:8000/api/v1/domains/academic/chat"
headers = {
    "Content-Type": "application/json",
    "X-API-Key": "vx_live_8f3a9e127c54b9d0e21a4f"
}
payload = {
    "message": "What are the prerequisite credits for Machine Learning?",
    "language": "en-US"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())
```

---

## 5. Getting Started

### Running the Frontend
```bash
cd frontend
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running the Backend
```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).
