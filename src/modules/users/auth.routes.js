import { Router } from 'express';

import * as authController from './auth.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authorize } from '../../middleware/authorize.middleware.js';
import { userSchema } from './auth.schema.js';



const router = Router();
// We leave these routes unprotected since this product is supposed to work as an open platform



//router.use(authMiddleware);
router.get(
  '/',
  authController.getUsers
);
router.get(
  '/:userId',
  authController.getUser
);
router.post(
  '/',
  authController.postUser
);
router.put('/:userId',
  authController.putUser);

router.patch(
  '/:userId/status',
  validate(userSchema.updateStatusParams, 'params'),
  validate(userSchema.updateStatus),
  authorize.self(),
  authController.updateStatus
);

router.delete(
  '/:userId',
  validate(userSchema.softDeleteParams, 'params'),
  authorize.selfOrAdmin(),
  authController.softDelete
);

export default router;