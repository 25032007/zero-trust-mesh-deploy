'use client';

import { AlertTriangle, Shield, XCircle } from 'lucide-react';

export function ThreatFeed({ threats }: { threats: any[] }) {
  if (!threats || threats.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Live Threat Feed</h2>
        <div className="text-center py-12 text-slate-400">
          <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No active threats detected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Live Threat Feed</h2>

      <div className="space-y-4 max-h-screen overflow-y-auto">
        {threats.map((threat, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-lg border ${
              threat.severity === 'CRITICAL'
                ? 'bg-red-900/20 border-red-700'
                : threat.severity === 'HIGH'
                  ? 'bg-orange-900/20 border-orange-700'
                  : 'bg-yellow-900/20 border-yellow-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className={`w-5 h-5 mt-1 ${
                    threat.severity === 'CRITICAL'
                      ? 'text-red-500'
                      : threat.severity === 'HIGH'
                        ? 'text-orange-500'
                        : 'text-yellow-500'
                  }`}
                />
                <div>
                  <p className="font-semibold text-white">{threat.threatType || 'UNKNOWN_THREAT'}</p>
                  <p className="text-sm text-slate-300">
                    {threat.source} → {threat.destination}
                  </p>
                  {threat.path && (
                    <p className="text-xs text-slate-400 mt-1">
                      Attack Path: {threat.path.join(' → ')}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(threat.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-red-500">Risk: {threat.riskScore || 0}</p>
                <p className="text-xs text-slate-400">BLOCKED</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
