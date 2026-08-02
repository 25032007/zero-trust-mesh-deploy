'use client';

import { FileText } from 'lucide-react';

export function AuditLog({ events }: { events: any[] }) {
  return (
    <div className="p-8 animate-fade-in max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <FileText className="w-6 h-6 text-indigo-500" />
        Audit Log
      </h2>

      <div className="glass-panel rounded-xl overflow-hidden animate-slide-up">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-900/80 border-b border-slate-700/50">
              <tr>
                <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time</th>
                <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
                <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Source</th>
                <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {events.slice(0, 20).map((event, idx) => {
                const risk = event.riskScore || 0;
                const isHighRisk = risk > 60;
                
                return (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors duration-150 group">
                    <td className="py-4 px-6 text-slate-300 font-mono text-xs group-hover:text-white transition-colors">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-200">
                      {event.action || 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800/50 text-xs">
                        {event.source || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center justify-center min-w-[3rem] px-2.5 py-1 rounded-full text-xs font-bold border ${
                          isHighRisk
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                        }`}
                      >
                        {risk}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {events.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500 font-medium">
                    No events recorded in the audit log yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
