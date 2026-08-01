import express, { Router } from 'express';
import { auditLogger } from '../../audit/logger';

const router = Router();

router.get('/', (req, res) => {
  const events = auditLogger.getEvents({ limit: 100 });
  res.json({ events, count: events.length });
});

router.get('/security', (req, res) => {
  const events = auditLogger.getSecurityEvents(100);
  res.json({ events, count: events.length });
});

router.get('/compliance', (req, res) => {
  const report = auditLogger.generateComplianceReport();
  res.json(report);
});

export default router;
