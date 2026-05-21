import { Router } from 'express';

import * as usersController from './users.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authorize } from '../../middleware/authorize.middleware.js';
import { usersSchema } from './users.schema.js';



const router = Router();
// We leave these routes unprotected since this product is supposed to work as an open platform



//router.use(authMiddleware);
router.get(
  '/',
  usersController.getUsers
);
router.get(
  '/:userId',
  usersController.getUser
);
router.post(
  '/',
  validate(usersSchema.post),
  usersController.postUser
  );

  router.put('/:userId',
    validate(usersSchema.putParams,'params'),
    validate(usersSchema.put),
    usersController.putUser);
    /*
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
*/
export default router;