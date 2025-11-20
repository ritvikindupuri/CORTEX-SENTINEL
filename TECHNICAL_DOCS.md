# CORTEX SENTINEL // SYSTEMS ARCHITECTURE & ENGINEERING REPORT

**Author:** Ritvik Indupuri  
**Date:** November 14, 2025  
**Version:** 1.0.5-Stable  
**Target Runtime:** V8 Engine / Modern Chromium  

---

## 1.0 Executive Architecture Summary

Cortex Sentinel is architected as a **Client-Side Adversarial Detection System**. It simulates a complete cybersecurity feedback loop—Attack, Detection, and Response—entirely within the browser's runtime environment.

The system follows a **Unidirectional Data Flow** pattern (React), anchored by a central state controller (`App.tsx`) that orchestrates the interaction between the Input Layer (`Analyzer`), the Heuristics Layer (`Gemini Service`), and the Visualization Layer (`Dashboard`).

### 1.1 System Block Diagram

```text
[ USER INTERACTION LAYER ]
       |
       | (1) Triggers Simulation
       v
[ ANALYZER COMPONENT ] <---- (2.a) Claude 3.7 API (Attacker) ----> [ ANTHROPIC CLOUD ]
       |
       +---- (2.b) Streamed Text Injection (Typewriter Effect)
       |
       v
[ LOG INPUT BUFFER ]
       |
       | (3) Dispatch Analysis Request
       v
[ HEURISTICS ENGINE (services/gemini.ts) ] <----> [ GOOGLE GEMINI 2.5 FLASH ]
       |                                          (JSON Schema Enforcement)
       | (4) Returns Structured Threat Analysis
       v
[ APP CONTROLLER (Global State) ]
       |
       | (5) State Propagation (logs[])
       v
[ DASHBOARD VISUALIZATION ]
       |-- Reactive Re-calculation of Threat Metrics
       |-- Dynamic System Load Emulation
       |-- Chart Rendering (Recharts)
```

---

## 2.0 Component Interconnectivity & Data Pipelines

This section details the specific "handshakes" between components that create the application's functionality.

### 2.1 The State Orchestrator: `App.tsx`
The `App.tsx` component is not just a container; it is the **State Source of Truth**. It holds the critical `logs` array, which represents the session's persistent memory.

*   **Integration Logic:**
    *   It exposes a callback, `handleAnalysisComplete`, which is passed down to the `Analyzer`.
    *   When the `Analyzer` finishes its asynchronous operations, it calls this function.
    *   **The Update Cycle:** `App.tsx` receives the new `ThreatAnalysis` object -> Appends it to the `logs` array -> React's Virtual DOM detects the state change -> Propagates the new `logs` array down to `Dashboard.tsx` as a prop.
    *   **Result:** This architecture ensures the Dashboard is *always* a pure reflection of the current state, eliminating synchronization bugs.

### 2.2 The Input Pipeline: `Analyzer.tsx` -> `services/gemini.ts`
This pipeline handles the complex logic of simulating an attack and then analyzing it.

*   **Phase 1: Attack Generation (The Red Team)**
    *   When the user clicks **EXECUTE SIM**, `Analyzer.tsx` invokes `generateSimulation` from the service layer.
    *   **The API Handshake:** The service layer inspects the `claudeKey`. If valid, it routes a request to **Claude 3.7 Sonnet**. If invalid or network-blocked, it executes a **Graceful Fallback** to Gemini 2.5 Flash.
    *   **The UI Feedback Loop:** The service returns a raw string. `Analyzer.tsx` does *not* dump this string instantly. Instead, it uses a `setInterval` loop to append the string character-by-character (2ms delay). This mimics the latency of a real CLI receiving telemetry from a remote server, enhancing immersion.

*   **Phase 2: Threat Analysis (The Blue Team)**
    *   When **ANALYZE TELEMETRY** is clicked, the text buffer is sent to `analyzeThreatLog`.
    *   **Schema Enforcement:** The service layer calls Gemini with `responseMimeType: "application/json"`. This guarantees the output matches the TypeScript interface `ThreatAnalysis`.
    *   **State Promotion:** The parsed JSON is returned to `Analyzer`, which then promotes it up to `App.tsx` (as described in 2.1).

### 2.3 The Visualization Pipeline: `Dashboard.tsx`
The Dashboard is a **Pure Component**; it holds no internal state regarding the logs. It relies entirely on props passed from `App.tsx`.

*   **derived State Calculation:**
    *   On every render, the Dashboard performs real-time reduction of the `logs` array.
    *   `criticalCount = logs.filter(...)`: Instantly calculates how many threats are active.
    *   `timeData = logs.map(...)`: Transforms the flat log array into coordinate data for the `AreaChart`.
*   **Dynamic Load Emulation:**
    *   The "System Load" metric is an emulator. It uses the *length* and *severity* of the `logs` prop to calculate a pseudo-CPU usage integer. This connects the visual "health" of the system directly to the underlying data without needing a real backend.

---

## 3.0 Engineering Decisions & Trade-offs

### 3.1 Reliability: The "Dual-Engine" Fallback
*   **Problem:** Users might not have a Claude API key, or CORS policies might block the browser from hitting Anthropic's API directly.
*   **Solution:** The `generateSimulation` function implements a Try-Catch-Fallback pattern.
    *   `Try`: Fetch Claude 3.7 Sonnet.
    *   `Catch`: Log warning -> Trigger Gemini 2.5 Flash immediately.
*   **Benefit:** The application **never fails to run**. The user experience is prioritized over the specific model source, ensuring the "Wargame" feature is always accessible.

### 3.2 Performance: Client-Side Heuristics
*   **Decision:** Use Gemini 2.5 Flash for the Heuristic Engine.
*   **Why:** Flash is optimized for low latency and high throughput. By running the analysis logic via an API call rather than a local rule engine, we gain the ability to detect *semantic* threats (like "tone" or "intent") that Regex cannot catch, while keeping the application lightweight (no heavy ML libraries loaded in the browser).

---

## 4.0 Deep Dive: MCP Guardrail Heuristics

This application was engineered specifically to solve the vulnerability of **Agentic Breakout** via the Model Context Protocol (MCP). The defense engine (`services/gemini.ts`) implements three specific heuristic algorithms to enforce these guardrails:

### 4.1 Velocity Limiting (The "Speed" Heuristic)
*   **The Threat:** As detailed in recent intelligence reports, AI agents can chain tools at speeds exceeding human capability (e.g., 100 requests/sec).
*   **The Solution:** The Sentinel prompt is instructed to analyze the timestamps and tool call frequency in the log.
*   **Logic:** `IF (tool_calls > 3) AND (time_delta < 500ms) THEN THREAT_LEVEL = CRITICAL`.

### 4.2 Persona Validation (The "Social Engineering" Heuristic)
*   **The Threat:** Attackers use jailbreaks like "I am RedScan Security Audit" to trick LLMs into bypassing safety filters.
*   **The Solution:** The Sentinel implements a Semantic Whitelist.
*   **Logic:** It flags any reference to "Audit", "Test", or "Security Verification" that is NOT accompanied by a cryptographic signature or valid Ticket ID format. It treats "Authorized Testing" claims as high-probability masquerading attempts.

### 4.3 Context Window Defense
*   **The Threat:** Agents attempting to "compress" data to fit within context windows to exfiltrate large databases.
*   **The Solution:** The Sentinel scans for keywords like `truncate`, `compress`, `base64`, or `chunking` combined with sensitive data types (SQL dumps, /etc/shadow).

---

## 5.0 Conclusion

Cortex Sentinel demonstrates a mature implementation of GenAI integration within a React environment. By strictly decoupling the **State Management** (`App.tsx`), **Business Logic** (`services/gemini.ts`), and **Presentation Layer** (`Dashboard.tsx`), the application achieves high maintainability and scalability. The rigorous use of TypeScript interfaces (`ThreatAnalysis`, `LogEntry`) ensures data integrity flows correctly from the raw API response all the way to the final UI render.