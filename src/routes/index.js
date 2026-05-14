import { Router } from 'express';

import authRoutes from '../modules/auth/auth.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  return res.json({
    success: true,
    message: 'API funcionando',
  });
});

router.use('/auth', authRoutes);

export default router;