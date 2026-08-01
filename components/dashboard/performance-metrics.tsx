'use client';

export function PerformanceMetrics({ metrics }: { metrics: any }) {
  if (!metrics) {
    return <div className="p-6 text-slate-400">Loading metrics...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Performance Metrics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <p className="text-slate-400 text-sm">Avg Latency</p>
          <p className="text-3xl font-bold text-white">{metrics.avgLatency || 0}ms</p>
          <p className="text-xs text-slate-500 mt-2">Target: ≤ 15ms</p>
        </div>

        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <p className="text-slate-400 text-sm">P95 Latency</p>
          <p className="text-3xl font-bold text-white">{metrics.p95Latency || 0}ms</p>
        </div>

        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <p className="text-slate-400 text-sm">Proxy Overhead</p>
          <p className="text-3xl font-bold text-white">{metrics.avgProxyOverhead || 0}ms</p>
        </div>
      </div>
    </div>
  );
}
