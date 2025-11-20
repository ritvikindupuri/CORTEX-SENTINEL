# CORTEX SENTINEL
## Neural Defense Grid (Offline Architecture)

**Author:** Ritvik Indupuri
**Version:** 2.0.0-Neural
**Architecture:** TensorFlow.js / Client-Side WebGL

---

### 1. Executive Summary

Cortex Sentinel is a fully offline, browser-based cybersecurity platform designed to detect "Agentic Breakout" threats. It replaces traditional Cloud LLM APIs with a **local Neural Network (TensorFlow.js)**.

This system demonstrates the power of **Edge AI** for security. By running the **Universal Sentence Encoder (USE)** directly in the user's browser, it performs deep semantic analysis of server logs to detect anomalies, malicious intent, and MCP (Model Context Protocol) violations without a single byte of data leaving the local machine.

---

### 2. Core Capabilities

#### A. Neural Heuristics Engine (The Defender)
Instead of sending logs to the cloud, Cortex Sentinel loads a 512-dimensional vector embedding model into the browser's GPU via WebGL.
*   **Vector Space Classification:** Converts raw log text into mathematical vectors.
*   **Cosine Similarity:** Measures the distance between the input log and known "Threat Anchors" (mathematical representations of concepts like "SQL Injection" or "Root Escalation").
*   **Privacy First:** Zero data egress. 100% GDPR/CCPA compliant by design.

#### B. Procedural Telemetry Generator (The Attacker)
A sophisticated algorithmic engine that "hallucinates" realistic cyber-attack logs.
*   **Rule-Based Synthesis:** Generates high-fidelity logs for Reconnaissance, Exploitation, and Social Engineering.
*   **Dynamic Variables:** Randomizes IPs, timestamps, and user agents to create unique datasets for every simulation run.

#### C. Real-Time Ops Center
A React-based dashboard providing instantaneous visibility into the Neural Net's performance, including System Load (Compute Intensity) and Threat Distribution.

---

### 3. Installation & Setup

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
The application will launch at http://localhost:3000.
*Note: Upon first load, the system will download the TensorFlow.js model shards (approx 30MB). This happens once and is cached.*

---

### 4. Technical Usage Guide

#### Mode 1: Forensic Analysis (Manual)
1. Navigate to **Threat Hunter**.
2. Paste raw logs into the console.
3. Click **ANALYZE TELEMETRY**.
4. The Neural Engine computes the vector embeddings and returns a threat verdict in <100ms.

#### Mode 2: Adversarial Simulation
1. Select an Attack Vector (e.g., "Exfiltration").
2. Click **GENERATE LOG**.
3. The Procedural Engine constructs a synthetic log entry.
4. Analyze it to see how the Vector Space model classifies the synthetic threat.

---

### 5. Disclaimer

This tool uses client-side machine learning for educational and research purposes. While the Universal Sentence Encoder is powerful, production security systems should rely on multi-layered defense strategies.