# Architecture & System Design

## Incident Memory: Autonomous SRE Root-Cause Agent with Hindsight Memory

```mermaid
flowchart TD
    User["SRE / DevOps Engineer"] -->|Accesses Console| Frontend["Next.js 15 Frontend\n(React 19 + Tailwind CSS)"]
    Frontend -->|REST APIs| Backend["FastAPI Backend Service\n(Python 3.14)"]
    
    subgraph "SRE Agent Orchestration"
        Backend --> Investigator["Incident Investigator Agent"]
        Investigator --> EvidenceEngine["Evidence Engine\n(Telemetry Extraction)"]
        Investigator --> LLM["LLM Reasoner\n(DemoLLM / RealLLM)"]
    end
    
    subgraph "Dual Storage Architecture"
        Backend -->|Structured Records| DB[("PostgreSQL / SQLite\n(Incidents, Events, Postmortems)")]
        Investigator -->|Semantic Retrieval & Retention| Hindsight[("Hindsight Memory Store\n(Operational Precedents, Fixes, Avoidances)")]
    end
    
    EvidenceEngine -->|Current Evidence| LLM
    Hindsight -->|Historical Memory Precedents| LLM
    LLM -->|Synthesized Investigation| Backend
```

---

## 1. Why Separate PostgreSQL and Hindsight?

A key architectural innovation in Incident Memory is the strict separation between **Structured Application Records** and **Long-Term Operational Memory**:

| Storage Layer | Engine | Purpose | Lifecycle |
|---|---|---|---|
| **Transactional Records** | PostgreSQL / SQLite | Stores ACID-compliant relational data: incident tickets, event timelines, service definitions, resolutions, and generated postmortems. | Immediate CRUD operations with strict relational integrity. |
| **Operational Memory** | Hindsight (Live / Demo Adapter) | Stores semantic abstractions of what failed, what worked, why specific troubleshooting steps failed, and deployment contexts. | Long-term operational learning across services and past quarters. |

### The Value of Separation:
1. **No Data Polluting**: Relational tickets can be closed, archived, or purged according to compliance requirements without erasing the extracted organizational knowledge in Hindsight.
2. **Multi-Factor Semantic Retrieval**: Hindsight scores historical relevance based on four distinct dimensions (Service Match, Error Pattern, Deployment Context, and Failure Signature) rather than simple text lookups.
3. **Safety & Advisory Separation**: The system explicitly marks historical memory as *advisory context* (`HISTORICAL MEMORY — NOT CURRENT EVIDENCE`), guaranteeing that past failures inform current investigations without hallucinating certainty.

---

## 2. End-to-End Investigation Flow

```mermaid
sequenceDiagram
    autonumber
    actor Engineer as SRE Engineer
    participant UI as Next.js Console
    participant API as FastAPI Backend
    participant Agent as Investigator Agent
    participant Mem as Hindsight Memory
    participant LLM as SRE Reasoner

    Engineer->>UI: Submit Incident Telemetry (payment-api: timeout)
    UI->>API: POST /api/incidents/:id/investigate
    API->>Agent: investigate(incident)
    Agent->>Agent: Extract Current Evidence (Connection Saturation, v2.1.0)
    Agent->>Mem: search("database connection timeout", service="payment-api")
    Mem-->>Agent: Recall INC-071 (87% relevance, restart failed, config fix worked)
    Agent->>LLM: Synthesize Current Evidence + Historical Memory
    LLM-->>Agent: Contextual Investigation (Avoid pod restarts, verify pool config diff)
    Agent->>API: Persist Investigation Record
    API-->>UI: Return Evidence Chain, Why Factors & Verification Steps
    UI-->>Engineer: Display Contextual Remediation Console
```

---

## 3. Provider Abstractions (Zero Friction Local Run)

The application enforces a provider pattern:
- **`MemoryProvider`**:
  - `HindsightMemoryProvider`: Queries remote Hindsight cloud when API keys are configured.
  - `DemoMemoryProvider`: Local in-process memory engine with token-overlap, Jaccard similarity, and multi-factor scoring.
- **`LLMProvider`**:
  - `RealLLMProvider`: Interfaces with OpenAI/Gemini/Anthropic with function calling.
  - `DemoLLMProvider`: Deterministic enterprise SRE reasoning engine guaranteeing 100% reliable, zero-latency judging demos.
