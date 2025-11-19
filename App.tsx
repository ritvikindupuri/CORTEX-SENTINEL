import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Analyzer from './components/Analyzer';
import { X, Save, Key, Check, Shield, AlertCircle } from 'lucide-react';
import { LogEntry, ThreatAnalysis } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [claudeKey, setClaudeKey] = useState('');
  const [tempKey, setTempKey] = useState('');

  useEffect(() => {
    const storedKey = localStorage.getItem('sentinel_claude_key');
    if (storedKey) {
      setClaudeKey(storedKey);
      setTempKey(storedKey);
    }
  }, []);

  const handleSaveKey = () => {
    localStorage.setItem('sentinel_claude_key', tempKey);
    setClaudeKey(tempKey);
  };

  const handleAnalysisComplete = (analysis: ThreatAnalysis) => {
    const newLog: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      source: analysis.source || 'Unknown Agent',
      activity: analysis.activity || 'Anomalous Behavior Scan',
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
        {activeTab === 'dashboard' && <Dashboard logs={logs} />}
        {activeTab === 'analyzer' && <Analyzer onAnalysisComplete={handleAnalysisComplete} claudeKey={claudeKey} />}
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
              <h2 className="text-lg font-bold text-white uppercase tracking-widest">Platform Configuration</h2>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="text-[#737373] hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              {/* Gemini Config */}
              <div>
                <label className="block text-[10px] font-bold text-[#737373] uppercase tracking-widest mb-2">Defense Engine (Sentinel)</label>
                <div className="bg-[#171717] border border-[#262626] p-4 flex justify-between items-center">
                  <div>
                    <div className="text-sm text-white font-mono font-bold">CORTEX CORE (Gemini 2.5)</div>
                    <div className="text-xs text-[#737373]">Heuristics & Anomaly Detection</div>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 bg-emerald-950/30 border border-emerald-900/50 text-[10px] text-emerald-500 font-mono uppercase">
                     <Check size={10} />
                     Operational
                  </div>
                </div>
              </div>

              {/* Claude Config */}
              <div>
                 <label className="block text-[10px] font-bold text-[#737373] uppercase tracking-widest mb-2">Red Team Agent (Adversary)</label>
                 <div className="bg-[#171717] border border-[#262626] p-4 space-y-4">
                    <div className="flex justify-between items-center border-b border-[#262626] pb-3">
                      <div>
                        <div className="text-sm text-blue-400 font-mono font-bold">CLAUDE 3.5 SONNET</div>
                        <div className="text-xs text-[#737373]">MCP Simulation & Attack Generation</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] text-[#737373] uppercase font-bold tracking-wider">Anthropic API Key</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-[#525252]" size={14} />
                          <input 
                            type="password" 
                            value={tempKey}
                            onChange={(e) => setTempKey(e.target.value)}
                            placeholder="sk-ant-..."
                            className="w-full bg-black border border-[#333] py-2 pl-9 pr-3 text-xs text-white placeholder-[#333] focus:outline-none focus:border-blue-600 transition-colors font-mono"
                          />
                        </div>
                        <button 
                          onClick={handleSaveKey}
                          className="bg-blue-900/20 hover:bg-blue-900/40 border border-blue-800 text-blue-400 p-2 transition-colors"
                          title="Save Key"
                        >
                          <Save size={16} />
                        </button>
                      </div>
                      <p className="text-[10px] text-[#525252] font-mono flex gap-2 items-center mt-2">
                        <AlertCircle size={10} />
                        Key is stored locally in browser secure storage.
                      </p>
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