/**
 * Lateral Movement Detection System
 * Detects suspicious traversal through microservices
 */

interface MovementContext {
  source: string;
  destination: string;
  riskScore: number;
  context: any;
}

interface AttackPath {
  path: string[];
  detected: boolean;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason?: string;
}

interface ServiceCommunicationRecord {
  source: string;
  destination: string;
  timestamp: Date;
  success: boolean;
  endpoint: string;
  riskScore: number;
}

const UNAUTHORIZED_PATHS = [
  // Direct access to database without going through API
  {
    path: ['frontend-service', 'database-service'],
    reason: 'DIRECT_DATABASE_ACCESS',
    severity: 'CRITICAL' as const,
  },
  // Frontend directly accessing payments
  {
    path: ['frontend-service', 'payments-service'],
    reason: 'DIRECT_PAYMENT_ACCESS',
    severity: 'HIGH' as const,
  },
  // Skipping order service to payments
  {
    path: ['frontend-service', 'payments-service'],
    reason: 'BYPASSED_ORDER_SERVICE',
    severity: 'HIGH' as const,
  },
];

class LateralMovementDetector {
  private communicationGraph: Map<string, Map<string, ServiceCommunicationRecord[]>> = new Map();
  private requestSequences: Map<string, ServiceCommunicationRecord[]> = new Map();
  private suspiciousSequences: AttackPath[] = [];

  /**
   * Detect lateral movement in service communication
   */
  async detectMovement(context: MovementContext): Promise<AttackPath> {
    const { source, destination, riskScore } = context;

    // Record this communication
    this.recordCommunication(source, destination, context.context);

    // Check for unauthorized paths
    const unauthorizedDetection = this.checkUnauthorizedPaths(source, destination);
    if (unauthorizedDetection.detected) {
      return unauthorizedDetection;
    }

    // Check for rapid traversal
    const rapidTraversalDetection = this.checkRapidTraversal(source, riskScore);
    if (rapidTraversalDetection.detected) {
      return rapidTraversalDetection;
    }

    // Check for repeated failed access attempts
    const failedAccessDetection = this.checkRepeatedFailures(source, destination);
    if (failedAccessDetection.detected) {
      return failedAccessDetection;
    }

    // Check for sensitive service targeting
    const sensitiveDetection = this.checkSensitiveTargeting(source, destination);
    if (sensitiveDetection.detected) {
      return sensitiveDetection;
    }

    // Check for abnormal communication pattern
    const anomalyDetection = this.checkAnomalousPattern(source, destination, riskScore);
    if (anomalyDetection.detected) {
      return anomalyDetection;
    }

    return {
      path: [source, destination],
      detected: false,
    };
  }

  /**
   * Check for unauthorized service communication paths
   */
  private checkUnauthorizedPaths(source: string, destination: string): AttackPath {
    for (const forbidden of UNAUTHORIZED_PATHS) {
      if (forbidden.path[0] === source && forbidden.path[1] === destination) {
        return {
          path: forbidden.path,
          detected: true,
          severity: forbidden.severity,
          reason: forbidden.reason,
        };
      }
    }

    return { path: [source, destination], detected: false, severity: 'LOW' };
  }

  /**
   * Check for rapid service traversal (multi-hop lateral movement)
   */
  private checkRapidTraversal(source: string, riskScore: number): AttackPath {
    const sequence = this.requestSequences.get(source) || [];

    if (sequence.length > 0) {
      const lastRequest = sequence[sequence.length - 1];
      const timeDiff = Date.now() - lastRequest.timestamp.getTime();

      // If multiple service hops within 100ms, might be attack
      if (sequence.length > 2 && timeDiff < 100) {
        const path = sequence.map((s) => s.destination);
        return {
          path,
          detected: true,
          severity: 'HIGH' as const,
          reason: 'RAPID_SERVICE_TRAVERSAL',
        };
      }
    }

    return { path: [source], detected: false, severity: 'LOW' };
  }

  /**
   * Check for repeated failed access attempts
   */
  private checkRepeatedFailures(source: string, destination: string): AttackPath {
    const key = `${source}:${destination}`;
    const records = this.communicationGraph.get(key) || new Map();

    if (records.size > 0) {
      const recentRecords = Array.from(records.values())
        .flat()
        .filter(
          (r) => Date.now() - r.timestamp.getTime() < 60000 // Last minute
        );

      const failures = recentRecords.filter((r) => !r.success);

      // More than 5 failures in last minute
      if (failures.length > 5) {
        return {
          path: [source, destination],
          detected: true,
          severity: 'HIGH' as const,
          reason: 'REPEATED_ACCESS_FAILURES',
        };
      }
    }

    return { path: [source, destination], detected: false, severity: 'LOW' };
  }

  /**
   * Check if targeting sensitive services
   */
  private checkSensitiveTargeting(source: string, destination: string): AttackPath {
    const sensitiveServices = ['database-service', 'auth-service', 'payment-service'];

    if (sensitiveServices.includes(destination)) {
      // Check if source is not typically allowed to access this
      const isUnusualPath = !this.isKnownPath(source, destination);

      if (isUnusualPath) {
        return {
          path: [source, destination],
          detected: true,
          severity: 'HIGH' as const,
          reason: 'UNUSUAL_SENSITIVE_SERVICE_ACCESS',
        };
      }
    }

    return { path: [source, destination], detected: false, severity: 'LOW' };
  }

  /**
   * Check for anomalous communication patterns
   */
  private checkAnomalousPattern(source: string, destination: string, riskScore: number): AttackPath {
    // If risk score is already high and this is a new communication path, flag it
    if (riskScore > 60 && !this.isKnownPath(source, destination)) {
      return {
        path: [source, destination],
        detected: true,
        severity: 'HIGH' as const,
        reason: 'ANOMALOUS_HIGH_RISK_COMMUNICATION',
      };
    }

    return { path: [source, destination], detected: false, severity: 'LOW' };
  }

  /**
   * Record service communication for analysis
   */
  private recordCommunication(source: string, destination: string, context: any): void {
    const key = `${source}:${destination}`;

    if (!this.communicationGraph.has(key)) {
      this.communicationGraph.set(key, new Map());
    }

    const record: ServiceCommunicationRecord = {
      source,
      destination,
      timestamp: new Date(),
      success: context.decision !== 'BLOCK',
      endpoint: context.endpoint || '',
      riskScore: context.riskScore || 0,
    };

    const recordMap = this.communicationGraph.get(key)!;
    const timestamp = Date.now();
    recordMap.set(timestamp.toString(), [record]);

    // Record in sequence
    if (!this.requestSequences.has(source)) {
      this.requestSequences.set(source, []);
    }

    const sequence = this.requestSequences.get(source)!;
    sequence.push(record);

    // Keep sequence size bounded (last 100 requests)
    if (sequence.length > 100) {
      sequence.shift();
    }
  }

  /**
   * Check if communication path is known/normal
   */
  private isKnownPath(source: string, destination: string): boolean {
    const knownPaths: [string, string][] = [
      ['frontend-service', 'orders-service'],
      ['orders-service', 'payments-service'],
      ['orders-service', 'users-service'],
      ['payments-service', 'database-service'],
      ['users-service', 'database-service'],
      ['orders-service', 'database-service'],
      ['auth-service', 'users-service'],
      ['frontend-service', 'auth-service'],
    ];

    return knownPaths.some((path) => path[0] === source && path[1] === destination);
  }

  /**
   * Build attack path from communication records
   */
  buildAttackPath(source: string): string[] {
    const path = [source];
    const visited = new Set([source]);
    let current = source;

    // Traverse communication graph to build attack chain
    while (path.length < 10) {
      // Prevent infinite loops
      let nextService: string | null = null;

      // Find next service in communication
      for (const [key, records] of this.communicationGraph) {
        if (key.startsWith(current + ':')) {
          const destination = key.split(':')[1];
          if (!visited.has(destination)) {
            nextService = destination;
            break;
          }
        }
      }

      if (!nextService) break;

      path.push(nextService);
      visited.add(nextService);
      current = nextService;
    }

    return path;
  }

  /**
   * Get communication baseline for service
   */
  getBaselinePaths(service: string): string[][] {
    const baselines: string[][] = [];

    for (const [key, records] of this.communicationGraph) {
      if (key.startsWith(service + ':')) {
        const destination = key.split(':')[1];
        baselines.push([service, destination]);
      }
    }

    return baselines;
  }

  /**
   * Clear old records (run periodically)
   */
  clearOldRecords(): void {
    const now = Date.now();
    const maxAge = 3600000; // 1 hour

    for (const [key, records] of this.communicationGraph) {
      const filtered = new Map(
        Array.from(records).filter(([timestamp]) => now - parseInt(timestamp) < maxAge)
      );

      if (filtered.size === 0) {
        this.communicationGraph.delete(key);
      } else {
        this.communicationGraph.set(key, filtered);
      }
    }
  }
}

export const lateralMovementDetector = new LateralMovementDetector();

// Clear old records every 15 minutes
setInterval(() => {
  lateralMovementDetector.clearOldRecords();
}, 900000);
