import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { identityMiddleware } from '../identity/middleware';
import { identityService } from '../identity/service';
import { tokenValidationMiddleware } from '../token/validation';
import { policyEngine } from '../policies/engine';
import { riskEngine } from '../risk/engine';
import { anomalyEngine } from '../anomaly/engine';
import { lateralMovementDetector } from '../detection/lateral-movement';
import { auditLogger } from '../audit/logger';
import { rateLimiter } from '../rate-limiting/limiter';
import { quarantineService } from '../quarantine/service';
import { metricsCollector } from '../metrics/collector';
import { wsEventBroadcaster } from '../websocket/broadcaster';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

// Global middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Initialize WebSocket broadcaster
wsEventBroadcaster.initialize(wss);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Management API routes — mounted BEFORE security middleware (no auth required)
// These are internal/admin routes called server-side, not by external services
app.use('/api/health', require('./routes/health').default);
app.use('/api/metrics', require('./routes/metrics').default);
app.use('/api/audit', require('./routes/audit').default);
app.use('/api/services', require('./routes/services').default);
app.use('/api/policies', require('./routes/policies').default);
app.use('/api/tokens', require('./routes/tokens').default);
app.use('/api/quarantine', require('./routes/quarantine').default);
app.use('/api/simulator', require('./routes/simulator').default);

// Zero-Trust security middleware pipeline — applies only to /api/proxy
app.use('/api/proxy', metricsCollector.middleware());
app.use('/api/proxy', rateLimiter.middleware());
app.use('/api/proxy', identityMiddleware.validate);
app.use('/api/proxy', tokenValidationMiddleware.validate);
app.use('/api/proxy',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Add request context
      const requestContext = {
        id: req.headers['x-request-id'] || `req_${Date.now()}`,
        sourceService: (req as any).serviceId,
        timestamp: new Date(),
        headers: req.headers,
      };

      (req as any).context = requestContext;

      // Check quarantine
      if (await quarantineService.isServiceQuarantined((req as any).serviceId)) {
        return res.status(403).json({
          decision: 'BLOCK',
          reason: 'SERVICE_QUARANTINED',
          riskScore: 100,
          message: 'Service is currently quarantined due to suspicious activity',
        });
      }

      next();
    } catch (error: any) {
      auditLogger.log({
        action: 'MIDDLEWARE_ERROR',
        error: error.message,
        source: (req as any).serviceId || 'unknown',
      });
      res.status(500).json({
        decision: 'BLOCK',
        reason: 'INTERNAL_ERROR',
        riskScore: 50,
      });
    }
  }
);

// Policy and Risk Evaluation Pipeline
app.use('/api/proxy',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const source = (req as any).serviceId;
      const destination = req.headers['x-destination-service'] as string;
      const endpoint = req.path;
      const method = req.method;

      // Check authorization policy
      const policyDecision = await policyEngine.evaluate({
        source,
        destination,
        endpoint,
        method,
        context: (req as any).context,
      });

      if (!policyDecision.allowed) {
        await auditLogger.log({
          action: 'POLICY_VIOLATION',
          source,
          destination,
          endpoint,
          reason: policyDecision.reason,
          riskScore: 70,
        });

        return res.status(403).json({
          decision: 'BLOCK',
          reason: policyDecision.reason,
          riskScore: 70,
          message: 'Access denied by security policy',
        });
      }

      // Calculate payload anomaly
      const payloadAnomaly = await anomalyEngine.detectPayloadAnomaly(req.body, endpoint);

      // Calculate risk score
      const riskScore = await riskEngine.calculateRisk({
        source,
        destination,
        endpoint,
        method,
        payloadAnomaly,
        ip: req.ip || req.socket.remoteAddress,
        context: (req as any).context,
      });

      (req as any).riskScore = riskScore;
      (req as any).destination = destination;
      (req as any).payloadAnomaly = payloadAnomaly;

      // Check lateral movement
      const lateralMovement = await lateralMovementDetector.detectMovement({
        source,
        destination,
        riskScore,
        context: (req as any).context,
      });

      if (lateralMovement.detected) {
        await auditLogger.log({
          action: 'LATERAL_MOVEMENT_DETECTED',
          source,
          destination,
          path: lateralMovement.path,
          riskScore: 85,
        });

        // Broadcast to dashboard
        wsEventBroadcaster.broadcast({
          type: 'THREAT_DETECTED',
          data: {
            threatType: 'LATERAL_MOVEMENT',
            source,
            destination,
            path: lateralMovement.path,
            riskScore: 85,
            timestamp: new Date(),
          },
        });

        if (riskScore > 75) {
          await quarantineService.quarantineService(source);
          return res.status(403).json({
            decision: 'BLOCK',
            reason: 'LATERAL_MOVEMENT_DETECTED',
            riskScore: 85,
            message: 'Suspicious lateral movement detected. Service quarantined.',
          });
        }
      }

      // Dynamic re-authentication if risk is high
      if (riskScore > 60 && riskScore <= 75) {
        const mfaToken = req.headers['x-service-totp'] as string;
        if (mfaToken && identityService.verifyMfa(source, mfaToken)) {
          // MFA successful, allow request
          await auditLogger.log({
            action: 'MFA_SUCCESS',
            source,
            riskScore,
          });
        } else {
          await auditLogger.log({
            action: 'STEP_UP_AUTH_REQUIRED',
            source,
            riskScore,
          });

          return res.status(401).json({
            decision: 'STEP_UP_AUTH',
            reason: 'HIGH_RISK_DETECTED',
            riskScore,
            message: 'Step-up authentication (MFA) required',
            requiresReauth: true,
          });
        }
      }

      if (riskScore > 75) {
        await quarantineService.quarantineService(source);
        await auditLogger.log({
          action: 'CRITICAL_RISK',
          source,
          riskScore,
        });

        return res.status(403).json({
          decision: 'BLOCK',
          reason: 'CRITICAL_RISK_SCORE',
          riskScore,
          message: 'Critical risk detected. Access blocked.',
        });
      }

      // Allow request
      await auditLogger.log({
        action: 'REQUEST_ALLOWED',
        source,
        destination,
        endpoint,
        riskScore,
      });

      res.locals.riskScore = riskScore;
      next();
    } catch (error: any) {
      auditLogger.log({
        action: 'EVALUATION_ERROR',
        error: error.message,
        source: (req as any).serviceId,
      });

      res.status(500).json({
        decision: 'BLOCK',
        reason: 'EVALUATION_ERROR',
        riskScore: 50,
      });
    }
  }
);

// Proxy Route (after security pipeline)
app.use('/api/proxy', require('./routes/proxy').default);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Zero-Trust Proxy Error]', err);
  auditLogger.log({
    action: 'ERROR',
    error: err.message,
    source: (req as any).serviceId || 'unknown',
  });

  res.status(err.status || 500).json({
    decision: 'BLOCK',
    reason: 'INTERNAL_SERVER_ERROR',
    riskScore: 50,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('[WebSocket] Client connected');

  ws.on('close', () => {
    console.log('[WebSocket] Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('[WebSocket] Error:', error);
  });
});

// Start server
const PORT = process.env.PROXY_PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`[Zero-Trust Proxy] Server listening on port ${PORT}`);
  console.log(`[Health Check] Available at http://localhost:${PORT}/health`);
});

export { app, httpServer, wss };
