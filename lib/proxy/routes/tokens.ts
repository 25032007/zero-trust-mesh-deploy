import express, { Router } from 'express';
import { identityService } from '../../identity/service';

const router = Router();

router.post('/generate', (req, res) => {
  const { serviceId } = req.body;
  const result = identityService.createToken(serviceId);
  
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  
  res.json({ token: result.token });
});

export default router;
