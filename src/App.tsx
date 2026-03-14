import { useState, useEffect } from 'react';
import { Shield, Terminal, Activity, AlertTriangle, FileText, RefreshCw, Zap, Ghost, Search, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AttackLog, SecurityAlert, AttackModule, Severity } from './types';

const ATTACK_MODULES: AttackModule[] = [
  { id: 'brute_force', name: 'SSH Brute Force', description: 'Simulate repeated failed login attempts via SSH.', category: 'Offensive', severity: 'Medium' },
  { id: 'phishing', name: 'Credential Harvesting', description: 'Simulate a phishing page capturing user credentials.', category: 'Offensive', severity: 'High' },
  { id: 'sqli', name: 'SQL Injection', description: 'Attempt to bypass authentication via SQL injection.', category: 'Offensive', severity: 'Critical' },
  { id: 'log_wipe', name: 'Log Tampering', description: 'Attempt to delete or modify system audit logs.', category: 'Evasion', severity: 'High' },
  { id: 'priv_esc', name: 'Privilege Escalation', description: 'Exploit local misconfigurations to gain root access.', category: 'Post-Exploitation', severity: 'Critical' },
  { id: 'nmap_scan', name: 'Network Reconnaissance', description: 'Perform a stealthy port scan of the local network.', category: 'Offensive', severity: 'Low' },
];

export default function App() {
  const [logs, setLogs] = useState<AttackLog[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [stats, setStats] = useState({ totalAttacks: 0, detectedAttacks: 0, criticalAlerts: 0, detectionRate: '0' });
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'attacks' | 'logs' | 'reports'>('dashboard');
  const [evasionLevel, setEvasionLevel] = useState(0);

  const fetchData = async () => {
    try {
      const [logsRes, alertsRes, statsRes] = await Promise.all([
        fetch('/api/logs'),
        fetch('/api/alerts'),
        fetch('/api/stats')
      ]);
      setLogs(await logsRes.json());
      setAlerts(await alertsRes.json());
      setStats(await statsRes.json());
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulate = async (module: AttackModule) => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: module.name,
          details: module.description,
          severity: module.severity,
          evasionLevel
        })
      });
      const result = await res.json();
      await fetchData();
      // Show result toast or notification here if needed
    } finally {
      setIsSimulating(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to clear all lab data?')) {
      await fetch('/api/reset', { method: 'POST' });
      fetchData();
    }
  };

  const getSeverityColor = (sev: Severity) => {
    switch (sev) {
      case 'Low': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'High': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'Critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-300 font-sans selection:bg-emerald-500/30">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-[#111114] border-r border-white/5 z-50">
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
            <Shield className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-tight">AEGIS-RED</h1>
            <p className="text-[10px] text-emerald-500 font-mono tracking-widest uppercase">Cyber Range v1.0</p>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'hover:bg-white/5 text-gray-400'}`}
          >
            <Activity className="w-5 h-5" />
            <span className="text-sm font-medium">Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('attacks')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'attacks' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'hover:bg-white/5 text-gray-400'}`}
          >
            <Zap className="w-5 h-5" />
            <span className="text-sm font-medium">Attack Simulation</span>
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'logs' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'hover:bg-white/5 text-gray-400'}`}
          >
            <Terminal className="w-5 h-5" />
            <span className="text-sm font-medium">System Logs</span>
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'reports' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'hover:bg-white/5 text-gray-400'}`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-sm font-medium">Reporting</span>
          </button>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
          <button 
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reset Lab Environment
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="pl-64">
        {/* Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#0A0A0B]/80 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-tighter">System Online</span>
            </div>
            <h2 className="text-lg font-semibold text-white capitalize">{activeTab}</h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase font-mono">Current User</p>
              <p className="text-sm font-medium text-white">Red_Team_Intern</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1px]">
              <div className="w-full h-full rounded-full bg-[#0A0A0B] flex items-center justify-center">
                <Ghost className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-6">
                  {[
                    { label: 'Total Simulations', value: stats.totalAttacks, icon: Zap, color: 'text-emerald-500' },
                    { label: 'Detection Rate', value: `${stats.detectionRate}%`, icon: Search, color: 'text-blue-500' },
                    { label: 'Alerts Triggered', value: alerts.length, icon: AlertTriangle, color: 'text-orange-500' },
                    { label: 'Critical Risks', value: stats.criticalAlerts, icon: Database, color: 'text-red-500' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-[#111114] border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <stat.icon className={`w-12 h-12 ${stat.color}`} />
                      </div>
                      <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">{stat.label}</p>
                      <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-8">
                  {/* Recent Alerts */}
                  <div className="col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        Security Alert Feed
                      </h3>
                      <span className="text-[10px] font-mono text-gray-500">Real-time monitoring active</span>
                    </div>
                    <div className="space-y-3">
                      {alerts.length === 0 ? (
                        <div className="bg-[#111114] border border-dashed border-white/10 rounded-2xl p-12 text-center">
                          <p className="text-gray-500 text-sm italic">No security alerts detected yet. Launch an attack to test the SIEM.</p>
                        </div>
                      ) : (
                        alerts.map((alert) => (
                          <motion.div 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            key={alert.id} 
                            className="bg-[#111114] border border-white/5 p-4 rounded-xl flex items-start gap-4 hover:border-white/10 transition-colors"
                          >
                            <div className={`mt-1 p-2 rounded-lg ${getSeverityColor(alert.severity)} border`}>
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-sm font-bold text-white">{alert.alert_name}</h4>
                                <span className="text-[10px] font-mono text-gray-500">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                              </div>
                              <p className="text-xs text-gray-400 leading-relaxed">{alert.description}</p>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Quick Launch */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-500" />
                      Quick Simulation
                    </h3>
                    <div className="bg-[#111114] border border-white/5 rounded-2xl p-6 space-y-6">
                      <div className="space-y-4">
                        <label className="text-[10px] text-gray-500 uppercase font-mono tracking-widest">Evasion Level: {evasionLevel}</label>
                        <input 
                          type="range" min="0" max="3" step="1" 
                          value={evasionLevel}
                          onChange={(e) => setEvasionLevel(parseInt(e.target.value))}
                          className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                        <div className="flex justify-between text-[10px] font-mono text-gray-600">
                          <span>NOISY</span>
                          <span>STEALTH</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {ATTACK_MODULES.slice(0, 3).map((module) => (
                          <button
                            key={module.id}
                            disabled={isSimulating}
                            onClick={() => handleSimulate(module)}
                            className="w-full text-left p-3 rounded-xl border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-300 group-hover:text-emerald-500">{module.name}</span>
                              <Zap className="w-3 h-3 text-gray-600 group-hover:text-emerald-500" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'attacks' && (
              <motion.div 
                key="attacks"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="grid grid-cols-2 gap-6"
              >
                {ATTACK_MODULES.map((module) => (
                  <div key={module.id} className="bg-[#111114] border border-white/5 p-6 rounded-2xl hover:border-emerald-500/20 transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white">{module.name}</h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getSeverityColor(module.severity)}`}>
                            {module.severity}
                          </span>
                        </div>
                        <p className="text-xs text-emerald-500 font-mono uppercase tracking-widest">{module.category}</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-xl group-hover:bg-emerald-500/10 transition-colors">
                        {module.category === 'Offensive' ? <Zap className="w-6 h-6 text-emerald-500" /> : <Ghost className="w-6 h-6 text-blue-500" />}
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mb-6 leading-relaxed">{module.description}</p>
                    <button
                      disabled={isSimulating}
                      onClick={() => handleSimulate(module)}
                      className="w-full py-3 bg-emerald-500 text-[#0A0A0B] font-bold rounded-xl hover:bg-emerald-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSimulating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Executing Payload...
                        </>
                      ) : (
                        <>
                          <Terminal className="w-4 h-4" />
                          Launch Simulation
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'logs' && (
              <motion.div 
                key="logs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-[#111114] border border-white/5 rounded-2xl overflow-hidden"
              >
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">System Audit Logs</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-mono text-gray-500">Detected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-[10px] font-mono text-gray-500">Undetected</span>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/2">
                        <th className="px-6 py-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">Timestamp</th>
                        <th className="px-6 py-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">Attack Type</th>
                        <th className="px-6 py-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">Source IP</th>
                        <th className="px-6 py-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">Severity</th>
                        <th className="px-6 py-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/2 transition-colors">
                          <td className="px-6 py-4 text-xs font-mono text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm font-medium text-white">{log.type}</td>
                          <td className="px-6 py-4 text-xs font-mono text-gray-400">{log.source_ip}</td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getSeverityColor(log.severity)}`}>
                              {log.severity}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`w-2 h-2 rounded-full ${log.detected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'reports' && (
              <motion.div 
                key="reports"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                <div className="bg-[#111114] border border-white/5 p-12 rounded-3xl space-y-12">
                  <div className="flex justify-between items-start border-b border-white/5 pb-8">
                    <div className="space-y-2">
                      <h1 className="text-3xl font-bold text-white tracking-tight">Red Team Engagement Report</h1>
                      <p className="text-emerald-500 font-mono text-xs uppercase tracking-[0.2em]">Internal Security Assessment - Confidential</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[10px] text-gray-500 font-mono uppercase">Report ID</p>
                      <p className="text-sm font-bold text-white">AEGIS-2026-03-13</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest">Executive Summary</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        The simulated engagement targeted local infrastructure to identify detection gaps. 
                        A total of <span className="text-white font-bold">{stats.totalAttacks}</span> attack vectors were simulated, 
                        resulting in <span className="text-white font-bold">{alerts.length}</span> security alerts.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest">Detection Efficacy</h3>
                      <div className="flex items-end gap-4">
                        <span className="text-5xl font-bold text-white tracking-tighter">{stats.detectionRate}%</span>
                        <p className="text-xs text-gray-500 mb-2">Overall SIEM Detection Rate</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest">Vulnerability Breakdown</h3>
                    <div className="space-y-3">
                      {logs.slice(0, 5).map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-4 bg-white/2 rounded-xl border border-white/5">
                          <div className="flex items-center gap-4">
                            <div className={`w-2 h-2 rounded-full ${log.detected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            <span className="text-sm font-medium text-white">{log.type}</span>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getSeverityColor(log.severity)}`}>
                            {log.severity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/5 flex justify-between items-center">
                    <p className="text-[10px] text-gray-600 font-mono">Generated by Aegis-Red Reporting Engine</p>
                    <button className="px-6 py-2 bg-white text-[#0A0A0B] text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Export PDF
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
