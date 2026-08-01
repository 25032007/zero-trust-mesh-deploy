import express, { Router } from 'express';
import { metricsCollector } from '../../metrics/collector';

const router = Router();

router.get('/', (req, res) => {
  res.json(metricsCollector.getSummary());
});

export default router;
