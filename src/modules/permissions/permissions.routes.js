import { Router } from 'express';

import * as permissionsController from './permissions.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware(4));

router.get('/', permissionsController.getPermissions);

export default router;
