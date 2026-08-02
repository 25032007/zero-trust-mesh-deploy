import { Request, Response, NextFunction } from 'express';
import { identityService } from '../identity/service';
import { auditLogger } from '../audit/logger';

interface TokenValidationResult {
  valid: boolean;
  error?: string;
  reason?: string;
  riskScore?: number;
}

class TokenValidationMiddleware {
  /**
   * Validate incoming service token
   */
  validate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        await auditLogger.log({
          action: 'TOKEN_MISSING',
          ip: req.ip,
          path: req.path,
        });

        res.status(401).json({
          decision: 'BLOCK',
          reason: 'MISSING_TOKEN',
          riskScore: 85,
          message: 'Authorization token is required',
        });
        return;
      }

      const [scheme, token] = authHeader.split(' ');

      if (scheme !== 'Bearer') {
        await auditLogger.log({
          action: 'INVALID_AUTH_SCHEME',
          scheme,
          path: req.path,
        });

        res.status(401).json({
          decision: 'BLOCK',
          reason: 'INVALID_AUTH_SCHEME',
          riskScore: 90,
          message: 'Invalid authorization scheme. Use "Bearer"',
        });
        return;
      }

      const result = this.validateToken(token);

      if (!result.valid) {
        const riskScore = this.calculateTokenValidationRisk(result.error!);

        await auditLogger.log({
          action: 'TOKEN_VALIDATION_FAILED',
          error: result.error,
          endpoint: req.path,
          riskScore,
        });

        res.status(401).json({
          decision: 'BLOCK',
          reason: result.error,
          riskScore,
          message: `Token validation failed: ${result.reason || result.error}`,
        });
        return;
      }

      // Attach validated service ID to request
      (req as any).serviceId = result.payload!.service_id;
      (req as any).token = result.payload;
      (req as any).keyId = result.payload!.key_id;
      (req as any).keyVersion = result.payload!.key_version;

      await auditLogger.log({
        action: 'TOKEN_VALIDATED',
        service: result.payload!.service_id,
        path: req.path,
        jti: result.payload!.jti,
      });

      next();
    } catch (error: any) {
      console.error('[TokenValidationMiddleware] Error:', error);
      await auditLogger.log({
        action: 'TOKEN_VALIDATION_ERROR',
        error: error.message,
      });

      res.status(500).json({
        decision: 'BLOCK',
        reason: 'VALIDATION_ERROR',
        riskScore: 50,
      });
    }
  }

  /**
   * Validate JWT token
   */
  private validateToken(token: string) {
    const validation = identityService.validateToken(token);

    if (!validation.valid) {
      return {
        valid: false,
        error: validation.error,
        reason: this.getTokenErrorReason(validation.error!),
      };
    }

    return {
      valid: true,
      payload: validation.payload,
    };
  }

  /**
   * Calculate risk score based on token validation error
   */
  private calculateTokenValidationRisk(error: string): number {
    const riskMap: { [key: string]: number } = {
      MISSING_TOKEN: 85,
      INVALID_TOKEN_FORMAT: 80,
      TOKEN_EXPIRED: 30,
      INVALID_SIGNATURE: 95,
      TOKEN_REVOKED: 75,
      TOKEN_REPLAY_DETECTED: 90,
      SERVICE_NOT_FOUND: 70,
      SERVICE_INACTIVE: 65,
      JWT_MALFORMED: 85,
      JWT_SIGNATURE_REQUIRED: 80,
      JWT_SIGNATURE_INVALID: 95,
      invalid_payload: 75,
    };

    return riskMap[error] || 50;
  }

  /**
   * Get human-readable error reason
   */
  private getTokenErrorReason(error: string): string {
    const reasons: { [key: string]: string } = {
      MISSING_TOKEN: 'No authentication token provided',
      INVALID_TOKEN_FORMAT: 'Token format is invalid',
      TOKEN_EXPIRED: 'Authentication token has expired',
      INVALID_SIGNATURE: 'Token signature is invalid or tampered',
      TOKEN_REVOKED: 'Token has been revoked',
      TOKEN_REPLAY_DETECTED: 'Token replay attack detected',
      SERVICE_NOT_FOUND: 'Service identity not found in registry',
      SERVICE_INACTIVE: 'Service is currently inactive',
      JWT_MALFORMED: 'JWT is malformed',
      JWT_SIGNATURE_REQUIRED: 'JWT signature verification required',
      JWT_SIGNATURE_INVALID: 'JWT signature does not match payload',
      invalid_payload: 'JWT payload is invalid',
    };

    return reasons[error] || 'Token validation failed for unknown reason';
  }
}

export const tokenValidationMiddleware = new TokenValidationMiddleware();
