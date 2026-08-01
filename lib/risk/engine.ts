import redis from 'redis';

interface RiskContext {
  source: string;
  destination: string;
  endpoint: string;
  method: string;
  payloadAnomaly?: number;
  context: any;
}

interface RiskFactors {
  timeAnomaly: number;
  geoAnomaly: number;
  newServiceCommunication: number;
  sensitiveEndpoint: number;
  abnormalFrequency: number;
  payloadAnomaly: number;
  invalidTokenAttempt: number;
  tokenReplay: number;
  rapidTraversal: number;
  authFailure: number;
}

const SENSITIVE_ENDPOINTS = [
  '/database',
  '/admin',
  '/secrets',
  '/credentials',
  '/payment',
  '/pii',
  '/sensitive',
];

class RiskEngine {
  private redisClient: redis.RedisClient | null = null;
  private requestHistory: Map<string, number[]> = new Map();
  private serviceGraph: Map<string, Set<string>> = new Map();

  constructor() {
    this.initializeRedis();
  }

  private initializeRedis(): void {
    try {
      if (process.env.REDIS_URL) {
        this.redisClient = redis.createClient({
          url: process.env.REDIS_URL,
        });

        this.redisClient.on('error', (err) => {
          console.error('[Risk Engine] Redis error:', err);
        });

        this.redisClient.on('connect', () => {
          console.log('[Risk Engine] Connected to Redis');
        });
      }
    } catch (error) {
      console.warn('[Risk Engine] Redis not available, using in-memory storage');
    }
  }

  /**
   * Calculate risk score for a request (0-100)
   */
  async calculateRisk(context: RiskContext): Promise<number> {
    const factors = await this.evaluateRiskFactors(context);
    const baseScore = this.computeRiskScore(factors);

    return Math.min(100, Math.max(0, baseScore));
  }

  /**
   * Evaluate all risk factors
   */
  private async evaluateRiskFactors(context: RiskContext): Promise<RiskFactors> {
    const factors: RiskFactors = {
      timeAnomaly: this.checkTimeAnomaly(context),
      geoAnomaly: this.checkGeoAnomaly(context),
      newServiceCommunication: await this.checkNewServiceCommunication(
        context.source,
        context.destination
      ),
      sensitiveEndpoint: this.checkSensitiveEndpoint(context.endpoint),
      abnormalFrequency: await this.checkAbnormalFrequency(context.source, context.destination),
      payloadAnomaly: context.payloadAnomaly || 0,
      invalidTokenAttempt: 0,
      tokenReplay: 0,
      rapidTraversal: 0,
      authFailure: 0,
    };

    return factors;
  }

  /**
   * Check if request time is unusual
   */
  private checkTimeAnomaly(context: RiskContext): number {
    const now = new Date();
    const hour = now.getHours();

    // Assume business hours are 9am-6pm
    const isBusinessHour = hour >= 9 && hour < 18;
    const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;

    if (!isBusinessHour || !isWeekday) {
      return 10;
    }

    return 0;
  }

  /**
   * Check for geo anomaly (placeholder - would use IP geolocation in production)
   */
  private checkGeoAnomaly(context: RiskContext): number {
    // In production, would use IP geolocation and compare to historical data
    return 0;
  }

  /**
   * Check if this is a new service-to-service communication
   */
  private async checkNewServiceCommunication(
    source: string,
    destination: string
  ): Promise<number> {
    if (!this.serviceGraph.has(source)) {
      this.serviceGraph.set(source, new Set());
    }

    const known = this.serviceGraph.get(source)!.has(destination);

    if (!known) {
      this.serviceGraph.get(source)!.add(destination);
      return 20; // New communication path
    }

    return 0;
  }

  /**
   * Check if endpoint is sensitive
   */
  private checkSensitiveEndpoint(endpoint: string): number {
    for (const sensitive of SENSITIVE_ENDPOINTS) {
      if (endpoint.toLowerCase().includes(sensitive.toLowerCase())) {
        return 15;
      }
    }
    return 0;
  }

  /**
   * Check for abnormal request frequency
   */
  private async checkAbnormalFrequency(source: string, destination: string): Promise<number> {
    const key = `${source}:${destination}`;

    if (!this.requestHistory.has(key)) {
      this.requestHistory.set(key, []);
    }

    const now = Date.now();
    const history = this.requestHistory.get(key)!;
    const recentRequests = history.filter((timestamp) => now - timestamp < 60000); // Last minute

    recentRequests.push(now);
    this.requestHistory.set(key, recentRequests);

    // If more than 100 requests per minute, flag as abnormal
    if (recentRequests.length > 100) {
      return 20;
    }

    // If more than 50 requests per minute, flag as elevated
    if (recentRequests.length > 50) {
      return 10;
    }

    return 0;
  }

  /**
   * Compute final risk score from factors
   */
  private computeRiskScore(factors: RiskFactors): number {
    // Weighted scoring
    let score = 0;
    score += factors.timeAnomaly * 1.0;
    score += factors.geoAnomaly * 1.5;
    score += factors.newServiceCommunication * 2.0;
    score += factors.sensitiveEndpoint * 1.5;
    score += factors.abnormalFrequency * 2.0;
    score += factors.payloadAnomaly * 1.5;
    score += factors.invalidTokenAttempt * 3.0;
    score += factors.tokenReplay * 4.0;
    score += factors.rapidTraversal * 3.0;
    score += factors.authFailure * 2.5;

    // Normalize to 0-100 scale
    return Math.min(100, Math.round(score / 10));
  }

  /**
   * Get risk level description
   */
  getRiskLevel(score: number): string {
    if (score < 30) return 'LOW';
    if (score < 60) return 'MEDIUM';
    if (score < 80) return 'HIGH';
    return 'CRITICAL';
  }

  /**
   * Get risk decision based on score
   */
  getRiskDecision(score: number): string {
    if (score < 30) return 'ALLOW';
    if (score < 60) return 'ALLOW_WITH_MONITORING';
    if (score < 80) return 'STEP_UP_AUTH';
    return 'BLOCK';
  }

  /**
   * Record service-to-service communication
   */
  recordCommunication(source: string, destination: string, endpoint: string): void {
    if (!this.serviceGraph.has(source)) {
      this.serviceGraph.set(source, new Set());
    }
    this.serviceGraph.get(source)!.add(destination);
  }

  /**
   * Get communication baseline
   */
  getCommunicationBaseline(source: string): string[] {
    const destinations = this.serviceGraph.get(source);
    return destinations ? Array.from(destinations) : [];
  }

  /**
   * Clear old history entries (run periodically)
   */
  clearOldHistory(): void {
    const now = Date.now();
    const maxAge = 3600000; // 1 hour

    for (const [key, timestamps] of this.requestHistory) {
      const filtered = timestamps.filter((ts) => now - ts < maxAge);
      if (filtered.length === 0) {
        this.requestHistory.delete(key);
      } else {
        this.requestHistory.set(key, filtered);
      }
    }
  }
}

export const riskEngine = new RiskEngine();

// Clear old history every 10 minutes
setInterval(() => {
  riskEngine.clearOldHistory();
}, 600000);
