'use client';

import { useState } from 'react';
import { ShieldCheck, ShieldAlert, Key, Fingerprint, Activity, Zap, PlayCircle, Loader2, ArrowRight } from 'lucide-react';

export function AttackSimulator({ onAttackComplete }: { onAttackComplete: () => void }) {
  const [selectedAttack, setSelectedAttack] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const attacks = [
    { id: 'normal', label: 'Normal Request', description: 'Frontend → Orders (Expected: ALLOW)', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'unauthorized', label: 'Unauthorized Access', description: 'Frontend → Database (Expected: BLOCK)', icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { id: 'expired-token', label: 'Expired Token', description: 'Replay with old token (Expected: BLOCK)', icon: Key, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'invalid-sig', label: 'Invalid Signature', description: 'Tampered token (Expected: BLOCK)', icon: Fingerprint, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { id: 'lateral', label: 'Lateral Movement', description: 'Multi-hop attack chain (Expected: BLOCK)', icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  const runAttack = async () => {
    if (!selectedAttack) return;
    setIsRunning(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch('/api/simulator/attack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedAttack }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Attack simulation failed');
      } else {
        setResult(data.result);
        onAttackComplete();
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    }
    setIsRunning(false);
  };

  const isAllowed = result?.decision === 'ALLOW';
  const decisionColors = isAllowed
    ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
    : 'text-rose-400 border-rose-500/30 bg-rose-500/5 shadow-[0_0_20px_rgba(244,63,94,0.1)]';

  const riskColor = (score: number) => {
    if (score < 30) return 'text-emerald-400';
    if (score < 60) return 'text-yellow-400';
    if (score < 80) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="p-8 space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Zap className="w-6 h-6 text-indigo-500" />
          Attack Simulator
        </h2>
      </div>

      <div className="glass-panel rounded-xl p-8 border border-slate-700/50 space-y-6">
        <div>
          <label className="block text-slate-300 text-sm font-semibold mb-4 uppercase tracking-wider">Select Attack Scenario</label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {attacks.map((attack) => {
              const Icon = attack.icon;
              const isSelected = selectedAttack === attack.id;
              
              return (
                <button
                  key={attack.id}
                  onClick={() => { setSelectedAttack(attack.id); setResult(null); setError(null); }}
                  className={`p-4 rounded-xl border text-left transition-all duration-300 relative overflow-hidden group ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                      : 'border-slate-700/50 hover:border-slate-600 bg-slate-900/50'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
                  )}
                  <div className="flex items-start gap-3 relative z-10">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-500/20' : attack.bg} transition-colors`}>
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-400' : attack.color}`} />
                    </div>
                    <div>
                      <p className={`font-semibold ${isSelected ? 'text-blue-400' : 'text-white'} transition-colors`}>
                        {attack.label}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{attack.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={runAttack}
          disabled={!selectedAttack || isRunning}
          className="w-full relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          <span className="relative z-10 flex items-center gap-2">
            {isRunning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Executing Attack...
              </>
            ) : (
              <>
                <PlayCircle className="w-5 h-5" /> Execute Scenario
              </>
            )}
          </span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="glass-panel border-rose-500/30 bg-rose-500/10 rounded-xl p-6 text-rose-400 animate-slide-up">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-lg">Execution Failed</p>
              <p className="text-sm mt-1 text-rose-300">{error}</p>
              <p className="text-xs text-rose-400/70 mt-2">Make sure the proxy server is running on port 4000.</p>
            </div>
          </div>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className={`glass-panel border rounded-xl p-8 space-y-6 animate-slide-up ${decisionColors}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Attack Analysis</h3>
              <p className="text-sm text-slate-400 mt-1">Real-time policy evaluation completed</p>
            </div>
            <div className={`px-6 py-2 rounded-full font-bold text-sm border flex items-center gap-2 shadow-lg ${
              isAllowed ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-rose-500 text-rose-400 bg-rose-500/10'
            }`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${isAllowed ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              {result.decision}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 rounded-xl p-4 border border-white/5">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Risk Score</p>
              <div className="mt-2 flex items-baseline gap-1">
                <p className={`text-4xl font-black tracking-tighter ${riskColor(result.riskScore)}`}>{result.riskScore}</p>
                <span className="text-sm font-medium text-slate-500">/100</span>
              </div>
            </div>
            
            {result.source && (
              <div className="bg-slate-900/60 rounded-xl p-4 border border-white/5 flex flex-col justify-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Source</p>
                <p className="text-sm font-semibold text-white truncate">{result.source}</p>
              </div>
            )}
            
            {result.destination && (
              <div className="bg-slate-900/60 rounded-xl p-4 border border-white/5 flex flex-col justify-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Destination</p>
                <p className="text-sm font-semibold text-white truncate">{result.destination}</p>
              </div>
            )}
            
            {result.reason && (
              <div className="bg-slate-900/60 rounded-xl p-4 border border-white/5 flex flex-col justify-center col-span-2 md:col-span-4">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Evaluation Reason</p>
                <p className="text-sm font-mono font-medium text-amber-400">{result.reason}</p>
              </div>
            )}
          </div>

          {/* Attack path for lateral movement */}
          {result.path && result.path.length > 0 && (
            <div className="bg-slate-900/60 rounded-xl p-5 border border-white/5">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">Detected Attack Path</p>
              <div className="flex items-center flex-wrap gap-2">
                {result.path.map((node: string, i: number) => (
                  <span key={i} className="flex items-center gap-2">
                    <span className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide">
                      {node}
                    </span>
                    {i < result.path.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-rose-500/50" />
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center gap-2 text-xs text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Audit log and threat feed updated in real-time.
          </div>
        </div>
      )}
    </div>
  );
}

