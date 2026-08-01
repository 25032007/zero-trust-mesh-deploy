import express, { Router } from 'express';
import { identityService } from '../../identity/service';

const router = Router();

router.get('/', (req, res) => {
  const services = identityService.getAllServices();
  res.json({ services, count: services.length });
});

export default router;
