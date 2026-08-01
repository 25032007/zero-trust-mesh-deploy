import { NextResponse } from 'next/server';

export async function GET() {
  const events = [
    {
      id: 'evt_1',
      timestamp: new Date(Date.now() - 30000),
      action: 'POLICY_VIOLATION',
      source: 'frontend-service',
      destination: 'database-service',
      riskScore: 85,
      reason: 'UNAUTHORIZED_SERVICE_PATH',
    },
    {
      id: 'evt_2',
      timestamp: new Date(Date.now() - 60000),
      action: 'TOKEN_VALIDATION_FAILED',
      source: 'orders-service',
      reason: 'TOKEN_EXPIRED',
      riskScore: 65,
    },
  ];

  return NextResponse.json({
    events,
    count: events.length,
  });
}
