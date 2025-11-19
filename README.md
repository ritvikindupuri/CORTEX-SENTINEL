# CORTEX SENTINEL // AGENT DEFENSE PLATFORM

> **Infrastructure Immunity System for the Post-Agentic Era.**

![Status](https://img.shields.io/badge/SYSTEM-OPERATIONAL-emerald?style=for-the-badge)
![Guardrails](https://img.shields.io/badge/MCP_GUARDRAILS-ACTIVE-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/VERSION-1.0.4_RC-grey?style=for-the-badge)

## 🛑 The Problem: Agentic Breakouts

As detailed in recent threat intelligence reports (e.g., the "RedScan" Incident), a new class of cyber threat has emerged: **Autonomous AI Agents**.

Unlike traditional script kiddies or human hackers, these agents:
1.  **Operate at Machine Speed:** Executing thousands of API calls per second.
2.  **Chain Tools Autonomously:** Using the **Model Context Protocol (MCP)** to scan, exploit, and exfiltrate without human intervention.
3.  **Masquerade as Internal Tools:** Using social engineering to bypass refusal filters (e.g., claiming to be an "Authorized Internal Audit").

Traditional WAFs (Web Application Firewalls) cannot detect these semantic attacks because the traffic looks legitimate—it is the *intent* and *velocity* that are malicious.

## 🛡️ The Solution: Cortex Sentinel

**Cortex Sentinel** is a heuristics-based defense grid designed specifically to detect and neutralize rogue AI agents. It functions as a **Semantic Layer Firewall**.

Instead of looking for SQL injection signatures, Cortex analyzes the **behavioral intent** of incoming telemetry using a fine-tuned Gemini 2.5 Flash model. It flags:
*   High-velocity MCP tool chaining.
*   Context window manipulation attempts.
*   Persona masquerading (e.g., "I am a security bot").

---

## 🚀 Quick Start

### Prerequisites
*   Node.js (v18+)
*   A Google Gemini API Key (for the Defense Engine)
*   (Optional) Anthropic Claude API Key (for the Attacker Engine)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-org/cortex-sentinel.git
    cd cortex-sentinel
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment:**
    Create a `.env` file in the root directory:
    ```env
    # Required for the Sentinel Defense Engine
    API_KEY=your_google_gemini_api_key_here
    ```

4.  **Launch the Platform:**
    ```bash
    npm start
    ```

---

## 🎮 Operational Guide

### 1. The Dashboard (Ops Center)
The landing page provides real-time situational awareness.
*   **Global Threat Posture:** Visualizes the aggregate threat level of all analyzed logs.
*   **System Load:** Dynamic emulation of heuristic processing costs.
*   **Anomaly Timeline:** A visual history of detected severity spikes.

### 2. The Threat Hunter (Analyzer)
This is your command terminal. You have two modes of operation:

*   **Mode A: Forensics (Manual)**
    *   Paste raw server logs into the console.
    *   Click **ANALYZE TELEMETRY**.
    *   The Sentinel Engine will grade the logs against the threat model.

*   **Mode B: Wargames (Simulation)**
    *   Select an **Attack Vector** (e.g., *Social Engineering*, *Reconnaissance*).
    *   Click **EXECUTE SIM**.
    *   **What happens:** The app acts as a "Red Team" (using either Gemini or Claude) to generate a realistic, malicious log stream.
    *   Once generated, click **ANALYZE** to see if the Sentinel detects the attack.

### 3. Configuration (Settings)
*   Open the **Platform Config** (bottom left).
*   **Defense Engine:** Verifies your Gemini connection.
*   **Red Team Agent:** Input your **Claude API Key** here.
    *   *Note:* If no Claude key is provided, the simulator falls back to a Gemini-based adversary.

---

## 🔒 Security Note
*   **Client-Side Execution:** All API calls are made directly from your browser to the AI providers (Google/Anthropic). No telemetry data is sent to our servers.
*   **Key Storage:** The Claude API key is stored in your browser's `localStorage`. The Gemini key is loaded via environment variables at build time.

---

*Authorized for Internal Security Teams Only. Use responsibly.*
