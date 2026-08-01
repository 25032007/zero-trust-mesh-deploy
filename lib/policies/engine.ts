/**
 * Policy Engine
 * Enforces service-to-service communication policies
 */

interface ServicePolicy {
  id: string;
  source: string;
  destination: string;
  allowedMethods: string[];
  allowedEndpoints?: string[];
  denyEndpoints?: string[];
  maxRequestsPerMinute: number;
  maxRiskScore: number;
  allowedTimeWindow?: { start: string; end: string };
  active: boolean;
  createdAt: Date;
}

interface PolicyDecision {
  allowed: boolean;
  reason?: string;
  policyId?: string;
}

class PolicyEngine {
  private policies: Map<string, ServicePolicy> = new Map();

  constructor() {
    this.initializeDefaultPolicies();
  }

  /**
   * Initialize default policies for demo services
   */
  private initializeDefaultPolicies(): void {
    // Frontend -> Orders
    this.createPolicy({
      source: 'frontend-service',
      destination: 'orders-service',
      allowedMethods: ['GET', 'POST', 'PUT'],
      maxRequestsPerMinute: 1000,
      maxRiskScore: 60,
    });

    // Orders -> Payments
    this.createPolicy({
      source: 'orders-service',
      destination: 'payments-service',
      allowedMethods: ['POST', 'GET'],
      maxRequestsPerMinute: 500,
      maxRiskScore: 50,
    });

    // Orders -> Users
    this.createPolicy({
      source: 'orders-service',
      destination: 'users-service',
      allowedMethods: ['GET'],
      maxRequestsPerMinute: 2000,
      maxRiskScore: 70,
    });

    // Orders -> Database
    this.createPolicy({
      source: 'orders-service',
      destination: 'database-service',
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
      maxRequestsPerMinute: 5000,
      maxRiskScore: 40,
    });

    // Payments -> Database
    this.createPolicy({
      source: 'payments-service',
      destination: 'database-service',
      allowedMethods: ['GET', 'POST', 'PUT'],
      maxRequestsPerMinute: 1000,
      maxRiskScore: 35,
    });

    // Auth -> Users
    this.createPolicy({
      source: 'auth-service',
      destination: 'users-service',
      allowedMethods: ['GET', 'POST', 'PUT'],
      maxRequestsPerMinute: 500,
      maxRiskScore: 45,
    });

    // Frontend -> Auth
    this.createPolicy({
      source: 'frontend-service',
      destination: 'auth-service',
      allowedMethods: ['POST'],
      maxRequestsPerMinute: 100,
      maxRiskScore: 50,
    });

    console.log('[Policy Engine] Initialized with 7 default policies');
  }

  /**
   * Evaluate if request is allowed by policy
   */
  async evaluate(context: {
    source: string;
    destination: string;
    endpoint: string;
    method: string;
    context?: any;
  }): Promise<PolicyDecision> {
    const policyKey = `${context.source}:${context.destination}`;
    const policy = this.policies.get(policyKey);

    if (!policy) {
      return {
        allowed: false,
        reason: 'NO_POLICY_FOUND',
      };
    }

    if (!policy.active) {
      return {
        allowed: false,
        reason: 'POLICY_DISABLED',
      };
    }

    // Check HTTP method
    if (!policy.allowedMethods.includes(context.method)) {
      return {
        allowed: false,
        reason: 'METHOD_NOT_ALLOWED',
        policyId: policy.id,
      };
    }

    // Check endpoint whitelist
    if (policy.allowedEndpoints && policy.allowedEndpoints.length > 0) {
      const isAllowed = policy.allowedEndpoints.some((allowed) =>
        context.endpoint.match(new RegExp(allowed))
      );

      if (!isAllowed) {
        return {
          allowed: false,
          reason: 'ENDPOINT_NOT_ALLOWED',
          policyId: policy.id,
        };
      }
    }

    // Check endpoint blacklist
    if (policy.denyEndpoints && policy.denyEndpoints.length > 0) {
      const isDenied = policy.denyEndpoints.some((denied) =>
        context.endpoint.match(new RegExp(denied))
      );

      if (isDenied) {
        return {
          allowed: false,
          reason: 'ENDPOINT_DENIED',
          policyId: policy.id,
        };
      }
    }

    // Check time window
    if (policy.allowedTimeWindow) {
      if (!this.isWithinTimeWindow(policy.allowedTimeWindow)) {
        return {
          allowed: false,
          reason: 'OUTSIDE_TIME_WINDOW',
          policyId: policy.id,
        };
      }
    }

    return {
      allowed: true,
      policyId: policy.id,
    };
  }

  /**
   * Create a new policy
   */
  createPolicy(config: {
    source: string;
    destination: string;
    allowedMethods: string[];
    allowedEndpoints?: string[];
    denyEndpoints?: string[];
    maxRequestsPerMinute: number;
    maxRiskScore: number;
    allowedTimeWindow?: { start: string; end: string };
  }): ServicePolicy {
    const policy: ServicePolicy = {
      id: `policy_${Date.now()}`,
      source: config.source,
      destination: config.destination,
      allowedMethods: config.allowedMethods,
      allowedEndpoints: config.allowedEndpoints,
      denyEndpoints: config.denyEndpoints,
      maxRequestsPerMinute: config.maxRequestsPerMinute,
      maxRiskScore: config.maxRiskScore,
      allowedTimeWindow: config.allowedTimeWindow,
      active: true,
      createdAt: new Date(),
    };

    const key = `${config.source}:${config.destination}`;
    this.policies.set(key, policy);

    console.log(`[Policy Engine] Created policy: ${config.source} -> ${config.destination}`);

    return policy;
  }

  /**
   * Update an existing policy
   */
  updatePolicy(id: string, updates: Partial<ServicePolicy>): ServicePolicy | null {
    for (const [, policy] of this.policies) {
      if (policy.id === id) {
        Object.assign(policy, updates);
        return policy;
      }
    }
    return null;
  }

  /**
   * Delete a policy
   */
  deletePolicy(id: string): boolean {
    for (const [key, policy] of this.policies) {
      if (policy.id === id) {
        this.policies.delete(key);
        return true;
      }
    }
    return false;
  }

  /**
   * Disable a policy
   */
  disablePolicy(id: string): boolean {
    for (const [, policy] of this.policies) {
      if (policy.id === id) {
        policy.active = false;
        return true;
      }
    }
    return false;
  }

  /**
   * Enable a policy
   */
  enablePolicy(id: string): boolean {
    for (const [, policy] of this.policies) {
      if (policy.id === id) {
        policy.active = true;
        return true;
      }
    }
    return false;
  }

  /**
   * Get all policies
   */
  getAllPolicies(): ServicePolicy[] {
    return Array.from(this.policies.values());
  }

  /**
   * Get policies for a source service
   */
  getPoliciesForSource(source: string): ServicePolicy[] {
    return Array.from(this.policies.values()).filter((p) => p.source === source);
  }

  /**
   * Check if request is within allowed time window
   */
  private isWithinTimeWindow(window: { start: string; end: string }): boolean {
    const now = new Date();
    const [startHour, startMin] = window.start.split(':').map(Number);
    const [endHour, endMin] = window.end.split(':').map(Number);

    const startTime = new Date(now);
    startTime.setHours(startHour, startMin, 0, 0);

    const endTime = new Date(now);
    endTime.setHours(endHour, endMin, 0, 0);

    return now >= startTime && now <= endTime;
  }
}

export const policyEngine = new PolicyEngine();
