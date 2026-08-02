'use client';

import { Network, CheckCircle2 } from 'lucide-react';

export function ServiceGraph() {
  return (
    <div className="p-8 animate-fade-in max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Network className="w-6 h-6 text-indigo-500" />
        Service Communication Graph
      </h2>

      <div className="glass-panel rounded-xl p-8 animate-slide-up relative overflow-hidden group">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />
        
        <svg viewBox="0 0 800 400" className="w-full relative z-10 drop-shadow-2xl">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(56, 189, 248, 0.2)" />
              <stop offset="50%" stopColor="rgba(56, 189, 248, 0.8)" />
              <stop offset="100%" stopColor="rgba(56, 189, 248, 0.2)" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-strong" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Connections with animated dash */}
          {[
            { from: { x: 140, y: 100 }, to: { x: 360, y: 100 } },
            { from: { x: 440, y: 100 }, to: { x: 660, y: 100 } },
            { from: { x: 400, y: 140 }, to: { x: 400, y: 260 } },
            { from: { x: 440, y: 140 }, to: { x: 550, y: 260 } },
          ].map((conn, idx) => (
            <g key={idx}>
              {/* Glow line */}
              <line
                x1={conn.from.x} y1={conn.from.y} x2={conn.to.x} y2={conn.to.y}
                stroke="url(#lineGrad)" strokeWidth="6" opacity="0.3" filter="url(#glow)"
              />
              {/* Solid line */}
              <line
                x1={conn.from.x} y1={conn.from.y} x2={conn.to.x} y2={conn.to.y}
                stroke="#38bdf8" strokeWidth="2" opacity="0.8"
              />
            </g>
          ))}

          {/* Services */}
          {[
            { x: 100, y: 100, id: 'frontend', label: 'Frontend', type: 'entry' },
            { x: 400, y: 100, id: 'orders', label: 'Orders', type: 'internal' },
            { x: 700, y: 100, id: 'payments', label: 'Payments', type: 'internal' },
            { x: 400, y: 300, id: 'users', label: 'Users', type: 'internal' },
            { x: 550, y: 300, id: 'db', label: 'Database', type: 'db' },
          ].map((service) => (
            <g key={service.id} className="cursor-pointer transition-transform duration-300 hover:scale-110" style={{ transformOrigin: `${service.x}px ${service.y}px` }}>
              {/* Outer glow ring */}
              <circle cx={service.x} cy={service.y} r="45" fill="none" stroke="#6366f1" strokeWidth="1" opacity="0.3" filter="url(#glow-strong)">
                <animate attributeName="r" values="40;48;40" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.2;0.5;0.2" dur="3s" repeatCount="indefinite" />
              </circle>
              {/* Inner Node */}
              <circle cx={service.x} cy={service.y} r="35" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2" filter="url(#glow)" />
              {/* Center Dot */}
              <circle cx={service.x} cy={service.y} r="15" fill="#6366f1" />
              <text
                x={service.x}
                y={service.y + 60}
                textAnchor="middle"
                fill="#cbd5e1"
                fontSize="14"
                fontWeight="600"
                className="font-sans drop-shadow-md"
              >
                {service.label}
              </text>
            </g>
          ))}
        </svg>

        <div className="mt-8 flex flex-col md:flex-row items-center gap-4 text-slate-400 text-sm font-medium">
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            All services communicating within security policies
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            No unauthorized lateral movement detected
          </div>
        </div>
      </div>
    </div>
  );
}
