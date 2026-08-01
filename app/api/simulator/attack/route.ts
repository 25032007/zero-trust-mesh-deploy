import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { type } = await request.json();

    // Simulate attack response
    const attacks: { [key: string]: any } = {
      normal: {
        decision: 'ALLOW',
        riskScore: 8,
        source: 'frontend-service',
        destination: 'orders-service',
        type: 'NORMAL_REQUEST',
      },
      unauthorized: {
        decision: 'BLOCK',
        riskScore: 86,
        source: 'frontend-service',
        destination: 'database-service',
        reason: 'UNAUTHORIZED_SERVICE_PATH',
        type: 'UNAUTHORIZED_ACCESS',
      },
      'expired-token': {
        decision: 'BLOCK',
        riskScore: 65,
        reason: 'TOKEN_EXPIRED',
        type: 'EXPIRED_TOKEN_ATTACK',
      },
      'invalid-sig': {
        decision: 'BLOCK',
        riskScore: 95,
        reason: 'INVALID_SIGNATURE',
        type: 'INVALID_SIGNATURE_ATTACK',
      },
      lateral: {
        decision: 'BLOCK',
        riskScore: 92,
        reason: 'LATERAL_MOVEMENT_DETECTED',
        path: ['frontend-service', 'orders-service', 'payments-service', 'database-service'],
        type: 'LATERAL_MOVEMENT_ATTACK',
      },
    };

    const result = attacks[type] || { error: 'Unknown attack type' };

    return NextResponse.json({
      success: true,
      attack: type,
      result,
      timestamp: new Date(),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to execute attack' }, { status: 500 });
  }
}
