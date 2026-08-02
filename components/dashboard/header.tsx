'use client';

import { AlertCircle, Wifi, WifiOff, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  wsConnected: boolean;
  stats?: any;
}

export function Header({ wsConnected, stats }: HeaderProps) {
  const getThreatLevel = () => {
    if (!stats) return 'UNKNOWN';
    const threats = stats.threats || 0;
    const blocked = stats.blockedRequests || 0;

    if (blocked > 100) return 'CRITICAL';
    if (blocked > 50) return 'HIGH';
    if (blocked > 10) return 'MEDIUM';
    return 'LOW';
  };

  const getThreatStyles = () => {
    const level = getThreatLevel();
    switch (level) {
      case 'CRITICAL':
        return { color: 'text-rose-500', bg: 'bg-rose-500/10', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.5)]' };
      case 'HIGH':
        return { color: 'text-amber-500', bg: 'bg-amber-500/10', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.4)]' };
      case 'MEDIUM':
        return { color: 'text-yellow-400', bg: 'bg-yellow-400/10', glow: 'shadow-[0_0_10px_rgba(250,204,21,0.3)]' };
      default:
        return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', glow: 'shadow-[0_0_10px_rgba(16,185,129,0.2)]' };
    }
  };

  const threatStyle = getThreatStyles();

  return (
    <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800/60 px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)] animate-pulse-slow">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Zero-Trust Mesh
            </h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide uppercase mt-0.5">Continuous Identity • Adaptive Access</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Threat Level */}
          <div className="flex items-center gap-3 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800/50">
            <div className={`p-2 rounded-full ${threatStyle.bg} ${threatStyle.glow}`}>
              <AlertCircle className={`w-5 h-5 ${threatStyle.color}`} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Threat Level</p>
              <p className={`text-sm font-bold ${threatStyle.color}`}>{getThreatLevel()}</p>
            </div>
          </div>

          {/* Active Threats */}
          {stats && (
            <div className="flex flex-col items-center justify-center">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Active</p>
              <div className="text-xl font-bold text-rose-500 leading-none">{stats.threats || 0}</div>
            </div>
          )}

          {/* Blocked Requests */}
          {stats && (
            <div className="flex flex-col items-center justify-center">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Blocked</p>
              <div className="text-xl font-bold text-amber-500 leading-none">{stats.blockedRequests || 0}</div>
            </div>
          )}

          <div className="w-px h-8 bg-slate-800 mx-2" />

          {/* Connection Status */}
          <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800/50">
            {wsConnected ? (
              <>
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </div>
                <span className="text-xs font-medium text-emerald-400">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-medium text-rose-500">Offline</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
