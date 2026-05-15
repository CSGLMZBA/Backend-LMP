import { Router } from 'express';

import * as authController from './auth.controller.js';

import { validate } from '../../middleware/validate.middleware.js';

import {
  loginSchema,
  registerSchema,
} from './auth.schema.js';



const router = Router();
// We leave these routes unprotected since this product is supposed to work as an open platform

router.post(
  '/register',
  validate(registerSchema),
  authController.register
);

router.post(
  '/login',
  validate(loginSchema),
  authController.login
);

export default router;