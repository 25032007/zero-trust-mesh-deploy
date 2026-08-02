'use client';

import { Shield, AlertTriangle, CheckCircle, Clock, Activity, Zap } from 'lucide-react';

export function SystemOverview({ overview }: { overview: any }) {
  if (!overview) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <Activity className="w-8 h-8 text-blue-500" />
          <p className="text-slate-400 font-medium">Loading system overview...</p>
        </div>
      </div>
    );
  }

  const metrics = overview.metrics || {};
  const stats = overview.stats || {};

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white tracking-tight">System Overview</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Protected Services */}
        <div className="glass-panel rounded-xl p-6 relative overflow-hidden group animate-slide-up" style={{ animationDelay: '0ms' }}>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Shield className="w-16 h-16 text-blue-500" />
          </div>
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 rounded-lg border border-blue-500/20 text-blue-400">
                <Shield className="w-5 h-5" />
              </div>
              <p className="text-slate-400 font-medium text-sm tracking-wide uppercase">Protected Services</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white tracking-tight">{overview.services?.active || 0}</p>
            </div>
          </div>
        </div>

        {/* Requests/Sec */}
        <div className="glass-panel rounded-xl p-6 relative overflow-hidden group animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock className="w-16 h-16 text-cyan-500" />
          </div>
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-500/10 rounded-lg border border-cyan-500/20 text-cyan-400">
                <Clock className="w-5 h-5" />
              </div>
              <p className="text-slate-400 font-medium text-sm tracking-wide uppercase">Requests/Min</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white tracking-tight">{Math.round(metrics.throughput || 0)}</p>
            </div>
          </div>
        </div>

        {/* Allowed Requests */}
        <div className="glass-panel rounded-xl p-6 relative overflow-hidden group animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle className="w-16 h-16 text-emerald-500" />
          </div>
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400">
                <CheckCircle className="w-5 h-5" />
              </div>
              <p className="text-slate-400 font-medium text-sm tracking-wide uppercase">Allowed</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-emerald-400 tracking-tight">{stats.totalRequests || 0}</p>
            </div>
          </div>
        </div>

        {/* Blocked Requests */}
        <div className="glass-panel rounded-xl p-6 relative overflow-hidden group animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertTriangle className="w-16 h-16 text-rose-500" />
          </div>
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-500/10 rounded-lg border border-rose-500/20 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <p className="text-slate-400 font-medium text-sm tracking-wide uppercase">Blocked</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-rose-500 tracking-tight">{stats.blockedRequests || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Latency Info */}
      <div className="glass-panel rounded-xl p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white">Performance Metrics</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800/50 text-center">
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">Avg Latency</p>
            <p className="text-2xl font-bold text-white tracking-tight">{metrics.avgLatency || 0}<span className="text-sm text-slate-500 ml-1">ms</span></p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800/50 text-center">
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">P95 Latency</p>
            <p className="text-2xl font-bold text-white tracking-tight">{metrics.p95Latency || 0}<span className="text-sm text-slate-500 ml-1">ms</span></p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800/50 text-center">
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">P99 Latency</p>
            <p className="text-2xl font-bold text-white tracking-tight">{metrics.p99Latency || 0}<span className="text-sm text-slate-500 ml-1">ms</span></p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800/50 text-center">
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">Error Rate</p>
            <p className="text-2xl font-bold text-white tracking-tight">{metrics.errorRate || 0}<span className="text-sm text-slate-500 ml-1">%</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
