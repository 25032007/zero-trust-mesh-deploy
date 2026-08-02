'use client';

import { useState, useEffect, useCallback } from 'react';
import { SystemOverview } from './system-overview';
import { ThreatFeed } from './threat-feed';
import { ServiceGraph } from './service-graph';
import { RiskAnalytics } from './risk-analytics';
import { PerformanceMetrics } from './performance-metrics';
import { AuditLog } from './audit-log';
import { AttackSimulator } from './attack-simulator';
import { Header } from './header';
import { WebSocketClient } from '@/lib/websocket/client';
import { LayoutDashboard, ShieldAlert, Network, Activity, Zap, FileText, Bomb } from 'lucide-react';

interface DashboardState {
  overview: any;
  threats: any[];
  metrics: any;
  events: any[];
  stats: any;
}

export function Dashboard() {
  const [state, setState] = useState<DashboardState>({
    overview: null,
    threats: [],
    metrics: null,
    events: [],
    stats: null,
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [wsConnected, setWsConnected] = useState(false);

  // Initialize WebSocket connection
  useEffect(() => {
    const wsClient = new WebSocketClient();

    wsClient.on('connected', () => {
      setWsConnected(true);
      console.log('[Dashboard] WebSocket connected');
    });

    wsClient.on('disconnected', () => {
      setWsConnected(false);
      console.log('[Dashboard] WebSocket disconnected');
    });

    wsClient.on('event', (event: any) => {
      handleNewEvent(event);
    });

    wsClient.connect();

    return () => {
      wsClient.disconnect();
    };
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [healthRes, eventsRes, statsRes] = await Promise.all([
        fetch('/api/health/detailed'),
        fetch('/api/audit/security'),
        fetch('/api/health/stats'),
      ]);

      if (healthRes.ok) {
        const health = await healthRes.json();
        setState((prev) => ({
          ...prev,
          overview: health,
          metrics: health.metrics,
        }));
      }

      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setState((prev) => ({
          ...prev,
          events: data.events || [],
        }));
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setState((prev) => ({
          ...prev,
          stats: data,
        }));
      }
    } catch (error) {
      console.error('[Dashboard] Data fetch error:', error);
    }
  }, []);

  const handleNewEvent = (event: any) => {
    if (event.type === 'THREAT_ALERT' || event.type === 'THREAT_DETECTED') {
      setState((prev) => ({
        ...prev,
        threats: [
          {
            id: Date.now(),
            timestamp: new Date(),
            ...event.data,
          },
          ...prev.threats.slice(0, 49),
        ],
      }));
    }

    if (event.type === 'POLICY_VIOLATION' || event.type === 'LATERAL_MOVEMENT_DETECTED') {
      setState((prev) => ({
        ...prev,
        events: [
          {
            id: Date.now(),
            timestamp: new Date(),
            ...event.data,
          },
          ...prev.events.slice(0, 99),
        ],
      }));
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0a0a0c] text-slate-50 font-sans selection:bg-blue-500/30">
      <Header wsConnected={wsConnected} stats={state.stats} />

      <div className="flex h-[calc(100vh-73px)] overflow-hidden">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-slate-950/50 backdrop-blur-md border-r border-slate-800/60 overflow-y-auto premium-glow z-10">
          <div className="p-4 space-y-1">
            {[
              { id: 'overview', label: 'System Overview', icon: LayoutDashboard },
              { id: 'threats', label: 'Live Threats', icon: ShieldAlert },
              { id: 'services', label: 'Service Graph', icon: Network },
              { id: 'analytics', label: 'Risk Analytics', icon: Activity },
              { id: 'performance', label: 'Performance', icon: Zap },
              { id: 'audit', label: 'Audit Log', icon: FileText },
              { id: 'simulator', label: 'Attack Simulator', icon: Bomb },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center group relative overflow-hidden ${
                    isActive
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                  )}
                  <Icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <span className="font-medium text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-[#0a0a0c] to-[#0a0a0c]">
          {activeTab === 'overview' && <SystemOverview overview={state.overview} />}
          {activeTab === 'threats' && <ThreatFeed threats={state.threats} />}
          {activeTab === 'services' && <ServiceGraph />}
          {activeTab === 'analytics' && <RiskAnalytics events={state.events} />}
          {activeTab === 'performance' && <PerformanceMetrics metrics={state.metrics} />}
          {activeTab === 'audit' && <AuditLog events={state.events} />}
          {activeTab === 'simulator' && <AttackSimulator onAttackComplete={fetchData} />}
        </div>
      </div>
    </div>
  );
}
