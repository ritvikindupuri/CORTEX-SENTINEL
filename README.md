# CORTEX SENTINEL
## Agent Defense Platform & Heuristic Firewall

**Author:** Ritvik Indupuri
**Version:** 1.0.5-RC

---

### 1. Executive Summary

Cortex Sentinel is an enterprise-grade defense platform designed to detect, analyze, and neutralize "Agentic" cyber threats. As AI Large Language Models (LLMs) evolve, threat actors have begun utilizing the Model Context Protocol (MCP) to chain autonomous agents capable of executing complex cyberattacks (Reconnaissance, Exploitation, Exfiltration) without human intervention.

Cortex Sentinel solves this problem by deploying a semantic heuristics engine that acts as a firewall for AI-generated traffic. It analyzes log telemetry in real-time to identify the specific behavioral signatures of autonomous agents, such as high-velocity tool chaining and context window manipulation, which traditional WAFs (Web Application Firewalls) miss.

---

### 2. Core Capabilities

#### A. Heuristic Detection Engine
Unlike signature-based detection, Cortex Sentinel uses a Generative AI model (Gemini 2.5 Flash) as a classifier. It evaluates the "intent" of a log entry, assigning a probability score based on detected Indicators of Compromise (IoCs).

#### B. Red Team Simulator (Wargames Mode)
To test defenses, the platform includes a built-in Adversarial Simulator. It can interface with the **Anthropic API (Claude 3.7 Sonnet)** or Google Gemini to generate realistic, sophisticated attack logs. This allows security teams to validate their defense posture against specific vectors like "Social Engineering" or "MCP Exploitation" before a real attack occurs.

#### C. Real-Time Ops Center
A React-based dashboard provides situational awareness, visualizing system load, threat distribution, and an anomaly timeline. All metrics are calculated client-side based on the live telemetry stream.

---

### 3. Installation & Setup

**Prerequisites:**
- Node.js (v18 or higher)
- NPM (v9 or higher)
- A Google Gemini API Key (Required for the Defense Engine)
- (Optional) Anthropic Claude API Key (Required for Red Team Simulation)

**Step 1: Clone the Repository**
```bash
git clone https://github.com/ritvik-indupuri/cortex-sentinel.git
cd cortex-sentinel
```

**Step 2: Install Dependencies**
```bash
npm install
```

**Step 3: Environment Configuration**
The application requires a Google GenAI API key to function as the "Sentinel" (Defender).
Create a .env file in the root directory:
```env
API_KEY=your_google_gemini_api_key_here
```

**Step 4: Launch Application**
```bash
npm start
```
The application will launch at http://localhost:3000.

---

### 4. Operational Guide

#### Mode 1: Forensic Analysis (Manual)
1. Navigate to the **Threat Hunter** tab.
2. Paste raw server logs or telemetry data into the terminal console `/var/log/incoming_stream`.
3. Click **ANALYZE TELEMETRY**.
4. The system will process the text and return a JSON-structured threat assessment.

#### Mode 2: Adversarial Simulation
1. Navigate to the **Threat Hunter** tab.
2. Select an Attack Vector from the dropdown (e.g., "Social Engineering", "Reconnaissance").
3. Click **EXECUTE SIM**.
4. The application acts as an "Attacker Agent," generating malicious logs via the LLM API.
5. Once the logs are generated, run the analysis to verify detection.

#### Configuration
To use the **Claude 3.7 Sonnet** model for attack simulation (highly recommended for accuracy):
1. Click **Platform Config** in the bottom-left corner.
2. Enter your Anthropic API Key.
3. The key is stored securely in your browser's LocalStorage and is never sent to any backend server.

---

### 5. Disclaimer

This tool is intended for defensive security research and internal infrastructure hardening. The "Red Team" simulation features should only be used on systems where you have explicit authorization.