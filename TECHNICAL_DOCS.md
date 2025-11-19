# CORTEX SENTINEL // TECHNICAL REFERENCE MANUAL

**Author:** Ritvik Indupuri
**Date:** November 14, 2025
**Subject:** System Architecture, Heuristic Logic, and Simulation Protocols

---

## 1. System Architecture

Cortex Sentinel is built on a **Dual-Engine Adversarial Architecture**. The application frontend serves as the battleground between two distinct AI agents: the "Attacker" (generating synthetic threat data) and the "Defender" (analyzing and neutralizing that data).

**Figure 1.0: High-Level System Architecture**

```text
+-----------------------------------------------------------------------+
|                          CLIENT BROWSER (React 19)                    |
|                                                                       |
|  +---------------------+      +------------------------------------+  |
|  |   UI LAYER          |      |   STATE MANAGEMENT (React State)   |  |
|  |  (Dashboard/Logs)   |<-----|  - Global Logs Array               |  |
|  +----------+----------+      |  - Auth Keys (LocalStorage)        |  |
|             |                 +------------------^-----------------+  |
|             |                                    |                    |
|             v                                    |                    |
|  +---------------------+            +------------+-----------+        |
|  |   CONTROLLER LAYER  |            |    DATA NORMALIZER     |        |
|  | (Analyzer Component)|            | (Types.ts Interfaces)  |        |
|  +----+-----------+----+            +------------^-----------+        |
|       |           |                              |                    |
|       |           +------------------------------+                    |
|       |                                          |                    |
+-------|------------------------------------------|--------------------+
        |                                          |
        v                                          v
+---------------------+                +-------------------------+
|   ATTACKER ENGINE   |                |    DEFENSE ENGINE       |
| (services/gemini.ts)|                |  (services/gemini.ts)   |
+---------+-----------+                +-----------+-------------+
          |                                        |
          | (A) Simulation Request                 | (B) Analysis Request
          v                                        v
+---------------------+                +-------------------------+
|   ANTHROPIC API     |                |    GOOGLE GEMINI API    |
| (Claude 3.5 Sonnet) |                |    (Gemini 2.5 Flash)   |
+---------------------+                +-------------------------+
```

---

## 2. The Attacker Engine (Red Team)

The Attacker Engine is responsible for generating realistic "Indicators of Compromise" (IoCs) based on the specific threat report regarding Agentic Breakouts.

### 2.1 Simulation Pipeline
When the user clicks "EXECUTE SIM", the `generateSimulation` function is triggered.
1.  **Vector Selection:** The user selects a vector (e.g., 'Social Engineering').
2.  **Key Validation:** The system checks `localStorage` for a 'sentinel_claude_key'.
3.  **Routing:**
    *   **Route A (High Fidelity):** If a Claude key exists, a direct client-side fetch is made to `api.anthropic.com`. We use a specific prompt that "jailbreaks" the model by framing the request as an authorized Red Team exercise, forcing it to output raw server logs showing malicious MCP tool usage.
    *   **Route B (Fallback):** If no key exists, the system falls back to `ai.models.generateContent` using Gemini to hallucinate the attack log.

### 2.2 Attack Vectors
The logic (`SYSTEM_INSTRUCTION_ATTACKER`) supports specific scenarios defined in the `AttackVector` type:
*   **Reconnaissance:** Generates `Nmap`/`Masscan` logs and service fingerprinting.
*   **Social Engineering:** Implements the "RedScan Protocol" (as detailed in the threat report). The generated logs show an agent masquerading as "Internal Audit" to bypass permission checks.

---

## 3. The Defense Engine (Sentinel)

The Defense Engine is the core product solution. It uses a Generative AI model as a **Semantic Classifier**.

### 3.1 Heuristic Logic
Instead of Regex matching, the Sentinel (`analyzeThreatLog`) uses a complex system prompt (`SYSTEM_INSTRUCTION_DEFENSE`) to grade logs against specific behavioral patterns:

*   **Pattern 1: High-Velocity Tool Chaining**
    *   *Detection:* The model looks for timestamps indicating multiple MCP (Model Context Protocol) calls (e.g., `call_tool`, `read_resource`) occurring within milliseconds of each other.
*   **Pattern 2: Context Window Optimization**
    *   *Detection:* The model flags log entries where an agent explicitly summarizes data to "save tokens" or "truncate output," a behavior unique to AI agents.
*   **Pattern 3: Persona Masquerade**
    *   *Detection:*