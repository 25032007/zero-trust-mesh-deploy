import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    metrics: {
      totalRequests: 1250,
      avgLatency: 8.5,
      p50Latency: 7,
      p95Latency: 12,
      p99Latency: 15,
      throughput: 250,
      errorRate: 0.8,
      avgProxyOverhead: 2.1,
    },
    stats: {
      totalRequests: 1250,
      blockedRequests: 45,
      threats: 8,
      avgRiskScore: 22,
    },
    services: {
      total: 6,
      active: 6,
      inactive: 0,
      revoked: 0,
    },
  });
}
