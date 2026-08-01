'use client';

import { useState } from 'react';

export function AttackSimulator({ onAttackComplete }: { onAttackComplete: () => void }) {
  const [selectedAttack, setSelectedAttack] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const attacks = [
    { id: 'normal', label: 'Normal Request', description: 'Frontend → Orders' },
    { id: 'unauthorized', label: 'Unauthorized Access', description: 'Frontend → Database' },
    { id: 'expired-token', label: 'Expired Token Attack', description: 'Replay with old token' },
    { id: 'invalid-sig', label: 'Invalid Signature', description: 'Tampered token' },
    { id: 'lateral', label: 'Lateral Movement', description: 'Multi-hop attack chain' },
  ];

  const runAttack = async () => {
    setIsRunning(true);
    try {
      await fetch('/api/simulator/attack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedAttack }),
      });
      onAttackComplete();
    } catch (error) {
      console.error('Attack error:', error);
    }
    setIsRunning(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Attack Simulator</h2>

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 space-y-4">
        <div>
          <label className="block text-white font-semibold mb-3">Select Attack Type:</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {attacks.map((attack) => (
              <button
                key={attack.id}
                onClick={() => setSelectedAttack(attack.id)}
                className={`p-3 rounded-lg border-2 text-left transition ${
                  selectedAttack === attack.id
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-slate-600 hover:border-slate-500'
                }`}
              >
                <p className="font-semibold text-white">{attack.label}</p>
                <p className="text-xs text-slate-400">{attack.description}</p>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={runAttack}
          disabled={!selectedAttack || isRunning}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white font-bold py-3 rounded-lg transition"
        >
          {isRunning ? 'Running Attack...' : 'Execute Attack'}
        </button>
      </div>
    </div>
  );
}
