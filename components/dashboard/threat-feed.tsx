'use client';

import { AlertTriangle, Shield, XCircle, ArrowRight, Activity } from 'lucide-react';

export function ThreatFeed({ threats }: { threats: any[] }) {
  if (!threats || threats.length === 0) {
    return (
      <div className="p-8 animate-fade-in max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Activity className="w-6 h-6 text-indigo-500" />
          Live Threat Feed
        </h2>
        <div className="glass-panel rounded-xl py-16 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-emerald-500/30 animate-pulse-slow" />
          <p className="text-lg font-medium text-emerald-400">System Secure</p>
          <p className="text-slate-500 text-sm mt-1">No active threats detected at this time</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 animate-fade-in max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Activity className="w-6 h-6 text-indigo-500" />
        Live Threat Feed
      </h2>

      <div className="space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto pr-2 pb-10">
        {threats.map((threat, idx) => (
          <div
            key={threat.id || idx}
            className={`glass-panel p-5 rounded-xl border relative overflow-hidden group animate-slide-in-right ${
              threat.severity === 'CRITICAL'
                ? 'border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10'
                : threat.severity === 'HIGH'
                  ? 'border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10'
                  : 'border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10'
            } transition-colors duration-300`}
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            {threat.severity === 'CRITICAL' && (
               <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
            )}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-lg shrink-0 ${
                  threat.severity === 'CRITICAL'
                    ? 'bg-rose-500/20 text-rose-400'
                    : threat.severity === 'HIGH'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-white tracking-wide">{threat.threatType || 'UNKNOWN_THREAT'}</p>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                      {new Date(threat.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-sm text-slate-300 font-medium">
                    <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-700">{threat.source}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                    <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-700">{threat.destination}</span>
                  </div>
                  {threat.path && (
                    <div className="mt-3 flex items-center flex-wrap gap-1">
                      <span className="text-xs text-slate-500 mr-1">Path:</span>
                      {threat.path.map((node: string, i: number) => (
                        <span key={i} className="flex items-center gap-1 text-xs">
                          <span className="text-slate-400">{node}</span>
                          {i < threat.path.length - 1 && <span className="text-slate-600">→</span>}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start shrink-0 ml-11 md:ml-0 gap-2">
                <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700/50 flex flex-col items-end">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">Risk Score</p>
                  <p className="text-xl font-bold text-rose-400 leading-none">{threat.riskScore || 0}</p>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-rose-500/10 border border-rose-500/20 rounded text-rose-400">
                  <XCircle className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">BLOCKED</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
