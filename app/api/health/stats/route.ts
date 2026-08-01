import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    totalEvents: 2450,
    totalRequests: 1250,
    blockedRequests: 45,
    threats: 8,
    avgRiskScore: 22,
  });
}
