/**
 * Rate Limiter
 * Prevents abuse by limiting request rates per service
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitRecord> = new Map();
  private windowSize = 60000; // 1 minute
  private defaultLimit = 1000; // requests per minute

  middleware() {
    return (req: any, res: any, next: any) => {
      const serviceId = req.headers['x-service-id'] || req.ip;
      const limit = this.checkLimit(serviceId as string);

      if (!limit.allowed) {
        return res.status(429).json({
          decision: 'BLOCK',
          reason: 'RATE_LIMIT_EXCEEDED',
          riskScore: 75,
          message: `Rate limit exceeded. Retry after ${Math.ceil((limit.resetIn || 0) / 1000)}s`,
          retryAfter: Math.ceil((limit.resetIn || 0) / 1000),
        });
      }

      res.set('X-RateLimit-Limit', this.defaultLimit.toString());
      res.set('X-RateLimit-Remaining', (this.defaultLimit - limit.count).toString());

      next();
    };
  }

  /**
   * Check if request is within rate limit
   */
  private checkLimit(key: string): {
    allowed: boolean;
    count: number;
    resetIn?: number;
  } {
    const now = Date.now();
    let record = this.limits.get(key);

    // Initialize or reset if window expired
    if (!record || now >= record.resetTime) {
      record = {
        count: 1,
        resetTime: now + this.windowSize,
      };
      this.limits.set(key, record);

      return {
        allowed: true,
        count: 1,
      };
    }

    record.count++;

    const allowed = record.count <= this.defaultLimit;

    return {
      allowed,
      count: record.count,
      resetIn: allowed ? undefined : record.resetTime - now,
    };
  }

  /**
   * Set custom limit for a service
   */
  setLimit(serviceId: string, requestsPerMinute: number): void {
    // This would be implemented with persistent storage
  }

  /**
   * Reset limit for a service
   */
  resetLimit(serviceId: string): void {
    this.limits.delete(serviceId);
  }

  /**
   * Clear all limits
   */
  clearAll(): void {
    this.limits.clear();
  }
}

export const rateLimiter = new RateLimiter();
