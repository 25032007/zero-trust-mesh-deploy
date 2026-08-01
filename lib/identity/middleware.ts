import { Request, Response, NextFunction } from 'express';
import { auditLogger } from '../audit/logger';

/**
 * Identity Middleware - Validates service identity
 */

class IdentityMiddleware {
  async validate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const serviceIdHeader = req.headers['x-service-id'] as string;
      const serviceNameHeader = req.headers['x-service-name'] as string;

      if (!serviceIdHeader) {
        await auditLogger.log({
          action: 'IDENTITY_MISSING',
          ip: req.ip,
          userAgent: req.get('user-agent'),
        });

        res.status(400).json({
          decision: 'BLOCK',
          reason: 'MISSING_SERVICE_IDENTITY',
          riskScore: 80,
          message: 'Service identity required in X-Service-ID header',
        });
        return;
      }

      // Validate service ID format
      if (!this.isValidServiceId(serviceIdHeader)) {
        await auditLogger.log({
          action: 'INVALID_SERVICE_ID',
          source: serviceIdHeader,
          ip: req.ip,
        });

        res.status(400).json({
          decision: 'BLOCK',
          reason: 'INVALID_SERVICE_ID_FORMAT',
          riskScore: 70,
          message: 'Service ID format is invalid',
        });
        return;
      }

      // Attach to request
      (req as any).serviceId = serviceIdHeader;
      (req as any).serviceName = serviceNameHeader || serviceIdHeader;

      next();
    } catch (error: any) {
      await auditLogger.log({
        action: 'IDENTITY_VALIDATION_ERROR',
        error: error.message,
      });

      res.status(500).json({
        decision: 'BLOCK',
        reason: 'IDENTITY_VALIDATION_ERROR',
        riskScore: 50,
      });
    }
  }

  /**
   * Validate service ID format
   */
  private isValidServiceId(serviceId: string): boolean {
    // Allow alphanumeric, hyphens, underscores
    const pattern = /^[a-zA-Z0-9_-]{3,50}$/;
    return pattern.test(serviceId);
  }
}

export const identityMiddleware = new IdentityMiddleware();
