import express, { Router } from 'express';
import { identityService } from '../../identity/service';
import { auditLogger } from '../../audit/logger';
import { wsEventBroadcaster } from '../../websocket/broadcaster';
import { lateralMovementDetector } from '../../detection/lateral-movement';

const router = Router();

/**
 * Attack simulator endpoint
 * Generates realistic attack scenarios
 */
router.post('/attack', async (req, res) => {
  const { type } = req.body;

  try {
    const result = await simulateAttack(type);

    res.json({
      success: true,
      attack: type,
      result,
      timestamp: new Date(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Simulate different attack types
 */
async function simulateAttack(type: string): Promise<any> {
  const frontendToken = identityService.createToken('frontend-service', '15m');
  const ordersToken = identityService.createToken('orders-service', '15m');
  const paymentsToken = identityService.createToken('payments-service', '15m');

  const baseHeaders = {
    'X-Service-ID': 'frontend-service',
    'X-Service-Name': 'Frontend Service',
    'X-Destination-Service': 'orders-service',
    'Content-Type': 'application/json',
  };

  switch (type) {
    case 'normal':
      return simulateNormalRequest(baseHeaders, frontendToken.token);

    case 'unauthorized':
      return simulateUnauthorizedAccess();

    case 'expired-token':
      return simulateExpiredTokenAttack();

    case 'invalid-sig':
      return simulateInvalidSignatureAttack();

    case 'lateral':
      return simulateLateralMovement();

    default:
      return { message: 'Unknown attack type' };
  }
}

async function simulateNormalRequest(headers: any, token: string): Promise<any> {
  const result = {
    type: 'NORMAL_REQUEST',
    source: 'frontend-service',
    destination: 'orders-service',
    endpoint: '/orders/list',
    method: 'GET',
    decision: 'ALLOW',
    riskScore: 8,
  };

  await auditLogger.log({
    action: 'REQUEST_ALLOWED',
    source: 'frontend-service',
    destination: 'orders-service',
    endpoint: '/orders/list',
    riskScore: 8,
  });

  wsEventBroadcaster.broadcast({
    type: 'REQUEST',
    data: result,
  });

  return result;
}

async function simulateUnauthorizedAccess(): Promise<any> {
  const result = {
    type: 'UNAUTHORIZED_ACCESS',
    source: 'frontend-service',
    destination: 'database-service',
    endpoint: '/database/query',
    method: 'POST',
    decision: 'BLOCK',
    reason: 'UNAUTHORIZED_SERVICE_PATH',
    riskScore: 86,
  };

  await auditLogger.log({
    action: 'POLICY_VIOLATION',
    source: 'frontend-service',
    destination: 'database-service',
    reason: 'UNAUTHORIZED_SERVICE_PATH',
    riskScore: 86,
  });

  wsEventBroadcaster.broadcast({
    type: 'THREAT_DETECTED',
    data: {
      threatType: 'UNAUTHORIZED_ACCESS',
      source: 'frontend-service',
      destination: 'database-service',
      riskScore: 86,
      decision: 'BLOCKED',
    },
  });

  return result;
}

async function simulateExpiredTokenAttack(): Promise<any> {
  const result = {
    type: 'EXPIRED_TOKEN_ATTACK',
    source: 'frontend-service',
    reason: 'TOKEN_EXPIRED',
    decision: 'BLOCK',
    riskScore: 65,
  };

  await auditLogger.log({
    action: 'TOKEN_VALIDATION_FAILED',
    source: 'frontend-service',
    error: 'TOKEN_EXPIRED',
    riskScore: 65,
  });

  wsEventBroadcaster.broadcast({
    type: 'THREAT_DETECTED',
    data: {
      threatType: 'EXPIRED_TOKEN',
      source: 'frontend-service',
      riskScore: 65,
      decision: 'BLOCKED',
    },
  });

  return result;
}

async function simulateInvalidSignatureAttack(): Promise<any> {
  const result = {
    type: 'INVALID_SIGNATURE_ATTACK',
    source: 'frontend-service',
    reason: 'INVALID_SIGNATURE',
    decision: 'BLOCK',
    riskScore: 95,
  };

  await auditLogger.log({
    action: 'TOKEN_VALIDATION_FAILED',
    source: 'frontend-service',
    error: 'INVALID_SIGNATURE',
    riskScore: 95,
  });

  wsEventBroadcaster.broadcast({
    type: 'THREAT_DETECTED',
    data: {
      threatType: 'TAMPERED_TOKEN',
      source: 'frontend-service',
      riskScore: 95,
      decision: 'BLOCKED',
    },
  });

  return result;
}

async function simulateLateralMovement(): Promise<any> {
  const path = ['frontend-service', 'orders-service', 'payments-service', 'database-service'];

  const result = {
    type: 'LATERAL_MOVEMENT_ATTACK',
    path,
    source: 'frontend-service',
    destination: 'database-service',
    reason: 'LATERAL_MOVEMENT_DETECTED',
    decision: 'BLOCK',
    riskScore: 92,
  };

  // Record the attack path
  for (let i = 0; i < path.length - 1; i++) {
    await auditLogger.log({
      action: 'LATERAL_MOVEMENT_DETECTED',
      source: path[i],
      destination: path[i + 1],
      path: path.slice(i, i + 2),
      riskScore: 85 + i * 2,
    });
  }

  wsEventBroadcaster.broadcast({
    type: 'THREAT_DETECTED',
    data: {
      threatType: 'LATERAL_MOVEMENT',
      source: 'frontend-service',
      destination: 'database-service',
      path,
      riskScore: 92,
      decision: 'BLOCKED',
    },
  });

  return result;
}

export default router;
