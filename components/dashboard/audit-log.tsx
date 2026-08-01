'use client';

export function AuditLog({ events }: { events: any[] }) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Audit Log</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 text-slate-400">Time</th>
              <th className="text-left py-3 px-4 text-slate-400">Action</th>
              <th className="text-left py-3 px-4 text-slate-400">Source</th>
              <th className="text-left py-3 px-4 text-slate-400">Risk</th>
            </tr>
          </thead>
          <tbody>
            {events.slice(0, 20).map((event, idx) => (
              <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/50">
                <td className="py-3 px-4 text-slate-300">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </td>
                <td className="py-3 px-4 text-slate-300">{event.action || 'N/A'}</td>
                <td className="py-3 px-4 text-slate-300">{event.source || 'N/A'}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      (event.riskScore || 0) > 60
                        ? 'bg-red-900 text-red-300'
                        : 'bg-green-900 text-green-300'
                    }`}
                  >
                    {event.riskScore || 0}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
