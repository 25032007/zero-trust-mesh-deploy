/**
 * Metrics Collector
 * Collects performance and security metrics
 */

interface RequestMetrics {
  timestamp: Date;
  path: string;
  method: string;
  statusCode: number;
  duration: number;
  proxyOverhead: number;
  riskScore?: number;
}

class MetricsCollector {
  private metrics: RequestMetrics[] = [];
  private proxyBaseline: number = 0; // ms

  middleware() {
    // Capture `this` so it's accessible inside the overridden res.send
    const collector = this;

    return (req: any, res: any, next: any) => {
      const startTime = Date.now();

      // Capture original send
      const originalSend = res.send.bind(res);

      res.send = function (data: any) {
        const duration = Date.now() - startTime;

        const metric: RequestMetrics = {
          timestamp: new Date(),
          path: req.path,
          method: req.method,
          statusCode: res.statusCode,
          duration,
          proxyOverhead: duration - collector.proxyBaseline,
          riskScore: res.locals.riskScore,
        };

        collector.metrics.push(metric);

        // Limit size
        if (collector.metrics.length > 10000) {
          collector.metrics = collector.metrics.slice(-10000);
        }

        return originalSend(data);
      };

      next();
    };
  }

  /**
   * Get metrics summary
   */
  getSummary(timeWindow: number = 3600000): {
    totalRequests: number;
    avgLatency: number;
    p50Latency: number;
    p95Latency: number;
    p99Latency: number;
    throughput: number;
    errorRate: number;
    avgProxyOverhead: number;
  } {
    const now = Date.now();
    const recent = this.metrics.filter((m) => now - m.timestamp.getTime() < timeWindow);

    if (recent.length === 0) {
      return {
        totalRequests: 0,
        avgLatency: 0,
        p50Latency: 0,
        p95Latency: 0,
        p99Latency: 0,
        throughput: 0,
        errorRate: 0,
        avgProxyOverhead: 0,
      };
    }

    const durations = recent.map((m) => m.duration).sort((a, b) => a - b);
    const overheads = recent.map((m) => m.proxyOverhead).filter((o) => o > 0);

    const errors = recent.filter((m) => m.statusCode >= 400).length;

    return {
      totalRequests: recent.length,
      avgLatency: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
      p50Latency: durations[Math.floor(durations.length * 0.5)],
      p95Latency: durations[Math.floor(durations.length * 0.95)],
      p99Latency: durations[Math.floor(durations.length * 0.99)],
      throughput: Math.round((recent.length / timeWindow) * 60000), // req/min
      errorRate: Math.round((errors / recent.length) * 100),
      avgProxyOverhead:
        overheads.length > 0
          ? Math.round(overheads.reduce((a, b) => a + b, 0) / overheads.length)
          : 0,
    };
  }

  /**
   * Get latency percentiles
   */
  getLatencyPercentiles(): {
    p50: number;
    p75: number;
    p90: number;
    p95: number;
    p99: number;
  } {
    const durations = this.metrics.map((m) => m.duration).sort((a, b) => a - b);

    if (durations.length === 0) {
      return { p50: 0, p75: 0, p90: 0, p95: 0, p99: 0 };
    }

    return {
      p50: durations[Math.floor(durations.length * 0.5)],
      p75: durations[Math.floor(durations.length * 0.75)],
      p90: durations[Math.floor(durations.length * 0.9)],
      p95: durations[Math.floor(durations.length * 0.95)],
      p99: durations[Math.floor(durations.length * 0.99)],
    };
  }

  /**
   * Export metrics as JSON
   */
  export(): string {
    return JSON.stringify(this.metrics, null, 2);
  }

  /**
   * Clear metrics
   */
  clear(): void {
    this.metrics = [];
  }
}

export const metricsCollector = new MetricsCollector();
