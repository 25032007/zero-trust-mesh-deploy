'use client';
import { useEffect, useState } from 'react';

export default function CompliancePage() {
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:4000/api/audit/compliance')
      .then((res) => res.json())
      .then((data) => setReport(data))
      .catch((err) => console.error(err));
  }, []);

  if (!report) return <div className="p-8 text-white min-h-screen bg-slate-950">Loading compliance report...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Compliance Report</h1>
            <p className="text-slate-400 mt-1">Generated at: {new Date(report.timestamp).toLocaleString()}</p>
          </div>
          <div className="flex gap-2">
            {report.frameworks.map((fw: string) => (
              <span key={fw} className="bg-indigo-950 text-indigo-400 border border-indigo-800 px-3 py-1 rounded text-sm font-medium">
                {fw}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          {report.controls.map((control: any) => (
            <div key={control.id} className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-3">
                  <span className="text-slate-400">{control.id}</span>
                  {control.name}
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${control.status === 'PASS' ? 'bg-green-950 text-green-400 border border-green-800' : 'bg-red-950 text-red-400 border border-red-800'}`}>
                  {control.status}
                </span>
              </div>
              <p className="text-slate-300 mb-6 leading-relaxed">{control.description}</p>
              <div className="bg-slate-950 rounded p-4 border border-slate-800 shadow-inner">
                <h3 className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-semibold">Evidence / Audit Data</h3>
                <p className="font-mono text-sm text-cyan-400 leading-relaxed">{control.evidence}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
