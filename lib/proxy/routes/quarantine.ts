import express, { Router } from 'express';
import { quarantineService } from '../../quarantine/service';

const router = Router();

router.get('/', (req, res) => {
  const quarantined = quarantineService.getAllQuarantinedServices();
  res.json({ quarantined, count: quarantined.length });
});

export default router;
