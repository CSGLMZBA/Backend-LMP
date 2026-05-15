import { Router } from 'express';

import authRoutes from '../modules/auth/auth.routes.js';
import teamsRoutes from '../modules/teams/teams.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  return res.json({
    success: true,
    message: 'API funcionando',
  });
});
// Add routes for registering and login in users
router.use('/auth', authRoutes);

// Add routes for creating aand updating teams
router.use('/teams', teamsRoutes);

export default router;