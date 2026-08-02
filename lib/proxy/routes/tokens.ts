import express, { Router } from 'express';
import { identityService } from '../../identity/service';

const router = Router();

router.post('/generate', (req, res) => {
  const { serviceId, forceRsa } = req.body;
  
  if (forceRsa && process.env.NODE_ENV !== 'production') {
    // Override the mock service identity with RSA just for test scripts
    // because jsonwebtoken doesn't support EdDSA natively without extra setup
    // This is gated to ensure Ed25519 is strictly used in production.
    identityService.generateServiceIdentity(serviceId, `${serviceId} (RSA)`, 'RSA');
  }

  const result = identityService.createToken(serviceId);
  
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  
  res.json({ token: result.token });
});

export default router;
