import { Router } from 'express';

import authRoutes from '../modules/auth/auth.routes.js';
import teamsRoutes from '../modules/teams/teams.routes.js';
import tasksRoutes from '../modules/Task/task.routes.js';
import usersRoutes from '../modules/users/users.routes.js';
import rolesRoutes from '../modules/roles/roles.routes.js';
import stagesRoutes from '../modules/stages/stages.routes.js';

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
router.use('/roles', rolesRoutes);
// Add routes for tasks
router.use('/tasks', tasksRoutes);

export default router;