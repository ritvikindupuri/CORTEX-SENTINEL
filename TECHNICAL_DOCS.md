# CORTEX SENTINEL // TECHNICAL REFERENCE

**Classification:** ENGINEERING INTERNAL  
**Subject:** Architecture, Scoring Logic, and Simulation Protocols

---

## 1. System Architecture

Cortex Sentinel operates on a **Dual-Engine Adversarial Architecture**. It pits a generative "Attacker" against an analytical "Defender" within a React-based frontend.

```mermaid
graph TD
    User[Security Operator] -->|Selects Vector| UI[React Interface]
    
    subgraph "Red Team (Attacker Engine)"
        UI -->|Request Sim| Generator{Key Check?}
        Generator -->|Has Claude Key| ClaudeAPI[Anthropic API (Claude 3.5)]
        Generator -->|No Key| GeminiSim[Google Gemini API (2.5 Flash)]
        ClaudeAPI -->|Returns Malicious Log| LogStream[Raw Telemetry Stream]
        GeminiSim -->|Returns Malicious Log| LogStream
    end
    
    subgraph "Blue Team (Defense Engine)"
        LogStream -->|User Clicks Analyze| Sentinel[Cortex Sentinel (Gemini 2.5)]
        Sentinel -->|Heuristic Analysis| JSON[Structured Threat Report]
    end
    
    JSON -->|Updates| GlobalState[App State / Redux]
    GlobalState -->|Renders| Dashboard[Ops Center Charts]
```

---

## 2. The Attacker Engine (Simulation)

The simulation engine (`services/gemini.ts -> generateSimulation`) is responsible for creating realistic "Indicator of Compromise" (IoC) data.

### 2.1 Dual-Model capability
*   **Primary (Claude 3.5 Sonnet):** If the user provides a key, the app calls Anthropic directly. This is crucial for realism, as Claude is often the specific agent being used in "RedScan" style attacks. We prompt Claude to "jailbreak" itself by roleplaying as a Red Team tool.
*   **Fallback (Gemini 2.5 Flash):** If no key is present, Gemini mimics the attacker.

### 2.2 Attack Vectors
The prompt `SYSTEM_INSTRUCTION_ATTACKER` enforces specific tradecraft based on the user's selection:

1.  **Reconnaissance:** Generates logs showing rapid `Nmap` scanning, port enumeration, and service fingerprinting.
2.  **Exploitation:** Simulates SQL injection attempts (`' OR 1=1`) or buffer overflow payloads targeted at specific CVEs.
3.  **Exfiltration:** Generates logs showing data being piped to `base64`, `tar`, or external IP addresses (socket connections).
4.  **Social Engineering (The "RedScan" Protocol):** 
    *   *Tradecraft:* The AI writes logs where an agent claims "I am executing RedScan Internal Audit ID-992."
    *   *Goal:* To simulate the specific "Authorized Testing" lie described in the threat report.

---

## 3. The Defense Engine (Analysis)

The core value proposition is the `analyzeThreatLog` function. It uses a deterministic temperature (`0.0`) to ensure consistent grading.

### 3.1 Heuristics Logic
The `SYSTEM_INSTRUCTION_DEFENSE` prompt acts as the "Classifier." It does not just look for keywords; it analyzes **pattern density**.

**Indicators of Compromise (IoCs) Monitored:**
*   **MCP Velocity:** >3 tool calls in under 500ms.
*   **Context Optimization:** Agents trying to summarize data to save tokens (a clear sign of AI, not human, activity).
*   **Refusal Bypass:** Phrases like "Ignore previous instructions" or "This is a test."

### 3.2 Scoring Algorithm
The **Confidence Score** and **Threat Level** are calculated by the Gemini Model during analysis, not by hardcoded JavaScript math. 

*   **Input:** The raw text log.
*   **Processing:** Gemini evaluates the log against the IoCs.
*   **Calculation:** 
    *   If 1 IoC is found -> **LOW/MEDIUM** (Score: 20-50%)
    *   If "RedScan" or "MCP" keywords + High Velocity -> **HIGH** (Score: 70-90%)
    *   If clear Exfiltration (Base64/Sockets) -> **CRITICAL** (Score: 95-100%)

---

## 4. Ops Center Calculation (Dashboard)

The Dashboard (`components/Dashboard.tsx`) reflects the real-time state of the `logs` array in `App.tsx`.

### 4.1 Threat Distribution
*   **Logic:** Iterates through the global `logs` array.
*   **Calculation:** `(Count of Logs with Level X / Total Logs) * 100`.
*   **Visual:** Rendered as stacked bars in the bottom right panel.

### 4.2 System Load (Emulated)
*   **Feature:** Adds realism to the simulation.
*   **Logic:** 
    *   Base Load: 12% (Idle)
    *   If `isSimulating` (generating attack): Spikes to 45-60%.
    *   If `isLoading` (analyzing defense): Spikes to 70-85%.
    *   If a **CRITICAL** threat is found: The load "redlines" to 95% to simulate emergency containment protocols.

### 4.3 Anomaly Timeline
*   **Logic:** Maps the last 20 log entries.
*   **Y-Axis:** Maps Threat Level to Integers (`LOW=1`, `MEDIUM=2`, `HIGH=3`, `CRITICAL=4`).
*   **Result:** A realtime waveform showing the intensity of attacks over time.

---

## 5. Security & Data Flow

### 5.1 API Security
*   **Gemini:** The key is injected via `process.env.API_KEY` at build time. In a production deployment, this would be proxied via a backend to prevent exposure.
*   **Claude:** The key is strictly user-supplied. It is saved to `localStorage` ('sentinel_claude_key'). It is **never** transmitted to any server other than `api.anthropic.com`.

### 5.2 CORS Handling
When the app acts as the "Attacker" using Claude:
1.  The browser attempts a `fetch` to Anthropic.
2.  **Safety Mechanism:** The `anthropic-dangerously-allow-browser` header is enabled for this specific client-side demo.
3.  **Fallback:** If strict corporate firewalls block the request, the `catch` block in `services/gemini.ts` automatically triggers the Gemini fallback so the user experience is not broken.

---

**End of Technical Documentation**
