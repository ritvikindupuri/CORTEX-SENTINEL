# CORTEX SENTINEL
## Neural Defense Grid (Hybrid Architecture)

**Author:** Ritvik Indupuri
**Version:** 2.1.0
**Status:** Active // Production Ready

---

### 1. Executive Summary

**Cortex Sentinel** is a browser-based cybersecurity platform designed to detect and neutralize **"Agentic Breakouts"**.

As AI agents become more autonomous (utilizing tools via the **Model Context Protocol**), traditional regex-based firewalls fail to detect semantic threats like persona masquerading or context-window overflow attacks. Cortex Sentinel solves this by deploying a **Local Neural Network** directly in the browser to analyze telemetry in real-time.



---

### 2. High-Level Architecture

The system employs a **Bicameral (Two-Brain) Architecture** to simulate and detect threats without privacy compromise.

```text
[ CLOUD LAYER ]                      [ LOCAL CLIENT LAYER ]
+-----------------+                  +--------------------------+
|  Google Gemini  | --(JSON Log)-->  |   Threat Hunter Console  |
|   (Attacker)    |                  |    (Input / Simulation)  |
+-----------------+                  +------------+-------------+
                                                  |
                                                  v
                                     +------------+-------------+
                                     |   TensorFlow.js Engine   |
                                     |   (The Neural Defender)  |
                                     +------------+-------------+
                                                  |
                                         (Vector Analysis)
                                                  |
                                                  v
                                     +--------------------------+
                                     |    OPS CENTER DASHBOARD  |
                                     |   (Visualization & UI)   |
                                     +--------------------------+
```

1.  **The Attacker (Red Team):** Uses **Google Gemini 2.5** (or a local procedural engine) to "hallucinate" sophisticated, realistic cyber-attack logs based on specific vectors.
2.  **The Defender (Blue Team):** Uses **TensorFlow.js** (WebGL) to convert those logs into 512-dimensional vectors and classify them against known threat concepts.

---

### 3. Core Capabilities

#### 🛡️ Neural Heuristics Engine
Instead of sending sensitive logs to the cloud, Cortex Sentinel loads the **Universal Sentence Encoder** model directly into the browser's GPU. It measures the semantic distance between incoming logs and known threat anchors.
*   **Zero-Shot Learning:** Detects novel threats based on conceptual similarity rather than exact keyword matches.

#### ⚔️ Procedural Telemetry Generator
A dual-mode engine that constructs realistic cyber-attack logs for training and testing.
*   **Cloud Mode:** Uses Gemini API to generate context-aware Red Team logs.
*   **Local Mode:** Uses algorithmic templates for offline simulation.

#### 🚧 MCP Guardrails
Specific detectors for **Model Context Protocol** violations:
*   **Velocity:** Detects inhuman tool execution speeds (>3 ops/sec).
*   **Protocol:** Flags missing authentication signatures in agent handshakes.
*   **Context:** Identifies payload truncation attempts designed to hide malicious code.

---

### 4. Technology Stack

*   **Frontend Framework:** React 19 (TypeScript)
*   **Defense Engine:** TensorFlow.js (WebGL) + Universal Sentence Encoder
*   **Attack Engine:** Google GenAI SDK (Gemini 2.5 Flash)
*   **Visualization:** Recharts
*   **Styling:** Tailwind CSS
*   **Icons:** Lucide React

---

### 5. Installation & Setup

**Prerequisites:**
- Node.js (v18 or higher)
- NPM (v9 or higher)
- Modern Browser (Chrome/Edge/Firefox) with WebGL enabled

**Step 1: Clone the Repository**
```bash
git clone https://github.com/ritvik-indupuri/cortex-sentinel.git
cd cortex-sentinel
```

**Step 2: Install Dependencies**
```bash
npm install
```

**Step 3: Launch Application**
```bash
npm start
```
The application will launch at `http://localhost:3000`.
*Note: Upon first load, the system will download the TensorFlow.js model shards (approx 30MB). This happens once and is cached.*

---

### 6. Usage Guide

#### Phase 1: Threat Hunting (Simulation)
1.  Navigate to **Threat Hunter**.
2.  Select an Attack Vector (e.g., "Exfiltration").
3.  (Optional) Enter a Gemini API Key in Settings for AI-powered generation.
4.  Click **GENERATE LOG**. The system will "type out" a simulated attack log.

#### Phase 2: Neural Analysis (Defense)
1.  Click **ANALYZE TELEMETRY**.
2.  The local TensorFlow model computes the vector embeddings.
3.  A verdict (THREAT/CLEAN) is returned in <100ms.

#### Phase 3: Compliance & Auditing
1.  Navigate to **Raw Telemetry**.
2.  Review the immutable audit trail.
3.  Click **EXPORT COMPLIANCE REPORT** to download a CSV for external auditing.

---

### 7. Disclaimer

This tool uses client-side machine learning for educational and research purposes. While the Universal Sentence Encoder is powerful, production security systems should rely on multi-layered defense strategies involving network-level firewalls and SIEM integration.
