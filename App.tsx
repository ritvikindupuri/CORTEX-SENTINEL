import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Analyzer from './components/Analyzer';
import { X, Save, Key, Check, Shield, AlertCircle, AlertTriangle, Loader2, Wifi } from 'lucide-react';
import { LogEntry, ThreatAnalysis, ThreatLevel } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [claudeKey, setClaudeKey] = useState('');
  const [tempKey, setTempKey] = useState('');
  const [keyError, setKeyError] = useState('');
  const [keySuccess, setKeySuccess] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('sentinel_claude_key');
    if (storedKey) {
      setClaudeKey(storedKey);
      setTempKey(storedKey);
    }
  }, []);

  const handleVerifyAndSaveKey = async () => {
    setKeyError('');
    setKeySuccess('');
    const cleanedKey = tempKey.trim();
    
    if (!cleanedKey) {
      setKeyError('API Key cannot be empty.');
      return;
    }

    setIsVerifying(true);

    try {
      // Attempt a minimal handshake with Claude 3.7 to verify credentials
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': cleanedKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'anthropic-dangerously-allow-browser': 'true'
        },
        body: JSON.stringify({
          model: 'claude-3-7-sonnet-20250219',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'ping' }]
        })
      });

      if (response.ok) {
        localStorage.setItem('sentinel_claude_key', cleanedKey);
        setClaudeKey(cleanedKey);
        setKeySuccess('UPLINK ESTABLISHED :: CREDENTIALS VERIFIED');
        setTimeout(() => {
            setIsSettingsOpen(false);
            setKeySuccess('');
        }, 1500);
      } else {
        const errorData = await response.json();
        setKeyError(`Auth Failed: ${errorData.error?.message || 'Invalid API Key'}`);
      }
    } catch (error) {
      setKeyError('Connection Failed: Unable to reach Anthropic API (CORS/Network).');
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePurge = () => {
    setLogs([]);
    setKeySuccess('SYSTEM PURGED :: LOGS CLEARED');
    setTimeout(() => setKeySuccess(''), 2000);
  };

  const handleLoadHistory = () => {
      const sampleLogs: LogEntry[] = [
          { id: '1', timestamp: new Date(Date.now() - 100000).toISOString(), source: 'System_Daemon', activity: 'Routine Health Check', threatLevel: ThreatLevel.LOW, details: {} as any },
          { id: '2', timestamp: new Date(Date.now() - 80000).toISOString(), source: 'Auth_Gate', activity: 'Failed Login (User: admin)', threatLevel: ThreatLevel.MEDIUM, details: {} as any },
          { id: '3', timestamp: new Date(Date.now() - 60000).toISOString(), source: 'MCP_Bridge', activity: 'High Velocity Tool Chain Detected', threatLevel: ThreatLevel.CRITICAL, details: {} as any },
          { id: '4', timestamp: new Date(Date.now() - 40000).toISOString(), source: 'Firewall', activity: 'Outbound Connection Blocked (Port 4444)', threatLevel: ThreatLevel.HIGH, details: {} as any },
      ];
      setLogs(prev => [...prev, ...sampleLogs]);
      setKeySuccess('HISTORY LOADED :: SIMULATION DATA INJECTED');
      setTimeout(() => setKeySuccess(''), 2000);
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
        onOpenSettings={() => {
          setKeyError(''); // Reset error when opening
          setKeySuccess('');
          setIsSettingsOpen(true);
        }}
      />
      
      <main className="flex-1 overflow-auto relative z-10 bg-[#050505]">
        <div className={activeTab === 'dashboard' ? 'block h-full' : 'hidden h-full'}>
             <Dashboard logs={logs} />
        </div>
        <div className={activeTab === 'analyzer' ? 'block h-full' : 'hidden h-full'}>
             <Analyzer onAnalysisComplete={handleAnalysisComplete} claudeKey={claudeKey} />
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
                        <div className="text-sm text-blue-400 font-mono font-bold">CLAUDE 3.7 SONNET</div>
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
                            className={`w-full bg-black border py-2 pl-9 pr-3 text-xs text-white placeholder-[#333] focus:outline-none focus:border-blue-600 transition-colors font-mono ${keyError ? 'border-red-500' : keySuccess ? 'border-emerald-500' : 'border-[#333]'}`}
                          />
                        </div>
                        <button 
                          onClick={handleVerifyAndSaveKey}
                          disabled={isVerifying}
                          className={`border p-2 transition-all duration-200 flex items-center gap-2 px-4 font-mono text-xs ${
                              isVerifying 
                              ? 'bg-[#171717] border-[#333] text-[#737373]'
                              : 'bg-blue-900/20 hover:bg-blue-900/40 border-blue-800 text-blue-400'
                          }`}
                          title="Verify & Save"
                        >
                          {isVerifying ? <Loader2 size={14} className="animate-spin" /> : <Wifi size={14} />}
                          {isVerifying ? 'VERIFYING...' : 'CONNECT'}
                        </button>
                      </div>
                      
                      {keyError && (
                        <div className="text-[10px] text-red-500 font-mono flex items-center gap-1.5 mt-1 animate-in slide-in-from-top-1">
                           <AlertTriangle size={10} />
                           {keyError}
                        </div>
                      )}
                      
                      {keySuccess && (
                        <div className="text-[10px] text-emerald-500 font-mono flex items-center gap-1.5 mt-1 animate-in slide-in-from-top-1">
                           <Check size={10} />
                           {keySuccess}
                        </div>
                      )}

                      <p className="text-[10px] text-[#525252] font-mono flex gap-2 items-center mt-2">
                        <AlertCircle size={10} />
                        Key is verified against Anthropic API before saving.
                      </p>
                    </div>
                 </div>
              </div>
              
              {/* Data Management */}
              <div>
                 <label className="block text-[10px] font-bold text-[#737373] uppercase tracking-widest mb-2">System Controls</label>
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