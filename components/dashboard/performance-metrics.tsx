'use client';

import { Zap, Activity, Clock, ShieldAlert } from 'lucide-react';

export function PerformanceMetrics({ metrics }: { metrics: any }) {
  if (!metrics) {
    return (
      <div className="p-8 h-full flex items-center justify-center animate-fade-in">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <Activity className="w-8 h-8 text-indigo-500" />
          <p className="text-slate-400 font-medium">Loading metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 animate-fade-in max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Zap className="w-6 h-6 text-indigo-500" />
        Performance Metrics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-panel rounded-xl p-6 relative overflow-hidden group animate-slide-up" style={{ animationDelay: '0ms' }}>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock className="w-16 h-16 text-cyan-500" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                <Clock className="w-5 h-5" />
              </div>
              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">Avg Latency</p>
            </div>
            <div>
              <p className="text-4xl font-black text-white tracking-tighter">{metrics.avgLatency || 0}<span className="text-sm font-medium text-slate-500 ml-1">ms</span></p>
              <div className="mt-3 flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${(metrics.avgLatency || 0) <= 15 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`} />
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Target: ≤ 15ms</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-6 relative overflow-hidden group animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="w-16 h-16 text-indigo-500" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <Activity className="w-5 h-5" />
              </div>
              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">P95 Latency</p>
            </div>
            <div>
              <p className="text-4xl font-black text-white tracking-tighter">{metrics.p95Latency || 0}<span className="text-sm font-medium text-slate-500 ml-1">ms</span></p>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-3 invisible">Placeholder</p>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-6 relative overflow-hidden group animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldAlert className="w-16 h-16 text-amber-500" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">Proxy Overhead</p>
            </div>
            <div>
              <p className="text-4xl font-black text-white tracking-tighter">{metrics.avgProxyOverhead || 0}<span className="text-sm font-medium text-slate-500 ml-1">ms</span></p>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-3 invisible">Placeholder</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
