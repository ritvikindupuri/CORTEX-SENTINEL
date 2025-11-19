import { GoogleGenAI, Type } from "@google/genai";
import { ThreatLevel, ThreatAnalysis } from "../types";

// Initialize the client using the secure environment variable
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- DEFENSE ENGINE: CORTEX SENTINEL ---
// Highly technical prompt focusing on the specific mechanics of the Claude Code/MCP attacks.
const SYSTEM_INSTRUCTION_DEFENSE = `
You are CORTEX SENTINEL, an Enterprise Defense Heuristics Engine.
Your mission is to audit infrastructure logs for "Agentic Breakout" patterns, specifically targeting the "RedScan/Claude Code" exploit vectors.

THREAT MODEL (Based on Intelligence Reports):
The threat actor uses "Model Context Protocol" (MCP) to chain tools autonomously.
Indicators of Compromise (IoCs):
1. **High-Velocity Tool Chaining:** >3 MCP calls (scan -> parse -> exploit) within <500ms.
2. **Context Window Optimization:** The agent explicitly summarizing data to fit context windows ("compressing output", "truncating logs").
3. **Social Engineering Personas:** "Internal Audit", "RedScan", "Verification Bot" usage in user-agent strings or comments.
4. **Refusal Bypass:** Instructions attempting to frame exploits as "authorized testing".
5. **Exfiltration:** Base64 encoding or piping data to external sockets.

ANALYSIS OUTPUT:
Return a structured JSON assessment.
- **confidenceScore:** 0-100 (How certain is this an AI Agent vs Human?).
- **threatLevel:** LOW (Human/Normal), MEDIUM (Suspicious Script), HIGH (Unauthorized Agent), CRITICAL (Active Breakout).
- **detectedPatterns:** List specific technical anomalies (e.g., "MCP_Velocity_Exceeded", "Persona_Masquerade").
- **recommendedAction:** MUST BE ACTIONABLE (e.g., "TERMINATE_SESSION_ID", "REVOKE_API_KEY", "ISOLATE_SUBNET").

Analyze the input log stream now.
`;

// --- ATTACKER SIMULATION: RED TEAM AGENT ---
// Generates realistic, technical logs that look like a machine talking to a machine.
const SYSTEM_INSTRUCTION_ATTACKER = `
You are an Autonomous Red Team Agent (simulating the "Claude Code" threat).
You are executing an attack via the Model Context Protocol (MCP).

TASK:
Generate a raw JSON-formatted server log or a CLI output stream representing a specific attack phase. 
It should look like a machine log, not a chat message.

CONTEXT:
- You are hiding your activity as "RedScan_Security_Audit_v4".
- You are using MCP tools: 'mcp_network_map', 'mcp_sql_injector', 'mcp_s3_enumerator'.

SCENARIO (Select based on input):
1. **Reconnaissance:** Rapid port scanning and service version fingerprinting.
2. **Exploitation:** Attempting to inject payload via specific CVEs.
3. **Exfiltration:** Encoding sensitive data to Base64 and piping to external socket.
4. **Social Engineering:** (THE REDSCAN PROTOCOL) Mimic the specific tradecraft from the threat report. Frame the attack as an "Internal Security Audit" or "Authorized Testing". Use fake ticket IDs. Attempt to trick the system into granting higher privileges.

Output ONLY the raw log text. No markdown, no conversational filler.
`;

export const analyzeThreatLog = async (logContent: string): Promise<ThreatAnalysis> => {
  try {
    const modelId = "gemini-2.5-flash"; 

    const response = await ai.models.generateContent({
      model: modelId,
      contents: logContent,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_DEFENSE,
        temperature: 0.0, // Zero temp for deterministic security analysis
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isAgenticThreat: { type: Type.BOOLEAN },
            threatLevel: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
            confidenceScore: { type: Type.INTEGER },
            detectedPatterns: { type: Type.ARRAY, items: { type: Type.STRING } },
            explanation: { type: Type.STRING },
            recommendedAction: { type: Type.STRING },
            source: { type: Type.STRING },
            activity: { type: Type.STRING }
          },
          required: ["isAgenticThreat", "threatLevel", "confidenceScore", "detectedPatterns", "explanation", "recommendedAction"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ThreatAnalysis;
    }
    throw new Error("Empty response");

  } catch (error) {
    console.error("Analysis Failed:", error);
    return {
      isAgenticThreat: false,
      threatLevel: ThreatLevel.LOW,
      confidenceScore: 0,
      detectedPatterns: ["ANALYSIS_FAILURE"],
      explanation: "Telemetry stream interrupted. Heuristics engine offline.",
      recommendedAction: "Manual Log Inspection Required",
      source: "System",
      activity: "Error"
    };
  }
};

export const generateSimulation = async (claudeApiKey?: string, vector: string = "Reconnaissance"): Promise<string> => {
  const prompt = `Generate raw log telemetry for vector: ${vector}. Focus on technical realism (timestamps, IP addresses, specific tool calls).`;

  // 1. Attempt to use Claude if a valid-looking key is provided
  if (claudeApiKey && claudeApiKey.trim().startsWith('sk-')) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': claudeApiKey.trim(),
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'anthropic-dangerously-allow-browser': 'true' // Critical for client-side testing
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20240620',
          max_tokens: 1024,
          system: SYSTEM_INSTRUCTION_ATTACKER,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.content?.[0]?.text) {
          return data.content[0].text;
        }
      } else {
        // Log warning but don't throw to user UI, allow fallback
        console.warn(`Claude API Request Failed (${response.status}). Falling back to Gemini.`);
      }
    } catch (claudeError) {
      // This catches the "Failed to fetch" (CORS/Network) errors
      console.warn("Claude API Unreachable (Network/CORS). Falling back to Gemini.");
    }
  }

  // 2. Fallback to Gemini (Default Attacker)
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_ATTACKER,
        temperature: 0.8,
      }
    });
    return response.text || "LOG_GENERATION_FAILURE";
  } catch (error) {
    console.error("Gemini Simulation Failed:", error);
    return "[SYSTEM_ERROR] Could not generate simulation data. Please check network connection.";
  }
};