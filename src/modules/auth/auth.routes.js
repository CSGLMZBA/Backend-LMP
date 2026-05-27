import { Router } from 'express';

import * as authController from './auth.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { authRateLimiter } from '../../middleware/rate-limit.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { userSchema } from './auth.schema.js';



const router = Router();
// We leave these routes unprotected since this product is supposed to work as an open platform

router.post(
  '/register',
  authRateLimiter,
  validate(userSchema.register),
  authController.register
);


router.post(
  '/login',
  authRateLimiter,
  validate(userSchema.login),
  authController.login
);

router.post(
  '/refresh',
  authController.refresh);

router.use(authMiddleware());

router.post(
  '/logout',
  authController.logout
);

router.get(
  '/me',
  authController.getSelf);
  
router.patch(
  '/change-password',
  validate(userSchema.updatePassword),
  authController.updatePassword
);


export default router;
