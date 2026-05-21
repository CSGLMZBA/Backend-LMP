import { Router } from 'express';
import {
  createProject,
  getProjects,
} from './projects.controller.js';
import {
  createProjectSchema,
} from './projects.schema.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/', authMiddleware, validate(createProjectSchema), createProject);
router.get('/', authMiddleware, getProjects);

export default router;