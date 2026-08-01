import express, { Router } from 'express';
import { policyEngine } from '../../policies/engine';

const router = Router();

router.get('/', (req, res) => {
  const policies = policyEngine.getAllPolicies();
  res.json({ policies, count: policies.length });
});

export default router;
