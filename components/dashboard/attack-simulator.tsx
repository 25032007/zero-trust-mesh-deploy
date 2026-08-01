'use client';

import { useState } from 'react';

export function AttackSimulator({ onAttackComplete }: { onAttackComplete: () => void }) {
  const [selectedAttack, setSelectedAttack] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const attacks = [
    { id: 'normal', label: 'Normal Request', description: 'Frontend → Orders (Expected: ALLOW)', icon: '✅' },
    { id: 'unauthorized', label: 'Unauthorized Access', description: 'Frontend → Database (Expected: BLOCK)', icon: '🚫' },
    { id: 'expired-token', label: 'Expired Token Attack', description: 'Replay with old token (Expected: BLOCK)', icon: '⏰' },
    { id: 'invalid-sig', label: 'Invalid Signature', description: 'Tampered token (Expected: BLOCK)', icon: '🔐' },
    { id: 'lateral', label: 'Lateral Movement', description: 'Multi-hop attack chain (Expected: BLOCK)', icon: '🔗' },
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

  const decisionColor = result?.decision === 'ALLOW'
    ? 'text-green-400 border-green-700 bg-green-950'
    : 'text-red-400 border-red-700 bg-red-950';

  const riskColor = (score: number) => {
    if (score < 30) return 'text-green-400';
    if (score < 60) return 'text-yellow-400';
    if (score < 80) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-white">Attack Simulator</h2>

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 space-y-4">
        <div>
          <label className="block text-white font-semibold mb-3">Select Attack Type:</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {attacks.map((attack) => (
              <button
                key={attack.id}
                onClick={() => { setSelectedAttack(attack.id); setResult(null); setError(null); }}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedAttack === attack.id
                    ? 'border-blue-500 bg-blue-900/30 shadow-lg shadow-blue-900/20'
                    : 'border-slate-600 hover:border-slate-500 bg-slate-900'
                }`}
              >
                <p className="font-semibold text-white flex items-center gap-2">
                  <span>{attack.icon}</span> {attack.label}
                </p>
                <p className="text-xs text-slate-400 mt-1">{attack.description}</p>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={runAttack}
          disabled={!selectedAttack || isRunning}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
        >
          {isRunning ? (
            <>
              <span className="animate-spin">⟳</span> Executing Attack...
            </>
          ) : (
            '⚡ Execute Attack'
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-950 border border-red-700 rounded-lg p-4 text-red-400">
          <p className="font-semibold">❌ Error</p>
          <p className="text-sm mt-1">{error}</p>
          <p className="text-xs text-slate-400 mt-2">Make sure the proxy server is running on port 4000.</p>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className={`border rounded-lg p-6 space-y-4 ${decisionColor}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Attack Result</h3>
            <span className={`px-4 py-1 rounded-full font-bold text-sm border ${decisionColor}`}>
              {result.decision}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 rounded p-3">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Risk Score</p>
              <p className={`text-2xl font-bold mt-1 ${riskColor(result.riskScore)}`}>{result.riskScore}<span className="text-sm font-normal text-slate-500">/100</span></p>
            </div>
            {result.source && (
              <div className="bg-slate-900 rounded p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Source</p>
                <p className="text-sm font-medium text-white mt-1 truncate">{result.source}</p>
              </div>
            )}
            {result.destination && (
              <div className="bg-slate-900 rounded p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Destination</p>
                <p className="text-sm font-medium text-white mt-1 truncate">{result.destination}</p>
              </div>
            )}
            {result.reason && (
              <div className="bg-slate-900 rounded p-3 col-span-2 md:col-span-3">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Reason</p>
                <p className="text-sm font-mono font-medium text-orange-400 mt-1">{result.reason}</p>
              </div>
            )}
          </div>

          {/* Attack path for lateral movement */}
          {result.path && result.path.length > 0 && (
            <div className="bg-slate-900 rounded p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Attack Path</p>
              <div className="flex items-center flex-wrap gap-2">
                {result.path.map((node: string, i: number) => (
                  <span key={i} className="flex items-center gap-2">
                    <span className="bg-red-900 border border-red-700 text-red-300 px-3 py-1 rounded-full text-xs font-medium">
                      {node}
                    </span>
                    {i < result.path.length - 1 && (
                      <span className="text-red-500 font-bold">→</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-slate-500 mt-2">✅ Audit log and threat feed have been updated in real-time. Switch to the Live Threats or Audit Log tab to see the events.</p>
        </div>
      )}
    </div>
  );
}

