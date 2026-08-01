/**
 * Quarantine Service
 * Isolates suspicious services from the mesh
 */

interface QuarantinedService {
  serviceId: string;
  quarantinedAt: Date;
  reason: string;
  severity: 'MEDIUM' | 'HIGH' | 'CRITICAL';
  evidence: string[];
  autoRelease?: Date;
}

class QuarantineService {
  private quarantinedServices: Map<string, QuarantinedService> = new Map();
  private releaseCallbacks: ((serviceId: string) => void)[] = [];

  /**
   * Quarantine a service
   */
  async quarantineService(
    serviceId: string,
    reason: string = 'SUSPICIOUS_ACTIVITY',
    severity: 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'HIGH',
    autoReleaseIn?: number
  ): Promise<void> {
    const existing = this.quarantinedServices.get(serviceId);

    if (existing) {
      // Already quarantined, update severity if higher
      if (this.getSeverityLevel(severity) > this.getSeverityLevel(existing.severity)) {
        existing.severity = severity;
        existing.evidence.push(`Updated: ${reason}`);
      }
      return;
    }

    const quarantine: QuarantinedService = {
      serviceId,
      quarantinedAt: new Date(),
      reason,
      severity,
      evidence: [reason],
      autoRelease: autoReleaseIn ? new Date(Date.now() + autoReleaseIn) : undefined,
    };

    this.quarantinedServices.set(serviceId, quarantine);

    console.log(`[Quarantine] ${serviceId} quarantined: ${reason} (${severity})`);

    // Schedule auto-release if specified
    if (autoReleaseIn) {
      setTimeout(() => {
        this.releaseService(serviceId);
      }, autoReleaseIn);
    }
  }

  /**
   * Release a quarantined service
   */
  async releaseService(serviceId: string): Promise<void> {
    const quarantine = this.quarantinedServices.get(serviceId);

    if (!quarantine) {
      return;
    }

    this.quarantinedServices.delete(serviceId);

    console.log(`[Quarantine] ${serviceId} released from quarantine`);

    // Trigger callbacks
    this.releaseCallbacks.forEach((callback) => {
      try {
        callback(serviceId);
      } catch (error) {
        console.error('[Quarantine] Release callback error:', error);
      }
    });
  }

  /**
   * Check if service is quarantined
   */
  async isServiceQuarantined(serviceId: string): Promise<boolean> {
    return this.quarantinedServices.has(serviceId);
  }

  /**
   * Get quarantine details
   */
  getQuarantineDetails(serviceId: string): QuarantinedService | null {
    return this.quarantinedServices.get(serviceId) || null;
  }

  /**
   * Get all quarantined services
   */
  getAllQuarantinedServices(): QuarantinedService[] {
    return Array.from(this.quarantinedServices.values());
  }

  /**
   * Add evidence to quarantine
   */
  addEvidence(serviceId: string, evidence: string): void {
    const quarantine = this.quarantinedServices.get(serviceId);

    if (quarantine) {
      quarantine.evidence.push(evidence);
    }
  }

  /**
   * Subscribe to release events
   */
  onRelease(callback: (serviceId: string) => void): () => void {
    this.releaseCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      this.releaseCallbacks = this.releaseCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Get severity level as number
   */
  private getSeverityLevel(severity: string): number {
    const levels: { [key: string]: number } = {
      MEDIUM: 1,
      HIGH: 2,
      CRITICAL: 3,
    };
    return levels[severity] || 0;
  }

  /**
   * Get quarantine statistics
   */
  getStatistics(): {
    totalQuarantined: number;
    critical: number;
    high: number;
    medium: number;
  } {
    const services = Array.from(this.quarantinedServices.values());

    return {
      totalQuarantined: services.length,
      critical: services.filter((s) => s.severity === 'CRITICAL').length,
      high: services.filter((s) => s.severity === 'HIGH').length,
      medium: services.filter((s) => s.severity === 'MEDIUM').length,
    };
  }

  /**
   * Clear all quarantines (use with caution)
   */
  clearAll(): void {
    this.quarantinedServices.clear();
    console.log('[Quarantine] All quarantines cleared');
  }
}

export const quarantineService = new QuarantineService();
