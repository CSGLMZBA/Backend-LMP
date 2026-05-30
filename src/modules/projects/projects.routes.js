import { Router } from 'express';
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  updateProject,
  updateProjectStatus,
} from './projects.controller.js';
import {
  createProjectSchema,
  getProjectsQuerySchema,
  projectIdParamSchema,
  updateProjectSchema,
  updateProjectStatusSchema,
} from './projects.schema.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();
router.use(authMiddleware());
router.post('/', validate(createProjectSchema), createProject);
router.get('/', validate(getProjectsQuerySchema, 'query'), getProjects);
router.get(
  '/:projectId',
  validate(projectIdParamSchema, 'params'),
  getProjectById
);
router.patch(
  '/:projectId',
  validate(projectIdParamSchema, 'params'),
  validate(updateProjectSchema),
  updateProject
);
router.patch(
  '/:projectId/status',
  validate(projectIdParamSchema, 'params'),
  validate(updateProjectStatusSchema),
  updateProjectStatus
);
router.delete(
  '/:projectId',
  validate(projectIdParamSchema, 'params'),
  deleteProject
);

export default router;
