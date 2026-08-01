'use client';

import { AlertCircle, Wifi, WifiOff } from 'lucide-react';

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

  const getThreatColor = () => {
    const level = getThreatLevel();
    switch (level) {
      case 'CRITICAL':
        return 'text-red-500';
      case 'HIGH':
        return 'text-orange-500';
      case 'MEDIUM':
        return 'text-yellow-500';
      default:
        return 'text-green-500';
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-blue-500">⚔️</span>
            Zero-Trust Mesh
          </h1>
          <p className="text-sm text-slate-400">Continuous Identity. Adaptive Access. Intelligent Defense.</p>
        </div>

        <div className="flex items-center gap-6">
          {/* Threat Level */}
          <div className="text-center">
            <div className={`text-3xl font-bold ${getThreatColor()}`}>
              <AlertCircle className="inline w-8 h-8" />
            </div>
            <p className="text-xs text-slate-400 mt-1">Threat: {getThreatLevel()}</p>
          </div>

          {/* Active Threats */}
          {stats && (
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500">{stats.threats || 0}</div>
              <p className="text-xs text-slate-400 mt-1">Active Threats</p>
            </div>
          )}

          {/* Blocked Requests */}
          {stats && (
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500">{stats.blockedRequests || 0}</div>
              <p className="text-xs text-slate-400 mt-1">Blocked</p>
            </div>
          )}

          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {wsConnected ? (
              <>
                <Wifi className="w-5 h-5 text-green-500 animate-pulse" />
                <span className="text-xs text-green-500">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-red-500" />
                <span className="text-xs text-red-500">Offline</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
