import { Router } from 'express';

import * as authController from './auth.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authorize } from '../../middleware/authorize.middleware.js';
import { userSchema } from './auth.schema.js';



const router = Router();
// We leave these routes unprotected since this product is supposed to work as an open platform

router.post(
  '/register',
  validate(userSchema.register),
  authController.register
);

router.get(
  '/:userId',
  authController.getUser
)

router.post(
  '/login',
  validate(userSchema.login),
  authController.login
);


router.use(authMiddleware);

router.patch(
  '/:userId',
  validate(userSchema.updateParams, 'params'),
  validate(userSchema.update),
  authorize.self(),
  authController.update
);

router.delete(
  '/:userId',
  validate(userSchema.softDeleteParams, 'params'),
  authorize.selfOrAdmin(),
  authController.softDelete
);

export default router;