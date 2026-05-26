import { Router } from 'express';
import * as rolesController from './roles.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { rolesSchema } from './roles.schema.js';

const router = Router();

router.use(authMiddleware(4));//make it so this is exclusive to admins

router.get('/',rolesController.getRoles);
router.post('/', validate(rolesSchema.post), rolesController.postRole);
router.put('/:roleId', validate(rolesSchema.putParams, 'params'), validate(rolesSchema.put), rolesController.putRole);
router.delete('/:roleId', validate(rolesSchema.deleteParams, 'params'), rolesController.softDelete);

export default router;
