'use client';

export function RiskAnalytics({ events }: { events: any[] }) {
  const threatTypes: { [key: string]: number } = {};
  events.forEach((e) => {
    const type = e.action || 'UNKNOWN';
    threatTypes[type] = (threatTypes[type] || 0) + 1;
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Risk Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Threat Distribution</h3>
          <div className="space-y-2">
            {Object.entries(threatTypes)
              .sort((a, b) => (b[1] as number) - (a[1] as number))
              .slice(0, 5)
              .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-slate-300">{type}</span>
                  <span className="font-bold text-red-500">{count}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Risk Timeline</h3>
          <div className="h-32 bg-slate-900 rounded flex items-end justify-around">
            {Array(12)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="w-2 bg-blue-500"
                  style={{ height: `${Math.random() * 100}%` }}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
