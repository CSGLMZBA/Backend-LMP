import { Router } from 'express';

import * as usersController from './users.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { usersSchema } from './users.schema.js';



const router = Router();
router.use(authMiddleware(0));

router.get(
  '/search',
  validate(usersSchema.getByUsername,'query'), usersController.getByUserName
);
router.get('/list', usersController.getBasicUsers);
router.use(authMiddleware(3));
router.get(
  '/',
  usersController.getUsers
);
router.get(
  '/:userId',
  validate(usersSchema.getParams,'params'),
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
  
router.patch(
    '/:userId/status',
    validate(usersSchema.patchStatusParams, 'params'),
    validate(usersSchema.patchStatus),
    usersController.patchStatus
  );

router.patch(
  '/:userId/unlock',
  validate(usersSchema.getParams, 'params'),
  usersController.unlockUser
);
  
router.delete(
  '/:userId',
  validate(usersSchema.softDeleteParams, 'params'),
  usersController.softDelete
  );
/*
*/
export default router;
