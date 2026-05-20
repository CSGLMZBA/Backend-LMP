import { Router } from 'express';

import authRoutes from '../modules/auth/auth.routes.js';
import teamsRoutes from '../modules/teams/teams.routes.js';
import tasksRoutes from '../modules/Task/task.routes.js'; 
import usersRoutes from '../modules/users/auth.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  return res.json({
    success: true,
    message: 'API funcionando',
  });
});

// Add routes for registering and login in users
router.use('/auth', authRoutes);

// Add routes for creating and updating teams
router.use('/teams', teamsRoutes);

// Add routes for tasks
router.use('/tasks', tasksRoutes);
//router.use('/users', usersRoutes);

export default router;