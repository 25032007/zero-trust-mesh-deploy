import express, { Router } from 'express';
import { identityService } from '../../identity/service';
import { auditLogger } from '../../audit/logger';
import { metricsCollector } from '../../metrics/collector';
import { riskEngine } from '../../risk/engine';

const router = Router();

/**
 * Health check endpoint
 */
router.get('/', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

/**
 * Get system metrics
 */
router.get('/metrics', (req, res) => {
  const metrics = metricsCollector.getSummary();
  res.json(metrics);
});

/**
 * Get audit statistics
 */
router.get('/stats', (req, res) => {
  const stats = auditLogger.getStatistics();
  res.json(stats);
});

/**
 * Get service registry
 */
router.get('/services', (req, res) => {
  const services = identityService.getAllServices();
  res.json({
    count: services.length,
    services: services.map((s) => ({
      serviceId: s.serviceId,
      serviceName: s.serviceName,
      status: s.status,
      keyVersion: s.keyVersion,
      createdAt: s.createdAt,
    })),
  });
});

/**
 * Get system health detailed
 */
router.get('/detailed', (req, res) => {
  const metrics = metricsCollector.getSummary();
  const stats = auditLogger.getStatistics();
  const services = identityService.getAllServices();

  const latencies = metricsCollector.getLatencyPercentiles();

  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    metrics: {
      ...metrics,
      latencyPercentiles: latencies,
    },
    stats,
    services: {
      total: services.length,
      active: services.filter((s) => s.status === 'ACTIVE').length,
      inactive: services.filter((s) => s.status === 'INACTIVE').length,
      revoked: services.filter((s) => s.status === 'REVOKED').length,
    },
  });
});

export default router;
