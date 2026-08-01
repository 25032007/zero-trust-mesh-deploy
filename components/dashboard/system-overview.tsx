'use client';

import { Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export function SystemOverview({ overview }: { overview: any }) {
  if (!overview) {
    return <div className="p-6 text-slate-400">Loading system overview...</div>;
  }

  const metrics = overview.metrics || {};
  const stats = overview.stats || {};

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-white">System Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Protected Services */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Protected Services</p>
              <p className="text-3xl font-bold text-white">{overview.services?.active || 0}</p>
            </div>
            <Shield className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        {/* Requests/Sec */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Requests/Min</p>
              <p className="text-3xl font-bold text-white">{Math.round(metrics.throughput || 0)}</p>
            </div>
            <Clock className="w-8 h-8 text-green-500" />
          </div>
        </div>

        {/* Allowed Requests */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Allowed</p>
              <p className="text-3xl font-bold text-green-500">{stats.totalRequests || 0}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        {/* Blocked Requests */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Blocked</p>
              <p className="text-3xl font-bold text-red-500">{stats.blockedRequests || 0}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Latency Info */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-slate-400 text-sm">Avg Latency</p>
            <p className="text-xl font-bold text-white">{metrics.avgLatency || 0}ms</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">P95</p>
            <p className="text-xl font-bold text-white">{metrics.p95Latency || 0}ms</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">P99</p>
            <p className="text-xl font-bold text-white">{metrics.p99Latency || 0}ms</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Error Rate</p>
            <p className="text-xl font-bold text-white">{metrics.errorRate || 0}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
