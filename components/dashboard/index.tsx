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
    <div className="w-full min-h-screen bg-slate-950 text-slate-50">
      <Header wsConnected={wsConnected} stats={state.stats} />

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-slate-900 border-r border-slate-800 overflow-y-auto">
          <div className="p-4 space-y-2">
            {[
              { id: 'overview', label: 'System Overview', icon: '📊' },
              { id: 'threats', label: 'Live Threats', icon: '🚨' },
              { id: 'services', label: 'Service Graph', icon: '🔗' },
              { id: 'analytics', label: 'Risk Analytics', icon: '📈' },
              { id: 'performance', label: 'Performance', icon: '⚡' },
              { id: 'audit', label: 'Audit Log', icon: '📋' },
              { id: 'simulator', label: 'Attack Simulator', icon: '💣' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-2 rounded transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
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
