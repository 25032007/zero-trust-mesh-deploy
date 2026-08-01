'use client';

export function ServiceGraph() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Service Communication Graph</h2>

      <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
        <svg viewBox="0 0 800 400" className="w-full">
          {/* Services */}
          {[
            { x: 100, y: 100, id: 'frontend', label: 'Frontend' },
            { x: 400, y: 100, id: 'orders', label: 'Orders' },
            { x: 700, y: 100, id: 'payments', label: 'Payments' },
            { x: 400, y: 300, id: 'users', label: 'Users' },
            { x: 550, y: 300, id: 'db', label: 'Database' },
          ].map((service) => (
            <g key={service.id}>
              <circle cx={service.x} cy={service.y} r="40" fill="#3b82f6" opacity="0.9" />
              <text
                x={service.x}
                y={service.y}
                textAnchor="middle"
                dy="0.3em"
                fill="white"
                fontSize="12"
                fontWeight="bold"
              >
                {service.label}
              </text>
            </g>
          ))}

          {/* Connections */}
          {[
            { from: { x: 140, y: 100 }, to: { x: 360, y: 100 } },
            { from: { x: 440, y: 100 }, to: { x: 660, y: 100 } },
            { from: { x: 400, y: 140 }, to: { x: 400, y: 260 } },
            { from: { x: 440, y: 140 }, to: { x: 550, y: 260 } },
          ].map((conn, idx) => (
            <line
              key={idx}
              x1={conn.from.x}
              y1={conn.from.y}
              x2={conn.to.x}
              y2={conn.to.y}
              stroke="#10b981"
              strokeWidth="2"
            />
          ))}
        </svg>
      </div>

      <div className="mt-4 text-slate-400 text-sm">
        <p>✓ All services are communicating within security policies</p>
        <p>✓ No unauthorized lateral movement detected</p>
      </div>
    </div>
  );
}
