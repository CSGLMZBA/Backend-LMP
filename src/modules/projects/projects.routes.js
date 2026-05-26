import { Router } from 'express';
import {
  createProject,
  getProjects,
} from './projects.controller.js';
import {
  createProjectSchema,
} from './projects.schema.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

router.post('/', authMiddleware, validate(createProjectSchema), createProject);
router.get('/', authMiddleware, getProjects);

export default router;