import { Router } from 'express';

import * as auditController from './audit.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';



const router = Router();
// We leave these routes unprotected since this product is supposed to work as an open platform
router.use(authMiddleware(4));

router.get(
  '/',
  auditController.get);
  


export default router;