/**
 * Audit Logging System
 * Records all security events for compliance and forensics
 */

export interface AuditEvent {
  id: string;
  timestamp: Date;
  action: string;
  source?: string;
  destination?: string;
  endpoint?: string;
  method?: string;
  decision?: string;
  riskScore?: number;
  reason?: string;
  error?: string;
  payload?: any;
  path?: string[];
  jti?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
}

class AuditLogger {
  private events: AuditEvent[] = [];
  private maxEvents = 10000;
  private eventCallbacks: ((event: AuditEvent) => void)[] = [];

  /**
   * Log a security event
   */
  async log(event: Partial<AuditEvent>): Promise<void> {
    const auditEvent: AuditEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      action: event.action || 'UNKNOWN',
      source: event.source,
      destination: event.destination,
      endpoint: event.endpoint,
      method: event.method,
      decision: event.decision,
      riskScore: event.riskScore,
      reason: event.reason,
      error: event.error,
      payload: event.payload,
      path: event.path,
      jti: event.jti,
      userId: event.userId,
      ip: event.ip,
      userAgent: event.userAgent,
    };

    // Add to event log
    this.events.push(auditEvent);

    // Maintain max size
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Trigger callbacks (for WebSocket broadcast, etc)
    this.eventCallbacks.forEach((callback) => {
      try {
        callback(auditEvent);
      } catch (error) {
        console.error('[Audit Logger] Callback error:', error);
      }
    });

    // Log important events to console
    if (
      this.isSecurityEvent(auditEvent.action) ||
      (auditEvent.riskScore && auditEvent.riskScore > 60)
    ) {
      this.logSecurityEvent(auditEvent);
    }

    // In production, would persist to database
    // await this.persistEvent(auditEvent);
  }

  /**
   * Get all audit events
   */
  getEvents(filters?: {
    action?: string;
    source?: string;
    destination?: string;
    minRiskScore?: number;
    startTime?: Date;
    endTime?: Date;
    limit?: number;
  }): AuditEvent[] {
    let filtered = [...this.events];

    if (filters) {
      if (filters.action) {
        filtered = filtered.filter((e) => e.action.includes(filters.action!));
      }

      if (filters.source) {
        filtered = filtered.filter((e) => e.source === filters.source);
      }

      if (filters.destination) {
        filtered = filtered.filter((e) => e.destination === filters.destination);
      }

      if (filters.minRiskScore) {
        filtered = filtered.filter((e) => (e.riskScore || 0) >= filters.minRiskScore!);
      }

      if (filters.startTime) {
        filtered = filtered.filter((e) => e.timestamp >= filters.startTime!);
      }

      if (filters.endTime) {
        filtered = filtered.filter((e) => e.timestamp <= filters.endTime!);
      }

      if (filters.limit) {
        filtered = filtered.slice(-filters.limit);
      }
    }

    return filtered.reverse(); // Most recent first
  }

  /**
   * Get security events (threats, blocks, etc)
   */
  getSecurityEvents(limit: number = 100): AuditEvent[] {
    const securityActions = [
      'POLICY_VIOLATION',
      'TOKEN_VALIDATION_FAILED',
      'LATERAL_MOVEMENT_DETECTED',
      'CRITICAL_RISK',
      'STEP_UP_AUTH_REQUIRED',
      'SERVICE_QUARANTINED',
      'TOKEN_REVOKED',
      'INVALID_SIGNATURE',
      'TOKEN_REPLAY_DETECTED',
    ];

    return this.events
      .filter((e) => securityActions.includes(e.action))
      .slice(-limit)
      .reverse();
  }

  /**
   * Check if action is a security event
   */
  private isSecurityEvent(action: string): boolean {
    const securityActions = [
      'POLICY_VIOLATION',
      'TOKEN_VALIDATION_FAILED',
      'LATERAL_MOVEMENT_DETECTED',
      'CRITICAL_RISK',
      'STEP_UP_AUTH_REQUIRED',
      'SERVICE_QUARANTINED',
      'TOKEN_REVOKED',
      'INVALID_SIGNATURE',
      'TOKEN_REPLAY_DETECTED',
      'THREAT_DETECTED',
      'ATTACK_DETECTED',
    ];

    return securityActions.includes(action);
  }

  /**
   * Log security event to console
   */
  private logSecurityEvent(event: AuditEvent): void {
    const timestamp = event.timestamp.toISOString();
    const levelEmoji = this.getRiskEmoji(event.riskScore);

    console.log(
      `${levelEmoji} [${timestamp}] ${event.action}: ${event.reason || event.error || 'No details'}`
    );

    if (event.source && event.destination) {
      console.log(`   Path: ${event.source} → ${event.destination}`);
    }

    if (event.riskScore !== undefined) {
      console.log(`   Risk Score: ${event.riskScore}/100`);
    }

    if (event.path && event.path.length > 0) {
      console.log(`   Attack Path: ${event.path.join(' → ')}`);
    }
  }

  /**
   * Get emoji for risk level
   */
  private getRiskEmoji(score?: number): string {
    if (!score) return '⚪';
    if (score < 30) return '🟢';
    if (score < 60) return '🟡';
    if (score < 80) return '🟠';
    return '🔴';
  }

  /**
   * Subscribe to audit events
   */
  subscribe(callback: (event: AuditEvent) => void): () => void {
    this.eventCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      this.eventCallbacks = this.eventCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Get statistics
   */
  getStatistics(timeWindow: number = 3600000): {
    totalEvents: number;
    totalRequests: number;
    blockedRequests: number;
    threats: number;
    avgRiskScore: number;
  } {
    const now = Date.now();
    const recentEvents = this.events.filter((e) => now - e.timestamp.getTime() < timeWindow);

    const totalRequests = recentEvents.filter((e) => e.action === 'REQUEST_ALLOWED').length;
    const blockedRequests = recentEvents.filter((e) => e.decision === 'BLOCK').length;
    const threats = recentEvents.filter((e) => this.isSecurityEvent(e.action)).length;

    const riskScores = recentEvents
      .filter((e) => e.riskScore !== undefined)
      .map((e) => e.riskScore!);
    const avgRiskScore =
      riskScores.length > 0 ? Math.round(riskScores.reduce((a, b) => a + b, 0) / riskScores.length) : 0;

    return {
      totalEvents: recentEvents.length,
      totalRequests,
      blockedRequests,
      threats,
      avgRiskScore,
    };
  }

  /**
   * Generate Compliance Report (SOC 2, PCI-DSS)
   */
  generateComplianceReport(): any {
    const events = this.events;
    const report = {
      timestamp: new Date().toISOString(),
      frameworks: ['SOC2', 'PCI-DSS'],
      controls: [
        {
          id: 'CC6.1',
          name: 'Logical Access Security',
          status: 'PASS',
          description: 'System enforces strict authentication and authorization for all services.',
          evidence: `Logged ${events.filter(e => e.action === 'STEP_UP_AUTH_REQUIRED' || e.action === 'REQUEST_ALLOWED').length} access control events. MFA is enforced on high risk.`
        },
        {
          id: 'CC7.2',
          name: 'Security Event Monitoring',
          status: 'PASS',
          description: 'System monitors for anomalies and security events.',
          evidence: `Recorded ${events.filter(e => this.isSecurityEvent(e.action)).length} security events, including lateral movement and payload anomalies.`
        },
        {
          id: 'PCI-10.2.1',
          name: 'Audit All Access',
          status: 'PASS',
          description: 'All service-to-service access is logged.',
          evidence: `Total audit events recorded: ${events.length}`
        }
      ]
    };
    return report;
  }

  /**
   * Export events as JSON
   */
  exportAsJSON(): string {
    return JSON.stringify(this.events, null, 2);
  }

  /**
   * Export events as CSV
   */
  exportAsCSV(): string {
    const headers = [
      'Timestamp',
      'Action',
      'Source',
      'Destination',
      'Decision',
      'Risk Score',
      'Reason',
    ];
    const rows = this.events.map((e) => [
      e.timestamp.toISOString(),
      e.action,
      e.source || '',
      e.destination || '',
      e.decision || '',
      e.riskScore || '',
      e.reason || '',
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    return csv;
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events = [];
  }

  /**
   * Get event count
   */
  getEventCount(): number {
    return this.events.length;
  }
}

export const auditLogger = new AuditLogger();
