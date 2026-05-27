import { Router } from 'express';

import authRoutes from '../modules/auth/auth.routes.js';
import teamsRoutes from '../modules/teams/teams.routes.js';
import tasksRoutes from '../modules/Task/task.routes.js';
import usersRoutes from '../modules/users/users.routes.js';
import rolesRoutes from '../modules/roles/roles.routes.js';
import stagesRoutes from '../modules/stages/stages.routes.js';
import projectRoutes from '../modules/projects/projects.routes.js';
import auditRoutes from '../modules/audit/audit.routes.js'
import chartsRoutes from '../modules/charts/charts.routes.js';
import permissionsRoutes from '../modules/permissions/permissions.routes.js';

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
router.use('/permissions', permissionsRoutes);
// Add routes for tasks
router.use('/tasks', tasksRoutes);
router.use('/users', usersRoutes);

//Add routes for stages
router.use('/stages', stagesRoutes);
router.use('/audit', auditRoutes);
router.use('/projects', projectRoutes);
router.use('/charts', chartsRoutes);

export default router;
