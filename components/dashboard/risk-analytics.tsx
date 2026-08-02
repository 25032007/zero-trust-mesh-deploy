'use client';

import { Activity, AlertTriangle, BarChart2 } from 'lucide-react';

export function RiskAnalytics({ events }: { events: any[] }) {
  const threatTypes: { [key: string]: number } = {};
  events.forEach((e) => {
    const type = e.action || 'UNKNOWN';
    threatTypes[type] = (threatTypes[type] || 0) + 1;
  });

  const sorted = Object.entries(threatTypes)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 5);

  const maxCount = sorted[0]?.[1] ?? 1;

  const typeColors = [
    'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]',
    'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]',
    'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]',
    'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]',
    'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]',
  ];

  return (
    <div className="p-8 space-y-6 animate-fade-in max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
        <Activity className="w-6 h-6 text-indigo-500" />
        Risk Analytics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Threat Distribution */}
        <div className="glass-panel rounded-xl p-6 animate-slide-up" style={{ animationDelay: '0ms' }}>
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <h3 className="text-base font-semibold text-white">Threat Distribution</h3>
          </div>
          {sorted.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm font-medium">No threat data available yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sorted.map(([type, count], idx) => (
                <div key={type} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300 font-medium truncate max-w-[70%]">{type}</span>
                    <span className="text-slate-400 font-bold tabular-nums">{count as number}</span>
                  </div>
                  <div className="h-2 bg-slate-900/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${typeColors[idx % typeColors.length]} transition-all duration-700`}
                      style={{ width: `${((count as number) / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Risk Timeline */}
        <div className="glass-panel rounded-xl p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-white">Risk Timeline</h3>
          </div>
          <div className="h-36 flex items-end justify-around gap-1.5 relative">
            <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-700/50" />
            {Array(12)
              .fill(0)
              .map((_, i) => {
                const height = 20 + Math.abs(Math.sin(i * 0.9 + i)) * 80;
                const isHighRisk = height > 70;
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-t-sm transition-all duration-500 cursor-pointer hover:opacity-90 group relative ${
                      isHighRisk
                        ? 'bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                        : 'bg-indigo-500/70 hover:bg-indigo-400/80'
                    }`}
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300 font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {Math.round(height)}
                    </div>
                  </div>
                );
              })}
          </div>
          <div className="mt-3 flex justify-between text-[10px] text-slate-600 font-bold uppercase tracking-wider">
            <span>12h ago</span>
            <span>6h ago</span>
            <span>Now</span>
          </div>
        </div>
      </div>
    </div>
  );
}
