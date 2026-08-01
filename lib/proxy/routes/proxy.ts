import express, { Router } from 'express';

const router = Router();

router.post('/forward', (req, res) => {
  // Proxy implementation
  res.json({ message: 'Proxy endpoint' });
});

export default router;
