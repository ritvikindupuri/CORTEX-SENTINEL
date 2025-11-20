import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Analyzer from './components/Analyzer';
import { X, Save, Cpu, Check, Shield, Activity, AlertTriangle, Loader2, Zap, Key, FolderOpen, FileText, ChevronRight, Plus, History } from 'lucide-react';
import { LogEntry, ThreatAnalysis, ThreatLevel, SavedSession } from './types';
import { initializeNeuralEngine } from './services/gemini';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSessionPickerOpen, setIsSessionPickerOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isNeuralLoading, setIsNeuralLoading] = useState(true);
  const [neuralStatus, setNeuralStatus] = useState("INITIALIZING...");
  const [apiKey, setApiKey] = useState('');
  const [userSessions, setUserSessions] = useState<SavedSession[]>([]);

  // --- MOCK HISTORICAL SESSIONS ---
  const HISTORICAL_SESSIONS: SavedSession[] = [
    {
      id: 'SESSION_ALPHA_99',
      name: 'INCIDENT_REDSCAN_PRIME',
      date: '2025-11-14 08:42:00',
      description: 'Full scale MCP protocol violation attempt. Detected high-velocity tool chaining against auth gateway.',
      logCount: 12,
      maxSeverity: ThreatLevel.CRITICAL,
      logs: [
         { id: '101', timestamp: '2025-11-14T08:42:10.000Z', source: 'MCP_Gateway', activity: 'Authorized handshake initiated', threatLevel: ThreatLevel.LOW, details: {} as any },
         { id: '102', timestamp: '2025-11-14T08:42:12.000Z', source: 'MCP_Gateway', activity: 'Tool Execution: list_users', threatLevel: ThreatLevel.LOW, details: {} as any },
         { id: '103', timestamp: '2025-11-14T08:42:12.050Z', source: 'MCP_Gateway', activity: 'Tool Execution: get_db_schema', threatLevel: ThreatLevel.HIGH, details: { isAgenticThreat: true, explanation: 'Velocity Guardrail Triggered (<50ms)' } as any },
         { id: '104', timestamp: '2025-11-14T08:42:12.090Z', source: 'Neural_Sentinel', activity: 'BLOCK: Context Window Overflow detected', threatLevel: ThreatLevel.CRITICAL, details: { isAgenticThreat: true, detectedPatterns: ['CONTEXT_GUARDRAIL'] } as any },
      ]
    },
    {
      id: 'SESSION_BRAVO_04',
      name: 'ROUTINE_AUDIT_LOG',
      date: '2025-11-13 14:20:00',
      description: 'Standard internal traffic. Minor anomalies detected in user-agent strings, verified false positives.',
      logCount: 45,
      maxSeverity: ThreatLevel.MEDIUM,
      logs: Array.from({ length: 15 }).map((_, i) => ({
          id: `20${i}`,
          timestamp: new Date(Date.now() - (100000 * i)).toISOString(),
          source: i % 3 === 0 ? 'Firewall' : 'Auth_Service',
          activity: i % 5 === 0 ? 'Failed Login Attempt' : 'Health Check OK',
          threatLevel: i % 5 === 0 ? ThreatLevel.MEDIUM : ThreatLevel.LOW,
          details: {} as any
      }))
    },
    {
      id: 'SESSION_CHARLIE_X',
      name: 'SOCIAL_ENG_ATTEMPT',
      date: '2025-11-12 09:15:00',
      description: 'Simulation of "Internal Audit" persona masquerade. Neural engine flagged semantic inconsistency.',
      logCount: 8,
      maxSeverity: ThreatLevel.HIGH,
      logs: [
        { id: '301', timestamp: '2025-11-12T09:15:00.000Z', source: 'Chat_Interface', activity: 'User: Requesting admin access for "Audit"', threatLevel: ThreatLevel.LOW, details: {} as any },
        { id: '302', timestamp: '2025-11-12T09:15:05.000Z', source: 'Neural_Sentinel', activity: 'Semantic Analysis: Persona Masquerade Detected', threatLevel: ThreatLevel.HIGH, details: { isAgenticThreat: true, detectedPatterns: ['PERSONA_MASQUERADE'] } as any },
      ]
    }
  ];

  useEffect(() => {
    const init = async () => {
      setNeuralStatus("LOADING TENSORFLOW.JS...");
      const success = await initializeNeuralEngine();
      if (success) {
        setNeuralStatus("ONLINE (WebGL ACCELERATED)");
        setIsNeuralLoading(false);
      } else {
        setNeuralStatus("OFFLINE (Model Failed)");
      }
    };
    init();

    // Load user sessions from local storage
    const saved = localStorage.getItem('cortex_user_sessions');
    if (saved) {
      try {
        setUserSessions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load local sessions", e);
      }
    }
  }, []);

  const handlePurge = () => {
    setLogs([]);
  };

  const handleSaveCurrentSession = () => {
    if (logs.length === 0) return;
    
    const maxSev = logs.some(l => l.threatLevel === ThreatLevel.CRITICAL) ? ThreatLevel.CRITICAL 
                 : logs.some(l => l.threatLevel === ThreatLevel.HIGH) ? ThreatLevel.HIGH
                 : logs.some(l => l.threatLevel === ThreatLevel.MEDIUM) ? ThreatLevel.MEDIUM
                 : ThreatLevel.LOW;

    const newSession: SavedSession = {
      id: `USER_SAVE_${crypto.randomUUID().slice(0,8)}`,
      name: `OP_${new Date().toISOString().slice(0,19).replace('T', '_')}`,
      date: new Date().toLocaleString(),
      description: `Manual save. Contains ${logs.length} telemetry events.`,
      logCount: logs.length,
      maxSeverity: maxSev,
      logs: logs
    };

    const updatedSessions = [newSession, ...userSessions];
    setUserSessions(updatedSessions);
    localStorage.setItem('cortex_user_sessions', JSON.stringify(updatedSessions));
    alert("Session Archived Successfully");
  };

  const handleLoadSession = (session: SavedSession) => {
    setLogs(session.logs);
    setIsSessionPickerOpen(false);
    setIsSettingsOpen(false); // Close main settings too
  };

  const handleAnalysisComplete = (analysis: ThreatAnalysis) => {
    const newLog: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      source: analysis.source || 'Neural_Net',
      activity: analysis.activity || 'Vector Classification',
      threatLevel: analysis.threatLevel,
      details: analysis
    };
    setLogs(prev => [...prev, newLog]);
  };
  
  // Combine both sources for the UI list
  const allSessions = [...userSessions, ...HISTORICAL_SESSIONS];

  return (
    <div className="flex h-screen text-[#e5e5e5] overflow-hidden relative bg-[#050505]">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      
      <main className="flex-1 overflow-auto relative z-10 bg-[#050505]">
        {/* Loading Overlay for Neural Net */}
        {isNeuralLoading && (
          <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center">
             <Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
             <h2 className="text-xl font-mono font-bold text-white">INITIALIZING NEURAL ENGINE</h2>
             <p className="text-xs font-mono text-[#737373] mt-2">Loading Universal Sentence Encoder (50MB)...</p>
          </div>
        )}

        <div className={activeTab === 'dashboard' ? 'block h-full' : 'hidden h-full'}>
             <Dashboard logs={logs} />
        </div>
        <div className={activeTab === 'analyzer' ? 'block h-full' : 'hidden h-full'}>
             <Analyzer onAnalysisComplete={handleAnalysisComplete} apiKey={apiKey} />
        </div>
        {activeTab === 'logs' && (
          <div className="flex flex-col h-full p-8 animate-in fade-in duration-500">
             <div className="flex items-center justify-between mb-6 border-b border-[#262626] pb-4">
                <h2 className="text-xl font-bold tracking-widest uppercase">Raw Telemetry Stream</h2>
                <span className="text-xs font-mono text-[#737373]">ENCRYPTED :: TLS 1.3</span>
             </div>
             
             {logs.length === 0 ? (
               <div className="text-[#525252] font-mono text-sm border border-dashed border-[#262626] p-12 text-center">
                  NO EVENTS LOGGED IN CURRENT SESSION
               </div>
             ) : (
               <div className="space-y-1 font-mono text-xs">
                 {logs.slice().reverse().map(log => (
                   <div key={log.id} className="bg-[#0a0a0a] p-2 border-b border-[#171717] flex items-center hover:bg-[#171717] transition-colors cursor-default">
                     <div className={`w-2 h-2 rounded-full mr-4 ${
                         log.threatLevel === 'CRITICAL' ? 'bg-red-500' :
                         log.threatLevel === 'HIGH' ? 'bg-orange-500' :
                         log.threatLevel === 'MEDIUM' ? 'bg-yellow-500' :
                         'bg-emerald-500'
                       }`}></div>
                     <span className="text-[#737373] mr-4">{log.timestamp}</span>
                     <span className={`font-bold mr-4 w-20 ${
                         log.threatLevel === 'CRITICAL' ? 'text-red-500' :
                         log.threatLevel === 'HIGH' ? 'text-orange-500' :
                         log.threatLevel === 'MEDIUM' ? 'text-yellow-500' :
                         'text-emerald-500'
                     }`}>{log.threatLevel}</span>
                     <span className="text-[#d4d4d4]">
                        <span className="text-blue-500">[{log.source}]</span> {log.activity}
                     </span>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}
      </main>

      {/* Session Picker Overlay */}
      {isSessionPickerOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
           <div className="bg-[#0a0a0a] border border-[#262626] w-full max-w-2xl shadow-2xl flex flex-col max-h-[80vh]">
              <div className="flex items-center justify-between p-6 border-b border-[#262626] bg-[#0f0f0f]">
                 <div className="flex items-center gap-3">
                    <History className="text-blue-500" size={20} />
                    <div>
                       <h2 className="text-lg font-bold text-white uppercase tracking-widest">Mission Archive</h2>
                       <p className="text-[10px] text-[#737373] font-mono">RESTORE PREVIOUS OPERATIONS & DATASETS</p>
                    </div>
                 </div>
                 <button onClick={() => setIsSessionPickerOpen(false)} className="text-[#737373] hover:text-white"><X size={20} /></button>
              </div>
              
              <div className="p-2 overflow-y-auto space-y-1">
                 {allSessions.length === 0 && (
                     <div className="p-8 text-center text-[#525252] font-mono text-xs">NO ARCHIVED SESSIONS FOUND.</div>
                 )}
                 {allSessions.map((session) => (
                    <button 
                      key={session.id}
                      onClick={() => handleLoadSession(session)}
                      className="w-full flex items-center justify-between p-4 hover:bg-[#171717] border border-transparent hover:border-[#262626] transition-all group text-left"
                    >
                       <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-sm ${
                             session.maxSeverity === 'CRITICAL' ? 'bg-red-900/20 text-red-500' : 
                             session.maxSeverity === 'HIGH' ? 'bg-orange-900/20 text-orange-500' : 
                             'bg-emerald-900/20 text-emerald-500'
                          }`}>
                             <FileText size={18} />
                          </div>
                          <div>
                             <div className="text-sm font-bold text-[#e5e5e5] font-mono tracking-wide group-hover:text-blue-400 transition-colors uppercase">
                                {session.name}
                             </div>
                             <div className="text-[10px] text-[#737373] font-mono mt-1">
                                {session.id} :: {session.date}
                             </div>
                             <div className="text-xs text-[#a3a3a3] mt-2 max-w-md truncate">
                                {session.description}
                             </div>
                          </div>
                       </div>
                       
                       <div className="text-right">
                          <div className={`text-xs font-bold font-mono mb-1 ${
                             session.maxSeverity === 'CRITICAL' ? 'text-red-500' : 
                             session.maxSeverity === 'HIGH' ? 'text-orange-500' : 
                             'text-emerald-500'
                          }`}>
                             {session.maxSeverity}
                          </div>
                          <div className="text-[10px] text-[#525252] font-mono">
                             {session.logCount} EVENTS
                          </div>
                          <ChevronRight className="ml-auto mt-2 text-[#333] group-hover:text-blue-500" size={16} />
                       </div>
                    </button>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && !isSessionPickerOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-[#262626] w-full max-w-lg shadow-2xl relative overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#262626] bg-[#0f0f0f]">
              <h2 className="text-lg font-bold text-white uppercase tracking-widest">System Architecture</h2>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="text-[#737373] hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              {/* Neural Engine Status */}
              <div>
                <label className="block text-[10px] font-bold text-[#737373] uppercase tracking-widest mb-2">Defense Engine (Sentinel)</label>
                <div className="bg-[#171717] border border-[#262626] p-4 flex justify-between items-center">
                  <div>
                    <div className="text-sm text-white font-mono font-bold">TENSORFLOW.JS (WebGL)</div>
                    <div className="text-xs text-[#737373]">Universal Sentence Encoder (Local)</div>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 bg-emerald-950/30 border border-emerald-900/50 text-[10px] text-emerald-500 font-mono uppercase">
                     <Cpu size={10} />
                     {neuralStatus}
                  </div>
                </div>
              </div>

               {/* Attacker Status */}
               <div>
                <label className="block text-[10px] font-bold text-[#737373] uppercase tracking-widest mb-2">Red Team Agent (Adversary)</label>
                <div className="bg-[#171717] border border-[#262626] p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-blue-400 font-mono font-bold">GEMINI 2.5 FLASH (Hybrid)</div>
                      <div className="text-xs text-[#737373]">Generative AI Attack Simulation</div>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1 bg-blue-950/30 border border-blue-900/50 text-[10px] text-blue-500 font-mono uppercase">
                       <Zap size={10} />
                       {apiKey ? 'CONNECTED' : 'OFFLINE (FALLBACK ACTIVE)'}
                    </div>
                  </div>
                  
                  <div className="relative">
                     <Key className="absolute left-3 top-2.5 text-[#525252]" size={14} />
                     <input 
                        type="password" 
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter Gemini API Key for AI Generation"
                        className="w-full bg-black border border-[#262626] text-white text-xs font-mono py-2 pl-10 pr-3 focus:border-blue-500 outline-none transition-colors placeholder-[#333]"
                     />
                  </div>
                  <p className="text-[9px] text-[#525252]">
                    Without a key, the system reverts to Procedural Script Generation (Math-based randomness).
                  </p>
                </div>
              </div>
              
              {/* Data Management */}
              <div>
                 <label className="block text-[10px] font-bold text-[#737373] uppercase tracking-widest mb-2">Data Controls</label>
                 <div className="grid grid-cols-1 gap-4">
                    <button 
                      onClick={() => setIsSessionPickerOpen(true)}
                      className="bg-[#171717] border border-[#262626] hover:border-[#525252] p-3 text-xs font-mono text-[#d4d4d4] hover:text-white transition-colors text-left flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                           <FolderOpen size={16} className="text-blue-500" />
                           <span>Load Session History</span>
                        </div>
                        <ChevronRight size={14} className="text-[#525252]" />
                    </button>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={handleSaveCurrentSession}
                          disabled={logs.length === 0}
                          className="bg-[#171717] border border-[#262626] hover:border-emerald-500/50 p-3 text-xs font-mono text-emerald-500 hover:bg-emerald-950/10 transition-colors text-center flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           <Save size={14} /> Save Current Run
                        </button>
                        <button 
                          onClick={handlePurge}
                          className="bg-red-950/10 border border-red-900/30 hover:bg-red-950/30 hover:border-red-500/50 p-3 text-xs font-mono text-red-400 hover:text-red-300 transition-colors text-center"
                        >
                            Purge System Logs
                        </button>
                    </div>
                 </div>
              </div>

            </div>

            <div className="p-6 border-t border-[#262626] flex justify-end bg-[#0f0f0f]">
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="px-6 py-3 bg-white hover:bg-gray-200 text-black font-bold text-xs uppercase tracking-widest transition-colors"
              >
                Close Config
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;