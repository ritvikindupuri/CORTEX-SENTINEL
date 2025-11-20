import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Analyzer from './components/Analyzer';
import { X, Save, Cpu, Check, Shield, Activity, AlertTriangle, Loader2, Zap, Key } from 'lucide-react';
import { LogEntry, ThreatAnalysis, ThreatLevel } from './types';
import { initializeNeuralEngine } from './services/gemini';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isNeuralLoading, setIsNeuralLoading] = useState(true);
  const [neuralStatus, setNeuralStatus] = useState("INITIALIZING...");
  const [apiKey, setApiKey] = useState('');

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
  }, []);

  const handlePurge = () => {
    setLogs([]);
  };

  const handleLoadHistory = () => {
      const sampleLogs: LogEntry[] = [
          { id: '1', timestamp: new Date(Date.now() - 100000).toISOString(), source: 'System_Daemon', activity: 'Routine Health Check', threatLevel: ThreatLevel.LOW, details: {} as any },
          { id: '2', timestamp: new Date(Date.now() - 80000).toISOString(), source: 'Auth_Gate', activity: 'Failed Login (User: admin)', threatLevel: ThreatLevel.MEDIUM, details: {} as any },
          { id: '3', timestamp: new Date(Date.now() - 60000).toISOString(), source: 'MCP_Bridge', activity: 'High Velocity Tool Chain Detected', threatLevel: ThreatLevel.CRITICAL, details: {} as any },
          { id: '4', timestamp: new Date(Date.now() - 40000).toISOString(), source: 'Firewall', activity: 'Outbound Connection Blocked (Port 4444)', threatLevel: ThreatLevel.HIGH, details: {} as any },
      ];
      setLogs(prev => [...prev, ...sampleLogs]);
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

      {/* Settings Modal */}
      {isSettingsOpen && (
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
                 <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={handleLoadHistory}
                      className="bg-[#171717] border border-[#262626] hover:border-[#525252] p-3 text-xs font-mono text-[#d4d4d4] hover:text-white transition-colors text-left"
                    >
                        Load Sample History
                    </button>
                    <button 
                      onClick={handlePurge}
                      className="bg-red-950/10 border border-red-900/30 hover:bg-red-950/30 hover:border-red-500/50 p-3 text-xs font-mono text-red-400 hover:text-red-300 transition-colors text-left"
                    >
                        Purge System Logs
                    </button>
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