# CORTEX SENTINEL
## Neural Defense Grid (Offline Architecture)

**Author:** Ritvik Indupuri
**Version:** 2.1.0-Hybrid
**Architecture:** Hybrid (Google Gemini Generator + TFJS Defender)

---

### 1. Executive Summary

Cortex Sentinel is a browser-based cybersecurity platform designed to detect **"Agentic Breakout"** threats. It addresses the specific vulnerabilities outlined in recent Agentic AI security reports, such as rapid-fire tool execution and protocol masquerading.

The system employs a **Hybrid Architecture**:
1.  **Offense:** Uses **Google Gemini 2.5** (or a local procedural engine) to simulate sophisticated AI attacks.
2.  **Defense:** Uses a local **TensorFlow.js** Neural Network to detect those attacks in real-time via vector space analysis, ensuring zero data egress for the defense layer.

---

### 2. Technology Stack

*   **Frontend Framework:** React 19 (TypeScript)
*   **Defense Engine:** TensorFlow.js (WebGL) + Universal Sentence Encoder
*   **Attack Engine:** Google GenAI SDK (Gemini 2.5 Flash)
*   **Visualization:** Recharts
*   **Styling:** Tailwind CSS
*   **Icons:** Lucide React

---

### 3. Core Capabilities

#### A. Neural Heuristics Engine (The Defender)
Instead of sending sensitive logs to the cloud, Cortex Sentinel loads a **512-dimensional vector embedding model** directly into the browser's GPU. It measures the semantic distance between incoming logs and known threat concepts (e.g., "SQL Injection", "Root Escalation").
*   **Zero-Shot Learning:** Uses Semantic Anchor Injection to classify new threats without model retraining.

#### B. Procedural Telemetry Generator (The Attacker)
A dual-mode engine that constructs realistic cyber-attack logs.
*   **Cloud Mode:** Uses Gemini to hallucinate creative, context-aware Red Team logs.
*   **Local Mode:** Uses algorithmic templates to generate high-entropy logs offline.

#### C. MCP Guardrails
Specific detectors for **Model Context Protocol** violations:
*   **Velocity:** Detects inhuman tool execution speeds (>3 ops/sec).
*   **Protocol:** Flags missing authentication signatures in agent handshakes.
*   **Context:** Identifies payload truncation attempts designed to hide malicious code.

---

### 4. Installation & Setup

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

### 5. Operational Guide

#### Phase 1: Threat Hunting (Simulation)
1.  Navigate to **Threat Hunter**.
2.  Select an Attack Vector (e.g., "Exfiltration").
3.  (Optional) Enter a Gemini API Key in Settings for AI-powered generation.
4.  Click **GENERATE LOG**. The system will "type out" a simulated attack log.

#### Phase 2: Neural Analysis (Defense)
1.  Click **ANALYZE TELEMETRY**.
2.  The local TensorFlow model computes the vector embeddings.
3.  A verdict (THREAT/CLEAN) is returned in <100ms.

#### Phase 3: Compliance
1.  Navigate to **Raw Telemetry**.
2.  Review the immutable audit trail.
3.  Click **EXPORT COMPLIANCE REPORT** to download a CSV for external auditing.

---

### 6. Disclaimer

This tool uses client-side machine learning for educational and research purposes. While the Universal Sentence Encoder is powerful, production security systems should rely on multi-layered defense strategies involving network-level firewalls and SIEM integration.