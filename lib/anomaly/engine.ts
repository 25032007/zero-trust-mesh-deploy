/**
 * Payload Anomaly Detection Engine
 * Detects suspicious request payloads using hybrid approach
 */

interface AnomalyScore {
  score: number; // 0-100
  factors: {
    sizeAnomaly: number;
    structureAnomaly: number;
    fieldAnomaly: number;
    typeAnomaly: number;
    depthAnomaly: number;
  };
  reasons: string[];
}

class AnomalyEngine {
  private payloadBaselines: Map<string, any> = new Map();
  private normalPayloadSizes: Map<string, number[]> = new Map();

  /**
   * Detect payload anomalies
   */
  async detectPayloadAnomaly(payload: any): Promise<number> {
    if (!payload || typeof payload !== 'object') {
      return 0; // No payload to analyze
    }

    const anomalyScore = this.analyzePayload(payload);
    return Math.min(100, Math.max(0, anomalyScore.score));
  }

  /**
   * Analyze payload for anomalies
   */
  private analyzePayload(payload: any): AnomalyScore {
    const factors = {
      sizeAnomaly: this.checkSizeAnomaly(payload),
      structureAnomaly: this.checkStructureAnomaly(payload),
      fieldAnomaly: this.checkFieldAnomaly(payload),
      typeAnomaly: this.checkTypeAnomaly(payload),
      depthAnomaly: this.checkDepthAnomaly(payload),
    };

    const reasons: string[] = [];
    if (factors.sizeAnomaly > 0) reasons.push('Unusual payload size');
    if (factors.structureAnomaly > 0) reasons.push('Unexpected payload structure');
    if (factors.fieldAnomaly > 0) reasons.push('Unknown or suspicious fields');
    if (factors.typeAnomaly > 0) reasons.push('Type mismatch in fields');
    if (factors.depthAnomaly > 0) reasons.push('Excessive nesting depth');

    // Weighted score calculation
    const score =
      factors.sizeAnomaly * 0.2 +
      factors.structureAnomaly * 0.25 +
      factors.fieldAnomaly * 0.3 +
      factors.typeAnomaly * 0.15 +
      factors.depthAnomaly * 0.1;

    return {
      score: Math.round(score),
      factors,
      reasons,
    };
  }

  /**
   * Check for size anomalies
   */
  private checkSizeAnomaly(payload: any): number {
    const payloadStr = JSON.stringify(payload);
    const size = payloadStr.length;

    // Warn if payload is unusually large (> 1MB)
    if (size > 1000000) {
      return 30;
    }

    // Warn if payload is excessively large (> 10MB)
    if (size > 10000000) {
      return 60;
    }

    // Baseline: normal payloads are usually under 10KB
    if (size > 100000) {
      return 15;
    }

    return 0;
  }

  /**
   * Check for structure anomalies
   */
  private checkStructureAnomaly(payload: any): number {
    // Check if payload is deeply nested object instead of array/simple
    if (this.hasMultipleNestedObjects(payload)) {
      return 20;
    }

    // Check for circular or self-referential structures
    if (this.hasCircularReference(payload)) {
      return 50;
    }

    return 0;
  }

  /**
   * Check for unknown or suspicious fields
   */
  private checkFieldAnomaly(payload: any): number {
    const commonFields = [
      'id',
      'userId',
      'name',
      'email',
      'amount',
      'price',
      'quantity',
      'description',
      'status',
      'timestamp',
      'data',
      'message',
      'content',
      'orderId',
      'paymentId',
    ];

    let anomalyCount = 0;
    let fieldCount = 0;

    if (typeof payload === 'object' && !Array.isArray(payload)) {
      for (const field in payload) {
        fieldCount++;

        // Check for suspicious field names
        if (field.toLowerCase().includes('script') || field.toLowerCase().includes('eval')) {
          anomalyCount += 2;
        } else if (
          field.toLowerCase().includes('token') &&
          !field.toLowerCase().includes('refresh')
        ) {
          anomalyCount += 1;
        } else if (!commonFields.includes(field) && field.length > 50) {
          anomalyCount += 0.5;
        }
      }
    }

    if (fieldCount === 0) {
      return 0;
    }

    const anomalyRatio = (anomalyCount / fieldCount) * 100;
    return Math.min(50, anomalyRatio);
  }

  /**
   * Check for type anomalies
   */
  private checkTypeAnomaly(payload: any): number {
    let anomalies = 0;

    if (typeof payload === 'object' && !Array.isArray(payload)) {
      for (const [key, value] of Object.entries(payload)) {
        // Check for suspicious type combinations
        if (key.includes('id') && typeof value !== 'string' && typeof value !== 'number') {
          anomalies++;
        }

        if (key.includes('count') && typeof value !== 'number') {
          anomalies++;
        }

        if (key.includes('email') && typeof value !== 'string') {
          anomalies++;
        }

        // Check for null values where not expected
        if (value === null && !this.isOptionalField(key)) {
          anomalies += 0.5;
        }
      }
    }

    return Math.min(40, anomalies * 5);
  }

  /**
   * Check for excessive nesting depth
   */
  private checkDepthAnomaly(payload: any): number {
    const maxDepth = this.getMaxDepth(payload);

    if (maxDepth > 10) {
      return 40;
    }

    if (maxDepth > 7) {
      return 20;
    }

    if (maxDepth > 5) {
      return 10;
    }

    return 0;
  }

  /**
   * Get maximum nesting depth
   */
  private getMaxDepth(obj: any, depth = 0): number {
    if (obj === null || typeof obj !== 'object') {
      return depth;
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) return depth + 1;
      return Math.max(...obj.map((item) => this.getMaxDepth(item, depth + 1)));
    }

    const depths = Object.values(obj).map((val) => this.getMaxDepth(val, depth + 1));
    return depths.length > 0 ? Math.max(...depths) : depth + 1;
  }

  /**
   * Check for circular references
   */
  private hasCircularReference(obj: any, seen = new WeakSet()): boolean {
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }

    if (seen.has(obj)) {
      return true;
    }

    seen.add(obj);

    for (const value of Object.values(obj)) {
      if (this.hasCircularReference(value, seen)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if object has multiple nested objects
   */
  private hasMultipleNestedObjects(obj: any, depth = 0): boolean {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      return false;
    }

    let nestedCount = 0;

    for (const value of Object.values(obj)) {
      if (typeof value === 'object' && value !== null) {
        nestedCount++;

        if (nestedCount > 2 && depth < 3) {
          return true;
        }

        if (this.hasMultipleNestedObjects(value, depth + 1)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check if field is typically optional
   */
  private isOptionalField(field: string): boolean {
    const optionalFields = ['description', 'notes', 'comment', 'metadata', 'extra', 'optional'];

    return optionalFields.some((opt) => field.toLowerCase().includes(opt));
  }

  /**
   * Record normal payload for baseline
   */
  recordNormalPayload(endpoint: string, payload: any): void {
    const payloadStr = JSON.stringify(payload);
    const size = payloadStr.length;

    if (!this.normalPayloadSizes.has(endpoint)) {
      this.normalPayloadSizes.set(endpoint, []);
    }

    this.normalPayloadSizes.get(endpoint)!.push(size);

    // Keep last 1000 samples
    const samples = this.normalPayloadSizes.get(endpoint)!;
    if (samples.length > 1000) {
      samples.shift();
    }
  }

  /**
   * Get baseline statistics for endpoint
   */
  getBaselineStats(endpoint: string): {
    avgSize: number;
    maxSize: number;
    minSize: number;
  } | null {
    const sizes = this.normalPayloadSizes.get(endpoint);

    if (!sizes || sizes.length === 0) {
      return null;
    }

    const avgSize = sizes.reduce((a, b) => a + b, 0) / sizes.length;
    const maxSize = Math.max(...sizes);
    const minSize = Math.min(...sizes);

    return { avgSize, maxSize, minSize };
  }
}

export const anomalyEngine = new AnomalyEngine();
